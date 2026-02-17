use near_sdk::{env, near_bindgen, NearToken, Promise};

use crate::types::*;
use crate::{Contract, ContractExt};

#[near_bindgen]
impl Contract {
    #[payable]
    pub fn fund_contract(&mut self, contract_id: String) {
        let deposit = env::attached_deposit();
        assert!(deposit > NearToken::from_yoctonear(0), "Must attach NEAR to fund");

        let mut contract = self.contracts.get(&contract_id).cloned().expect("Contract not found");
        assert!(contract.status == ContractStatus::Active, "Contract must be active");

        let pct = contract.security_deposit_pct as u128;
        let security_part = NearToken::from_yoctonear(deposit.as_yoctonear() * pct / (100 + pct));
        let main_part = NearToken::from_yoctonear(deposit.as_yoctonear() - security_part.as_yoctonear());

        let remaining_to_fund = contract
            .total_amount
            .as_yoctonear()
            .saturating_sub(contract.funded_amount.as_yoctonear());

        assert!(remaining_to_fund > 0, "Contract is already fully funded");

        let effective_main = main_part.as_yoctonear().min(remaining_to_fund);
        let refund = main_part.as_yoctonear() - effective_main;

        contract.funded_amount = NearToken::from_yoctonear(
            contract.funded_amount.as_yoctonear() + effective_main,
        );
        contract.security_pool = NearToken::from_yoctonear(
            contract.security_pool.as_yoctonear() + security_part.as_yoctonear(),
        );

        let total_deposited = contract.funded_amount.as_yoctonear() + contract.security_pool.as_yoctonear();
        let mut cumulative: u128 = 0;
        for milestone in contract.milestones.iter_mut() {
            cumulative += milestone.amount.as_yoctonear();
            if milestone.status == MilestoneStatus::NotFunded
                && total_deposited >= cumulative
            {
                milestone.status = MilestoneStatus::InProgress;
            }
        }

        self.contracts.insert(contract_id.clone(), contract);

        if refund > 0 {
            let _ = Promise::new(env::predecessor_account_id())
                .transfer(NearToken::from_yoctonear(refund));
        }

        emit_event!("fund", {
            "contract_id" => contract_id,
            "amount" => deposit.as_yoctonear()
        });
    }

    #[payable]
    pub fn top_up_security(&mut self, contract_id: String) {
        let deposit = env::attached_deposit();
        assert!(deposit > NearToken::from_yoctonear(0), "Must attach NEAR");

        let mut contract = self.contracts.get(&contract_id).cloned().expect("Contract not found");
        let caller = env::predecessor_account_id();
        assert!(contract.is_party(&caller), "Only contract parties can top up security");

        contract.security_pool = NearToken::from_yoctonear(
            contract.security_pool.as_yoctonear() + deposit.as_yoctonear(),
        );

        self.contracts.insert(contract_id.clone(), contract);

        emit_event!("security_topped_up", {
            "contract_id" => contract_id,
            "amount" => deposit.as_yoctonear()
        });
    }

    pub fn approve_milestone(&mut self, contract_id: String, milestone_id: String) {
        let mut contract = self.contracts.get(&contract_id).cloned().expect("Contract not found");
        assert_eq!(contract.client, env::predecessor_account_id(), "Only client can approve");

        let freelancer = contract.require_freelancer();
        let idx = contract.find_milestone(&milestone_id).expect("Milestone not found");

        assert!(
            contract.milestones[idx].status == MilestoneStatus::SubmittedForReview,
            "Milestone must be submitted for review"
        );

        let amount = contract.milestones[idx].amount;
        contract.milestones[idx].status = MilestoneStatus::Completed;
        contract.milestones[idx].payment_request_deadline_ns = None;

        if contract.all_milestones_completed() {
            contract.status = ContractStatus::Completed;
        }

        self.contracts.insert(contract_id.clone(), contract);
        let _ = Promise::new(freelancer).transfer(amount);

        emit_event!("milestone_approved", {
            "contract_id" => contract_id,
            "milestone_id" => milestone_id,
            "amount" => amount.as_yoctonear()
        });
    }

    pub fn release_dispute_funds(&mut self, contract_id: String, milestone_id: String) {
        let mut contract = self.contracts.get(&contract_id).cloned().expect("Contract not found");

        let dispute_idx = contract
            .find_dispute(&milestone_id, DisputeStatus::Finalized)
            .expect("No finalized dispute for this milestone");

        assert!(!contract.disputes[dispute_idx].funds_released, "Funds already released");
        contract.disputes[dispute_idx].funds_released = true;

        let resolution = contract.disputes[dispute_idx]
            .resolution
            .clone()
            .expect("No resolution set");

        let milestone_idx = contract.find_milestone(&milestone_id).expect("Milestone not found");
        let amount = contract.milestones[milestone_idx].amount;
        let freelancer = contract.require_freelancer();
        let client = contract.client.clone();

        match resolution {
            Resolution::Freelancer => {
                contract.milestones[milestone_idx].status = MilestoneStatus::Completed;
                if contract.all_milestones_completed() {
                    contract.status = ContractStatus::Resolved;
                }
                self.contracts.insert(contract_id.clone(), contract);
                let _ = Promise::new(freelancer).transfer(amount);
            }
            Resolution::Client => {
                contract.milestones[milestone_idx].status = MilestoneStatus::Completed;
                if contract.all_milestones_completed() {
                    contract.status = ContractStatus::Resolved;
                }
                self.contracts.insert(contract_id.clone(), contract);
                let _ = Promise::new(client).transfer(amount);
            }
            Resolution::ContinueWork => {
                contract.milestones[milestone_idx].status = MilestoneStatus::InProgress;
                contract.milestones[milestone_idx].payment_request_deadline_ns = None;
                contract.status = ContractStatus::Active;
                self.contracts.insert(contract_id.clone(), contract);
            }
            Resolution::Split { freelancer_pct } => {
                assert!(freelancer_pct <= 100, "Invalid split percentage");
                contract.milestones[milestone_idx].status = MilestoneStatus::Completed;
                let freelancer_amount = amount.as_yoctonear() * freelancer_pct as u128 / 100;
                let client_amount = amount.as_yoctonear() - freelancer_amount;
                if contract.all_milestones_completed() {
                    contract.status = ContractStatus::Resolved;
                }
                self.contracts.insert(contract_id.clone(), contract);
                if freelancer_amount > 0 {
                    let _ = Promise::new(freelancer).transfer(NearToken::from_yoctonear(freelancer_amount));
                }
                if client_amount > 0 {
                    let _ = Promise::new(client).transfer(NearToken::from_yoctonear(client_amount));
                }
            }
        }

        emit_event!("dispute_funds_released", {
            "contract_id" => contract_id,
            "milestone_id" => milestone_id
        });
    }

    pub fn complete_contract_security(&mut self, contract_id: String) {
        let mut contract = self.contracts.get(&contract_id).cloned().expect("Contract not found");

        assert!(contract.all_milestones_completed(), "Not all milestones completed");

        let pool = contract.security_pool;
        assert!(pool.as_yoctonear() > 0, "No security deposit to release");

        contract.security_pool = NearToken::from_yoctonear(0);
        let freelancer = contract.require_freelancer();

        self.contracts.insert(contract_id.clone(), contract);
        let _ = Promise::new(freelancer).transfer(pool);

        emit_event!("security_pool_released", {
            "contract_id" => contract_id,
            "amount" => pool.as_yoctonear()
        });
    }
}
