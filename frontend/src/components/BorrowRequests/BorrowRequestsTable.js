import {
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  TableContainer,
  Heading,
  Tooltip,
  Box,
  Text,
  Spinner,
} from "@chakra-ui/react";
import { timeConverter, truncateAddress } from "../../utils/utils";
import { useAccount } from "wagmi";
import ApproveBorrowRequestButton from "../ApproveBorrowRequest/ApproveBorrowRequestButton";
import { formatUnits } from "viem";
import ClaimApprovedBorrowButton from "../ClaimApprovedBorrow/ClaimApprovedBorrowButton";
import RepayBorrowRequestButton from "../RepayBorrowRequest/RepayBorrowRequestButton";
import RepayBorrowRequestButton2 from "../RepayBorrowRequest/RepayBorrowRequestButton2";

function BorrowRequestsTable({
  borrowRequestDetails = [],
  isLoading,
  filterUser = false,
  lenderSignatures = [],
}) {
  const { address } = useAccount();
  const tableData = filterUser
    ? borrowRequestDetails.filter((request) => request.user == address)
    : borrowRequestDetails;

  const col = [
    "Address",
    "On Chain Score",
    "Passport Score",
    "Interest",
    "Amount",
    "Repay Time",
    "Status",
    "Action",
  ];

  const renderClaimButton = (borrowRequest) => {
    console.log("borrowRequest", borrowRequest);
    console.log("lenderSignatures", lenderSignatures);
    const isApprovedEntry = lenderSignatures.find(
      (lS) => lS.borrow_request_id == borrowRequest.id
    );
    // check if borrow req is claimed
    if (
      borrowRequest.fulfilledBy !=
        "0x0000000000000000000000000000000000000000" &&
      isApprovedEntry
    ) {
      return (
        <RepayBorrowRequestButton
          borrowedAmount={borrowRequest.amount}
          borrowRequestId={borrowRequest.id}
          lenderAddress={isApprovedEntry.lender_address}
          // signature={isApprovedEntry.signature}
        />
      );
    }

    console.log("isApprovedEntry", isApprovedEntry);
    return isApprovedEntry != null ? (
      <ClaimApprovedBorrowButton
        approvalAmount={borrowRequest.amount}
        borrowRequestId={borrowRequest.id}
        lenderAddress={isApprovedEntry.lender_address}
        signature={isApprovedEntry.signature}
      />
    ) : (
      <Text>-</Text>
    );
  };
  return (
    <Box>
      <Heading as="h4" size="md" margin={"20px 8px  20px"}>
        {filterUser ? "Active Credit Delegations" : "Borrow Requests"}
      </Heading>

      <TableContainer>
        <Table variant="striped" colorScheme="teal">
          <Thead backgroundColor={"white"}>
            <Tr>
              {col.map((col) => (
                <Th>{col}</Th>
              ))}
            </Tr>
          </Thead>
          <Tbody>
            {isLoading ? (
              <Spinner />
            ) : tableData ? (
              tableData.map((row, index) => (
                <Tr key={index}>
                  <Td>{truncateAddress(row.user)}</Td>
                  <Td>{Number(row.onChainScore)} </Td>
                  <Td>{Number(row.passportScore)} </Td>
                  <Td>{Number(row.interestRate)} </Td>
                  <Td>{formatUnits(row.amount, 18)} GHO </Td>
                  <Td>{timeConverter(Number(row.repayTime))} </Td>
                  <Td>
                    {truncateAddress(row.fulfilledBy) ? (
                      <Tooltip
                        label={`by ${truncateAddress(row.fulfilledBy)}`}
                        aria-label={`by ${truncateAddress(row.fulfilledBy)}`}
                      >
                        Fulfilled
                      </Tooltip>
                    ) : (
                      "Open"
                    )}{" "}
                  </Td>
                  <Td>
                    {address == row.user ? (
                      // Show claim button if there is signature
                      renderClaimButton(row)
                    ) : (
                      <ApproveBorrowRequestButton
                        approvalAmount={row.amount}
                        borrowRequestId={row.id}
                        lenderAddress={address}
                      />
                    )}
                  </Td>
                </Tr>
              ))
            ) : (
              <Tr>
                <Td>-</Td>
                <Td>- </Td>
                <Td>- </Td>
                <Td>- </Td>
                <Td>- </Td>
                <Td>- </Td>
                <Td>- </Td>
              </Tr>
            )}
          </Tbody>
        </Table>
      </TableContainer>
    </Box>
  );
}

export default BorrowRequestsTable;
