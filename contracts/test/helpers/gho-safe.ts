import { ethers } from "ethers"
import { BigNumber } from "@ethersproject/bignumber"

export const signTypedData = async (
  owner: any,
  spender: string,
  value: BigNumber,
  nonce: BigNumber,
  contract: string
): Promise<string> => {
  const domain = {
    name: "DebtToken",
    version: "1",
    verifyingContract: contract,
    chainId: 31337
  }

  const types = {
    Permit: [
      { name: "owner", type: "address" },
      { name: "spender", type: "address" },
      { name: "value", type: "uint256" },
      { name: "nonce", type: "uint256" },
      { name: "deadline", type: "uint256" }
    ]
  }

  const values = {
    owner: owner.address,
    spender,
    value,
    nonce,
    deadline: 2888888888
  }

  return owner._signTypedData(domain, types, values)
}

export const getSignatureFromTypedData = (signature: string) => {
  return ethers.utils.splitSignature(signature)
}

export const getDelegationSig = async (params: any) => {
  return getSignatureFromTypedData(params)
}

export const buildDelegationWithSigParams = (
  chainId: number,
  token: string,
  revision: string,
  tokenName: string,
  delegatee: string,
  nonce: number,
  deadline: string,
  value: BigNumber
) => ({
  types: {
    EIP712Domain: [
      { name: "name", type: "string" },
      { name: "version", type: "string" },
      { name: "chainId", type: "uint256" },
      { name: "verifyingContract", type: "address" }
    ],
    DelegationWithSig: [
      { name: "delegatee", type: "address" },
      { name: "value", type: "uint256" },
      { name: "nonce", type: "uint256" },
      { name: "deadline", type: "uint256" }
    ]
  },
  primaryType: "DelegationWithSig" as const,
  domain: {
    name: tokenName,
    version: revision,
    chainId: chainId,
    verifyingContract: token
  },
  message: {
    delegatee,
    value,
    nonce,
    deadline
  }
})
