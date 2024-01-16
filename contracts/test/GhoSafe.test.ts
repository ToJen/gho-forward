import { expect } from "chai"
import { Signer, Wallet } from "ethers"
import { ethers } from "hardhat"
import { TestToken__factory } from "../build/typechain"
import { GhoSafe__factory } from "../build/typechain"
import { SendAll } from "../build/typechain/SendAll"
import { TestToken } from "../build/typechain/TestToken"
import { GhoSafe } from "../build/typechain/GhoSafe"
import { buildDelegationWithSigParams, getDelegationSig } from "./helpers/gho-safe"
// import { getVariableDebtToken } from "@aave/deploy-v3/dist/helpers/contract-getters"
import { BigNumber } from "@ethersproject/bignumber"

describe("GhoSafe", () => {
  let accounts: Signer[]
  let tokenDeployer
  let testTokenContract: TestToken
  let ghoSafeContract: GhoSafe
  let sendAllContract: SendAll
  let testTokenFactory: TestToken__factory
  let ghoSafeFactory: GhoSafe__factory
  let variableDebtToken: any
  const debtTokenAddress: string = "0x67ae46EF043F7A4508BD1d6B94DB6c33F0915844" // todo
  const poolAddress: string = "0x6Ae43d3271ff6888e7Fc43Fd7321a503ff738951" // todo
  const ghoAddress: string = "0xc4bF5CbDaBE595361438F8c6a187bDc330539c60" // todo
  const delegatee: string = "0xe8bCa9af93067809D178E5049078897Ed910A9AB" // todo
  beforeEach(async () => {
    accounts = await ethers.getSigners()
    tokenDeployer = accounts[0]
    // variableDebtToken = await getVariableDebtToken(debtTokenAddress)
    testTokenFactory = await ethers.getContractFactory("TestToken")
    ghoSafeFactory = await ethers.getContractFactory("GhoSafe")

    // testTokenContract = (await (await testTokenFactory.deploy("TestToken", "TT")).deployed()) as TestToken
    ghoSafeContract = (await (
      await ghoSafeFactory.deploy(debtTokenAddress, poolAddress, ghoAddress)
    ).deployed()) as GhoSafe
  })

  it.only("Should be able to send all approved tokens", async () => {
    const [, user2] = await ethers.getSigners()
    const wallet = new Wallet("0xe2b179d840395d4331542e596fdbe4d26f23d8058b48249aa857898e7efd558e")

    //@ts-ignore

    const nonce = 1 // (await variableDebtToken.nonces(user2.address)).toNumber()

    const signatureParams = buildDelegationWithSigParams(
      11155111,
      "0x67ae46EF043F7A4508BD1d6B94DB6c33F0915844",
      "1",
      "Aave Variable Debt Sepolia GHO",
      delegatee,
      0,
      "1805356853",
      BigNumber.from("100000000000000000")
    )
    const types = {
      [signatureParams.primaryType]: signatureParams.types[signatureParams.primaryType]
    }
    console.log("signatureParams", JSON.stringify(signatureParams))
    console.log(
      "split",
      getDelegationSig(await wallet._signTypedData(signatureParams.domain, types, signatureParams.message))
    )
    expect(true).equals(true)
  })
})
