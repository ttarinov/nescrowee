use near_sdk::borsh::{BorshDeserialize, BorshSerialize};
use near_sdk::serde::{Deserialize, Serialize};
use near_sdk::{AccountId, NearToken};

#[derive(BorshDeserialize, BorshSerialize, Serialize, Deserialize, Clone, PartialEq)]
#[serde(crate = "near_sdk::serde")]
pub enum MilestoneStatus {
    NotFunded,
    Funded,
    InProgress,
    Completed,
    Disputed,
}

#[derive(BorshDeserialize, BorshSerialize, Serialize, Deserialize, Clone, PartialEq)]
#[serde(crate = "near_sdk::serde")]
pub enum ContractStatus {
    Draft,
    Active,
    Completed,
    Disputed,
    Resolved,
}

#[derive(BorshDeserialize, BorshSerialize, Serialize, Deserialize, Clone, PartialEq)]
#[serde(crate = "near_sdk::serde")]
pub enum DisputeStatus {
    Pending,
    AiResolved,
    Appealed,
    AppealResolved,
    Finalized,
}

#[derive(BorshDeserialize, BorshSerialize, Serialize, Deserialize, Clone)]
#[serde(crate = "near_sdk::serde")]
pub enum Resolution {
    Freelancer,
    Client,
    Split { freelancer_pct: u8 },
}

#[derive(BorshDeserialize, BorshSerialize, Serialize, Deserialize, Clone)]
#[serde(crate = "near_sdk::serde")]
pub struct Milestone {
    pub id: String,
    pub title: String,
    pub description: String,
    pub amount: NearToken,
    pub status: MilestoneStatus,
}

#[derive(BorshDeserialize, BorshSerialize, Serialize, Deserialize, Clone)]
#[serde(crate = "near_sdk::serde")]
pub struct Dispute {
    pub milestone_id: String,
    pub raised_by: AccountId,
    pub reason: String,
    pub status: DisputeStatus,
    pub resolution: Option<Resolution>,
    pub explanation: Option<String>,
    pub deadline_ns: Option<u64>,
    pub client_accepted: bool,
    pub freelancer_accepted: bool,
    pub is_appeal: bool,
    pub tee_signature: Option<Vec<u8>>,
    pub tee_signing_address: Option<Vec<u8>>,
    pub tee_text: Option<String>,
}

#[derive(BorshDeserialize, BorshSerialize, Serialize, Deserialize, Clone)]
#[serde(crate = "near_sdk::serde")]
pub struct EscrowContract {
    pub id: String,
    pub title: String,
    pub description: String,
    pub client: AccountId,
    pub freelancer: Option<AccountId>,
    pub total_amount: NearToken,
    pub funded_amount: NearToken,
    pub security_deposit_pct: u8,
    pub milestones: Vec<Milestone>,
    pub status: ContractStatus,
    pub created_at: u64,
    pub invite_token: Option<String>,
    pub prompt_hash: String,
    pub disputes: Vec<Dispute>,
    pub model_id: String,
}
