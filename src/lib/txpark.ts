export const TXPARK_CHAIN_ID = 127124;
export const TXPARK_HEX_CHAIN_ID = "0x1f094";
export const TXPARK_RPC_URL = "https://demo.txpark.nomadic-labs.com/rpc";

export const ADDRESSES = {
  usdc: "0xB155450Fbbe8B5bF1F584374243c7bdE5609Ab1f",
  xu3o8: "0xfBe9F61Da390178c9D1Bfa2d870B2916CE7e53BB",
  pool: "0xEfa19F1EB8608c19c84a7F74aB3cf8D1F92a3aA4",
  swapRouter: "0xc79Eb5Bd60Ac7cBF1C36fdCe0FF208B3b016947C",
  quoterV2: "0x156Aa25435Dd3A2B5D1E6881d651eE345A089c55",
  positionManager: "0xa87C8dd5FC8633Cf9452a03c8c604Ec5787d22d2",
  factory: "0xFbee097322418557d04285E51a17934E8b4C3f22",
} as const;

export const POOL_FEE = 2500;
export const FULL_RANGE_TICK_LOWER = -887250;
export const FULL_RANGE_TICK_UPPER = 887250;

export const TOKENS = {
  usdc: {
    key: "usdc",
    symbol: "USDC",
    name: "USD Coin",
    decimals: 6,
    address: ADDRESSES.usdc,
    accent: "from-cyan-300 to-sky-500",
  },
  xu3o8: {
    key: "xu3o8",
    symbol: "xU3O8",
    name: "xU3O8",
    decimals: 18,
    address: ADDRESSES.xu3o8,
    accent: "from-amber-300 to-lime-500",
  },
} as const;

export type TokenKey = keyof typeof TOKENS;

export const erc20Abi = [
  "function name() view returns (string)",
  "function symbol() view returns (string)",
  "function decimals() view returns (uint8)",
  "function balanceOf(address owner) view returns (uint256)",
  "function allowance(address owner, address spender) view returns (uint256)",
  "function approve(address spender, uint256 amount) returns (bool)",
] as const;

export const swapRouterAbi = [
  "function exactInputSingle((address tokenIn,address tokenOut,uint24 fee,address recipient,uint256 deadline,uint256 amountIn,uint256 amountOutMinimum,uint160 sqrtPriceLimitX96) params) payable returns (uint256 amountOut)",
] as const;

export const quoterAbi = [
  "function quoteExactInputSingle((address tokenIn,address tokenOut,uint256 amountIn,uint24 fee,uint160 sqrtPriceLimitX96) params) returns (uint256 amountOut,uint160 sqrtPriceX96After,uint32 initializedTicksCrossed,uint256 gasEstimate)",
] as const;

export const positionManagerAbi = [
  "function mint((address token0,address token1,uint24 fee,int24 tickLower,int24 tickUpper,uint256 amount0Desired,uint256 amount1Desired,uint256 amount0Min,uint256 amount1Min,address recipient,uint256 deadline) params) payable returns (uint256 tokenId,uint128 liquidity,uint256 amount0,uint256 amount1)",
] as const;

export const poolAbi = [
  "function slot0() view returns (uint160 sqrtPriceX96,int24 tick,uint16 observationIndex,uint16 observationCardinality,uint16 observationCardinalityNext,uint32 feeProtocol,bool unlocked)",
  "function liquidity() view returns (uint128)",
] as const;

export type WriteAction = "approve-swap" | "swap" | "approve-liquidity" | "liquidity";
