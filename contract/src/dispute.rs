use near_sdk::{env, near_bindgen, NearToken, Promise};

use crate::types::*;
use crate::Contract;

const DISPUTE_DEADLINE_NS: u64 = 48 * 60 * 60 * 1_000_000_000;

#[near_bindgen]
impl Contract {
    pub fn raise_dispute(
        &mut self,
        contract_id: String,
        milestone_id: String,
        reason: String,
    ) {
        let contract = self
            .contracts
            .get_mut(&contract_id)
            .expect("Contract not found");
        let caller = env::predecessor_account_id();
        assert_eq!(
            caller, contract.client,
            "Only client can raise disputes"
        );

        assert!(
            contract.security_pool.as_yoctonear() >= self.ai_processing_fee.as_yoctonear(),
            "Insufficient security deposit for AI processing"
        );

        let milestone = contract
            .milestones
            .iter_mut()
            .find(|m| m.id == milestone_id)
            .expect("Milestone not found");

        assert!(
            milestone.status == MilestoneStatus::SubmittedForReview,
            "Can only dispute milestones submitted for review"
        );

        milestone.status = MilestoneStatus::Disputed;
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
        assert!(
            env::ed25519_verify(&signature, tee_text.as_bytes(), &signing_address),
            "Invalid TEE signature"
        );
        assert!(
            self.trusted_tee_addresses.contains(&signing_address),
            "Signing address not in trusted TEE list"
        );

        let fee = self.ai_processing_fee;
        let owner = self.owner.clone();

        let contract = self
            .contracts
            .get_mut(&contract_id)
            .expect("Contract not found");
        let dispute = contract
            .disputes
            .iter_mut()
            .find(|d| d.milestone_id == milestone_id && d.status == DisputeStatus::Pending)
            .expect("No active dispute for this milestone");

        if !dispute.ai_fee_deducted && fee.as_yoctonear() > 0 {
            contract.security_pool = NearToken::from_yoctonear(
                contract
                    .security_pool
                    .as_yoctonear()
                    .saturating_sub(fee.as_yoctonear()),
            );
            Promise::new(owner).transfer(fee);
            dispute.ai_fee_deducted = true;
        }

        dispute.resolution = Some(resolution.clone());
        dispute.explanation = Some(explanation);
        dispute.tee_signature = Some(signature);
        dispute.tee_signing_address = Some(signing_address);
        dispute.tee_text = Some(tee_text);

        match resolution {
            Resolution::ContinueWork => {
                dispute.status = DisputeStatus::Finalized;
                dispute.funds_released = true;

                let milestone = contract
                    .milestones
                    .iter_mut()
                    .find(|m| m.id == milestone_id)
                    .expect("Milestone not found");
                milestone.status = MilestoneStatus::InProgress;
                milestone.payment_request_deadline_ns = None;
                contract.status = ContractStatus::Active;
            }
            _ => {
                dispute.status = DisputeStatus::AiResolved;
                dispute.deadline_ns = Some(env::block_timestamp() + DISPUTE_DEADLINE_NS);
            }
        }

        emit_event!("ai_resolution", {
            "contract_id" => contract_id,
            "milestone_id" => milestone_id
        });
    }

    pub fn accept_resolution(&mut self, contract_id: String, milestone_id: String) {
        let caller = env::predecessor_account_id();
        let contract = self
            .contracts
            .get_mut(&contract_id)
            .expect("Contract not found");

        assert!(
            caller == contract.client || Some(&caller) == contract.freelancer.as_ref(),
            "Only contract parties can accept"
        );

        let dispute = contract
            .disputes
            .iter_mut()
            .find(|d| d.milestone_id == milestone_id && d.status == DisputeStatus::AiResolved)
            .expect("No resolved dispute to accept");

        dispute.status = DisputeStatus::Finalized;

        emit_event!("dispute_finalized", {
            "contract_id" => contract_id,
            "milestone_id" => milestone_id
        });
    }

    pub fn finalize_resolution(&mut self, contract_id: String, milestone_id: String) {
        let contract = self
            .contracts
            .get_mut(&contract_id)
            .expect("Contract not found");
        let dispute = contract
            .disputes
            .iter_mut()
            .find(|d| d.milestone_id == milestone_id && d.status == DisputeStatus::AiResolved)
            .expect("No resolved dispute to finalize");

        let timed_out = dispute
            .deadline_ns
            .map(|d| env::block_timestamp() >= d)
            .unwrap_or(false);

        assert!(
            timed_out,
            "Cannot finalize yet: deadline not reached"
        );

        dispute.status = DisputeStatus::Finalized;

        emit_event!("dispute_finalized", {
            "contract_id" => contract_id,
            "milestone_id" => milestone_id
        });
    }
}
