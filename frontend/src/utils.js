export const buildDelegationWithSigParams = (
  chainId,
  token,
  revision,
  tokenName,
  delegatee,
  nonce,
  deadline,
  value
) => ({
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
});

export const GHO_DEBT_TOKEN_ADDR_SEPOLIA =
  "0x67ae46EF043F7A4508BD1d6B94DB6c33F0915844";
export const GHO_TOKEN_ADDR_SEPOLIA =
  "0xc4bF5CbDaBE595361438F8c6a187bDc330539c60";
export const AAVE_POOL_ADDR_SEPOLIA = `0x6Ae43d3271ff6888e7Fc43Fd7321a503ff738951`;
