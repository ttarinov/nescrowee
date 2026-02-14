use near_sdk::{env, near_bindgen};

use crate::types::*;
use crate::Contract;

const DISPUTE_DEADLINE_NS: u64 = 48 * 60 * 60 * 1_000_000_000; // 48 hours

#[near_bindgen]
impl Contract {
    pub fn raise_dispute(
        &mut self,
        contract_id: String,
        milestone_id: String,
        reason: String,
    ) {
        let contract = self.contracts.get_mut(&contract_id).expect("Contract not found");
        let caller = env::predecessor_account_id();
        assert!(
            caller == contract.client || Some(&caller) == contract.freelancer.as_ref(),
            "Only contract parties can raise disputes"
        );

        let milestone = contract
            .milestones
            .iter_mut()
            .find(|m| m.id == milestone_id)
            .expect("Milestone not found");

        assert!(
            milestone.status == MilestoneStatus::InProgress || milestone.status == MilestoneStatus::Funded,
            "Cannot dispute this milestone"
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
            client_accepted: false,
            freelancer_accepted: false,
            is_appeal: false,
            tee_signature: None,
            tee_signing_address: None,
            tee_text: None,
            investigation_rounds: vec![],
            max_rounds: 3,
        });

        env::log_str(&format!(
            "EVENT_JSON:{{\"standard\":\"milestone-trust\",\"event\":\"dispute_raised\",\"data\":{{\"contract_id\":\"{}\",\"milestone_id\":\"{}\"}}}}",
            contract_id, milestone_id
        ));
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

        let contract = self.contracts.get_mut(&contract_id).expect("Contract not found");
        let dispute = contract
            .disputes
            .iter_mut()
            .find(|d| {
                d.milestone_id == milestone_id
                    && (d.status == DisputeStatus::Pending || d.status == DisputeStatus::Appealed)
            })
            .expect("No active dispute for this milestone");

        let new_status = if dispute.is_appeal {
            DisputeStatus::AppealResolved
        } else {
            DisputeStatus::AiResolved
        };

        dispute.status = new_status;
        dispute.resolution = Some(resolution);
        dispute.explanation = Some(explanation);
        dispute.deadline_ns = Some(env::block_timestamp() + DISPUTE_DEADLINE_NS);
        dispute.client_accepted = false;
        dispute.freelancer_accepted = false;
        dispute.tee_signature = Some(signature);
        dispute.tee_signing_address = Some(signing_address);
        dispute.tee_text = Some(tee_text);

        env::log_str(&format!(
            "EVENT_JSON:{{\"standard\":\"milestone-trust\",\"event\":\"ai_resolution\",\"data\":{{\"contract_id\":\"{}\",\"milestone_id\":\"{}\"}}}}",
            contract_id, milestone_id
        ));
    }

    pub fn submit_investigation_round(
        &mut self,
        contract_id: String,
        milestone_id: String,
        round_number: u8,
        analysis: String,
        findings: String,
        confidence: u8,
        needs_more_analysis: bool,
        resolution: Option<Resolution>,
        explanation: Option<String>,
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

        let contract = self.contracts.get_mut(&contract_id).expect("Contract not found");
        let dispute = contract
            .disputes
            .iter_mut()
            .find(|d| {
                d.milestone_id == milestone_id
                    && (d.status == DisputeStatus::Pending || d.status == DisputeStatus::Appealed)
            })
            .expect("No active dispute for this milestone");

        assert!(
            round_number as usize == dispute.investigation_rounds.len() + 1,
            "Invalid round number"
        );

        dispute.investigation_rounds.push(InvestigationRound {
            round_number,
            analysis,
            findings,
            confidence,
            needs_more_analysis,
            tee_signature: signature.clone(),
            tee_signing_address: signing_address.clone(),
            tee_text: tee_text.clone(),
            timestamp: env::block_timestamp(),
        });

        let is_final = !needs_more_analysis || round_number >= dispute.max_rounds;

        if is_final {
            if let (Some(res), Some(exp)) = (resolution, explanation) {
                let new_status = if dispute.is_appeal {
                    DisputeStatus::AppealResolved
                } else {
                    DisputeStatus::AiResolved
                };
                dispute.status = new_status;
                dispute.resolution = Some(res);
                dispute.explanation = Some(exp);
                dispute.deadline_ns = Some(env::block_timestamp() + 48 * 60 * 60 * 1_000_000_000);
                dispute.client_accepted = false;
                dispute.freelancer_accepted = false;
                dispute.tee_signature = Some(signature);
                dispute.tee_signing_address = Some(signing_address);
                dispute.tee_text = Some(tee_text);
            }
        }

        env::log_str(&format!(
            "EVENT_JSON:{{\"standard\":\"milestone-trust\",\"event\":\"investigation_round\",\"data\":{{\"contract_id\":\"{}\",\"milestone_id\":\"{}\",\"round\":{}}}}}",
            contract_id, milestone_id, round_number
        ));
    }

    pub fn accept_resolution(&mut self, contract_id: String, milestone_id: String) {
        let caller = env::predecessor_account_id();
        let contract = self.contracts.get_mut(&contract_id).expect("Contract not found");

        let dispute = contract
            .disputes
            .iter_mut()
            .find(|d| {
                d.milestone_id == milestone_id
                    && (d.status == DisputeStatus::AiResolved
                        || d.status == DisputeStatus::AppealResolved)
            })
            .expect("No resolved dispute to accept");

        if caller == contract.client {
            dispute.client_accepted = true;
        } else if Some(&caller) == contract.freelancer.as_ref() {
            dispute.freelancer_accepted = true;
        } else {
            panic!("Only contract parties can accept");
        }

        if dispute.client_accepted && dispute.freelancer_accepted {
            dispute.status = DisputeStatus::Finalized;
            env::log_str(&format!(
                "EVENT_JSON:{{\"standard\":\"milestone-trust\",\"event\":\"dispute_finalized\",\"data\":{{\"contract_id\":\"{}\",\"milestone_id\":\"{}\"}}}}",
                contract_id, milestone_id
            ));
        }
    }

    pub fn appeal_resolution(&mut self, contract_id: String, milestone_id: String) {
        let caller = env::predecessor_account_id();
        let contract = self.contracts.get_mut(&contract_id).expect("Contract not found");

        assert!(
            caller == contract.client || Some(&caller) == contract.freelancer.as_ref(),
            "Only contract parties can appeal"
        );

        let dispute = contract
            .disputes
            .iter_mut()
            .find(|d| d.milestone_id == milestone_id && d.status == DisputeStatus::AiResolved)
            .expect("Can only appeal standard AI resolution");

        dispute.status = DisputeStatus::Appealed;
        dispute.is_appeal = true;
        dispute.client_accepted = false;
        dispute.freelancer_accepted = false;
        dispute.max_rounds = 5;
        dispute.investigation_rounds = vec![];

        env::log_str(&format!(
            "EVENT_JSON:{{\"standard\":\"milestone-trust\",\"event\":\"dispute_appealed\",\"data\":{{\"contract_id\":\"{}\",\"milestone_id\":\"{}\"}}}}",
            contract_id, milestone_id
        ));
    }

    pub fn finalize_resolution(&mut self, contract_id: String, milestone_id: String) {
        let contract = self.contracts.get_mut(&contract_id).expect("Contract not found");
        let dispute = contract
            .disputes
            .iter_mut()
            .find(|d| {
                d.milestone_id == milestone_id
                    && (d.status == DisputeStatus::AiResolved
                        || d.status == DisputeStatus::AppealResolved)
            })
            .expect("No resolved dispute to finalize");

        let both_accepted = dispute.client_accepted && dispute.freelancer_accepted;
        let timed_out = dispute
            .deadline_ns
            .map(|d| env::block_timestamp() >= d)
            .unwrap_or(false);

        assert!(both_accepted || timed_out, "Cannot finalize yet: not accepted and not timed out");

        dispute.status = DisputeStatus::Finalized;

        env::log_str(&format!(
            "EVENT_JSON:{{\"standard\":\"milestone-trust\",\"event\":\"dispute_finalized\",\"data\":{{\"contract_id\":\"{}\",\"milestone_id\":\"{}\"}}}}",
            contract_id, milestone_id
        ));
    }
}
