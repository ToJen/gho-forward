import { ERC20_ABI, allChainTokenInfo, tokenRegistry } from "./tokenRegistry";
import { createPublicClient, formatEther, formatUnits, http } from "viem";
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

const WeightsForScoring = {};

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
