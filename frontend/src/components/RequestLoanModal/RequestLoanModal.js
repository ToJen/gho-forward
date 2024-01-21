// import ABI from '../contracts/LoanFactoryABI.json'
import React, { useEffect, useState } from "react";
import {
  useDisclosure,
  Button,
  Modal,
  ModalBody,
  ModalFooter,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  FormControl,
  FormLabel,
  Input,
  Text,
} from "@chakra-ui/react";
import { useContractWrite, useAccount } from "wagmi";
import GhoSafeAbi from "../../abis/ghoSafeContractAbi.json";
import { GHO_SAFE_SEPOLIA } from "../../utils/constants";
import { parseUnits } from "viem";
import { getAllowedBorrowLimitDetails, timeConverter } from "../../utils/utils";

const RequestLoanModal = ({ gitcoinScore }) => {
  const { isOpen, onOpen, onClose } = useDisclosure();

  const [borrowLimitDetails, setBorrowLimitDetails] = useState();
  const [borrowAmount, setBorrowAmount] = useState();
  const [showError, setShowError] = useState(false);
  const { address } = useAccount();

  const {
    data: transactionDetails,
    isLoading,
    isSuccess,
    write,
  } = useContractWrite({
    address: GHO_SAFE_SEPOLIA,
    abi: GhoSafeAbi,
    functionName: "createBorrowRequest",
  });

  useEffect(() => {
    getAllowedBorrowLimitDetails(address, null).then((data) => {
      console.log("borrowLimitDetails", borrowLimitDetails);
      setBorrowLimitDetails(data);
    });
  }, []);
  const onSubmit = () => {
    if (!address || !borrowLimitDetails || !borrowAmount) {
      return;
    }
    if (Number(borrowAmount) > Number(borrowLimitDetails.borrowUpto)) {
      setShowError(true);
      return;
    }
    // TODO get amount, time based on scores
    // direct sending score is not safe, metatx?
    // TODO pass score here at the end
    write({
      args: [
        parseUnits(borrowAmount.toString(), 18),
        borrowLimitDetails.repayTime,
        Math.floor(borrowLimitDetails.gitcoinScore),
        Math.floor(borrowLimitDetails.onChainScore),
      ],
    });
  };
  return (
    <>
      <Button onClick={onOpen} marginTop={"12vh"} backgroundColor={"#D2F7A9"}>
        Request Loan
      </Button>
      {borrowLimitDetails && (
        <Modal isOpen={isOpen} onClose={onClose}>
          <ModalOverlay />
          <ModalContent>
            <ModalHeader>Request Loan</ModalHeader>
            <ModalCloseButton />
            <ModalBody pb={6}>
              <FormControl>
                <FormLabel>
                  Based on your score, your max limit is{" "}
                  {`${borrowLimitDetails.borrowUpto} GHO`}
                </FormLabel>
                <FormLabel>Borrow Amount (in GHO)</FormLabel>
                <Input
                  placeholder={` max. ${borrowLimitDetails.borrowUpto}`}
                  type="number"
                  onChange={(e) => {
                    setBorrowAmount(e.target.value);
                    setShowError(false);
                  }}
                />
                {showError && <Text color="Red">Borrow Limit Exceeded</Text>}
              </FormControl>

              <FormControl mt={4}>
                <FormLabel>Interest Rate</FormLabel>
                <Input disabled value={2} />
              </FormControl>

              <FormControl mt={4}>
                <FormLabel>Repay Time</FormLabel>
                <Input
                  disabled
                  value={timeConverter(borrowLimitDetails.repayTime)}
                />
              </FormControl>

              <FormControl mt={4}>
                <FormLabel>Gitcoin Passport Score</FormLabel>
                <Input disabled value={borrowLimitDetails.gitcoinScore} />
              </FormControl>
              <FormControl mt={4}>
                <FormLabel>On Chain Score</FormLabel>
                <Input disabled value={borrowLimitDetails.onChainScore} />
              </FormControl>
            </ModalBody>

            <ModalFooter>
              <Button colorScheme="blue" mr={3} onClick={onSubmit}>
                Submit
              </Button>
              <Button onClick={onClose}>Cancel</Button>
            </ModalFooter>
          </ModalContent>
        </Modal>
      )}
    </>
  );
};

export default RequestLoanModal;
