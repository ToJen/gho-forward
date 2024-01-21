// import ABI from '../contracts/LoanFactoryABI.json'
import React, { useEffect, useState } from "react";
import { useModal } from "connectkit";
import { useAccount } from "wagmi";
import { getAllowedBorrowLimitDetails, getBalances } from "../utils/utils";
import {
  Box,
  Button,
  Card,
  CardBody,
  CardHeader,
  Flex,
  Heading,
  Text,
} from "@chakra-ui/react";
import { useGetBorrowRequests } from "../hooks/useGetBorrowRequests";
import RequestLoanModal from "./RequestLoanModal/RequestLoanModal";
import CustomTable from "./CustomTable/CustomTable";
import { Tabs, TabList, TabPanels, Tab, TabPanel } from "@chakra-ui/react";
import BorrowRequestsTable from "./BorrowRequests/BorrowRequestsTable";
import { formatUnits, parseUnits } from "viem";

const Home = () => {
  const { address, isConnected } = useAccount();
  const { setOpen } = useModal();
  const { borrowRequestDetails, isLoading, refetch } = useGetBorrowRequests();

  const [gitcoinScore, setGitcoinScore] = useState(0);
  const [onChainScore, setOnChainScore] = useState(0);
  const [totalScore, setTotalScore] = useState(0);
  const [totalBorrowed, setTotalBorrowed] = useState(0);
  const [totalLoaned, setTotalLoaned] = useState(0);
  const [lenderSignatures, setLenderSignatures] = useState([]);
  const [borrowLimitDetails, setBorrowLimitDetails] = useState();

  useEffect(() => {
    if (isConnected) {
      checkPassport();
      getOnChainScore();
      fetchSavedLenderSignature();
    }
  }, [isConnected]);

  useEffect(() => {
    if (borrowRequestDetails && address) {
      let currBorrowed = 0;
      let currLoaned = 0;

      borrowRequestDetails.map((row) => {
        if (row.user == address) {
          currBorrowed += formatUnits(row.amount);
        } else if (row.fulfilledBy == address) {
          currLoaned += formatUnits(row.amount);
        }
      });

      setTotalBorrowed(parseUnits(currBorrowed.toString(), 18));
      setTotalLoaned(parseUnits(currLoaned.toString(), 18));
    }
  }, [borrowRequestDetails, address]);

  async function checkPassport(currentAddress = address) {
    console.log(`checking passport for ${currentAddress}`);
    setGitcoinScore(0);

    const uri = `${process.env.REACT_APP_SERVER_URL}/get_passport_score?eth_address=${currentAddress}`;
    // const uri = `${process.env.REACT_APP_SERVER_URL}/submit_passport`;

    try {
      const response = await fetch(uri, {
        headers: {
          "Content-Type": "application/json",
        },
        // method: 'POST',
        // body: JSON.stringify({
        //   eth_address: currentAddress,
        // })
      });

      const passportData = await response.json();
      console.log("passportData: ", passportData);

      if (passportData.score) {
        const roundedScore = Math.round(passportData.score * 100) / 100;
        setGitcoinScore(roundedScore);
      } else {
        setGitcoinScore(0);
      }
    } catch (err) {
      console.log("error: ", err);
    }
  }
  const fetchSavedLenderSignature = async () => {
    const uri = `${process.env.REACT_APP_SERVER_URL}/signatures`;

    try {
      const response = await fetch(uri, {
        headers: {
          "Content-Type": "application/json",
        },
      });

      const lenderSignatureData = await response.json();
      console.log("retrieved lenderSignatureData:", lenderSignatureData);

      if (lenderSignatureData?.length > 0) {
        setLenderSignatures(lenderSignatureData);
      }
    } catch (err) {
      console.log("error fetching lenderSignatureData:", err);
    }
  };

  async function getOnChainScore() {
    const borrowLimits = await getAllowedBorrowLimitDetails(
      address,
      gitcoinScore
    );
    // TODO
    setBorrowLimitDetails(borrowLimits);
    setTotalScore(borrowLimits.gitcoinScore + borrowLimits.onChainScore);
    setOnChainScore(borrowLimits.onChainScore);
  }

  return (
    <Box style={{ height: "100vh", backgroundColor: "#F5F5F5" }}>
      <header className="App-header">
        <Box style={{ paddingLeft: 20 }}>
          <Text
            style={{ fontSize: "large", color: "#D9D8D8", fontWeight: "bold" }}
          >
            GhoForward
          </Text>
        </Box>
        <Box style={{ paddingRight: 20 }}>
          {isConnected ? (
            <Text
              color={"black"}
              style={{
                fontSize: "large",
                backgroundColor: "#00FFFF",
                borderRadius: "10px",
                padding: "4px 8px",
                maxWidth: "200px",
                textOverflow: "ellipsis",
                overflow: "hidden",
                whiteSpace: "nowrap",
              }}
            >
              {address}
            </Text>
          ) : (
            <Button onClick={() => setOpen(true)} bgColor={"#00FFFF"}>
              Connect Wallet
            </Button>
          )}
        </Box>
      </header>

      <Flex justifyContent={"space-between"} paddingInline={"20px"}>
        <Heading marginTop={"12vh"}>Welcome</Heading>
        <RequestLoanModal refetch={refetch}/>
      </Flex>
      <Flex>
        <Box
          style={{
            flexDirection: "column",
            display: "flex",
            gap: "10px",
            margin: "20px",
          }}
          flex={1}
        >
          <Card width={"100%"}>
            <CardHeader paddingBlock={"10px 5px"}>
              <Text>GHO Forward Score</Text>
            </CardHeader>
            <CardBody>
              <Text>{totalScore}</Text>
            </CardBody>
          </Card>
          <Card width={"100%"}>
            <CardHeader paddingBlock={"10px 5px"}>
              <Text>Gitcoin Score</Text>
            </CardHeader>
            <CardBody>
              <Text>{gitcoinScore}</Text>
            </CardBody>
          </Card>
          <Card width={"100%"}>
            <CardHeader paddingBlock={"10px 5px"}>
              <Text>On-Chain Score</Text>
            </CardHeader>
            <CardBody>
              <Text>{onChainScore}</Text>
            </CardBody>
          </Card>
        </Box>
        <Box
          style={{
            flexDirection: "column",
            display: "flex",
            marginTop: 20,
          }}
          flex={2}
        >
          <Flex
            justifyContent={"space-between"}
            marginRight={"20px"}
            gap={"10px"}
            boxShadow={"5px"}
          >
            <Card width={"100%"}>
              <CardHeader paddingBlock={"10px 5px"}>
                <Text>Borrow Limit</Text>
              </CardHeader>
              <CardBody>
                <Text size="md">
                  <strong>
                    ${borrowLimitDetails?.borrowUpto ?? "-"} GHO *
                  </strong>
                </Text>
              </CardBody>
            </Card>
            <Card width={"100%"}>
              <CardHeader>
                <Text>Total Borrowed</Text>
              </CardHeader>
              <CardBody>
                <Text size="md">{totalBorrowed}</Text>
              </CardBody>
            </Card>
            <Card width={"100%"}>
              <CardHeader>
                <Text>Total Loaned</Text>
              </CardHeader>
              <CardBody>
                <Text size="md">{totalLoaned}</Text>
              </CardBody>
            </Card>
          </Flex>
          <Box
            style={{
              flexDirection: "column",
              display: "flex",
              height: "inherit",
              margin: "20px 20px 0 0",
            }}
          >
            <Tabs variant="enclosed">
              <TabList>
                <Tab>Open Supply Positions</Tab>
                <Tab>Borrow Requests</Tab>
              </TabList>
              <TabPanels>
                <TabPanel>
                  {/* TODO */}
                  {/* <CustomTable tableHeading={"Assets to Lend"} /> */}
                  <BorrowRequestsTable
                    borrowRequestDetails={borrowRequestDetails}
                    isLoading={isLoading}
                    filterUser={true}
                    lenderSignatures={lenderSignatures}
                    refetch={refetch}
                  />
                </TabPanel>
                <TabPanel>
                  <BorrowRequestsTable
                    borrowRequestDetails={borrowRequestDetails}
                    isLoading={isLoading}
                    lenderSignatures={lenderSignatures}
                    refetch={refetch}
                  />
                </TabPanel>
              </TabPanels>
            </Tabs>
          </Box>
        </Box>
      </Flex>
    </Box>
  );
};

export default Home;
