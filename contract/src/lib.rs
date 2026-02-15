use near_sdk::borsh::{BorshDeserialize, BorshSerialize};
use near_sdk::collections::UnorderedMap;
use near_sdk::{env, near_bindgen, AccountId, NearToken, PanicOnDefault};
use std::collections::HashMap;

macro_rules! emit_event {
    ($event:expr, { $($key:expr => $val:expr),* $(,)? }) => {
        env::log_str(&format!(
            "EVENT_JSON:{{\"standard\":\"milestone-trust\",\"event\":\"{}\",\"data\":{{{}}}}}",
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
    pub contracts: UnorderedMap<String, EscrowContract>,
    pub account_contracts: HashMap<AccountId, Vec<String>>,
    pub trusted_tee_addresses: Vec<Vec<u8>>,
    pub owner: AccountId,
    pub next_id: u64,
}

#[near_bindgen]
impl Contract {
    #[init]
    pub fn new(owner: AccountId) -> Self {
        Self {
            contracts: UnorderedMap::new(b"c"),
            account_contracts: HashMap::new(),
            trusted_tee_addresses: vec![],
            owner,
            next_id: 0,
        }
    }

    pub fn register_tee_address(&mut self, address: Vec<u8>) {
        assert_eq!(
            env::predecessor_account_id(),
            self.owner,
            "Only owner can register TEE addresses"
        );
        if !self.trusted_tee_addresses.contains(&address) {
            self.trusted_tee_addresses.push(address);
        }
    }

    pub fn remove_tee_address(&mut self, address: Vec<u8>) {
        assert_eq!(
            env::predecessor_account_id(),
            self.owner,
            "Only owner can remove TEE addresses"
        );
        self.trusted_tee_addresses.retain(|a| a != &address);
    }

    pub fn get_trusted_tee_addresses(&self) -> Vec<Vec<u8>> {
        self.trusted_tee_addresses.clone()
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
        let client = env::predecessor_account_id();
        self.next_id += 1;
        let contract_id = format!("c{}", self.next_id);

        let total_amount: u128 = milestones.iter().map(|m| m.amount).sum();

        let invite_token = if freelancer.is_none() {
            Some(format!("{:x}", env::random_seed().iter().fold(0u64, |acc, &b| acc.wrapping_mul(256).wrapping_add(b as u64))))
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
            })
            .collect();

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
            status: if freelancer.is_some() {
                ContractStatus::Active
            } else {
                ContractStatus::Draft
            },
            created_at: env::block_timestamp(),
            invite_token,
            prompt_hash,
            disputes: vec![],
            model_id,
        };

        self.contracts.insert(&contract_id, &escrow);

        self.account_contracts
            .entry(client)
            .or_default()
            .push(contract_id.clone());

        if let Some(ref f) = freelancer {
            self.account_contracts
                .entry(f.clone())
                .or_default()
                .push(contract_id.clone());
        }

        emit_event!("contract_created", {
            "contract_id" => contract_id
        });

        contract_id
    }

    pub fn join_contract(&mut self, contract_id: String, invite_token: String) {
        let contract = self.contracts.get_mut(&contract_id).expect("Contract not found");
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

        self.account_contracts
            .entry(freelancer)
            .or_default()
            .push(contract_id.clone());

        emit_event!("contract_joined", {
            "contract_id" => contract_id
        });
    }

    pub fn get_contract(&self, contract_id: String) -> Option<EscrowContract> {
        self.contracts.get(&contract_id)
    }

    pub fn get_contracts_by_account(&self, account_id: AccountId) -> Vec<EscrowContract> {
        self.account_contracts
            .get(&account_id)
            .map(|ids| {
                ids.iter()
                    .filter_map(|id| self.contracts.get(id))
                    .collect()
            })
            .unwrap_or_default()
    }

    pub fn get_dispute(&self, contract_id: String, milestone_id: String) -> Option<Dispute> {
        self.contracts.get(&contract_id).and_then(|c| {
            c.disputes
                .iter()
                .find(|d| d.milestone_id == milestone_id)
                .cloned()
        })
    }

    pub fn get_prompt_hash(&self, contract_id: String) -> Option<String> {
        self.contracts.get(&contract_id).map(|c| c.prompt_hash)
    }

    pub fn get_investigation_rounds(
        &self,
        contract_id: String,
        milestone_id: String,
    ) -> Vec<InvestigationRound> {
        self.contracts
            .get(&contract_id)
            .and_then(|c| {
                c.disputes
                    .iter()
                    .find(|d| d.milestone_id == milestone_id)
                    .map(|d| d.investigation_rounds.clone())
            })
            .unwrap_or_default()
    }
}

#[derive(near_sdk::serde::Deserialize, near_sdk::serde::Serialize)]
#[serde(crate = "near_sdk::serde")]
pub struct MilestoneInput {
    pub title: String,
    pub description: String,
    pub amount: u128,
}
