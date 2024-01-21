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
import { formatUnits, parseUnits } from "viem";

import AavePoolAbi from "../../abis/aavePoolAbi.json";
import { splitSignature } from "ethers/lib/utils";
const ethers = require("ethers");

const RepayBorrowRequestButton = ({
  borrowRequestId,
  borrowedAmount,
  lenderAddress,
}) => {
  const { data: signature, signTypedData } = useSignTypedData();
  const { address } = useAccount();
  const { lenderSignature, setLenderSignature } = useState();

  const {
    data: transactionDetails,
    isLoading,
    isSuccess,
    write,
  } = useContractWrite({
    address: AAVE_POOL_ADDR_SEPOLIA,
    abi: AavePoolAbi,
    functionName: "repayWithPermit", //"repayBorrowRequestWithPermit",
  });

  useEffect(() => {
    if (signature == null || !borrowedAmount) {
      return;
    }
    const splitSig = splitSignature(signature);
    console.log("splitSig", splitSig);

    const repayParams = {
      borrow_request_id: borrowRequestId,
      deadline: DEADLINE,
      amount: borrowedAmount,
      lendersAddress: lenderAddress, // TODO lender address get from borrow request
      signature: { v: splitSig.v, r: splitSig.r, s: splitSig.s },
    };

    write({
      args: [
        GHO_TOKEN_ADDR_SEPOLIA,
        repayParams.amount,
        2, //interest mode
        repayParams.lendersAddress,
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
      amount: parseUnits(formatUnits(borrowedAmount, 18)), // TODO
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
        onClick={async () => {
          await signMessage();
        }}
        //isLoading={nonceIsLoading}
      >
        Repay
      </Button>
    </>
  );
};

export default RepayBorrowRequestButton;
