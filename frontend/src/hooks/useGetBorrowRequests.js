import { useContractRead } from "wagmi";
import { GHO_SAFE_SEPOLIA } from "../utils/constants";
import GhoSafeAbi from "../abis/ghoSafeContractAbi.json";
import { useEffect, useState } from "react";

export const useGetBorrowRequests = () => {
  const { data, isError, isLoading } = useContractRead({
    address: GHO_SAFE_SEPOLIA,
    abi: GhoSafeAbi,
    functionName: "getBorrowReqeusts",
  });

  // const {
  //   data: brwRequestDetails,
  //   isError: errorBrwRqDetail,
  //   isLoading: brwRqDetailLoading,
  // } = useContractRead({
  //   address: GHO_SAFE_SEPOLIA,
  //   abi: GhoSafeAbi,
  //   functionName: "borrowRequests",
  //   args: [Number(data) - 1],
  //   // watch: true,
  //   // cacheTime: 2_000,
  //   enabled: data != null,
  // });
  // const [lastBorrowRequestId, setLastBorrowRequestId] = useState(0);
  const [borrowRequestDetails, setBorrowRequestDetails] = useState([]);

  useEffect(() => {
    if (data == null || isError) {
      return;
    }
    setBorrowRequestDetails(data);
  }, [data, isError]);

  // useEffect(() => {
  //   if (brwRequestDetails == null || errorBrwRqDetail) {
  //     return;
  //   }
  //   setBorrowRequestDetails(brwRequestDetails);
  // }, [data, isError]);

  return {
    borrowRequestDetails,
    isLoading: isLoading,
  };
};
