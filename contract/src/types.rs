use near_sdk::borsh::{BorshDeserialize, BorshSerialize};
use near_sdk::serde::{Deserialize, Serialize};
use near_sdk::{AccountId, NearToken};

#[derive(BorshDeserialize, BorshSerialize, Serialize, Deserialize, Clone, PartialEq, Debug)]
#[borsh(crate = "near_sdk::borsh")]
#[serde(crate = "near_sdk::serde")]
pub enum MilestoneStatus {
    NotFunded,
    Funded,
    InProgress,
    SubmittedForReview,
    Completed,
    Disputed,
}

#[derive(BorshDeserialize, BorshSerialize, Serialize, Deserialize, Clone, PartialEq, Debug)]
#[borsh(crate = "near_sdk::borsh")]
#[serde(crate = "near_sdk::serde")]
pub enum ContractStatus {
    Draft,
    Active,
    Completed,
    Disputed,
    Resolved,
}

#[derive(BorshDeserialize, BorshSerialize, Serialize, Deserialize, Clone, PartialEq, Debug)]
#[borsh(crate = "near_sdk::borsh")]
#[serde(crate = "near_sdk::serde")]
pub enum DisputeStatus {
    Pending,
    AiResolved,
    Finalized,
}

#[derive(BorshDeserialize, BorshSerialize, Serialize, Deserialize, Clone, PartialEq, Debug)]
#[borsh(crate = "near_sdk::borsh")]
#[serde(crate = "near_sdk::serde")]
pub enum Resolution {
    Freelancer,
    Client,
    ContinueWork,
    Split { freelancer_pct: u8 },
}

#[derive(BorshDeserialize, BorshSerialize, Serialize, Deserialize, Clone, Debug)]
#[borsh(crate = "near_sdk::borsh")]
#[serde(crate = "near_sdk::serde")]
pub struct Milestone {
    pub id: String,
    pub title: String,
    pub description: String,
    pub amount: NearToken,
    pub status: MilestoneStatus,
    pub payment_request_deadline_ns: Option<u64>,
}

#[derive(BorshDeserialize, BorshSerialize, Serialize, Deserialize, Clone, Debug)]
#[borsh(crate = "near_sdk::borsh")]
#[serde(crate = "near_sdk::serde")]
pub struct Dispute {
    pub milestone_id: String,
    pub raised_by: AccountId,
    pub reason: String,
    pub status: DisputeStatus,
    pub resolution: Option<Resolution>,
    pub explanation: Option<String>,
    pub deadline_ns: Option<u64>,
    pub ai_fee_deducted: bool,
    pub tee_signature: Option<Vec<u8>>,
    pub tee_signing_address: Option<Vec<u8>>,
    pub tee_text: Option<String>,
    pub funds_released: bool,
}

#[derive(BorshDeserialize, BorshSerialize, Serialize, Deserialize, Clone, Debug)]
#[borsh(crate = "near_sdk::borsh")]
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
    pub security_pool: NearToken,
}

impl EscrowContract {
    pub fn find_milestone(&self, milestone_id: &str) -> Option<usize> {
        self.milestones.iter().position(|m| m.id == milestone_id)
    }

    pub fn find_dispute(&self, milestone_id: &str, status: DisputeStatus) -> Option<usize> {
        self.disputes
            .iter()
            .position(|d| d.milestone_id == milestone_id && d.status == status)
    }

    pub fn all_milestones_completed(&self) -> bool {
        self.milestones
            .iter()
            .all(|m| m.status == MilestoneStatus::Completed)
    }

    pub fn require_freelancer(&self) -> AccountId {
        self.freelancer.clone().expect("No freelancer assigned")
    }

    pub fn is_party(&self, account: &AccountId) -> bool {
        *account == self.client || self.freelancer.as_ref() == Some(account)
    }
}
