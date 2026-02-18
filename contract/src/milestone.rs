use near_sdk::{env, near_bindgen, Promise};

use crate::types::*;
use crate::{Contract, ContractExt};

const PAYMENT_REQUEST_DEADLINE_NS: u64 = 48 * 60 * 60 * 1_000_000_000;

#[near_bindgen]
impl Contract {
    pub fn start_milestone(&mut self, contract_id: String, milestone_id: String) {
        let mut contract = self.contracts.get(&contract_id).cloned().expect("Contract not found");
        let caller = env::predecessor_account_id();
        assert!(
            Some(&caller) == contract.freelancer.as_ref(),
            "Only freelancer can start milestones"
        );

        let idx = contract.find_milestone(&milestone_id).expect("Milestone not found");
        assert!(
            contract.milestones[idx].status == MilestoneStatus::Funded,
            "Milestone must be funded first"
        );

        contract.milestones[idx].status = MilestoneStatus::InProgress;
        self.contracts.insert(contract_id.clone(), contract);

        emit_event!("milestone_started", {
            "contract_id" => contract_id,
            "milestone_id" => milestone_id
        });
    }

    pub fn request_payment(&mut self, contract_id: String, milestone_id: String) {
        let mut contract = self.contracts.get(&contract_id).cloned().expect("Contract not found");
        let caller = env::predecessor_account_id();
        assert!(
            Some(&caller) == contract.freelancer.as_ref(),
            "Only freelancer can request payment"
        );

        let idx = contract.find_milestone(&milestone_id).expect("Milestone not found");
        assert!(
            contract.milestones[idx].status == MilestoneStatus::InProgress,
            "Milestone must be in progress"
        );

        if let Some(blocked_until) = contract.milestones[idx].payment_request_blocked_until_ns {
            assert!(
                env::block_timestamp() >= blocked_until,
                "Payment requests are temporarily blocked (cooldown after dispute)"
            );
        }
        contract.milestones[idx].payment_request_blocked_until_ns = None;

        contract.milestones[idx].status = MilestoneStatus::SubmittedForReview;
        contract.milestones[idx].payment_request_deadline_ns =
            Some(env::block_timestamp() + PAYMENT_REQUEST_DEADLINE_NS);

        self.contracts.insert(contract_id.clone(), contract);

        emit_event!("payment_requested", {
            "contract_id" => contract_id,
            "milestone_id" => milestone_id
        });
    }

    pub fn auto_approve_payment(&mut self, contract_id: String, milestone_id: String) {
        let mut contract = self.contracts.get(&contract_id).cloned().expect("Contract not found");
        let freelancer = contract.require_freelancer();

        let idx = contract.find_milestone(&milestone_id).expect("Milestone not found");
        assert!(
            contract.milestones[idx].status == MilestoneStatus::SubmittedForReview,
            "Milestone must be submitted for review"
        );

        let deadline = contract.milestones[idx]
            .payment_request_deadline_ns
            .expect("No payment request deadline set");
        assert!(
            env::block_timestamp() >= deadline,
            "Payment request deadline has not passed"
        );

        let amount = contract.milestones[idx].amount;
        contract.milestones[idx].status = MilestoneStatus::Completed;
        contract.milestones[idx].payment_request_deadline_ns = None;

        if contract.all_milestones_completed() {
            contract.status = ContractStatus::Completed;
        }

        self.contracts.insert(contract_id.clone(), contract);
        let _ = Promise::new(freelancer).transfer(amount);

        emit_event!("payment_auto_approved", {
            "contract_id" => contract_id,
            "milestone_id" => milestone_id,
            "amount" => amount.as_yoctonear()
        });
    }

    pub fn cancel_payment_request(&mut self, contract_id: String, milestone_id: String) {
        let mut contract = self.contracts.get(&contract_id).cloned().expect("Contract not found");
        let caller = env::predecessor_account_id();
        assert!(
            Some(&caller) == contract.freelancer.as_ref(),
            "Only freelancer can cancel payment request"
        );

        let idx = contract.find_milestone(&milestone_id).expect("Milestone not found");
        assert!(
            contract.milestones[idx].status == MilestoneStatus::SubmittedForReview,
            "Milestone must be submitted for review"
        );

        contract.milestones[idx].status = MilestoneStatus::InProgress;
        contract.milestones[idx].payment_request_deadline_ns = None;

        self.contracts.insert(contract_id.clone(), contract);

        emit_event!("payment_request_cancelled", {
            "contract_id" => contract_id,
            "milestone_id" => milestone_id
        });
    }
}
