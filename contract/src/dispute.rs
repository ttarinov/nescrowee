use near_sdk::{env, near_bindgen, NearToken, Promise};

use crate::types::*;
use crate::{Contract, ContractExt};

const DISPUTE_DEADLINE_NS: u64 = 48 * 60 * 60 * 1_000_000_000;
const PAYMENT_COOLDOWN_NS: u64 = 24 * 60 * 60 * 1_000_000_000;

#[near_bindgen]
impl Contract {
    pub fn raise_dispute(
        &mut self,
        contract_id: String,
        milestone_id: String,
        reason: String,
    ) {
        let mut contract = self.contracts.get(&contract_id).cloned().expect("Contract not found");
        let caller = env::predecessor_account_id();
        assert_eq!(caller, contract.client, "Only client can raise disputes");

        assert!(
            contract.security_pool.as_yoctonear() >= self.ai_processing_fee.as_yoctonear(),
            "Insufficient security deposit for AI processing"
        );

        let idx = contract.find_milestone(&milestone_id).expect("Milestone not found");
        assert!(
            contract.milestones[idx].status == MilestoneStatus::SubmittedForReview,
            "Can only dispute milestones submitted for review"
        );

        contract.milestones[idx].status = MilestoneStatus::Disputed;
        contract.status = ContractStatus::Disputed;

        contract.disputes.push(Dispute {
            milestone_id: milestone_id.clone(),
            raised_by: caller,
            reason,
            status: DisputeStatus::Pending,
            resolution: None,
            explanation: None,
            deadline_ns: None,
            ai_fee_deducted: false,
            tee_signature: None,
            tee_signing_address: None,
            tee_text: None,
            funds_released: false,
        });

        self.contracts.insert(contract_id.clone(), contract);

        emit_event!("dispute_raised", {
            "contract_id" => contract_id,
            "milestone_id" => milestone_id
        });
    }

    pub fn submit_ai_resolution(
        &mut self,
        contract_id: String,
        milestone_id: String,
        resolution: Resolution,
        explanation: String,
        signature: Vec<u8>,
        signing_address: Vec<u8>,
        tee_text: String,
    ) {
        let sig: &[u8; 64] = signature
            .as_slice()
            .try_into()
            .expect("Signature must be 64 bytes");
        let pubkey: &[u8; 32] = signing_address
            .as_slice()
            .try_into()
            .expect("Signing address must be 32 bytes");
        assert!(
            env::ed25519_verify(sig, tee_text.as_bytes(), pubkey),
            "Invalid TEE signature"
        );
        assert!(
            self.trusted_tee_addresses.contains(&signing_address),
            "Signing address not in trusted TEE list"
        );

        if let Resolution::Split { freelancer_pct } = &resolution {
            assert!(*freelancer_pct <= 100, "Invalid split percentage");
        }

        let fee = self.ai_processing_fee;
        let owner = self.owner.clone();

        let mut contract = self.contracts.get(&contract_id).cloned().expect("Contract not found");

        let dispute_idx = contract
            .find_dispute(&milestone_id, DisputeStatus::Pending)
            .expect("No active dispute for this milestone");

        if !contract.disputes[dispute_idx].ai_fee_deducted && fee.as_yoctonear() > 0 {
            contract.security_pool = NearToken::from_yoctonear(
                contract.security_pool.as_yoctonear().saturating_sub(fee.as_yoctonear()),
            );
            let _ = Promise::new(owner).transfer(fee);
            contract.disputes[dispute_idx].ai_fee_deducted = true;
        }

        contract.disputes[dispute_idx].resolution = Some(resolution.clone());
        contract.disputes[dispute_idx].explanation = Some(explanation);
        contract.disputes[dispute_idx].tee_signature = Some(signature);
        contract.disputes[dispute_idx].tee_signing_address = Some(signing_address);
        contract.disputes[dispute_idx].tee_text = Some(tee_text);

        match resolution {
            Resolution::ContinueWork => {
                contract.disputes[dispute_idx].status = DisputeStatus::Finalized;
                contract.disputes[dispute_idx].funds_released = true;

                let milestone_idx = contract.find_milestone(&milestone_id).expect("Milestone not found");
                contract.milestones[milestone_idx].status = MilestoneStatus::InProgress;
                contract.milestones[milestone_idx].payment_request_deadline_ns = None;
                contract.status = ContractStatus::Active;
            }
            _ => {
                contract.disputes[dispute_idx].status = DisputeStatus::AiResolved;
                contract.disputes[dispute_idx].deadline_ns =
                    Some(env::block_timestamp() + DISPUTE_DEADLINE_NS);
            }
        }

        self.contracts.insert(contract_id.clone(), contract);

        emit_event!("ai_resolution", {
            "contract_id" => contract_id,
            "milestone_id" => milestone_id
        });
    }

    pub fn accept_resolution(&mut self, contract_id: String, milestone_id: String) {
        let caller = env::predecessor_account_id();
        let mut contract = self.contracts.get(&contract_id).cloned().expect("Contract not found");

        assert!(contract.is_party(&caller), "Only contract parties can accept");

        let dispute_idx = contract
            .find_dispute(&milestone_id, DisputeStatus::AiResolved)
            .expect("No resolved dispute to accept");

        contract.disputes[dispute_idx].status = DisputeStatus::Finalized;

        self.contracts.insert(contract_id.clone(), contract);

        emit_event!("dispute_finalized", {
            "contract_id" => contract_id,
            "milestone_id" => milestone_id
        });
    }

    pub fn finalize_resolution(&mut self, contract_id: String, milestone_id: String) {
        let mut contract = self.contracts.get(&contract_id).cloned().expect("Contract not found");

        let dispute_idx = contract
            .find_dispute(&milestone_id, DisputeStatus::AiResolved)
            .expect("No resolved dispute to finalize");

        let timed_out = contract.disputes[dispute_idx]
            .deadline_ns
            .map(|d| env::block_timestamp() >= d)
            .unwrap_or(false);

        assert!(timed_out, "Cannot finalize yet: deadline not reached");

        contract.disputes[dispute_idx].status = DisputeStatus::Finalized;

        self.contracts.insert(contract_id.clone(), contract);

        emit_event!("dispute_finalized", {
            "contract_id" => contract_id,
            "milestone_id" => milestone_id
        });
    }

    pub fn override_to_continue_work(&mut self, contract_id: String, milestone_id: String) {
        let caller = env::predecessor_account_id();
        let mut contract = self.contracts.get(&contract_id).cloned().expect("Contract not found");

        assert_eq!(caller, contract.client, "Only client can override to continue work");

        let dispute_idx = contract
            .find_dispute(&milestone_id, DisputeStatus::AiResolved)
            .or_else(|| {
                contract.disputes.iter().position(|d| {
                    d.milestone_id == milestone_id
                        && d.status == DisputeStatus::Finalized
                        && !d.funds_released
                })
            })
            .expect("No overridable dispute for this milestone");

        let resolution = contract.disputes[dispute_idx]
            .resolution
            .as_ref()
            .expect("No resolution set");

        assert!(
            matches!(resolution, Resolution::Client | Resolution::Split { .. }),
            "Override only allowed for Client or Split resolutions"
        );

        contract.disputes[dispute_idx].status = DisputeStatus::Finalized;
        contract.disputes[dispute_idx].funds_released = true;

        let milestone_idx = contract.find_milestone(&milestone_id).expect("Milestone not found");
        contract.milestones[milestone_idx].status = MilestoneStatus::InProgress;
        contract.milestones[milestone_idx].payment_request_deadline_ns = None;
        contract.milestones[milestone_idx].payment_request_blocked_until_ns =
            Some(env::block_timestamp() + PAYMENT_COOLDOWN_NS);
        contract.status = ContractStatus::Active;

        self.contracts.insert(contract_id.clone(), contract);

        emit_event!("dispute_override_continue", {
            "contract_id" => contract_id,
            "milestone_id" => milestone_id
        });
    }
}
