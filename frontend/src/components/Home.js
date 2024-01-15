// import ABI from '../contracts/LoanFactoryABI.json'
import React, { useEffect, useState } from 'react'
import HowItWorks from '../assets/HowItWorks.png'
import Compound from '../assets/compound-logo.png'
import Sismo from '../assets/sismo-logo.png'
import Push from '../assets/push-logo.jpeg'
const ethers = require("ethers")

const EthInWei = 1000000000000000000;

const Home = () => {
  const [connectedAddress, setConnectedAddress] = useState(null)
  const contractAddress = '0xC2eDd4C8fD6ae11bD209e3eE7cC0B60159A92663'
  const GITCOIN_PASSPORT_HOLDERS = '0x1cde61966decb8600dfd0749bd371f12'
  const ROCIFI_CREDIT_HOLDERS = '0xb3ac412738ed399acab21fbda9add42c'

  const provider = new ethers.providers.Web3Provider(window.ethereum)

  const [loanAmount, setLoanAmount] = useState(0)
  const [creditScore, setCreditScore] = useState(0)
  const [loanInterest, setLoanInterest] = useState(0)
  const [showLoan, setShowLoan] = useState(false)
  const [loanExists, setLoanExists] = useState(false)
  const [pendingAmount, setPendingAmount] = useState(0);
  const [healthRatio, setHealthRatio] = useState(0);
  const [collateralAmount, setCollateralAmount] = useState(0)
  const [signedContract, setSignedContract] = useState(null)
  const [timeOverdue, setTimeOverdue] = useState(0);

  const getCurrentAccount = async () => {
    const { ethereum } = window;

    const accounts = await ethereum.request({ method: "eth_accounts" });

    if (!accounts || accounts?.length === 0) {
      return null;
    }
    const account = accounts[0];
    setConnectedAddress(account);
  };

  const handleConnectWallet = async () => {
    try {
      if (window.ethereum) {
        await window.ethereum.request({ method: 'eth_requestAccounts' })
        const accounts = await window.ethereum.request({
          method: 'eth_accounts',
        })
        setConnectedAddress(accounts[0])
      } else {
        throw new Error(
          'No Ethereum wallet found in your browser. Please install MetaMask or a compatible wallet.',
        )
      }
    } catch (error) {
      console.error('Error connecting to wallet:', error)
      throw error
    }
  }

  useEffect(() => {
    getCurrentAccount();
  }, [])

  useEffect(() => {
    if (connectedAddress) {
      const signer = provider.getSigner();
      // setSignedContract(new ethers.Contract(contractAddress, ABI, signer))
    }
  }, [connectedAddress])

  return (
    <div style={{ height: '100vh' }}>
      <header className="App-header">
        <div style={{ paddingLeft: 20 }}>
          <span
            style={{ fontSize: 'larger', color: '#3466AA', fontWeight: 'bold' }}
          >
            Project
          </span>
          <span
            style={{ fontSize: 'larger', color: '#114084', fontWeight: 'bold' }}
          >
            X
          </span>
        </div>
        <div style={{ paddingRight: 20 }}>
          {connectedAddress ? (
            <div>
              <span
                style={{
                  color: '#82B7DC',
                  fontSize: 'medium',
                  fontWeight: 'bold',
                }}
              >
                Connected to:{' '}
              </span>
              <span
                style={{
                  color: 'black',
                  fontSize: 'large',
                  backgroundColor: '#82B7DC',
                  borderRadius: '10px',
                  padding: '4px 8px',
                  color: 'white',
                }}
              >
                {connectedAddress}
              </span>
            </div>
          ) : (
            <button onClick={handleConnectWallet} className="wallet-button">
              Connect Wallet
            </button>
          )}
        </div>
      </header>
      <div
        style={{
          flexDirection: 'column',
          display: 'flex',
          width: '70vw',
          marginTop: '10vh',
        }}
      >
        <div className="intro">
          <h3>Welcome to</h3>
          <h1>Uncollaterised Loans</h1>
          <h2>For Decentralised Finance</h2>
          <span>
            Project X tries to solve the problem of overcollateralization in DeFi.
            It uses your on-chain and off-chain information to create a trust
            score and based on this trust score it decides whether you are
            eligible for an uncollaterised loan or not. All this while
            leveraging the power of zero knowledge proofs to make sure you
            privacy is not compromised.
          </span>
        </div>
        <div className="how-it-works">
          <h2>How it works</h2>
          <img src={HowItWorks} />
        </div>
        <div className="powered-by">
          <h4>Powered by:</h4>
          <div
            style={{
              display: 'flex',
              flexDirection: 'row',
              alignContent: 'center',
              justifyContent: 'center',
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
          </div>
        </div>
      </div>
      <div
        style={{
          position: 'fixed',
          bottom: 0,
          right: 0,
          width: '30vw',
          height: '90vh',
        }}
      >
        <div
          style={{
            flexDirection: 'column',
            display: 'flex',
            padding: '30px',
            backgroundColor: '#F1F1F1',
            height: 'inherit',
          }}
        >
          <div
            className="content-section"
            style={{ color: '#82B7DC', flex: 1 }}
          >
            <h2>{loanExists ? 'Your Loan Details' : 'GET STARTED'}</h2>
          </div>

          <div
            className="content-section"
            style={{ color: '#82B7DC', flex: 3 }}
          >
            {loanExists ? (
              <div
                style={{
                  flexDirection: 'column',
                  display: 'flex',
                  color: '#82B7DC',
                  fontWeight: 'bold',
                }}
              >
                <span className="loan-info">
                  Total amount borrowed: {loanAmount}
                </span>
                {/* <span className="loan-info">
                  Interest accumulated till date: {loanInterestAmount}
                </span>
                <span className="loan-info">Amount Paid: {amountPaid}</span> */}
                <span className="loan-info">
                  Health Ratio: {healthRatio}
                </span>
                <span className="loan-info">
                  Amount pending to be paid:{' '}
                  {pendingAmount}
                </span>
                <span className="loan-info">
                  Time Overdue: {timeOverdue}
                </span>
              </div>
            ) : showLoan ? (
              <div
                style={{
                  flexDirection: 'column',
                  display: 'flex',
                  color: '#82B7DC',
                  fontWeight: 'bold',
                }}
              >
                <span className="loan-description">
                  Based on the ZK proofs provided and your previous credit
                  history. Following are the details about the loan that you are
                  eligible for:
                </span>
                <span className="loan-info">Trust Score: {creditScore}</span>
                <span className="loan-info">Loan Amount: {loanAmount}</span>
                <span className="loan-info">
                  Interest rate: {loanInterest}% p.a.
                </span>
                <span className="loan-info">
                  Collateral Amount: {collateralAmount}
                </span>
                <span className="loan-description">
                  {collateralAmount
                    ? "You don't have the required trust score yet for a collateral free loan"
                    : 'Yay! You are eligible for a collateral free loan'}
                </span>
              </div>
            ) : (
              <p className="description">
                If you are here for the first time, get an estimate of the loan
                amount you are eligible for and the corresponding interest rate.
                If you already have a loan you can check the details of your
                loan and repay the pending amount. To continue, sign in with
                sismo.
              </p>
            )}
          </div>
        </div>  
      </div>
    </div>
  )
}

export default Home
