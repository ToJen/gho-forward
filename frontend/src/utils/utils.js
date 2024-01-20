import { ERC20_ABI, allChainTokenInfo, tokenRegistry } from "./tokenRegistry";
import {
  createPublicClient,
  formatEther,
  formatUnits,
  http,
  parseUnits,
} from "viem";
import {
  polygon,
  mainnet,
  arbitrum,
  optimism,
  bsc,
  base,
  linea,
  zkSync,
} from "viem/chains";
import { GHO_DEBT_TOKEN_ADDR_SEPOLIA, SEPOLIA_CHAIN_ID } from "./constants";

const supportChains = [
  polygon,
  mainnet,
  arbitrum,
  optimism,
  base,
  linea,
  zkSync,
];

function getPublicClient(supportChain) {
  return createPublicClient({
    chain: supportChain,
    transport: http(),
  });
}

const WeightsForScoring = {
  [polygon.id]: 15,
  [mainnet.id]: 30,
  [arbitrum.id]: 15,
  [optimism.id]: 10,
  [base.id]: 10,
  [linea.id]: 5,
  [zkSync.id]: 15,
};
export const SecondHelper = {
  OneHour: 3600,
  OneDay: 86400,
  SixDays: 518400,
};

//takes in multiple address
export async function getBalances(addresses) {
  const finalBalances = [];
  for (let i = 0; i < addresses.length; ++i) {
    const currentAddr = addresses[i];
    if (currentAddr == null) {
      continue;
    }
    const allBalancesOfCurrentAddr = {};
    // let allTokens: any[] = [];
    for (let j = 0; j < supportChains.length; ++j) {
      const client = getPublicClient(supportChains[j]);

      // await client.createContractEventFilter({
      //   abi: parseAbi([
      //     'event Transfer(address indexed, address indexed, uint256)',
      //   ]),
      //   strict: true,
      //   eventName: 'Transfer',
      //   args: {
      //     to: ['0x'],
      //   },
      // });

      console.log(` supportChains[j]`, supportChains[j]?.network);
      // await getAllTransferToEventsForAddr(client, currentAddr);

      const nativeBalance = await client.getBalance({ address: currentAddr });

      const formatBal = formatEther(nativeBalance);
      console.log("supportChains[j]?.network!", supportChains[j]?.network);
      const chainTokenAddresses =
        tokenRegistry[supportChains[j]?.network]?.filter((t) => t.isEnabled) ??
        [];

      if (supportChains[j]?.network === "homestead") {
        console.log({ chainTokenAddresses });
      }
      const chainTokens = [];

      for (let j = 0; j < chainTokenAddresses.length; ++j) {
        const currentToken = chainTokenAddresses[j];

        await new Promise((f) => setTimeout(f, 100));
        const tokenBal = await client.readContract({
          address: currentToken.address,
          functionName: "balanceOf",
          args: [currentAddr],
          abi: ERC20_ABI,
        });
        // BigInt(tokenBal) == BigInt(0)
        if (tokenBal == 0) {
          continue;
        }

        const tokenInfo = allChainTokenInfo.filter(
          (t) =>
            t.contractAddress == currentToken.address &&
            t.chainId == supportChains[j]?.id
        );

        if (tokenInfo.length == 0) {
          console.log(
            "Token info not found for token address",
            currentToken.address
          );
          continue;
        }
        const tokenDetails = tokenInfo[0];

        chainTokens.push({
          name: tokenDetails.name,
          symbol: tokenDetails.symbol,
          balance: formatUnits(tokenBal, tokenDetails.decimals),
          decimals: tokenDetails.decimals,
          contractAddress: currentToken.address,
          networkName: supportChains[j]?.network,
          chainId: supportChains[j]?.id,
        });
      }
      // allTokens = [...allTokens, ...chainTokens];
      // no token balances
      if (nativeBalance == 0 && chainTokens.length === 0) {
        continue;
      }
      allBalancesOfCurrentAddr[supportChains[j]?.id] = {
        address: currentAddr,
        networkName: supportChains[j]?.network,
        balance: formatBal.toString(),
        tokens: chainTokens,
      };
    }

    finalBalances.push(allBalancesOfCurrentAddr);
  }
  return finalBalances;
}

export const buildDelegationWithSigParams = (
  delegatee,
  nonce,
  deadline,
  value
) => {
  const chainId = SEPOLIA_CHAIN_ID;
  const token = GHO_DEBT_TOKEN_ADDR_SEPOLIA;
  const revision = "1";
  const tokenName = "Aave Variable Debt Sepolia GHO";

  return {
    types: {
      EIP712Domain: [
        { name: "name", type: "string" },
        { name: "version", type: "string" },
        { name: "chainId", type: "uint256" },
        { name: "verifyingContract", type: "address" },
      ],
      DelegationWithSig: [
        { name: "delegatee", type: "address" },
        { name: "value", type: "uint256" },
        { name: "nonce", type: "uint256" },
        { name: "deadline", type: "uint256" },
      ],
    },
    primaryType: "DelegationWithSig",
    domain: {
      name: tokenName,
      version: revision,
      chainId: chainId,
      verifyingContract: token,
    },
    message: {
      delegatee,
      value,
      nonce,
      deadline,
    },
  };
};

export function truncateAddress(address) {
  if (!address) return "No Account";
  if ("0x0000000000000000000000000000000000000000" == address) return null;
  const match = address.match(
    /^(0x[a-zA-Z0-9]{4})[a-zA-Z0-9]+([a-zA-Z0-9]{4})$/
  );
  if (!match) return address;
  return `${match[1]}…${match[2]}`;
}

export async function getAllowedBorrowLimitDetails(address, gitcoinScore) {
  const balances = testbalances[0]; // (await getBalances([address]))?.[0];
  if (balances == null) {
    console.log("no onchain score");
  }
  // do some math
  let onChainScore = 0;
  Object.keys(WeightsForScoring).forEach((chainId) => {
    if (balances[chainId]?.balance == null) {
      return;
    }
    const currentChainScore =
      (balances[chainId].balance % 100) * WeightsForScoring[chainId];
    onChainScore += currentChainScore;
  });
  console.log(`onChainScore`, onChainScore);
  const finalScore = 12;
  let borrowUpto;
  let repayTime;
  switch (finalScore) {
    case finalScore > 10 && finalScore < 20:
      borrowUpto = "10";
      repayTime = Math.floor(Date.now() / 1000) + SecondHelper.OneDay * 2;
      break;
    case finalScore > 20 && finalScore < 40:
      borrowUpto = "100";
      repayTime = Math.floor(Date.now() / 1000) + SecondHelper.OneDay * 2;
      break;
    case finalScore > 40 && finalScore < 60:
      borrowUpto = "500";
      repayTime = Math.floor(Date.now() / 1000) + SecondHelper.SixDays;
      break;
    case finalScore > 60:
      borrowUpto = "1000";
      repayTime = Math.floor(Date.now() / 1000) + SecondHelper.SixDays * 12;
      break;
    default:
      borrowUpto = "10";
      repayTime = Math.floor(Date.now() / 1000) + SecondHelper.OneDay * 2;
  }
  return {
    borrowUpto,
    repayTime,
    gitcoinScore: gitcoinScore ?? 10,
    onChainScore: onChainScore ?? 12,
  };
}

const testbalances = [
  {
    10: {
      address: "0x18D365087Eb68362c7E62792953fB209703541fE",
      networkName: "optimism",
      balance: "0.00068464921077008",
      tokens: [],
    },
    137: {
      address: "0x18D365087Eb68362c7E62792953fB209703541fE",
      networkName: "matic",
      balance: "0.030371468725926904",
      tokens: [],
    },
    324: {
      address: "0x18D365087Eb68362c7E62792953fB209703541fE",
      networkName: "zksync-era",
      balance: "0.015777137699981988",
      tokens: [],
    },
    8453: {
      address: "0x18D365087Eb68362c7E62792953fB209703541fE",
      networkName: "base",
      balance: "0.001088441370999742",
      tokens: [],
    },
    59144: {
      address: "0x18D365087Eb68362c7E62792953fB209703541fE",
      networkName: "linea-mainnet",
      balance: "1.000027067355523564",
      tokens: [],
    },
  },
];

export function timeConverter(UNIX_timestamp) {
  var a = new Date(UNIX_timestamp * 1000);
  var months = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];
  var year = a.getFullYear();
  var month = months[a.getMonth()];
  var date = a.getDate();
  var hour = a.getHours();
  var min = a.getMinutes();
  var sec = a.getSeconds(); //+ " " + year
  var time = date + " " + month + " " + hour + ":" + min + ":" + sec;
  return time;
}
