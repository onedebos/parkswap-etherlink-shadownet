import { Contract, JsonRpcProvider } from "ethers";
import { ADDRESSES, POOL_FEE, TOKENS, positionManagerEnumerateAbi } from "@/lib/txpark";

const npmReadAbi = [...positionManagerEnumerateAbi] as const;

export type ParkswapLiquidityPosition = {
  tokenId: bigint;
  token0: string;
  token1: string;
  fee: number;
  tickLower: number;
  tickUpper: number;
  liquidity: bigint;
  tokensOwed0: bigint;
  tokensOwed1: bigint;
};

function sameAddr(a: string, b: string) {
  return a.toLowerCase() === b.toLowerCase();
}

/**
 * Include a position if its pair is exactly USDC + xU3O8 (by address), for any fee tier.
 * Each fee tier is a separate pool in the factory; the UI labels fee {POOL_FEE} as this app’s main pool.
 */
function isUsdcXu3o8Pair(token0: string, token1: string) {
  const usdc = ADDRESSES.usdc;
  const xu3 = ADDRESSES.xu3o8;
  return (
    (sameAddr(token0, usdc) && sameAddr(token1, xu3)) || (sameAddr(token0, xu3) && sameAddr(token1, usdc))
  );
}

/** True when this NFT’s fee tier matches `POOL_FEE` (ParkSwap swap + default add-liquidity pool). */
export function positionMatchesAppPoolFee(fee: number) {
  return fee === POOL_FEE;
}

export async function fetchParkswapLiquidityPositions(
  provider: JsonRpcProvider,
  owner: string
): Promise<ParkswapLiquidityPosition[]> {
  const npm = new Contract(ADDRESSES.positionManager, npmReadAbi, provider);
  const balance = (await npm.balanceOf(owner)) as bigint;
  const n = Number(balance);
  if (!Number.isSafeInteger(n) || n < 0) {
    return [];
  }

  const out: ParkswapLiquidityPosition[] = [];

  for (let i = 0; i < n; i++) {
    const tokenId = (await npm.tokenOfOwnerByIndex(owner, i)) as bigint;
    const row = (await npm.positions(tokenId)) as {
      nonce: bigint;
      operator: string;
      token0: string;
      token1: string;
      fee: bigint;
      tickLower: bigint;
      tickUpper: bigint;
      liquidity: bigint;
      feeGrowthInside0LastX128: bigint;
      feeGrowthInside1LastX128: bigint;
      tokensOwed0: bigint;
      tokensOwed1: bigint;
    };

    if (!isUsdcXu3o8Pair(row.token0, row.token1)) {
      continue;
    }

    out.push({
      tokenId,
      token0: row.token0,
      token1: row.token1,
      fee: Number(row.fee),
      tickLower: Number(row.tickLower),
      tickUpper: Number(row.tickUpper),
      liquidity: row.liquidity,
      tokensOwed0: row.tokensOwed0,
      tokensOwed1: row.tokensOwed1,
    });
  }

  return out;
}

export function token0Symbol(position: ParkswapLiquidityPosition) {
  if (sameAddr(position.token0, ADDRESSES.usdc)) return TOKENS.usdc.symbol;
  if (sameAddr(position.token0, ADDRESSES.xu3o8)) return TOKENS.xu3o8.symbol;
  return "token0";
}

export function token1Symbol(position: ParkswapLiquidityPosition) {
  if (sameAddr(position.token1, ADDRESSES.usdc)) return TOKENS.usdc.symbol;
  if (sameAddr(position.token1, ADDRESSES.xu3o8)) return TOKENS.xu3o8.symbol;
  return "token1";
}
