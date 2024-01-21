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
  Spinner,
} from "@chakra-ui/react";
import { timeConverter, truncateAddress } from "../../utils/utils";
import { useAccount } from "wagmi";
import ApproveBorrowRequestButton from "../ApproveBorrowRequest/ApproveBorrowRequestButton";
import { formatUnits } from "viem";

function BorrowRequestsTable({
  borrowRequestDetails = [],
  isLoading,
  filterUser = false,
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
                        label="Hey, I'm here!"
                        aria-label={`${truncateAddress(row.fulfilledBy)}`}
                      >
                        "Fulfilled"
                      </Tooltip>
                    ) : (
                      "Open"
                    )}{" "}
                  </Td>
                  <Td>
                    {address == row.user ? (
                      "-"
                    ) : (
                      <ApproveBorrowRequestButton
                          approvalAmount={row.amount}
                          borrowRequestId={index}
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
