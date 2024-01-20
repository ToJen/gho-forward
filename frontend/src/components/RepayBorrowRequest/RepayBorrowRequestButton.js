// import ABI from '../contracts/LoanFactoryABI.json'
import React, { useEffect, useState } from "react";
import { useDisclosure, Button } from "@chakra-ui/react";
import {
  useAccount,
  useSignTypedData,
  useContractRead,
  usePublicClient,
  useContractWrite,
} from "wagmi";
import {
  AAVE_POOL_ADDR_SEPOLIA,
  DEADLINE,
  GHO_DEBT_TOKEN_ADDR_SEPOLIA,
  GHO_SAFE_SEPOLIA,
  GHO_TOKEN_ADDR_SEPOLIA,
} from "../../utils/constants";
import { Pool } from "@aave/contract-helpers";
import { parseUnits } from "viem";
import { buildDelegationWithSigParams } from "../../utils/utils";
import GhoSafeAbi from "../../abis/ghoSafeContractAbi.json";
import { splitSignature } from "ethers/lib/utils";
const ethers = require("ethers");

// TODO pass borrowRequestId, borrowedAmount
const RepayBorrowRequestButton = (borrowRequestId, borrowedAmount) => {
  const { data: signature, signTypedData } = useSignTypedData();
  const { address } = useAccount();

  const {
    data: transactionDetails,
    isLoading,
    isSuccess,
    write,
  } = useContractWrite({
    address: GHO_SAFE_SEPOLIA,
    abi: GhoSafeAbi,
    functionName: "repayBorrowRequestWithPermit",
  });

  useEffect(() => {
    if (signature == null) {
      return;
    }
    const splitSig = splitSignature(signature);
    console.log("splitSig", splitSig);

    const repayParams = {
      borrowRequestId: 0,
      deadline: DEADLINE,
      signature: { v: splitSig.v, r: splitSig.r, s: splitSig.s },
    };
    write({
      args: [
        repayParams.borrowRequestId,
        repayParams.deadline,
        repayParams.signature.v,
        repayParams.signature.r,
        repayParams.signature.s,
      ],
    });
  }, [signature]);

  useEffect(
    (transactionDetails) => {
      if (!transactionDetails) {
        return;
      }
      console.log(`transactionDetails`, transactionDetails);
    },
    [transactionDetails]
  );
  const signMessage = async () => {
    if (!address) {
      console.log("No connected account", address);
      return;
    }
    const provider = new ethers.providers.Web3Provider(window.ethereum);

    const pool = new Pool(provider, {
      POOL: AAVE_POOL_ADDR_SEPOLIA, // UiGhoDataProvider  Sepolia, GHO market
    });

    const approvalMsg = await pool.signERC20Approval({
      user: address,
      reserve: GHO_TOKEN_ADDR_SEPOLIA,
      amount: parseUnits("1"), // TODO
      deadline: DEADLINE, // determined by GHO_SAFE
    });
    const signatureParams = JSON.parse(approvalMsg);
    signTypedData(signatureParams);
  };
  return (
    <>
      <Button
        colorScheme="blue"
        mr={3}
        onClick={signMessage}
        //isLoading={nonceIsLoading}
      >
        Repay
      </Button>
    </>
  );
};

export default RepayBorrowRequestButton;
