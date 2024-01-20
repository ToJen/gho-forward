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
const ApproveBorrowRequestButton = ({ approvalAmount }) => {
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

  useEffect(() => {
    if (signature == null) {
      return;
    }
    const splitSig = splitSignature(signature);
    console.log("splitSig", splitSig);
    // toast success
    // TODO store in api
  });
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
