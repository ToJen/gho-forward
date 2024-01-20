// import ABI from '../contracts/LoanFactoryABI.json'
import React, { useEffect, useState } from "react";
import { useModal } from "connectkit";
import { useAccount } from "wagmi";
import { getBalances } from "../utils/utils";
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
import { formatUnits } from "viem";

const API_KEY = "fKkSd21Z.e7WkHo51ArHiJor6QTOc5c2ND1j7dl9u";
const SCORER_ID = 6351;

const Home = () => {
  const { address, isConnected } = useAccount();
  const { setOpen } = useModal();
  const { borrowRequestDetails, isLoading }= useGetBorrowRequests();

  const [score, setScore] = useState("");
  const [noScoreMessage, setNoScoreMessage] = useState("");
  const [totalBorrowed, setTotalBorrowed] = useState(0);
  const [totalLoaned, setTotalLoaned] = useState(0);

  useEffect(() => {
    if (isConnected) {
      checkPassport();
    }
  }, [isConnected]);

  useEffect(() => {
    if (borrowRequestDetails && address) {
      let currBorrowed = 0;
      let currLoaned = 0;
      borrowRequestDetails.map((row) => {
        if (row.user == address) {
          currBorrowed += formatUnits(row.amount);
        } else if(row.fulfilledBy == address){
          currLoaned += formatUnits(row.amount);
        }
      })
      setTotalBorrowed(currBorrowed);
      setTotalLoaned(currLoaned);
    }
  }, [borrowRequestDetails])

  const headers = API_KEY
    ? {
        "Content-Type": "application/json",
        "X-API-Key": API_KEY,
      }
    : undefined;

  async function checkPassport(currentAddress = address) {
    console.log(`checking passport for ${currentAddress}`);
    setScore("");
    setNoScoreMessage("");

    const GET_PASSPORT_SCORE_URI = `https://api.scorer.gitcoin.co/registry/score/${SCORER_ID}/${currentAddress}`;

    try {
      const response = await fetch(GET_PASSPORT_SCORE_URI, {
        headers,
      });
      const passportData = await response.json();
      console.log("passportData: ", passportData);

      if (passportData.score) {
        const roundedScore = Math.round(passportData.score * 100) / 100;
        setScore(roundedScore.toString());
      } else {
        console.log(
          "No score available, please add stamps to your passport and then resubmit."
        );
        setNoScoreMessage(
          "No score available, please submit your passport after you have added some stamps."
        );
      }
    } catch (err) {
      console.log("error: ", err);
    }
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
        <RequestLoanModal />
      </Flex>
      <Flex>
        <Box
          style={{
            flexDirection: "column",
            display: "flex",
          }}
          flex={1}
        >
          <Box>
            <button
              onClick={async () => {
                console.log('getBalances([""])', await getBalances([address]));
              }}
            >
              Get Balances
            </button>
          </Box>
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
                <Text>$5000</Text>
              </CardBody>
            </Card>
            <Card width={"100%"}>
              <CardHeader>
                <Text>Total Borrowed</Text>
              </CardHeader>
              <CardBody>
                <Text>{totalBorrowed}</Text>
              </CardBody>
            </Card>
            <Card width={"100%"}>
              <CardHeader>
                <Text>Total Loaned</Text>
              </CardHeader>
              <CardBody>
                <Text>{totalLoaned}</Text>
              </CardBody>
            </Card>
          </Flex>
          <Box
            style={{
              flexDirection: "column",
              display: "flex",
              height: "inherit",
              marginRight: 20,
            }}
          >
            <Tabs variant="enclosed">
              <TabList>
                <Tab>View All</Tab>
                <Tab>Borrow Requests</Tab>
              </TabList>
              <TabPanels>
                <TabPanel>
                  <CustomTable tableHeading={"Assets to Lend"} />
                  <BorrowRequestsTable borrowRequestDetails={borrowRequestDetails} isLoading={isLoading} filterUser={true}/>
                </TabPanel>
                <TabPanel>
                  <BorrowRequestsTable borrowRequestDetails={borrowRequestDetails} isLoading={isLoading} />
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
