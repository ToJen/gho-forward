// import ABI from '../contracts/LoanFactoryABI.json'
import React, { useState } from "react";
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
} from "@chakra-ui/react";
import { useContractWrite, useAccount } from "wagmi";
import GhoSafeAbi from "../../abis/ghoSafeContractAbi.json";
import { GHO_SAFE_SEPOLIA, REPAY_TIME } from "../../utils/constants";

const RequestLoanModal = () => {
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
    functionName: "createBorrowRequest",
  });

  const onSubmit = () => {
    if (!address) {
      return;
    }
    // TODO get amount, time based on scores
    // direct sending score is not safe, metatx?
    // TODO pass score here at the end
    write({
      args: [address, 10, REPAY_TIME, 0, 0],
    });
  };
  return (
    <>
      <Button onClick={onOpen} marginTop={"12vh"} backgroundColor={"#D2F7A9"}>
        Request Loan
      </Button>

      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Request Loan</ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            <FormControl>
              <FormLabel>First name</FormLabel>
              <Input placeholder="First name" />
            </FormControl>

            <FormControl mt={4}>
              <FormLabel>Last name</FormLabel>
              <Input placeholder="Last name" />
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
    </>
  );
};

export default RequestLoanModal;
