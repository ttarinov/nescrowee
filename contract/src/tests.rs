use near_sdk::test_utils::VMContextBuilder;
use near_sdk::testing_env;
use near_sdk::NearToken;

use crate::types::*;
use crate::{Contract, MilestoneInput};

fn alice() -> near_sdk::AccountId {
    "alice.testnet".parse().unwrap()
}

fn bob() -> near_sdk::AccountId {
    "bob.testnet".parse().unwrap()
}

fn owner() -> near_sdk::AccountId {
    "owner.testnet".parse().unwrap()
}

fn setup_context(predecessor: &near_sdk::AccountId, deposit: u128) {
    let context = VMContextBuilder::new()
        .predecessor_account_id(predecessor.clone())
        .attached_deposit(NearToken::from_yoctonear(deposit))
        .build();
    testing_env!(context);
}

fn create_test_contract() -> Contract {
    setup_context(&owner(), 0);
    Contract::new(owner())
}

fn create_escrow_with_milestone(contract: &mut Contract) -> String {
    setup_context(&alice(), 0);
    contract.create_contract(
        "Test Project".into(),
        "Description".into(),
        vec![MilestoneInput {
            title: "Milestone 1".into(),
            description: "Build feature".into(),
            amount: 10_000_000_000_000_000_000_000_000, // 10 NEAR
        }],
        Some(bob()),
        10,
        "abc123hash".into(),
        "Qwen/Qwen3-30B-A3B".into(),
    )
}

#[test]
fn test_create_contract() {
    let mut contract = create_test_contract();
    let id = create_escrow_with_milestone(&mut contract);

    let escrow = contract.get_contract(id.clone()).unwrap();
    assert_eq!(escrow.client, alice());
    assert_eq!(escrow.freelancer, Some(bob()));
    assert_eq!(escrow.status, ContractStatus::Active);
    assert_eq!(escrow.milestones.len(), 1);
    assert_eq!(escrow.milestones[0].status, MilestoneStatus::NotFunded);
    assert_eq!(escrow.security_deposit_pct, 10);
}

#[test]
fn test_create_contract_draft_without_freelancer() {
    let mut contract = create_test_contract();
    setup_context(&alice(), 0);
    let id = contract.create_contract(
        "Draft".into(),
        "Desc".into(),
        vec![MilestoneInput {
            title: "M1".into(),
            description: "D1".into(),
            amount: 1_000_000_000_000_000_000_000_000,
        }],
        None,
        10,
        "hash".into(),
        "model".into(),
    );

    let escrow = contract.get_contract(id).unwrap();
    assert_eq!(escrow.status, ContractStatus::Draft);
    assert!(escrow.invite_token.is_some());
}

#[test]
#[should_panic(expected = "Security deposit must be between 5% and 30%")]
fn test_invalid_security_pct() {
    let mut contract = create_test_contract();
    setup_context(&alice(), 0);
    contract.create_contract(
        "Bad".into(),
        "Desc".into(),
        vec![MilestoneInput { title: "M".into(), description: "D".into(), amount: 1_000_000_000_000_000_000_000_000 }],
        Some(bob()),
        50,
        "hash".into(),
        "model".into(),
    );
}

#[test]
#[should_panic(expected = "Cannot be your own freelancer")]
fn test_cannot_self_hire() {
    let mut contract = create_test_contract();
    setup_context(&alice(), 0);
    contract.create_contract(
        "Self".into(),
        "Desc".into(),
        vec![MilestoneInput { title: "M".into(), description: "D".into(), amount: 1_000_000_000_000_000_000_000_000 }],
        Some(alice()),
        10,
        "hash".into(),
        "model".into(),
    );
}

#[test]
fn test_fund_contract_marks_milestones_funded() {
    let mut contract = create_test_contract();
    let id = create_escrow_with_milestone(&mut contract);

    // 10 NEAR milestone at 10% security → need 11 NEAR total deposit
    // 11 NEAR deposit → security = 11 * 10/110 = 1 NEAR, main = 10 NEAR
    setup_context(&alice(), 11_000_000_000_000_000_000_000_000);
    contract.fund_contract(id.clone());

    let escrow = contract.get_contract(id).unwrap();
    assert_eq!(escrow.milestones[0].status, MilestoneStatus::Funded);
    assert_eq!(escrow.funded_amount.as_yoctonear(), 10_000_000_000_000_000_000_000_000);
    assert_eq!(escrow.security_pool.as_yoctonear(), 1_000_000_000_000_000_000_000_000);
}

#[test]
#[should_panic(expected = "Contract is already fully funded")]
fn test_cannot_overfund() {
    let mut contract = create_test_contract();
    let id = create_escrow_with_milestone(&mut contract);

    setup_context(&alice(), 11_000_000_000_000_000_000_000_000);
    contract.fund_contract(id.clone());

    setup_context(&alice(), 11_000_000_000_000_000_000_000_000);
    contract.fund_contract(id);
}

#[test]
fn test_top_up_security() {
    let mut contract = create_test_contract();
    let id = create_escrow_with_milestone(&mut contract);

    setup_context(&alice(), 11_000_000_000_000_000_000_000_000);
    contract.fund_contract(id.clone());

    let pool_before = contract.get_contract(id.clone()).unwrap().security_pool.as_yoctonear();

    setup_context(&alice(), 5_000_000_000_000_000_000_000_000);
    contract.top_up_security(id.clone());

    let pool_after = contract.get_contract(id).unwrap().security_pool.as_yoctonear();
    assert_eq!(pool_after - pool_before, 5_000_000_000_000_000_000_000_000);
}

#[test]
#[should_panic(expected = "Only contract parties can top up security")]
fn test_top_up_security_stranger_rejected() {
    let mut contract = create_test_contract();
    let id = create_escrow_with_milestone(&mut contract);

    let stranger: near_sdk::AccountId = "stranger.testnet".parse().unwrap();
    setup_context(&stranger, 1_000_000_000_000_000_000_000_000);
    contract.top_up_security(id);
}

#[test]
fn test_milestone_lifecycle() {
    let mut contract = create_test_contract();
    let id = create_escrow_with_milestone(&mut contract);

    setup_context(&alice(), 11_000_000_000_000_000_000_000_000);
    contract.fund_contract(id.clone());

    // Freelancer starts
    setup_context(&bob(), 0);
    contract.start_milestone(id.clone(), "m1".into());
    assert_eq!(
        contract.get_contract(id.clone()).unwrap().milestones[0].status,
        MilestoneStatus::InProgress
    );

    // Freelancer requests payment
    setup_context(&bob(), 0);
    contract.request_payment(id.clone(), "m1".into());
    assert_eq!(
        contract.get_contract(id.clone()).unwrap().milestones[0].status,
        MilestoneStatus::SubmittedForReview
    );

    // Client approves
    setup_context(&alice(), 0);
    contract.approve_milestone(id.clone(), "m1".into());

    let escrow = contract.get_contract(id).unwrap();
    assert_eq!(escrow.milestones[0].status, MilestoneStatus::Completed);
    assert_eq!(escrow.status, ContractStatus::Completed);
}

#[test]
#[should_panic(expected = "Only freelancer can start milestones")]
fn test_client_cannot_start_milestone() {
    let mut contract = create_test_contract();
    let id = create_escrow_with_milestone(&mut contract);

    setup_context(&alice(), 11_000_000_000_000_000_000_000_000);
    contract.fund_contract(id.clone());

    setup_context(&alice(), 0);
    contract.start_milestone(id, "m1".into());
}

#[test]
fn test_cancel_payment_request() {
    let mut contract = create_test_contract();
    let id = create_escrow_with_milestone(&mut contract);

    setup_context(&alice(), 11_000_000_000_000_000_000_000_000);
    contract.fund_contract(id.clone());

    setup_context(&bob(), 0);
    contract.start_milestone(id.clone(), "m1".into());
    contract.request_payment(id.clone(), "m1".into());
    contract.cancel_payment_request(id.clone(), "m1".into());

    assert_eq!(
        contract.get_contract(id).unwrap().milestones[0].status,
        MilestoneStatus::InProgress
    );
}

#[test]
fn test_raise_dispute() {
    let mut contract = create_test_contract();

    setup_context(&owner(), 0);
    contract.set_ai_processing_fee(50_000_000_000_000_000_000_000); // 0.05 NEAR

    let id = create_escrow_with_milestone(&mut contract);

    setup_context(&alice(), 11_000_000_000_000_000_000_000_000);
    contract.fund_contract(id.clone());

    setup_context(&bob(), 0);
    contract.start_milestone(id.clone(), "m1".into());
    contract.request_payment(id.clone(), "m1".into());

    setup_context(&alice(), 0);
    contract.raise_dispute(id.clone(), "m1".into(), "Work incomplete".into());

    let escrow = contract.get_contract(id.clone()).unwrap();
    assert_eq!(escrow.milestones[0].status, MilestoneStatus::Disputed);
    assert_eq!(escrow.status, ContractStatus::Disputed);
    assert_eq!(escrow.disputes.len(), 1);
    assert_eq!(escrow.disputes[0].status, DisputeStatus::Pending);
}

#[test]
#[should_panic(expected = "Only client can raise disputes")]
fn test_freelancer_cannot_raise_dispute() {
    let mut contract = create_test_contract();
    let id = create_escrow_with_milestone(&mut contract);

    setup_context(&alice(), 11_000_000_000_000_000_000_000_000);
    contract.fund_contract(id.clone());

    setup_context(&bob(), 0);
    contract.start_milestone(id.clone(), "m1".into());
    contract.request_payment(id.clone(), "m1".into());

    setup_context(&bob(), 0);
    contract.raise_dispute(id, "m1".into(), "Reason".into());
}

#[test]
fn test_account_contract_linking() {
    let mut contract = create_test_contract();
    let id = create_escrow_with_milestone(&mut contract);

    let alice_contracts = contract.get_contracts_by_account(alice());
    let bob_contracts = contract.get_contracts_by_account(bob());

    assert_eq!(alice_contracts.len(), 1);
    assert_eq!(alice_contracts[0].id, id);
    assert_eq!(bob_contracts.len(), 1);
    assert_eq!(bob_contracts[0].id, id);
}

#[test]
fn test_join_contract() {
    let mut contract = create_test_contract();
    setup_context(&alice(), 0);
    let id = contract.create_contract(
        "Open".into(),
        "Desc".into(),
        vec![MilestoneInput { title: "M".into(), description: "D".into(), amount: 1_000_000_000_000_000_000_000_000 }],
        None,
        10,
        "hash".into(),
        "model".into(),
    );

    let token = contract.get_contract(id.clone()).unwrap().invite_token.unwrap();

    setup_context(&bob(), 0);
    contract.join_contract(id.clone(), token);

    let escrow = contract.get_contract(id).unwrap();
    assert_eq!(escrow.freelancer, Some(bob()));
    assert_eq!(escrow.status, ContractStatus::Active);
    assert!(escrow.invite_token.is_none());
}

#[test]
fn test_get_prompt_hash() {
    let mut contract = create_test_contract();
    let id = create_escrow_with_milestone(&mut contract);

    assert_eq!(contract.get_prompt_hash(id), Some("abc123hash".into()));
    assert_eq!(contract.get_prompt_hash("nonexistent".into()), None);
}
