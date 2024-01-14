// SPDX-License-Identifier: GPL 1.0
pragma solidity ^0.8.20;

import {ReentrancyGuard} from "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {ICreditDelegationToken} from "@aave/core-v3/contracts/interfaces/ICreditDelegationToken.sol";

contract GhoSafe is ReentrancyGuard, Ownable {
  struct BorrowRequest {
    address user;
    // address fulfilledByUser; // TODO decide fullfill by individual or from the pool
    uint256 amount;
    uint256 interestRate;
    uint256 repayTime;
    uint256 passportScore;
    uint256 onChainScore;
    address borrowedAsset; // will always be GHO
    // uint256[] collateralAsset;
    bool isFulfilled;
    bool hasRepayed;
  }

  mapping(uint256 => BorrowRequest) public borrowRequests;
  mapping(address => bool) public userHasBorrowed;
  address public immutable DEBT_TOKEN;
  uint256 public borrowRequestIndex;
  uint256 public totalDelegatedCredit;
  uint256 public totalBorrowed;

  // errors
  error BorrowLimitReached(); // cannot borrow twice or increase limit
  error BorrowRequestInvalid();

  // events
  event BorrowRequestCreated(uint256 indexed id, address indexed user, uint256 indexed amount);
  event BorrowRequestFulfilled(uint256 indexed id, address indexed user, address indexed fulfilledByUser);

  // event CreditDelegated(address indexed delegatedBy, uint256 indexed amount, uint256 indexed deadline);

  constructor(address debtToken) Ownable() {
    DEBT_TOKEN = debtToken;
  }

  function delegationCreditWithSig(
    uint256 value,
    uint256 deadline,
    uint8 v,
    bytes32 r,
    bytes32 s
  ) external nonReentrant {
    ICreditDelegationToken(DEBT_TOKEN).delegationWithSig(msg.sender, address(this), value, deadline, v, r, s);
    totalDelegatedCredit += value; // can be a mapping with struct value and time
  }

  function createBorrowRequest(
    address _user,
    //address _fulfilledByUser, // determined offchain (assess risk for this)
    uint256 _amount,
    uint256 _repayTime,
    uint256 _passportScore,
    uint256 _onChainScore
  ) external // uint256[] calldata _collateralAsset
  {
    if (userHasBorrowed[_user]) {
      revert BorrowLimitReached();
    }
    // addchecks based on credit score and amount requested

    borrowRequests[borrowRequestIndex] = BorrowRequest({
      user: _user,
      amount: _amount,
      repayTime: _repayTime,
      interestRate: 0, //TODO from where?
      passportScore: _passportScore,
      onChainScore: _onChainScore,
      borrowedAsset: address(0), // TODO
      isFulfilled: false,
      hasRepayed: false
    });

    emit BorrowRequestCreated(borrowRequestIndex++, _user, _amount);
  }

  // How about we create a risk score and let the lender decide based on the risk score

  function fulfillBorrowRequests(uint256 borrowRequestId) external onlyOwner {
    uint256 amountBorrowed = borrowRequests[borrowRequestId].amount;
    if (amountBorrowed == 0) {
      revert BorrowRequestInvalid();
    }
    // skip credit limit checks if called by owner/manager

    // Todo repay time check

    // mark fulfilled
    borrowRequests[borrowRequestId].isFulfilled = true;

    emit BorrowRequestFulfilled(borrowRequestId, borrowRequests[borrowRequestId].user, address(this));
  }
}
