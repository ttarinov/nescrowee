use near_sdk::{env, near_bindgen};

use crate::types::*;
use crate::Contract;

#[near_bindgen]
impl Contract {
    pub fn start_milestone(&mut self, contract_id: String, milestone_id: String) {
        let contract = self.contracts.get_mut(&contract_id).expect("Contract not found");
        let caller = env::predecessor_account_id();
        assert!(
            Some(&caller) == contract.freelancer.as_ref(),
            "Only freelancer can start milestones"
        );

        let milestone = contract
            .milestones
            .iter_mut()
            .find(|m| m.id == milestone_id)
            .expect("Milestone not found");

        assert!(
            milestone.status == MilestoneStatus::Funded,
            "Milestone must be funded first"
        );

        milestone.status = MilestoneStatus::InProgress;

        emit_event!("milestone_started", {
            "contract_id" => contract_id,
            "milestone_id" => milestone_id
        });
    }

    pub fn complete_milestone(&mut self, contract_id: String, milestone_id: String) {
        let contract = self.contracts.get_mut(&contract_id).expect("Contract not found");
        let caller = env::predecessor_account_id();
        assert!(
            Some(&caller) == contract.freelancer.as_ref(),
            "Only freelancer can mark milestones complete"
        );

        let milestone = contract
            .milestones
            .iter_mut()
            .find(|m| m.id == milestone_id)
            .expect("Milestone not found");

        assert!(
            milestone.status == MilestoneStatus::InProgress,
            "Milestone must be in progress"
        );

        milestone.status = MilestoneStatus::SubmittedForReview;

        emit_event!("milestone_completed", {
            "contract_id" => contract_id,
            "milestone_id" => milestone_id
        });
    }
}
