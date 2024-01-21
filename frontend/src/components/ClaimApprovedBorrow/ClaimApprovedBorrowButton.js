// import ABI from '../contracts/LoanFactoryABI.json'
import React, { useEffect, useState } from "react";
import { useDisclosure, Button } from "@chakra-ui/react";
import { useContractWrite, useAccount } from "wagmi";
import GhoSafeAbi from "../../abis/ghoSafeContractAbi.json";
import { DEADLINE, GHO_SAFE_SEPOLIA } from "../../utils/constants";
import { splitSignature } from "ethers/lib/utils";
//
// const claimBorrowParams = {
//   borrowRequestId: 0,
//   delegator: "", // lender address that approved the borrow request, signature address
//   deadline: DEADLINE, // TODO
//   signature: {},
// };
const ClaimApprovedBorrowButton = ({
  borrowRequestId,
  lenderAddress,
  signature,
  refetch
}) => {
  const { address } = useAccount();
  const {
    data: transactionDetails,
    isLoading,
    isSuccess,
    write,
  } = useContractWrite({
    address: GHO_SAFE_SEPOLIA,
    abi: GhoSafeAbi,
    functionName: "fulfillBorrowRequestWithDelegatedSig",
  });

  useEffect(() => {
    if (transactionDetails == null) {
      return;
    }
    //toast success
  });
  
  const {
    data: txReceipt,
    error: txError,
    isLoading: txLoading,
  } = useWaitForTransaction({ confirmations: 1, hash: transactionDetails?.hash });

  useEffect(() => {
    if(txReceipt){
      refetch()
    }
  }, [txReceipt])

  const onSubmit = () => {
    if (!address || !signature) {
      return;
    }
    const claimBorrowParamTest = {
      borrowRequestId: borrowRequestId,
      delegator: lenderAddress, // lender address that approved the borrow request, signature address
      deadline: DEADLINE, // TODO
      signature: splitSignature(signature),
      delegatee: address,
    };
    console.log("claimBorrowParamTest", claimBorrowParamTest);
    console.log("address", address);
    write({
      // TODO remove testing flags
      args: [
        claimBorrowParamTest.borrowRequestId,
        claimBorrowParamTest.delegator,
        claimBorrowParamTest.deadline,
        claimBorrowParamTest.signature.v,
        claimBorrowParamTest.signature.r,
        claimBorrowParamTest.signature.s,
        claimBorrowParamTest.delegatee,
        true,
        true,
      ],
    });
  };
  return (
    <Button colorScheme="blue" mr={3} onClick={onSubmit} isLoading={isLoading || txLoading}>
      Claim
    </Button>
  );
};

export default ClaimApprovedBorrowButton;
