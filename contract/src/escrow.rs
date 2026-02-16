use near_sdk::{env, near_bindgen, NearToken, Promise};

use crate::types::*;
use crate::Contract;

#[near_bindgen]
impl Contract {
    #[payable]
    pub fn fund_contract(&mut self, contract_id: String) {
        let deposit = env::attached_deposit();
        assert!(
            deposit > NearToken::from_yoctonear(0),
            "Must attach NEAR to fund"
        );

        let contract = self
            .contracts
            .get_mut(&contract_id)
            .expect("Contract not found");
        assert!(
            contract.status == ContractStatus::Active,
            "Contract must be active"
        );

        let pct = contract.security_deposit_pct as u128;
        let security_part =
            NearToken::from_yoctonear(deposit.as_yoctonear() * pct / (100 + pct));
        let main_part =
            NearToken::from_yoctonear(deposit.as_yoctonear() - security_part.as_yoctonear());

        contract.security_pool = NearToken::from_yoctonear(
            contract.security_pool.as_yoctonear() + security_part.as_yoctonear(),
        );

        contract.funded_amount = NearToken::from_yoctonear(
            contract.funded_amount.as_yoctonear() + main_part.as_yoctonear(),
        );

        let mut cumulative: u128 = 0;
        for milestone in contract.milestones.iter_mut() {
            cumulative += milestone.amount.as_yoctonear();
            if milestone.status == MilestoneStatus::NotFunded
                && contract.funded_amount.as_yoctonear() >= cumulative
            {
                milestone.status = MilestoneStatus::Funded;
            }
        }

        emit_event!("fund", {
            "contract_id" => contract_id,
            "amount" => deposit.as_yoctonear()
        });
    }

    pub fn approve_milestone(&mut self, contract_id: String, milestone_id: String) {
        let contract = self
            .contracts
            .get_mut(&contract_id)
            .expect("Contract not found");
        assert_eq!(
            contract.client,
            env::predecessor_account_id(),
            "Only client can approve"
        );

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

        emit_event!("milestone_approved", {
            "contract_id" => contract_id,
            "milestone_id" => milestone_id,
            "amount" => amount.as_yoctonear()
        });
    }

    pub fn release_dispute_funds(&mut self, contract_id: String, milestone_id: String) {
        let contract = self
            .contracts
            .get_mut(&contract_id)
            .expect("Contract not found");
        let dispute = contract
            .disputes
            .iter_mut()
            .find(|d| d.milestone_id == milestone_id && d.status == DisputeStatus::Finalized)
            .expect("No finalized dispute for this milestone");

        assert!(
            !dispute.funds_released,
            "Funds already released for this dispute"
        );
        dispute.funds_released = true;

        let resolution = dispute.resolution.clone().expect("No resolution set");
        let milestone = contract
            .milestones
            .iter_mut()
            .find(|m| m.id == milestone_id)
            .expect("Milestone not found");

        let amount = milestone.amount;
        let freelancer = contract.freelancer.clone().expect("No freelancer");
        let client = contract.client.clone();

        match resolution {
            Resolution::Freelancer => {
                milestone.status = MilestoneStatus::Completed;
                let all_completed = contract
                    .milestones
                    .iter()
                    .all(|m| m.status == MilestoneStatus::Completed);
                if all_completed {
                    contract.status = ContractStatus::Resolved;
                }
                Promise::new(freelancer).transfer(amount);
            }
            Resolution::Client => {
                milestone.status = MilestoneStatus::Completed;
                let all_completed = contract
                    .milestones
                    .iter()
                    .all(|m| m.status == MilestoneStatus::Completed);
                if all_completed {
                    contract.status = ContractStatus::Resolved;
                }
                Promise::new(client).transfer(amount);
            }
            Resolution::ContinueWork => {
                milestone.status = MilestoneStatus::InProgress;
                milestone.payment_request_deadline_ns = None;
                contract.status = ContractStatus::Active;
            }
            Resolution::Split { freelancer_pct } => {
                milestone.status = MilestoneStatus::Completed;
                let freelancer_amount = amount.as_yoctonear() * freelancer_pct as u128 / 100;
                let client_amount = amount.as_yoctonear() - freelancer_amount;
                let all_completed = contract
                    .milestones
                    .iter()
                    .all(|m| m.status == MilestoneStatus::Completed);
                if all_completed {
                    contract.status = ContractStatus::Resolved;
                }
                Promise::new(freelancer).transfer(NearToken::from_yoctonear(freelancer_amount));
                Promise::new(client).transfer(NearToken::from_yoctonear(client_amount));
            }
        }

        emit_event!("dispute_funds_released", {
            "contract_id" => contract_id,
            "milestone_id" => milestone_id
        });
    }

    pub fn complete_contract_security(&mut self, contract_id: String) {
        let contract = self
            .contracts
            .get_mut(&contract_id)
            .expect("Contract not found");

        assert!(
            contract
                .milestones
                .iter()
                .all(|m| m.status == MilestoneStatus::Completed),
            "Not all milestones completed"
        );

        let pool = contract.security_pool;
        assert!(
            pool.as_yoctonear() > 0,
            "No security deposit to release"
        );

        contract.security_pool = NearToken::from_yoctonear(0);
        let freelancer = contract.freelancer.clone().expect("No freelancer");

        Promise::new(freelancer).transfer(pool);

        emit_event!("security_pool_released", {
            "contract_id" => contract_id,
            "amount" => pool.as_yoctonear()
        });
    }
}
