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

import AavePoolAbi from "../../abis/aavePoolAbi.json";
import { splitSignature } from "ethers/lib/utils";
const ethers = require("ethers");

// TODO pass borrowRequestId, borrowedAmount
const brwAmount = parseUnits("1");
const RepayBorrowRequestButton = (borrowRequestId, borrowedAmount) => {
  const { data: signature, signTypedData } = useSignTypedData();
  const { address } = useAccount();
  const {lenderSignature, setLenderSignature} = useState();

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
    if (signature == null) {
      return;
    }
    const splitSig = splitSignature(signature);
    console.log("splitSig", splitSig);

    const repayParams = {
      borrowRequestId: 0,
      deadline: DEADLINE,
      amount: parseUnits("1", 18),
      lendersAddress: "0x32D1C9FFee079d6FD8E0d0E77aD5644DDdb3d95a", // TODO lender address get from borrow request
      signature: { v: splitSig.v, r: splitSig.r, s: splitSig.s },
    };

    write({
      args: [
        GHO_TOKEN_ADDR_SEPOLIA,
        repayParams.amount,
        2,
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
      amount: parseUnits("1"), // TODO
      deadline: DEADLINE, // determined by GHO_SAFE
    });
    const signatureParams = JSON.parse(approvalMsg);
    signTypedData(signatureParams);
  };

  const fetchSavedLenderSignature = async () => {
    const uri = `${process.env.REACT_APP_SERVER_URL}/signatures?borrow_request_id=${borrowRequestId}`;

    try {
      const response = await fetch(uri, {
        headers: {
          "Content-Type": "application/json",
        },
      });

      const lenderSignatureData = await response.json();
      console.log("retrieved lenderSignatureData:", lenderSignatureData);

      if (lenderSignatureData.signature) {
        setLenderSignature(signature);
      }
    } catch (err) {
      console.log("error fetching lenderSignatureData:", err);
    }
  };

  return (
    <>
      <Button
        colorScheme="blue"
        mr={3}
        onClick={async () => {
          await signMessage()
          await fetchSavedLenderSignature()
        }}
        //isLoading={nonceIsLoading}
      >
        Repay
      </Button>
    </>
  );
};

export default RepayBorrowRequestButton;
