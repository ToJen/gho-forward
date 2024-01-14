import { Contract } from "ethers"
import { task, types } from "hardhat/config"

task("deploy:box", "Deploy box contract")
  .addOptionalParam<boolean>("logs", "Logs ", true, types.boolean)
  .setAction(async ({ logs }, { ethers, upgrades }): Promise<Contract> => {
    const Box = await ethers.getContractFactory("Box")

    const box = await upgrades.deployProxy(Box, [42], { initializer: "store" })
    await box.deployed()

    const implementationAddress = await upgrades.erc1967.getImplementationAddress(box.address)
    const adminAddress = await upgrades.erc1967.getAdminAddress(box.address)

    console.log("Box implementationAddress:", implementationAddress)
    console.log("Box proxyAddress:", box.address)
    console.log("Box adminAddress:", adminAddress)

    return box
  })
