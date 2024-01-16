import chai from "chai"
import { chainConfig } from "./chain"
import "@nomiclabs/hardhat-ethers"
import "@nomiclabs/hardhat-waffle"
import "@typechain/hardhat"
import "@nomiclabs/hardhat-etherscan"
import "@openzeppelin/hardhat-upgrades"
import "hardhat-gas-reporter"
import { HardhatUserConfig } from "hardhat/config"
import { NetworksUserConfig } from "hardhat/types"
import "solidity-coverage"
import { config } from "./package.json"
import KEYS from "./private.json"

function getNetworks(): NetworksUserConfig | undefined {
  const infuraApiKey = process.env.INFURA_API_KEY
  const TESTNET_PRIVATE_KEY = KEYS.privateKey
  // const MAINNET_PRIVATE_KEY = KEYS.privateKey

  const selectedNetwork = "polygon" // check chain.ts file to deploy on particular network
  const accounts = [`0x${TESTNET_PRIVATE_KEY}`]

  return {
    testnet: {
      url: chainConfig[selectedNetwork].testnet.rpc[0],
      accounts,
      allowUnlimitedContractSize: true
    },
    mainnet: {
      url: chainConfig[selectedNetwork].mainnet.rpc[0],
      accounts,
      allowUnlimitedContractSize: true
    }
  }
}

const hardhatConfig: HardhatUserConfig = {
  solidity: {
    compilers: [
      {
        version: "0.8.4",
        settings: {
          optimizer: {
            enabled: true,
            runs: 200
          }
        }
      },
      { version: "0.8.20" },
      { version: "0.8.18" }
    ]
  },
  paths: {
    sources: config.paths.contracts,
    tests: config.paths.tests,
    cache: config.paths.cache,
    artifacts: config.paths.build.contracts
  },
  networks: {
    hardhat: {
      chainId: 1337,
      allowUnlimitedContractSize: true
    },
    ...getNetworks()
  },

  typechain: {
    outDir: config.paths.build.typechain,
    target: "ethers-v5"
  }
}

export default hardhatConfig
