// import ABI from '../contracts/LoanFactoryABI.json'
import React, { useEffect, useState } from "react";
import { useDisclosure, Button } from "@chakra-ui/react";
import { useAccount, useSignTypedData, useContractRead } from "wagmi";
import {
  DEADLINE,
  GHO_DEBT_TOKEN_ADDR_SEPOLIA,
  GHO_SAFE_SEPOLIA,
} from "../../utils/constants";
import { parseUnits } from "viem";
import { buildDelegationWithSigParams } from "../../utils/utils";
import GhoDebtTokenAbi from "../../abis/ghoDebtTokenAbi.json";
import { splitSignature } from "ethers/lib/utils";

// TODO pass approvalAmount
const ApproveBorrowRequestButton = ({
  approvalAmount,
  borrowRequestId,
  lenderAddress,
}) => {
  const { data: signature, signTypedData } = useSignTypedData();
  const { address } = useAccount();

  const {
    data: userNonce,
    isError: nonceIsError,
    isLoading: nonceIsLoading,
  } = useContractRead({
    address: GHO_DEBT_TOKEN_ADDR_SEPOLIA,
    abi: GhoDebtTokenAbi,
    functionName: "nonces",
    args: [address],
    enabled: !!address,
  });

  console.log("account", address);

  const SERVER_URL = `${process.env.REACT_APP_SERVER_URL}`;

  useEffect(() => {
    if (signature == null) {
      return;
    }
    const splitSig = splitSignature(signature);
    console.log("splitSig", splitSig);
    // toast success
    saveLenderSignature(lenderAddress, borrowRequestId, signature)
      .then(console.log)
      .catch(console.error);
  });

  const saveLenderSignature = async (
    lenderAddress,
    borrowRequestId,
    signature
  ) => {
    const uri = `${SERVER_URL}/signatures`;

    try {
      const response = await fetch(uri, {
        headers: {
          "Content-Type": "application/json",
        },
        method: "POST",
        body: JSON.stringify({
          lender_address: lenderAddress,
          borrow_request_id: Number(borrowRequestId),
          signature: signature,
        }),
      });

      const newLenderSignature = await response.json();
      console.log("newLenderSignature:", newLenderSignature);
      return newLenderSignature;
    } catch (err) {
      console.log("error saving newLenderSignature:", err);
    }
  };

  const signMessage = async () => {
    if (nonceIsLoading || nonceIsError) {
      console.log("nonceIsError", nonceIsError);
      return;
    }

    const signatureParams = buildDelegationWithSigParams(
      GHO_SAFE_SEPOLIA,
      userNonce,
      DEADLINE,
      approvalAmount
    );
    signTypedData(signatureParams);
  };

  return (
    <>
      <Button
        colorScheme="blue"
        onClick={signMessage}
        isLoading={nonceIsLoading}
      >
        Approve
      </Button>
    </>
  );
};

export default ApproveBorrowRequestButton;
