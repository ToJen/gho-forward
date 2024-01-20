// import ABI from '../contracts/LoanFactoryABI.json'
import React, { useEffect, useState } from "react";
import { useDisclosure, Button } from "@chakra-ui/react";
import { useContractWrite, useAccount } from "wagmi";
import GhoSafeAbi from "../../abis/ghoSafeContractAbi.json";
import { DEADLINE, GHO_SAFE_SEPOLIA } from "../../utils/constants";

//
// const claimBorrowParams = {
//   borrowRequestId: 0,
//   delegator: "", // lender address that approved the borrow request, signature address
//   deadline: DEADLINE, // TODO
//   signature: {},
// };
const ClaimApprovedBorrowButton = (claimBorrowParams) => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [connectedAddress, setConnectedAddress] = useState(null);
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
  const onSubmit = () => {
    if (!address || Object.keys(claimBorrowParams).length == 0) {
      return;
    }
    const claimBorrowParamTest = {
      borrowRequestId: 0,
      delegator: "", // lender address that approved the borrow request, signature address
      deadline: DEADLINE, // TODO
      signature: {},
    };
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
    <>
      <Button
        colorScheme="blue"
        mr={3}
        onClick={onSubmit}
        isLoading={isLoading}
      >
        Submit
      </Button>
    </>
  );
};

export default ClaimApprovedBorrowButton;
