// SPDX-License-Identifier: GPL 1.0
pragma solidity ^0.8.20;

import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {ICreditDelegationToken} from "@aave/core-v3/contracts/interfaces/ICreditDelegationToken.sol";
import {IERC20WithPermit} from "@aave/core-v3/contracts/interfaces/IERC20WithPermit.sol";
import {IERC20} from "@openzeppelin/contracts/interfaces/IERC20.sol";
import {IPool} from "@aave/core-v3/contracts/interfaces/IPool.sol";

// 0x50C3357Bc7608f3ac2EA301De154e122EBeAc63E CD
// 0xa7750fe3Bbc014077672a0eDe9C7C4a554A4B6a6, 1000000000000000000,0,0,0
contract GhoSafe is ReentrancyGuard, Ownable {
  struct BorrowRequest {
    address user;
    address fulfilledBy;
    uint256 amount;
    uint256 interestRate;
    uint256 repayTime;
    uint256 passportScore;
    uint256 onChainScore;
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
  error NotAuthorized();

  // events
  event BorrowRequestCreated(uint256 indexed id, address indexed user, uint256 indexed amount);
  event BorrowRequestFulfilled(uint256 indexed id, address indexed user, address indexed fulfilledByUser);

  // event CreditDelegated(address indexed delegatedBy, uint256 indexed amount, uint256 indexed deadline);

  constructor() Ownable(msg.sender) {
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
      fulfilledBy: address(0),
      amount: _amount,
      repayTime: _repayTime,
      interestRate: 0, //TODO from where?
      passportScore: _passportScore,
      onChainScore: _onChainScore,
      hasRepayed: false
    });

    emit BorrowRequestCreated(borrowRequestIndex++, _user, _amount);
  }

  // v: 28

  // {r: '0x76b54720cc7e4d81d48cea39adddc1f5f57653c7d48d83c6867e972f201562e9',
  // s: '0x77f8130be75046c67da200784e829855022a1ef1b4fdb3df3d64814dc8a4c942'
  // CD 0x50C3357Bc7608f3ac2EA301De154e122EBeAc63E
  // 0, 0x32D1C9FFee079d6FD8E0d0E77aD5644DDdb3d95a,1805356853,28,0xffb204e5c7b5d0884cc7fe52eeec1705b762689296f2b47efceadbc36cfaa4cc,0x14b46016a36c81168708f1e03eaf438c15a5db06c6f6a4ae64df83e3b19a7493,0xa7750fe3Bbc014077672a0eDe9C7C4a554A4B6a6,true,true
  // _delegator: 0x32D1C9FFee079d6FD8E0d0E77aD5644DDdb3d95a
  // dealdline: 1805356853
  //
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
  ) external nonReentrant {
    if (borrowRequests[borrowRequestId].user == address(0)) {
      revert BorrowRequestInvalid();
    }

    if (borrowRequests[borrowRequestId].fulfilledBy != address(0)) {
      revert BorrowRequestAlreadyFulfilled();
    }

    if (borrowRequests[borrowRequestId].user != msg.sender) {
      revert NotAuthorized();
    }

    // skip credit limit checks if called by owner/manager

    // TODO repay time check

    // TODO mark fulfilled
    borrowRequests[borrowRequestId].fulfilledBy = _delegator;
    uint256 amountBorrowed = borrowRequests[borrowRequestId].amount;

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

  // 0x50C3357Bc7608f3ac2EA301De154e122EBeAc63E
  // 0, 1805356853,27,0xee9f5c50a07bc583d20c9d47bf3d0d4ffd0313ff23f0e52c409be872420f1fae, 0x4f80816b1db7151148d39baea30ecdcc314f6d99eb9bbe1c6149400ebec99ba1
  // r: '0x6df71e0f8986f9aa4180a6b58b167e4c2be257f9e9faf03aa7c2271a163ee47c',
  // s: '0x64029ff49e996aefa651c9fc3c360753fb33c0ccb5f814292123f64c9d2ebb08',
  // v: 27
  // r: '0xee9f5c50a07bc583d20c9d47bf3d0d4ffd0313ff23f0e52c409be872420f1fae', s: '0x4f80816b1db7151148d39baea30ecdcc314f6d99eb9bbe1c6149400ebec99ba1'
  // 0,
  function repayBorrowRequestWithPermit(
    uint256 _borrowRequestId,
    // address onBehalfOf,
    uint256 _deadline,
    uint8 _permitV,
    bytes32 _permitR,
    bytes32 _permitS
  ) external nonReentrant {
    // todo checks

    IPool(POOL_ADDRESS).repayWithPermit(
      GHO_TOKEN,
      borrowRequests[_borrowRequestId].amount,
      interestRateMode,
      borrowRequests[_borrowRequestId].fulfilledBy,
      _deadline,
      _permitV,
      _permitR,
      _permitS
    );
  }

  // TODO delete
  function fulfillBorrowRequestApprovedDelegation(
    uint256 borrowRequestId,
    address _delegator
  ) external nonReentrant onlyOwner {
    uint256 amountBorrowed = borrowRequests[borrowRequestId].amount;
    if (amountBorrowed == 0) {
      revert BorrowRequestInvalid();
    }
    // bool isFulfilled = borrowRequests[borrowRequestId].isFulfilled;

    // if (isFulfilled) {
    //   revert BorrowRequestAlreadyFulfilled();
    // }
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

  // unprotected todo delete
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
