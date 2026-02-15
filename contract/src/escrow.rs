use near_sdk::{env, near_bindgen, NearToken, Promise};

use crate::types::*;
use crate::Contract;

#[near_bindgen]
impl Contract {
    #[payable]
    pub fn fund_contract(&mut self, contract_id: String) {
        let deposit = env::attached_deposit();
        assert!(deposit > NearToken::from_yoctonear(0), "Must attach NEAR to fund");

        let contract = self.contracts.get_mut(&contract_id).expect("Contract not found");
        assert!(
            contract.status == ContractStatus::Active,
            "Contract must be active"
        );

        contract.funded_amount = NearToken::from_yoctonear(
            contract.funded_amount.as_yoctonear() + deposit.as_yoctonear(),
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
        let contract = self.contracts.get_mut(&contract_id).expect("Contract not found");
        assert_eq!(contract.client, env::predecessor_account_id(), "Only client can approve");

        let freelancer = contract.freelancer.clone().expect("No freelancer assigned");

        let milestone = contract
            .milestones
            .iter_mut()
            .find(|m| m.id == milestone_id)
            .expect("Milestone not found");

        assert!(
            milestone.status == MilestoneStatus::InProgress
                || milestone.status == MilestoneStatus::SubmittedForReview,
            "Milestone must be in progress or submitted for review"
        );

        let amount = milestone.amount;
        milestone.status = MilestoneStatus::Completed;

        let all_completed = contract.milestones.iter().all(|m| m.status == MilestoneStatus::Completed);
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

    pub fn release_dispute_funds(
        &mut self,
        contract_id: String,
        milestone_id: String,
    ) {
        let contract = self.contracts.get_mut(&contract_id).expect("Contract not found");
        let dispute = contract
            .disputes
            .iter_mut()
            .find(|d| d.milestone_id == milestone_id && d.status == DisputeStatus::Finalized)
            .expect("No finalized dispute for this milestone");

        assert!(!dispute.funds_released, "Funds already released for this dispute");
        dispute.funds_released = true;

        let resolution = dispute.resolution.clone().expect("No resolution set");
        let milestone = contract
            .milestones
            .iter_mut()
            .find(|m| m.id == milestone_id)
            .expect("Milestone not found");

        let amount = milestone.amount;
        milestone.status = MilestoneStatus::Completed;

        let freelancer = contract.freelancer.clone().expect("No freelancer");
        let client = contract.client.clone();

        let all_completed = contract.milestones.iter().all(|m| m.status == MilestoneStatus::Completed);
        if all_completed {
            contract.status = ContractStatus::Resolved;
        }

        match resolution {
            Resolution::Freelancer => {
                Promise::new(freelancer).transfer(amount);
            }
            Resolution::Client => {
                Promise::new(client).transfer(amount);
            }
            Resolution::Split { freelancer_pct } => {
                let freelancer_amount = amount.as_yoctonear() * freelancer_pct as u128 / 100;
                let client_amount = amount.as_yoctonear() - freelancer_amount;
                Promise::new(freelancer).transfer(NearToken::from_yoctonear(freelancer_amount));
                Promise::new(client).transfer(NearToken::from_yoctonear(client_amount));
            }
        }
    }
}
