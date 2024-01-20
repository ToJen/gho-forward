import { ethers } from "ethers";
import {
  UiPoolDataProvider,
  UiIncentiveDataProvider,
  ChainId,
} from "@aave/contract-helpers";
import * as markets from "@bgd-labs/aave-address-book";
import dayjs from "dayjs";
import { formatUserSummary, formatReserves } from "@aave/math-utils";

// ES5 Alternative imports
//  const {
//    ChainId,
//    UiIncentiveDataProvider,
//    UiPoolDataProvider,
//  } = require('@aave/contract-helpers');
//  const markets = require('@bgd-labs/aave-address-book');
//  const ethers = require('ethers');
export function setupAaveMarkets() {
  const provider = new ethers.providers.Web3Provider(window.ethereum);
  // User address to fetch data for, insert address here
  const currentAccount = "0x32D1C9FFee079d6FD8E0d0E77aD5644DDdb3d95a";

  // View contract used to fetch all reserves data (including market base currency data), and user reserves
  // Using Aave V3 Eth Mainnet address for demo
  const poolDataProviderContract = new UiPoolDataProvider({
    uiPoolDataProviderAddress: markets.AaveV3Sepolia.UI_POOL_DATA_PROVIDER,
    provider,
    chainId: ChainId.sepolia,
  });

  // View contract used to fetch all reserve incentives (APRs), and user incentives
  // Using Aave V3 Eth Mainnet address for demo
  const incentiveDataProviderContract = new UiIncentiveDataProvider({
    uiIncentiveDataProviderAddress:
      markets.AaveV3Sepolia.UI_INCENTIVE_DATA_PROVIDER,
    provider,
    chainId: ChainId.sepolia,
  });

  fetchContractData(
    currentAccount,
    poolDataProviderContract,
    incentiveDataProviderContract
  );
}

async function fetchContractData(
  currentAccount,
  poolDataProviderContract,
  incentiveDataProviderContract
) {
  // Object containing array of pool reserves and market base currency data
  // { reservesArray, baseCurrencyData }
  const reserves = await poolDataProviderContract.getReservesHumanized({
    lendingPoolAddressProvider: markets.AaveV3Sepolia.POOL_ADDRESSES_PROVIDER,
  });

  // Object containing array or users aave positions and active eMode category
  // { userReserves, userEmodeCategoryId }
  const userReserves = await poolDataProviderContract.getUserReservesHumanized({
    lendingPoolAddressProvider: markets.AaveV3Sepolia.POOL_ADDRESSES_PROVIDER,
    user: currentAccount,
  });

  // Array of incentive tokens with price feed and emission APR
  const reserveIncentives =
    await incentiveDataProviderContract.getReservesIncentivesDataHumanized({
      lendingPoolAddressProvider: markets.AaveV3Sepolia.POOL_ADDRESSES_PROVIDER,
    });

  // Dictionary of claimable user incentives
  const userIncentives =
    await incentiveDataProviderContract.getUserReservesIncentivesDataHumanized({
      lendingPoolAddressProvider: markets.AaveV3Sepolia.POOL_ADDRESSES_PROVIDER,
      user: currentAccount,
    });

  console.log({ reserves, userReserves, reserveIncentives, userIncentives });

  const currentTimestamp = dayjs().unix();
  const reservesArray = reserves.reservesData;
  const baseCurrencyData = reserves.baseCurrencyData;
  const userReservesArray = userReserves.userReserves;
  const formattedPoolReserves = formatReserves({
    reserves: reservesArray,
    currentTimestamp,
    marketReferenceCurrencyDecimals:
      baseCurrencyData.marketReferenceCurrencyDecimals,
    marketReferencePriceInUsd:
      baseCurrencyData.marketReferenceCurrencyPriceInUsd,
  });

  /*
- @param `currentTimestamp` Current UNIX timestamp in seconds, Math.floor(Date.now() / 1000)
- @param `marketReferencePriceInUsd` Input from [Fetching Protocol Data](#fetching-protocol-data), `reserves.baseCurrencyData.marketReferencePriceInUsd`
- @param `marketReferenceCurrencyDecimals` Input from [Fetching Protocol Data](#fetching-protocol-data), `reserves.baseCurrencyData.marketReferenceCurrencyDecimals`
- @param `userReserves` Input from [Fetching Protocol Data](#fetching-protocol-data), combination of `userReserves.userReserves` and `reserves.reservesArray`
- @param `userEmodeCategoryId` Input from [Fetching Protocol Data](#fetching-protocol-data), `userReserves.userEmodeCategoryId`
*/
  const userSummary = formatUserSummary({
    currentTimestamp,
    marketReferencePriceInUsd:
      baseCurrencyData.marketReferenceCurrencyPriceInUsd,
    marketReferenceCurrencyDecimals:
      baseCurrencyData.marketReferenceCurrencyDecimals,
    userReserves: userReservesArray,
    formattedPoolReserves,
    userEmodeCategoryId: userReserves.userEmodeCategoryId,
  });
}

export function getLendingPosition() {
  // Connect to a provider (e.g., Infura, Alchemy, or a local node)
  const provider = new ethers.providers.Web3Provider(window.ethereum);

  // Aave V2 LendingPool contract address (for the specific market)
  const lendingPoolAddress = "0xB53C1a33016B2DC2fF3653530bfF1848a515c8c5";

  // The ABI for the LendingPool contract (simplified for this example)
  const lendingPoolAbi = []; // Replace with the actual ABI

  // Create an instance of the LendingPool contract
  const lendingPoolContract = new ethers.Contract(
    lendingPoolAddress,
    lendingPoolAbi,
    provider
  );

  // The address of the user whose supply positions you want to check
  const userAddress = "0x...";

  async function getSupplyPositions() {
    // Call the function to get the user's account data
    const userData = await lendingPoolContract.getUserAccountData(userAddress);

    // userData will contain various information including total collateral (supply) in ETH
    console.log(
      "Total Collateral (Supply) in ETH:",
      ethers.utils.formatEther(userData.totalCollateralETH)
    );

    // Additional processing can be done here to get more details about each supply position
  }

  getSupplyPositions().catch(console.error);
}
