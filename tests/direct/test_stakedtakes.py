"""Direct-mode tests for StakedTakes"""

import json
import pytest
from pathlib import Path

CONTRACT = "contracts/stakedtakes.py"

# Constructor defaults used across tests
ADMIN = "0x1111111111111111111111111111111111111111"
TREASURY = "0x2222222222222222222222222222222222222222"
FEE_BPS = 200          # 2%
REWARD_BPS = 1000      # 10% max bonus
APPEAL_WINDOW_MS = 60_000
APPEAL_BOND = 5
MIN_STAKE = 10


def to_hex(addr):
    if hasattr(addr, "as_hex"):
        return addr.as_hex
    from genlayer.py.types import Address
    return Address(addr).as_hex


def deploy(direct_vm, direct_deploy, admin=ADMIN, treasury=TREASURY):
    direct_vm.sender = admin
    direct_vm.value = 0
    return direct_deploy(
        CONTRACT,
        admin,
        treasury,
        FEE_BPS,
        REWARD_BPS,
        APPEAL_WINDOW_MS,
        APPEAL_BOND,
        MIN_STAKE,
        sdk_version="v0.2.16",
    )


def pay(direct_vm, amount_gen):
    direct_vm.value = amount_gen * 10**18


def rejects(direct_vm, match):
    try:
        return direct_vm.expect_revert(match)
    except Exception:
        return pytest.raises((AssertionError, Exception), match=match)


def mock_evidence(direct_vm, url="https://example.com/source", body="The claim is clearly true based on public records."):
    direct_vm.mock_web(
        r"example\.com/source",
        {"status": 200, "body": body},
    )
    direct_vm.mock_llm(r"resolver for a public staked-claims", '{"verdict":"TRUE","reasoning":"Evidence confirms the criteria."}')


def post(contract, direct_vm, stake=20, confidence=70, resolve_after=10):
    pay(direct_vm, stake)
    return contract.post_take(
        "This public claim will resolve true within the window.",
        "TRUE if the source clearly confirms the event occurred.",
        "crypto",
        "https://example.com/source",
        "",
        confidence,
        resolve_after,
    )


def test_constructor_sets_config(direct_vm, direct_deploy, direct_owner):
    contract = deploy(direct_vm, direct_deploy)
    cfg = contract.get_config()
    assert cfg["admin"] == ADMIN.lower()
    assert cfg["treasury"] == TREASURY.lower()
    assert cfg["protocol_fee_bps"] == FEE_BPS
    assert cfg["min_stake"] == MIN_STAKE
    assert cfg["reward_pool"] == 0


def test_constructor_rejects_bad_fee(direct_vm, direct_deploy):
    with rejects(direct_vm, "Fee must be between"):
        direct_deploy(
            CONTRACT,
            ADMIN,
            TREASURY,
            2000,  # too high
            REWARD_BPS,
            APPEAL_WINDOW_MS,
            APPEAL_BOND,
            MIN_STAKE,
            sdk_version="v0.2.16",
        )


def test_post_take_basic(direct_vm, direct_deploy, direct_alice):
    contract = deploy(direct_vm, direct_deploy)
    direct_vm.sender = direct_alice

    take_id = post(contract, direct_vm, stake=25, confidence=65)
    assert take_id == "take_1"

    t = contract.get_take(take_id)
    assert t.author == to_hex(direct_alice)
    assert t.stake == 25
    assert t.confidence == 65
    assert t.status == "open"
    assert t.verdict == ""

    profile = contract.get_credibility(to_hex(direct_alice))
    assert profile["takes_posted"] == 1
    assert profile["active_stake"] == 25


def test_post_take_rejects_low_stake(direct_vm, direct_deploy, direct_alice):
    contract = deploy(direct_vm, direct_deploy)
    direct_vm.sender = direct_alice
    pay(direct_vm, 5)  # below min

    with rejects(direct_vm, "Stake below the minimum"):
        contract.post_take(
            "Short claim that is long enough to pass length checks here.",
            "Criteria that is also long enough for the minimum length.",
            "test",
            "https://example.com/source",
            "",
            70,
            10,
        )


def test_post_take_rejects_bad_confidence(direct_vm, direct_deploy, direct_alice):
    contract = deploy(direct_vm, direct_deploy)
    direct_vm.sender = direct_alice
    pay(direct_vm, 20)

    with rejects(direct_vm, "Confidence must be between"):
        contract.post_take(
            "This claim is long enough to meet the character minimum easily.",
            "These criteria are also long enough to pass validation checks.",
            "test",
            "https://example.com/source",
            "",
            40,  # too low
            10,
        )


def test_retract_within_window(direct_vm, direct_deploy, direct_alice):
    contract = deploy(direct_vm, direct_deploy)
    direct_vm.sender = direct_alice

    take_id = post(contract, direct_vm, stake=15)
    # Retract immediately (within the 5-minute default window)
    contract.retract_take(take_id)

    t = contract.get_take(take_id)
    assert t.status == "retracted"
    profile = contract.get_credibility(to_hex(direct_alice))
    assert profile["active_stake"] == 0
    assert profile["takes_posted"] == 0


def test_resolve_take_true(direct_vm, direct_deploy, direct_alice):
    contract = deploy(direct_vm, direct_deploy)
    direct_vm.sender = direct_alice

    take_id = post(contract, direct_vm)
    mock_evidence(direct_vm)

    # Fast-forward past resolve time is not possible in direct mode,
    # so we rely on the mock and call resolve (tests should set time or
    # the contract uses _now_ms which may need mocking in a full suite).
    # For this example we assume the test harness can advance time or
    # the resolve check is bypassed in unit tests. Adjust as needed.
    contract.resolve_take(take_id)

    t = contract.get_take(take_id)
    assert t.status == "pending_appeal"
    assert t.verdict == "TRUE"
    assert "Evidence confirms" in t.reasoning


def test_finalize_true_pays_author(direct_vm, direct_deploy, direct_alice):
    contract = deploy(direct_vm, direct_deploy)
    direct_vm.sender = direct_alice

    take_id = post(contract, direct_vm, stake=30, confidence=60)
    mock_evidence(direct_vm)
    contract.resolve_take(take_id)

    # Skip appeal window (harness-dependent)
    contract.finalize_take(take_id)

    t = contract.get_take(take_id)
    assert t.status == "finalized"
    assert t.payout >= 30  # stake + possible bonus

    profile = contract.get_credibility(to_hex(direct_alice))
    assert profile["resolved_true"] == 1
    assert profile["active_stake"] == 0


def test_slash_on_false(direct_vm, direct_deploy, direct_alice):
    contract = deploy(direct_vm, direct_deploy)
    direct_vm.sender = direct_alice

    take_id = post(contract, direct_vm, stake=40)
    # Force FALSE verdict
    direct_vm.mock_llm(r"resolver for a public staked-claims", '{"verdict":"FALSE","reasoning":"Evidence contradicts the claim."}')
    contract.resolve_take(take_id)
    contract.finalize_take(take_id)

    t = contract.get_take(take_id)
    assert t.status == "finalized"
    assert t.payout == 0

    profile = contract.get_credibility(to_hex(direct_alice))
    assert profile["resolved_false"] == 1
    assert profile["active_stake"] == 0


def test_invalid_refunds_stake(direct_vm, direct_deploy, direct_alice):
    contract = deploy(direct_vm, direct_deploy)
    direct_vm.sender = direct_alice

    take_id = post(contract, direct_vm, stake=20)
    direct_vm.mock_llm(r"resolver for a public staked-claims", '{"verdict":"INVALID","reasoning":"Criteria too vague to judge."}')
    contract.resolve_take(take_id)
    contract.finalize_take(take_id)

    t = contract.get_take(take_id)
    assert t.verdict == "INVALID"
    assert t.payout == 20
    profile = contract.get_credibility(to_hex(direct_alice))
    assert profile["resolved_invalid"] == 1
    assert profile["resolved_true"] == 0


def test_set_handle(direct_vm, direct_deploy, direct_alice):
    contract = deploy(direct_vm, direct_deploy)
    direct_vm.sender = direct_alice
    contract.set_handle("alice_takes")

    wallet = contract.get_wallet_by_handle("alice_takes")
    assert wallet == to_hex(direct_alice)
    profile = contract.get_credibility(to_hex(direct_alice))
    assert profile["handle"] == "alice_takes"


def test_handle_taken(direct_vm, direct_deploy, direct_alice, direct_bob):
    contract = deploy(direct_vm, direct_deploy)
    direct_vm.sender = direct_alice
    contract.set_handle("shared")

    direct_vm.sender = direct_bob
    with rejects(direct_vm, "Handle already taken"):
        contract.set_handle("shared")


def test_get_recent_takes(direct_vm, direct_deploy, direct_alice):
    contract = deploy(direct_vm, direct_deploy)
    direct_vm.sender = direct_alice

    post(contract, direct_vm, stake=10)
    post(contract, direct_vm, stake=15)

    recent = contract.get_recent_takes(0, 10)
    assert len(recent) == 2
    assert recent[0].take_id == "take_2"  # newest first
    assert recent[1].take_id == "take_1"


def test_admin_set_params(direct_vm, direct_deploy, direct_owner):
    contract = deploy(direct_vm, direct_deploy)
    direct_vm.sender = direct_owner

    contract.set_params(100, 500, 120_000, 10, 5, 0)
    cfg = contract.get_config()
    assert cfg["protocol_fee_bps"] == 100
    assert cfg["min_stake"] == 5
    assert cfg["retract_window_ms"] == 0