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
} from '@chakra-ui/react'

function CustomTable({ data = [], columns = [], tableHeading }) {
  return (
    <Box backgroundColor={'white'}>
      <Heading as="h4" size="md" margin={'20px 0 0 20px'}>
        {tableHeading}
      </Heading>

      <TableContainer>
        <Table variant="simple">
          <Thead>
            <Tr>
              {columns.map((col) => (
                <Th>{col.title}</Th>
              ))}
            </Tr>
          </Thead>
          <Tbody>
            {data.map((row) => (
              <Tr>
                {columns.map((col) =>
                  col.render ? col.render(row) : <Td>{row[col.dataIndex]}</Td>,
                )}
              </Tr>
            ))}
          </Tbody>
        </Table>
      </TableContainer>
    </Box>
  )
}

export default CustomTable
