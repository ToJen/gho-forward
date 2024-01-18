// SPDX-License-Identifier: GPL 1.0
pragma solidity ^0.8.20;

import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {ICreditDelegationToken} from "@aave/core-v3/contracts/interfaces/ICreditDelegationToken.sol";
import {IERC20WithPermit} from "@aave/core-v3/contracts/interfaces/IERC20WithPermit.sol";
import {IERC20} from "@openzeppelin/contracts/interfaces/IERC20.sol";
import {IPool} from "@aave/core-v3/contracts/interfaces/IPool.sol";

// 0xa7750fe3Bbc014077672a0eDe9C7C4a554A4B6a6, 1000000000000000000,0,0,0
contract GhoSafe is ReentrancyGuard, Ownable {
  struct BorrowRequest {
    address user;
    uint256 amount;
    uint256 interestRate;
    uint256 repayTime;
    uint256 passportScore;
    uint256 onChainScore;
    bool isFulfilled;
    bool hasRepayed;
  }

  address public immutable DEBT_TOKEN;
  address public immutable POOL_ADDRESS;
  address public immutable GHO_TOKEN;

  mapping(uint256 => BorrowRequest) public borrowRequests;
  mapping(address => bool) public userHasBorrowed;

  uint256 public borrowRequestIndex;
  uint256 public totalDelegatedCredit;
  uint256 public totalBorrowed;
  uint256 public interestRateMode = 2;

  // errors
  error BorrowLimitReached(); // cannot borrow twice or increase limit
  error BorrowRequestInvalid();
  error BorrowRequestAlreadyFulfilled();

  // events
  event BorrowRequestCreated(uint256 indexed id, address indexed user, uint256 indexed amount);
  event BorrowRequestFulfilled(uint256 indexed id, address indexed user, address indexed fulfilledByUser);

  // event CreditDelegated(address indexed delegatedBy, uint256 indexed amount, uint256 indexed deadline);

  constructor(address _debtToken, address _poolAddress, address _ghoAddress) Ownable() {
    DEBT_TOKEN = 0x67ae46EF043F7A4508BD1d6B94DB6c33F0915844;
    POOL_ADDRESS = 0x6Ae43d3271ff6888e7Fc43Fd7321a503ff738951;
    GHO_TOKEN = 0xc4bF5CbDaBE595361438F8c6a187bDc330539c60;
  }

  function createBorrowRequest(
    address _user,
    uint256 _amount,
    uint256 _repayTime,
    uint256 _passportScore,
    uint256 _onChainScore
  ) external {
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
      isFulfilled: false,
      hasRepayed: false
    });

    emit BorrowRequestCreated(borrowRequestIndex++, _user, _amount);
  }

  // How about we create a risk score and let the lender decide based on the risk score
  function fulfillBorrowRequestWithDelegatedSig(
    uint256 borrowRequestId,
    address _delegator,
    uint256 _deadline,
    uint8 _v,
    bytes32 _r,
    bytes32 _s,
    address _delegatee,
    bool _borrow,
    bool _transfer
  ) external nonReentrant onlyOwner {
    uint256 amountBorrowed = borrowRequests[borrowRequestId].amount;
    if (amountBorrowed == 0) {
      revert BorrowRequestInvalid();
    }
    bool isFulfilled = borrowRequests[borrowRequestId].isFulfilled;
    if (isFulfilled) {
      revert BorrowRequestAlreadyFulfilled();
    }
    // skip credit limit checks if called by owner/manager

    // TODO repay time check

    // mark fulfilled
    //borrowRequests[borrowRequestId].isFulfilled = true;

    ICreditDelegationToken(DEBT_TOKEN).delegationWithSig(
      _delegator,
      address(this),
      amountBorrowed,
      _deadline,
      _v,
      _r,
      _s
    );

    if (_borrow) {
      // can be performed by the borrower
      IPool(POOL_ADDRESS).borrow(
        GHO_TOKEN,
        amountBorrowed,
        interestRateMode,
        0, // referralCode
        _delegator
      );
    }

    if (_transfer) {
      require(IERC20(GHO_TOKEN).transfer(borrowRequests[borrowRequestId].user, amountBorrowed), "Error Token");
    }

    emit BorrowRequestFulfilled(borrowRequestId, borrowRequests[borrowRequestId].user, _delegatee);
  }

  function fulfillBorrowRequestApprovedDelegation(
    uint256 borrowRequestId,
    address _delegator
  ) external nonReentrant onlyOwner {
    uint256 amountBorrowed = borrowRequests[borrowRequestId].amount;
    if (amountBorrowed == 0) {
      revert BorrowRequestInvalid();
    }
    bool isFulfilled = borrowRequests[borrowRequestId].isFulfilled;
    if (isFulfilled) {
      revert BorrowRequestAlreadyFulfilled();
    }
    // skip credit limit checks if called by owner/manager

    // TODO repay time check

    // mark fulfilled
    // borrowRequests[borrowRequestId].isFulfilled = true;

    //ICreditDelegationToken(DEBT_TOKEN).delegationWithSig(_delegator, address(this), amountBorrowed, _deadline, _v, _r, _s);

    // can be performed by the borrower
    IPool(POOL_ADDRESS).borrow(
      GHO_TOKEN,
      amountBorrowed,
      interestRateMode,
      0, // referralCode
      _delegator
    );

    // require(IERC20(GHO_TOKEN).transfer(borrowRequests[borrowRequestId].user,amountBorrowed),"Error Token");
    emit BorrowRequestFulfilled(borrowRequestId, borrowRequests[borrowRequestId].user, address(this));
  }

  // unprotected
  function withdrawToken(uint256 borrowRequestId) public {
    require(
      IERC20(GHO_TOKEN).transfer(borrowRequests[borrowRequestId].user, borrowRequests[borrowRequestId].amount),
      "Error Token"
    );
  }

  function setInterestRateMode(uint256 _mode) external onlyOwner {
    interestRateMode = _mode;
  }
}
