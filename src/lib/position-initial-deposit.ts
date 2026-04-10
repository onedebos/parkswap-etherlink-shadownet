import { formatUnits, Interface, JsonRpcProvider, toBeHex, zeroPadValue } from "ethers";
import { ADDRESSES, TOKENS } from "@/lib/txpark";
import type { ParkswapLiquidityPosition } from "@/lib/user-positions";

const increaseLiquidityIface = new Interface([
  "event IncreaseLiquidity(uint256 indexed tokenId, uint128 liquidity, uint256 amount0, uint256 amount1)",
]);

function sameAddr(a: string, b: string) {
  return a.toLowerCase() === b.toLowerCase();
}

/**
 * First `IncreaseLiquidity` for this NFT (usually the mint) gives principal token0/token1
 * actually deposited at creation. Later increases are ignored for "initial deposit" UX.
 */
export async function fetchFirstIncreaseAmounts(
  provider: JsonRpcProvider,
  tokenId: bigint,
): Promise<{ amount0: bigint; amount1: bigint } | null> {
  const topic0 = increaseLiquidityIface.getEvent("IncreaseLiquidity")!.topicHash;
  const topic1 = zeroPadValue(toBeHex(tokenId), 32);

  let logs;
  try {
    logs = await provider.getLogs({
      address: ADDRESSES.positionManager,
      fromBlock: 0n,
      toBlock: "latest",
      topics: [topic0, topic1],
    });
  } catch {
    return null;
  }

  if (logs.length === 0) {
    return null;
  }

  logs.sort((a, b) => {
    const bn = Number(a.blockNumber - b.blockNumber);
    if (bn !== 0) return bn;
    return a.index - b.index;
  });

  const first = logs[0];
  let parsed;
  try {
    parsed = increaseLiquidityIface.parseLog({ topics: [...first.topics], data: first.data });
  } catch {
    return null;
  }
  if (!parsed) return null;

  const amount0 = parsed.args.amount0 as bigint;
  const amount1 = parsed.args.amount1 as bigint;
  return { amount0, amount1 };
}

export async function fetchInitialDepositHuman(
  provider: JsonRpcProvider,
  position: ParkswapLiquidityPosition,
): Promise<{ usdc: number; xu3o8: number } | null> {
  const raw = await fetchFirstIncreaseAmounts(provider, position.tokenId);
  if (!raw) return null;

  const usdcRaw = sameAddr(position.token0, ADDRESSES.usdc) ? raw.amount0 : raw.amount1;
  const xu3Raw = sameAddr(position.token0, ADDRESSES.usdc) ? raw.amount1 : raw.amount0;

  return {
    usdc: parseFloat(formatUnits(usdcRaw, TOKENS.usdc.decimals)),
    xu3o8: parseFloat(formatUnits(xu3Raw, TOKENS.xu3o8.decimals)),
  };
}
