// import ABI from '../contracts/LoanFactoryABI.json'
import React, { useEffect, useState } from "react";
import { Button } from "@chakra-ui/react";
import { useAccount, useSignTypedData, useContractWrite } from "wagmi";
import {
  AAVE_POOL_ADDR_SEPOLIA,
  DEADLINE,
  GHO_SAFE_SEPOLIA,
  GHO_TOKEN_ADDR_SEPOLIA,
} from "../../utils/constants";
import { Pool } from "@aave/contract-helpers";
import { formatUnits, parseUnits } from "viem";

import GhoSafeAbi from "../../abis/ghoSafeContractAbi.json";
import GhoErc20Abi from "../../abis/ghoErc20Abi.json";
import { splitSignature } from "ethers/lib/utils";
const ethers = require("ethers");

const RepayBorrowRequestButton2 = ({ borrowRequestId, borrowedAmount }) => {
  const { data: signature, signTypedData } = useSignTypedData();
  const { address } = useAccount();
  const { lenderSignature, setLenderSignature } = useState();

  const {
    data: transactionDetails,
    isLoading,
    isSuccess,
    write,
  } = useContractWrite({
    address: GHO_SAFE_SEPOLIA,
    abi: GhoSafeAbi,
    functionName: "repayBorrowRequestWithPermit", //"repayBorrowRequestWithPermit",
  });
  //

  const { data: approveSpendGho, write: writeApproveSpendGho } =
    useContractWrite({
      address: GHO_TOKEN_ADDR_SEPOLIA,
      abi: GhoErc20Abi,
      functionName: "approve",
    });
  useEffect(() => {
    if (!borrowedAmount || !approveSpendGho) {
      return;
    }

    write({
      args: [borrowRequestId],
    });
  }, [approveSpendGho, borrowRequestId]);

  useEffect(
    (transactionDetails) => {
      if (!transactionDetails) {
        return;
      }
      console.log(`transactionDetails`, transactionDetails);
    },
    [transactionDetails]
  );
  const approveSpend = async () => {
    if (!address) {
      console.log("No connected account", address);
      return;
    }

    // writeApproveSpendGho({
    //   args: [GHO_SAFE_SEPOLIA, borrowedAmount],
    // });
    write({
      args: [borrowRequestId],
      from: address,
    });
  };

  return (
    <>
      <Button
        colorScheme="blue"
        mr={3}
        onClick={async () => {
          await approveSpend();
        }}
        //isLoading={nonceIsLoading}
      >
        Repay
      </Button>
    </>
  );
};

export default RepayBorrowRequestButton2;
