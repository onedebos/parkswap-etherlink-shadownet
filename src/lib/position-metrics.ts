import { CurrencyAmount, Token } from "@uniswap/sdk-core";
import { SqrtPriceMath, TickMath } from "@uniswap/v3-sdk";
import { Contract, JsonRpcProvider, ZeroAddress } from "ethers";
import JSBI from "jsbi";
import { ADDRESSES, FULL_RANGE_TICK_LOWER, FULL_RANGE_TICK_UPPER, TOKENS, TXPARK_CHAIN_ID, factoryAbi, poolAbi } from "@/lib/txpark";
import { fetchInitialDepositHuman } from "@/lib/position-initial-deposit";
import type { ParkswapLiquidityPosition } from "@/lib/user-positions";

function sameAddr(a: string, b: string) {
  return a.toLowerCase() === b.toLowerCase();
}

const ZERO = JSBI.BigInt(0);

function tokenMeta(addr: string) {
  if (sameAddr(addr, ADDRESSES.usdc)) {
    return { decimals: TOKENS.usdc.decimals, symbol: TOKENS.usdc.symbol, name: TOKENS.usdc.name };
  }
  if (sameAddr(addr, ADDRESSES.xu3o8)) {
    return { decimals: TOKENS.xu3o8.decimals, symbol: TOKENS.xu3o8.symbol, name: TOKENS.xu3o8.name };
  }
  return null;
}

function sdkToken(addr: string) {
  const m = tokenMeta(addr);
  if (!m) return null;
  return new Token(TXPARK_CHAIN_ID, addr, m.decimals, m.symbol, m.name);
}

function usdcPerXu3o8FromSqrtPrice(sqrtPriceX96: bigint): number | null {
  const q192 = 2n ** 192n;
  const ratioX192 = sqrtPriceX96 * sqrtPriceX96;
  const rawRatioScaled = Number((ratioX192 * 1_000_000_000_000n) / q192) / 1_000_000_000_000;
  const xu3o8PerUsdc = rawRatioScaled * 10 ** (TOKENS.usdc.decimals - TOKENS.xu3o8.decimals);
  if (!Number.isFinite(xu3o8PerUsdc) || xu3o8PerUsdc <= 0) {
    return null;
  }
  return 1 / xu3o8PerUsdc;
}

function positionTokenAmountsRaw(
  liquidity: bigint,
  tickLower: number,
  tickUpper: number,
  sqrtRatioX96: bigint,
  tickCurrent: number,
): { amount0: JSBI; amount1: JSBI } {
  const L = JSBI.BigInt(liquidity.toString());
  const sqrtP = JSBI.BigInt(sqrtRatioX96.toString());
  const sqrtLower = TickMath.getSqrtRatioAtTick(tickLower);
  const sqrtUpper = TickMath.getSqrtRatioAtTick(tickUpper);

  if (tickCurrent < tickLower) {
    return {
      amount0: SqrtPriceMath.getAmount0Delta(sqrtLower, sqrtUpper, L, false),
      amount1: ZERO,
    };
  }
  if (tickCurrent < tickUpper) {
    return {
      amount0: SqrtPriceMath.getAmount0Delta(sqrtP, sqrtUpper, L, false),
      amount1: SqrtPriceMath.getAmount1Delta(sqrtLower, sqrtP, L, false),
    };
  }
  return {
    amount0: ZERO,
    amount1: SqrtPriceMath.getAmount1Delta(sqrtLower, sqrtUpper, L, false),
  };
}

export type LiquidityPositionMetrics = {
  /** Principal implied by liquidity at the pool’s current price (token balances if exited now). */
  currentCompositionUsdc: number;
  currentCompositionXu3o8: number;
  /** From first `IncreaseLiquidity` log for this NFT (usually the mint). */
  initialDepositUsdc: number | null;
  initialDepositXu3o8: number | null;
  positionValueUsdApprox: number | null;
  poolSharePercentApprox: number | null;
  isFullRange: boolean;
  /** True when pool tick is inside [tickLower, tickUpper). Full range is always in range. */
  isInRange: boolean;
  priceRangeLabel: string;
};

export async function fetchUsdcXu3o8PoolSlot(
  provider: JsonRpcProvider,
  fee: number,
): Promise<{ sqrtPriceX96: bigint; tick: number; liquidity: bigint } | null> {
  const tokenA = ADDRESSES.usdc.toLowerCase() < ADDRESSES.xu3o8.toLowerCase() ? ADDRESSES.usdc : ADDRESSES.xu3o8;
  const tokenB = ADDRESSES.usdc.toLowerCase() < ADDRESSES.xu3o8.toLowerCase() ? ADDRESSES.xu3o8 : ADDRESSES.usdc;
  const factory = new Contract(ADDRESSES.factory, factoryAbi, provider);
  const poolAddr = (await factory.getPool(tokenA, tokenB, fee)) as string;
  if (!poolAddr || poolAddr === ZeroAddress) {
    return null;
  }
  const pool = new Contract(poolAddr, poolAbi, provider);
  const [slot0, liq] = await Promise.all([pool.slot0(), pool.liquidity()]);
  return {
    sqrtPriceX96: slot0.sqrtPriceX96 as bigint,
    tick: Number(slot0.tick),
    liquidity: liq as bigint,
  };
}

export function computePositionMetrics(
  position: ParkswapLiquidityPosition,
  slot: { sqrtPriceX96: bigint; tick: number; liquidity: bigint },
): LiquidityPositionMetrics | null {
  const token0 = sdkToken(position.token0);
  const token1 = sdkToken(position.token1);
  if (!token0 || !token1) {
    return null;
  }

  const { amount0: a0, amount1: a1 } = positionTokenAmountsRaw(
    position.liquidity,
    position.tickLower,
    position.tickUpper,
    slot.sqrtPriceX96,
    slot.tick,
  );

  const ca0 = CurrencyAmount.fromRawAmount(token0, a0.toString());
  const ca1 = CurrencyAmount.fromRawAmount(token1, a1.toString());
  const currentCompositionUsdc = sameAddr(position.token0, ADDRESSES.usdc)
    ? parseFloat(ca0.toExact())
    : parseFloat(ca1.toExact());
  const currentCompositionXu3o8 = sameAddr(position.token0, ADDRESSES.usdc)
    ? parseFloat(ca1.toExact())
    : parseFloat(ca0.toExact());

  const usdcPerXu3 = usdcPerXu3o8FromSqrtPrice(slot.sqrtPriceX96);
  const positionValueUsdApprox =
    usdcPerXu3 !== null && Number.isFinite(currentCompositionUsdc) && Number.isFinite(currentCompositionXu3o8)
      ? currentCompositionUsdc + currentCompositionXu3o8 * usdcPerXu3
      : null;

  let poolSharePercentApprox: number | null = null;
  if (slot.liquidity > 0n && position.liquidity > 0n) {
    const ratio = (Number(position.liquidity) / Number(slot.liquidity)) * 100;
    if (Number.isFinite(ratio)) {
      poolSharePercentApprox = ratio;
    }
  }

  const isFullRange = position.tickLower === FULL_RANGE_TICK_LOWER && position.tickUpper === FULL_RANGE_TICK_UPPER;
  const priceRangeLabel = isFullRange ? "Full range" : "Custom range";
  const isInRange =
    isFullRange || (slot.tick >= position.tickLower && slot.tick < position.tickUpper);

  return {
    currentCompositionUsdc,
    currentCompositionXu3o8,
    initialDepositUsdc: null,
    initialDepositXu3o8: null,
    positionValueUsdApprox,
    poolSharePercentApprox,
    isFullRange,
    isInRange,
    priceRangeLabel,
  };
}

export async function loadLiquidityPositionMetrics(
  provider: JsonRpcProvider,
  positions: ParkswapLiquidityPosition[],
): Promise<Map<string, LiquidityPositionMetrics | null>> {
  const out = new Map<string, LiquidityPositionMetrics | null>();
  const fees = [...new Set(positions.map((p) => p.fee))];
  const slotByFee = new Map<number, { sqrtPriceX96: bigint; tick: number; liquidity: bigint } | null>();
  await Promise.all(
    fees.map(async (fee) => {
      slotByFee.set(fee, await fetchUsdcXu3o8PoolSlot(provider, fee));
    }),
  );

  const enriched = await Promise.all(
    positions.map(async (p) => {
      const key = p.tokenId.toString();
      const slot = slotByFee.get(p.fee);
      if (!slot) {
        return [key, null] as const;
      }
      const base = computePositionMetrics(p, slot);
      if (!base) {
        return [key, null] as const;
      }
      const initial = await fetchInitialDepositHuman(provider, p);
      return [
        key,
        {
          ...base,
          initialDepositUsdc: initial?.usdc ?? null,
          initialDepositXu3o8: initial?.xu3o8 ?? null,
        } satisfies LiquidityPositionMetrics,
      ] as const;
    }),
  );

  for (const [key, val] of enriched) {
    out.set(key, val);
  }
  return out;
}
