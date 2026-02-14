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
        assert_eq!(contract.client, env::predecessor_account_id(), "Only client can fund");
        assert!(
            contract.status == ContractStatus::Active,
            "Contract must be active"
        );

        contract.funded_amount = NearToken::from_yoctonear(
            contract.funded_amount.as_yoctonear() + deposit.as_yoctonear(),
        );

        for milestone in contract.milestones.iter_mut() {
            if milestone.status == MilestoneStatus::NotFunded {
                if contract.funded_amount.as_yoctonear() >= milestone.amount.as_yoctonear() {
                    milestone.status = MilestoneStatus::Funded;
                }
            }
        }

        env::log_str(&format!(
            "EVENT_JSON:{{\"standard\":\"milestone-trust\",\"event\":\"fund\",\"data\":{{\"contract_id\":\"{}\",\"amount\":\"{}\"}}}}",
            contract_id,
            deposit.as_yoctonear()
        ));
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
            milestone.status == MilestoneStatus::InProgress,
            "Milestone must be in progress"
        );

        let amount = milestone.amount;
        milestone.status = MilestoneStatus::Completed;

        let all_completed = contract.milestones.iter().all(|m| m.status == MilestoneStatus::Completed);
        if all_completed {
            contract.status = ContractStatus::Completed;
        }

        Promise::new(freelancer).transfer(amount);

        env::log_str(&format!(
            "EVENT_JSON:{{\"standard\":\"milestone-trust\",\"event\":\"milestone_approved\",\"data\":{{\"contract_id\":\"{}\",\"milestone_id\":\"{}\",\"amount\":\"{}\"}}}}",
            contract_id, milestone_id, amount.as_yoctonear()
        ));
    }

    pub fn release_dispute_funds(
        &mut self,
        contract_id: String,
        milestone_id: String,
    ) {
        let contract = self.contracts.get_mut(&contract_id).expect("Contract not found");
        let dispute = contract
            .disputes
            .iter()
            .find(|d| d.milestone_id == milestone_id && d.status == DisputeStatus::Finalized)
            .expect("No finalized dispute for this milestone");

        let resolution = dispute.resolution.clone().expect("No resolution set");
        let milestone = contract
            .milestones
            .iter()
            .find(|m| m.id == milestone_id)
            .expect("Milestone not found");

        let amount = milestone.amount;
        let freelancer = contract.freelancer.clone().expect("No freelancer");
        let client = contract.client.clone();

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
