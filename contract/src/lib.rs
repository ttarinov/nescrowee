use near_sdk::borsh::{BorshDeserialize, BorshSerialize};
use near_sdk::store::IterableMap;
use near_sdk::{env, near_bindgen, AccountId, NearToken, PanicOnDefault};

macro_rules! emit_event {
    ($event:expr, { $($key:expr => $val:expr),* $(,)? }) => {
        env::log_str(&format!(
            "EVENT_JSON:{{\"standard\":\"nescrowee\",\"event\":\"{}\",\"data\":{{{}}}}}",
            $event,
            [$( format!("\"{}\":\"{}\"", $key, $val) ),*].join(",")
        ));
    };
}

mod dispute;
mod escrow;
mod milestone;
pub mod types;

use types::*;

#[near_bindgen]
#[derive(BorshDeserialize, BorshSerialize, PanicOnDefault)]
#[borsh(crate = "near_sdk::borsh")]
pub struct Contract {
    pub contracts: IterableMap<String, EscrowContract>,
    pub account_contracts: IterableMap<AccountId, Vec<String>>,
    pub trusted_tee_addresses: Vec<Vec<u8>>,
    pub owner: AccountId,
    pub next_id: u64,
    pub ai_processing_fee: NearToken,
}

#[near_bindgen]
impl Contract {
    #[init]
    pub fn new(owner: AccountId) -> Self {
        Self {
            contracts: IterableMap::new(b"c"),
            account_contracts: IterableMap::new(b"a"),
            trusted_tee_addresses: vec![],
            owner,
            next_id: 0,
            ai_processing_fee: NearToken::from_yoctonear(0),
        }
    }

    fn require_owner(&self) {
        assert_eq!(
            env::predecessor_account_id(),
            self.owner,
            "Only owner"
        );
    }

    fn link_account(&mut self, account: &AccountId, contract_id: &str) {
        let mut ids = self.account_contracts.get(account).cloned().unwrap_or_default();
        ids.push(contract_id.to_string());
        self.account_contracts.insert(account.clone(), ids);
    }

    pub fn register_tee_address(&mut self, address: Vec<u8>) {
        self.require_owner();
        if !self.trusted_tee_addresses.contains(&address) {
            self.trusted_tee_addresses.push(address);
        }
    }

    pub fn remove_tee_address(&mut self, address: Vec<u8>) {
        self.require_owner();
        self.trusted_tee_addresses.retain(|a| a != &address);
    }

    pub fn get_trusted_tee_addresses(&self) -> &[Vec<u8>] {
        &self.trusted_tee_addresses
    }

    pub fn set_ai_processing_fee(&mut self, fee_yoctonear: u128) {
        self.require_owner();
        self.ai_processing_fee = NearToken::from_yoctonear(fee_yoctonear);
    }

    pub fn get_ai_processing_fee(&self) -> NearToken {
        self.ai_processing_fee
    }

    pub fn create_contract(
        &mut self,
        title: String,
        description: String,
        milestones: Vec<MilestoneInput>,
        freelancer: Option<AccountId>,
        security_deposit_pct: u8,
        prompt_hash: String,
        model_id: String,
    ) -> String {
        assert!(
            (5..=30).contains(&security_deposit_pct),
            "Security deposit must be between 5% and 30%"
        );
        assert!(!milestones.is_empty(), "At least one milestone required");

        let client = env::predecessor_account_id();
        assert!(
            freelancer.as_ref() != Some(&client),
            "Cannot be your own freelancer"
        );

        self.next_id += 1;
        let contract_id = format!("c{}", self.next_id);

        let total_amount: u128 = milestones.iter().map(|m| m.amount).sum();
        assert!(total_amount > 0, "Total amount must be greater than zero");

        let invite_token = if freelancer.is_none() {
            Some(format!(
                "{:x}",
                env::random_seed()
                    .iter()
                    .fold(0u64, |acc, &b| acc.wrapping_mul(256).wrapping_add(b as u64))
            ))
        } else {
            None
        };

        let escrow_milestones: Vec<Milestone> = milestones
            .into_iter()
            .enumerate()
            .map(|(i, m)| Milestone {
                id: format!("m{}", i + 1),
                title: m.title,
                description: m.description,
                amount: NearToken::from_yoctonear(m.amount),
                status: MilestoneStatus::NotFunded,
                payment_request_deadline_ns: None,
            })
            .collect();

        let status = if freelancer.is_some() {
            ContractStatus::Active
        } else {
            ContractStatus::Draft
        };

        let escrow = EscrowContract {
            id: contract_id.clone(),
            title,
            description,
            client: client.clone(),
            freelancer: freelancer.clone(),
            total_amount: NearToken::from_yoctonear(total_amount),
            funded_amount: NearToken::from_yoctonear(0),
            security_deposit_pct,
            milestones: escrow_milestones,
            status,
            created_at: env::block_timestamp(),
            invite_token,
            prompt_hash,
            disputes: vec![],
            model_id,
            security_pool: NearToken::from_yoctonear(0),
        };

        self.contracts.insert(contract_id.clone(),escrow);
        self.link_account(&client, &contract_id);

        if let Some(ref f) = freelancer {
            self.link_account(f, &contract_id);
        }

        emit_event!("contract_created", {
            "contract_id" => contract_id
        });

        contract_id
    }

    pub fn join_contract(&mut self, contract_id: String, invite_token: String) {
        let mut contract = self.contracts.get(&contract_id).cloned().expect("Contract not found");

        assert!(contract.freelancer.is_none(), "Contract already has a freelancer");
        assert!(
            contract.invite_token.as_ref() == Some(&invite_token),
            "Invalid invite token"
        );

        let freelancer = env::predecessor_account_id();
        assert!(freelancer != contract.client, "Cannot join your own contract");

        contract.freelancer = Some(freelancer.clone());
        contract.status = ContractStatus::Active;
        contract.invite_token = None;

        self.contracts.insert(contract_id.clone(),contract);
        self.link_account(&freelancer, &contract_id);

        emit_event!("contract_joined", {
            "contract_id" => contract_id
        });
    }

    pub fn get_contract(&self, contract_id: String) -> Option<EscrowContract> {
        self.contracts.get(&contract_id).cloned()
    }

    pub fn get_contracts_by_account(&self, account_id: AccountId) -> Vec<EscrowContract> {
        self.account_contracts
            .get(&account_id)
            .map(|ids: &Vec<String>| {
                ids.iter()
                    .filter_map(|id| self.contracts.get(id).cloned())
                    .collect()
            })
            .unwrap_or_default()
    }

    pub fn get_dispute(&self, contract_id: String, milestone_id: String) -> Option<Dispute> {
        self.contracts.get(&contract_id).cloned().and_then(|c| {
            c.disputes
                .iter()
                .find(|d| d.milestone_id == milestone_id)
                .cloned()
        })
    }

    pub fn get_prompt_hash(&self, contract_id: String) -> Option<String> {
        self.contracts.get(&contract_id).map(|c| c.prompt_hash.clone())
    }
}

#[derive(near_sdk::serde::Deserialize, near_sdk::serde::Serialize)]
#[serde(crate = "near_sdk::serde")]
pub struct MilestoneInput {
    pub title: String,
    pub description: String,
    pub amount: u128,
}

#[cfg(test)]
mod tests;
