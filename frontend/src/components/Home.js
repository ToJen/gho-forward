// import ABI from '../contracts/LoanFactoryABI.json'
import React, { useEffect, useState } from "react";
import { useModal } from "connectkit";
import { useAccount, useDisconnect, useWalletClient } from "wagmi";
import Compound from "../assets/compound-logo.png";
import Sismo from "../assets/sismo-logo.png";
import Push from "../assets/push-logo.jpeg";
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

const EthInWei = 1000000000000000000;
const API_KEY = "fKkSd21Z.e7WkHo51ArHiJor6QTOc5c2ND1j7dl9u";
const SCORER_ID = 6351;

const Home = () => {
  const { address, isConnecting, isConnected, isDisconnected } = useAccount();
  const { setOpen } = useModal();
  const contractAddress = "0xC2eDd4C8fD6ae11bD209e3eE7cC0B60159A92663";
  const GITCOIN_PASSPORT_HOLDERS = "0x1cde61966decb8600dfd0749bd371f12";
  const ROCIFI_CREDIT_HOLDERS = "0xb3ac412738ed399acab21fbda9add42c";

  const [loanAmount, setLoanAmount] = useState(0);
  const [creditScore, setCreditScore] = useState(0);
  const [loanInterest, setLoanInterest] = useState(0);
  const [showLoan, setShowLoan] = useState(false);
  const [loanExists, setLoanExists] = useState(false);
  const [pendingAmount, setPendingAmount] = useState(0);
  const [healthRatio, setHealthRatio] = useState(0);
  const [collateralAmount, setCollateralAmount] = useState(0);
  const [signedContract, setSignedContract] = useState(null);
  const [timeOverdue, setTimeOverdue] = useState(0);

  const { data: signer } = useWalletClient();
  const [score, setScore] = useState("");
  const [noScoreMessage, setNoScoreMessage] = useState("");
  // const { lastBorrowRequestId, borrowRequestDetails } = useGetBorrowRequests();
  // console.log("borrowRequestDetails", borrowRequestDetails);

  useEffect(() => {
    if (isConnected) {
      checkPassport();
    }
  }, [isConnected]);

  const headers = API_KEY
    ? {
        "Content-Type": "application/json",
        "X-API-Key": API_KEY,
      }
    : undefined;

  // submitting passport
  const SUBMIT_PASSPORT_URI =
    "https://api.scorer.gitcoin.co/registry/submit-passport";
  // getting the signing message
  const SIGNING_MESSAGE_URI =
    "https://api.scorer.gitcoin.co/registry/signing-message";

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

  async function getSigningMessage() {
    try {
      const response = await fetch(SIGNING_MESSAGE_URI, {
        headers,
      });
      const json = await response.json();
      return json;
    } catch (err) {
      console.log("error: ", err);
    }
  }

  async function submitPassport() {
    setNoScoreMessage("");

    if (!signer) return;
    try {
      const { message, nonce } = await getSigningMessage();
      const signature = await signer.signMessage({ message });

      console.log(signature);
      const response = await fetch(SUBMIT_PASSPORT_URI, {
        method: "POST",
        headers,
        body: JSON.stringify({
          address,
          scorer: SCORER_ID,
          signature,
          nonce,
        }),
      });

      const data = await response.json();
      console.log("data:", data);
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
                color: "white",
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
          <Box className="intro">
            <h3>Welcome to</h3>
            <h1>Uncollaterised Loans</h1>
            <h2>For Decentralised Finance</h2>
            <h2>{score}</h2>
            <h2>{noScoreMessage}</h2>
            <Text>
              Project X tries to solve the problem of overcollateralization in
              DeFi. It uses your on-chain and off-chain information to create a
              trust score and based on this trust score it decides whether you
              are eligible for an uncollaterised loan or not. All this while
              leveraging the power of zero knowledge proofs to make sure you
              privacy is not compromised.
            </Text>
          </Box>

          <Box>
            <button
              onClick={async () => {
                console.log('getBalances([""])', await getBalances([address]));
              }}
            >
              Get Balances
            </button>
          </Box>
          <Box className="powered-by">
            <h4>Powered by:</h4>
            <Box
              style={{
                display: "flex",
                flexDirection: "row",
                alignContent: "center",
                justifyContent: "center",
              }}
            >
              <a href="https://www.sismo.io/">
                <img
                  src={Sismo}
                  height={50}
                  width={90}
                  style={{ marginInline: 20 }}
                />
              </a>
              <a href="https://compound.finance/">
                <img
                  src={Compound}
                  height={50}
                  width={90}
                  style={{ marginInline: 20 }}
                />
              </a>
              <a href="https://push.org/">
                <img
                  src={Push}
                  height={50}
                  width={90}
                  style={{ marginInline: 20 }}
                />
              </a>
            </Box>
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
                <Text>Borrow Limit</Text>
              </CardHeader>
              <CardBody>
                <Text>$5000</Text>
              </CardBody>
            </Card>
            <Card width={"100%"}>
              <CardHeader>
                <Text>Borrow Limit</Text>
              </CardHeader>
              <CardBody>
                <Text>$5000</Text>
              </CardBody>
            </Card>
          </Flex>
          <Box
            style={{
              flexDirection: "column",
              display: "flex",
              padding: "30px",
              backgroundColor: "#F1F1F1",
              height: "inherit",
              marginRight: 20,
            }}
          >
            <Box
              className="content-section"
              style={{ color: "#82B7DC", flex: 1 }}
            >
              <h2>{loanExists ? "Your Loan Details" : "GET STARTED"}</h2>
            </Box>

            <Box
              className="content-section"
              style={{ color: "#82B7DC", flex: 3 }}
            >
              {loanExists ? (
                <Box
                  style={{
                    flexDirection: "column",
                    display: "flex",
                    color: "#82B7DC",
                    fontWeight: "bold",
                  }}
                >
                  <Text className="loan-info">
                    Total amount borrowed: {loanAmount}
                  </Text>
                  <Text className="loan-info">Health Ratio: {healthRatio}</Text>
                  <Text className="loan-info">
                    Amount pending to be paid: {pendingAmount}
                  </Text>
                  <Text className="loan-info">Time Overdue: {timeOverdue}</Text>
                </Box>
              ) : showLoan ? (
                <Box
                  style={{
                    flexDirection: "column",
                    display: "flex",
                    color: "#82B7DC",
                    fontWeight: "bold",
                  }}
                >
                  <Text className="loan-description">
                    Based on the ZK proofs provided and your previous credit
                    history. Following are the details about the loan that you
                    are eligible for:
                  </Text>
                  <Text className="loan-info">Trust Score: {creditScore}</Text>
                  <Text className="loan-info">Loan Amount: {loanAmount}</Text>
                  <Text className="loan-info">
                    Interest rate: {loanInterest}% p.a.
                  </Text>
                  <Text className="loan-info">
                    Collateral Amount: {collateralAmount}
                  </Text>
                  <Text className="loan-description">
                    {collateralAmount
                      ? "You don't have the required trust score yet for a collateral free loan"
                      : "Yay! You are eligible for a collateral free loan"}
                  </Text>
                </Box>
              ) : (
                <p className="description">
                  If you are here for the first time, get an estimate of the
                  loan amount you are eligible for and the corresponding
                  interest rate. If you already have a loan you can check the
                  details of your loan and repay the pending amount. To
                  continue, sign in with sismo.
                </p>
              )}
            </Box>
          </Box>
        </Box>
      </Flex>
    </Box>
  );
};

export default Home;
