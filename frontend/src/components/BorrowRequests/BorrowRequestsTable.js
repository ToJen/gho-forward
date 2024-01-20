import {
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  TableContainer,
  Heading,
  Box,
  Spinner,
} from "@chakra-ui/react";
import { truncateAddress } from "../../utils/utils";
import { useAccount } from "wagmi";
import ApproveBorrowRequestButton from "../ApproveBorrowRequest/ApproveBorrowRequestButton";
import { formatUnits } from "viem";

function BorrowRequestsTable( { borrowRequestDetails = [], isLoading, filterUser=false }) {
  const { address } = useAccount();
  const tableData = filterUser ? borrowRequestDetails.filter((request) => request.user == address) : borrowRequestDetails;
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
        {filterUser ? "My Borrowings/Credit Delegations" : "Borrow Requests"}
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
              tableData.map((row) => (
                <Tr>
                  <Td>{truncateAddress(row.user)}</Td>
                  <Td>{Number(row.onChainScore)} </Td>
                  <Td>{Number(row.passportScore)} </Td>
                  <Td>{formatUnits(row.amount)} ETH </Td>
                  <Td>{Number(row.interestRate)} </Td>
                  <Td>{row.repayTime} </Td>
                  <Td>{truncateAddress(row.fulfilledBy)} </Td>
                  <Td>
                    {address == row.user ? (
                      "-"
                    ) : (
                      <ApproveBorrowRequestButton approvalAmount={row.amount} />
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
