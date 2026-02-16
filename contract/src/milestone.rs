use near_sdk::{env, near_bindgen, NearToken, Promise};

use crate::types::*;
use crate::Contract;

const PAYMENT_REQUEST_DEADLINE_NS: u64 = 48 * 60 * 60 * 1_000_000_000;

#[near_bindgen]
impl Contract {
    pub fn start_milestone(&mut self, contract_id: String, milestone_id: String) {
        let contract = self
            .contracts
            .get_mut(&contract_id)
            .expect("Contract not found");
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

    pub fn request_payment(&mut self, contract_id: String, milestone_id: String) {
        let contract = self
            .contracts
            .get_mut(&contract_id)
            .expect("Contract not found");
        let caller = env::predecessor_account_id();
        assert!(
            Some(&caller) == contract.freelancer.as_ref(),
            "Only freelancer can request payment"
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
        milestone.payment_request_deadline_ns =
            Some(env::block_timestamp() + PAYMENT_REQUEST_DEADLINE_NS);

        emit_event!("payment_requested", {
            "contract_id" => contract_id,
            "milestone_id" => milestone_id
        });
    }

    pub fn auto_approve_payment(&mut self, contract_id: String, milestone_id: String) {
        let contract = self
            .contracts
            .get_mut(&contract_id)
            .expect("Contract not found");

        let freelancer = contract.freelancer.clone().expect("No freelancer assigned");

        let milestone = contract
            .milestones
            .iter_mut()
            .find(|m| m.id == milestone_id)
            .expect("Milestone not found");

        assert!(
            milestone.status == MilestoneStatus::SubmittedForReview,
            "Milestone must be submitted for review"
        );

        let deadline = milestone
            .payment_request_deadline_ns
            .expect("No payment request deadline set");
        assert!(
            env::block_timestamp() >= deadline,
            "Payment request deadline has not passed"
        );

        let amount = milestone.amount;
        milestone.status = MilestoneStatus::Completed;
        milestone.payment_request_deadline_ns = None;

        let all_completed = contract
            .milestones
            .iter()
            .all(|m| m.status == MilestoneStatus::Completed);
        if all_completed {
            contract.status = ContractStatus::Completed;
        }

        Promise::new(freelancer).transfer(amount);

        emit_event!("payment_auto_approved", {
            "contract_id" => contract_id,
            "milestone_id" => milestone_id,
            "amount" => amount.as_yoctonear()
        });
    }

    pub fn cancel_payment_request(&mut self, contract_id: String, milestone_id: String) {
        let contract = self
            .contracts
            .get_mut(&contract_id)
            .expect("Contract not found");
        let caller = env::predecessor_account_id();
        assert!(
            Some(&caller) == contract.freelancer.as_ref(),
            "Only freelancer can cancel payment request"
        );

        let milestone = contract
            .milestones
            .iter_mut()
            .find(|m| m.id == milestone_id)
            .expect("Milestone not found");

        assert!(
            milestone.status == MilestoneStatus::SubmittedForReview,
            "Milestone must be submitted for review"
        );

        milestone.status = MilestoneStatus::InProgress;
        milestone.payment_request_deadline_ns = None;

        emit_event!("payment_request_cancelled", {
            "contract_id" => contract_id,
            "milestone_id" => milestone_id
        });
    }
}
