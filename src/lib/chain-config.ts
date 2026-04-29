import { getAddress, isAddress } from "ethers";

/**
 * Deployment defaults are selected by `NEXT_PUBLIC_DEPLOYMENT_NETWORK`.
 * Override any value with `NEXT_PUBLIC_*` — see `.env.example`.
 */

function envTrim(key: string): string | undefined {
  const v = process.env[key]?.trim();
  return v || undefined;
}

function parseAddressEnv(key: string, fallback: string): `0x${string}` {
  const raw = envTrim(key);
  if (raw && isAddress(raw)) return getAddress(raw) as `0x${string}`;
  return getAddress(fallback) as `0x${string}`;
}

function parseOptionalAddressEnv(key: string): `0x${string}` | null {
  const raw = envTrim(key);
  if (!raw || !isAddress(raw)) return null;
  return getAddress(raw) as `0x${string}`;
}

function parsePositiveIntEnv(key: string, fallback: number): number {
  const raw = envTrim(key);
  if (!raw) return fallback;
  const n = Number.parseInt(raw, 10);
  return Number.isFinite(n) && n >= 0 ? n : fallback;
}

function chainIdToHex(chainId: number): string {
  return `0x${chainId.toString(16)}`;
}

export type DeploymentNetwork = "previewnet" | "testnet";

type DexNetworkPreset = {
  chainId: number;
  rpcUrl: string;
  blockExplorerUrl: string;
  networkDisplayName: string;
  walletChainName: string;
  nativeCurrency: { name: string; symbol: string; decimals: number };
  faucetUrl: string;
  readMoreUrl: string;
  contracts: {
    swapRouter: string;
    quoterV2: string;
    positionManager: string;
    factory: string;
  };
  tokens: {
    usdc: string;
    xu3o8: string;
    vnxau: string;
  };
  pools: {
    featured: string;
    usdcXu3o8: string;
    usdcVnxau: string;
  };
};

const TESTNET_PRESET: DexNetworkPreset = {
  chainId: 127823,
  rpcUrl: "https://node.shadownet.etherlink.com",
  blockExplorerUrl: "https://shadownet.explorer.etherlink.com",
  networkDisplayName: "Etherlink Testnet",
  walletChainName: "Etherlink Testnet",
  nativeCurrency: { name: "XTZ", symbol: "XTZ", decimals: 18 },
  faucetUrl: "https://shadownet.faucet.etherlink.com/",
  readMoreUrl: "https://docs.etherlink.com/get-started/network-information/",
  contracts: {
    swapRouter: "0xEF1d06d1dA6074136b3fA588D16265aB3e328823",
    quoterV2: "0x8DE864210ebD4aD09B5D70d5992F7Ab79fb8D031",
    positionManager: "0x9d6e607fdcdf1c31df6C5dA59fC3786Cbe474EaD",
    factory: "0xE40476E6ED2B62ecBDac9e2e5EEc8b402c24Bd15",
  },
  tokens: {
    usdc: "0xE5131B396a18aB7d3D9716A06114cEC9EDEF9879",
    xu3o8: "0x556172039d9D854FE3B900267375DBebf48A1bf0",
    vnxau: "0xFABF9A6DbD6548958E93fe94dfAA2fd6e009cD82",
  },
  pools: {
    featured: "0x1c97bFFf8CCD5576a87C826f1845c0806Ac3Ae7E",
    usdcXu3o8: "0x1c97bFFf8CCD5576a87C826f1845c0806Ac3Ae7E",
    usdcVnxau: "0x613FF83eA2303f4226F188d796cbFFc9b2562506",
  },
};

const PREVIEWNET_PRESET: DexNetworkPreset = {
  chainId: 128064,
  rpcUrl: "https://evm.previewnet.tezosx.nomadic-labs.com",
  blockExplorerUrl: "https://blockscout.previewnet.tezosx.nomadic-labs.com",
  networkDisplayName: "Tezos X Previewnet",
  walletChainName: "Tezos X Previewnet",
  nativeCurrency: { name: "XTZ", symbol: "XTZ", decimals: 18 },
  faucetUrl: "https://faucet.previewnet.tezosx.nomadic-labs.com",
  readMoreUrl: "https://github.com/trilitech/tezos-x-previewnet",
  contracts: {
    swapRouter: "0x0000000000000000000000000000000000000000",
    quoterV2: "0x0000000000000000000000000000000000000000",
    positionManager: "0x0000000000000000000000000000000000000000",
    factory: "0x0000000000000000000000000000000000000000",
  },
  tokens: {
    usdc: "0x0000000000000000000000000000000000000000",
    xu3o8: "0x0000000000000000000000000000000000000000",
    vnxau: "0x0000000000000000000000000000000000000000",
  },
  pools: {
    featured: "0x0000000000000000000000000000000000000000",
    usdcXu3o8: "0x0000000000000000000000000000000000000000",
    usdcVnxau: "0x0000000000000000000000000000000000000000",
  },
};

function parseDeploymentNetwork(): DeploymentNetwork {
  const raw = envTrim("NEXT_PUBLIC_DEPLOYMENT_NETWORK")?.toLowerCase();
  if (raw === "testnet") return "testnet";
  return "previewnet";
}

function getPreset(network: DeploymentNetwork): DexNetworkPreset {
  return network === "testnet" ? TESTNET_PRESET : PREVIEWNET_PRESET;
}

export type DexChainErc20Meta = {
  address: `0x${string}`;
  symbol: string;
  name: string;
  decimals: number;
};

export type DexChainConfig = {
  deploymentNetwork: DeploymentNetwork;
  chainId: number;
  chainIdHex: string;
  rpcUrl: string;
  blockExplorerDefaultUrl: string;
  /** Shown when the wallet chain matches `chainId` (header, labels). */
  networkDisplayName: string;
  /** `chainName` passed to `wallet_addEthereumChain`. */
  walletAddEthereumChainName: string;
  nativeCurrency: { name: string; symbol: string; decimals: number };
  contracts: {
    swapRouter: `0x${string}`;
    quoterV2: `0x${string}`;
    positionManager: `0x${string}`;
    factory: `0x${string}`;
  };
  tokens: {
    usdc: DexChainErc20Meta;
    xu3o8: DexChainErc20Meta;
    vnxau: DexChainErc20Meta | null;
  };
  faucetUrl: string;
  readMoreUrl: string;
  pools: Array<{
    key: string;
    label: string;
    poolAddress: `0x${string}`;
    tokenA: DexChainErc20Meta;
    tokenB: DexChainErc20Meta;
  }>;
  /** Optional pinned pool for dashboard price + `getFeaturedPool` shortcut; omit on new chains until deployed. */
  featuredPoolAddress: `0x${string}` | null;
};

function buildDexChainConfig(): DexChainConfig {
  const deploymentNetwork = parseDeploymentNetwork();
  const preset = getPreset(deploymentNetwork);
  const chainId = parsePositiveIntEnv("NEXT_PUBLIC_CHAIN_ID", preset.chainId);
  const chainIdHex = envTrim("NEXT_PUBLIC_CHAIN_ID_HEX") ?? chainIdToHex(chainId);

  const usdcDecimals = parsePositiveIntEnv("NEXT_PUBLIC_TOKEN_USDC_DECIMALS", 6);
  const xu3o8Decimals = parsePositiveIntEnv("NEXT_PUBLIC_TOKEN_XU3O8_DECIMALS", 18);
  const vnxauDecimals = parsePositiveIntEnv("NEXT_PUBLIC_TOKEN_VNXAU_DECIMALS", 18);
  const explicitVnxauAddr =
    parseOptionalAddressEnv("NEXT_PUBLIC_VNXAU_TOKEN_ADDRESS") ??
    parseOptionalAddressEnv("NEXT_PUBLIC_TOKEN_VNXAU_ADDRESS");
  const vnxauAddr = explicitVnxauAddr ?? (getAddress(preset.tokens.vnxau) as `0x${string}`);

  const explicitPool =
    parseOptionalAddressEnv("NEXT_PUBLIC_FEATURED_POOL_ADDRESS") ??
    parseOptionalAddressEnv("NEXT_PUBLIC_DASHBOARD_POOL_ADDRESS");
  const featuredPool: `0x${string}` | null =
    explicitPool ?? (getAddress(preset.pools.featured) as `0x${string}`);

  const usdcToken = {
    address: parseAddressEnv("NEXT_PUBLIC_TOKEN_USDC_ADDRESS", preset.tokens.usdc),
    symbol: envTrim("NEXT_PUBLIC_TOKEN_USDC_SYMBOL") ?? "USDC",
    name: envTrim("NEXT_PUBLIC_TOKEN_USDC_NAME") ?? "USD Coin",
    decimals: usdcDecimals,
  } satisfies DexChainErc20Meta;

  const xu3o8Token = {
    address: parseAddressEnv("NEXT_PUBLIC_TOKEN_XU3O8_ADDRESS", preset.tokens.xu3o8),
    symbol: envTrim("NEXT_PUBLIC_TOKEN_XU3O8_SYMBOL") ?? "xU3O8",
    name: envTrim("NEXT_PUBLIC_TOKEN_XU3O8_NAME") ?? "xU3O8",
    decimals: xu3o8Decimals,
  } satisfies DexChainErc20Meta;

  const vnxauToken = vnxauAddr
    ? ({
        address: vnxauAddr,
        symbol: envTrim("NEXT_PUBLIC_TOKEN_VNXAU_SYMBOL") ?? "VNXAU",
        name: envTrim("NEXT_PUBLIC_TOKEN_VNXAU_NAME") ?? "VNX Gold",
        decimals: vnxauDecimals,
      } satisfies DexChainErc20Meta)
    : null;

  const configuredPools: DexChainConfig["pools"] = [];
  const poolUsdcXu3o8 =
    parseOptionalAddressEnv("NEXT_PUBLIC_POOL_USDC_XU3O8_ADDRESS") ??
    featuredPool ??
    (getAddress(preset.pools.usdcXu3o8) as `0x${string}`);
  if (poolUsdcXu3o8) {
    configuredPools.push({
      key: "usdc-xu3o8",
      label: `${usdcToken.symbol} / ${xu3o8Token.symbol}`,
      poolAddress: poolUsdcXu3o8,
      tokenA: usdcToken,
      tokenB: xu3o8Token,
    });
  }
  const poolUsdcVnxau =
    parseOptionalAddressEnv("NEXT_PUBLIC_POOL_USDC_VNXAU_ADDRESS") ??
    (getAddress(preset.pools.usdcVnxau) as `0x${string}`);
  if (poolUsdcVnxau && vnxauToken) {
    configuredPools.push({
      key: "usdc-vnxau",
      label: `${usdcToken.symbol} / ${vnxauToken.symbol}`,
      poolAddress: poolUsdcVnxau,
      tokenA: usdcToken,
      tokenB: vnxauToken,
    });
  }

  return {
    deploymentNetwork,
    chainId,
    chainIdHex,
    rpcUrl: envTrim("NEXT_PUBLIC_RPC_URL") ?? preset.rpcUrl,
    blockExplorerDefaultUrl: envTrim("NEXT_PUBLIC_BLOCK_EXPLORER_URL") ?? preset.blockExplorerUrl,
    networkDisplayName: envTrim("NEXT_PUBLIC_NETWORK_DISPLAY_NAME") ?? preset.networkDisplayName,
    walletAddEthereumChainName: envTrim("NEXT_PUBLIC_WALLET_CHAIN_NAME") ?? preset.walletChainName,
    nativeCurrency: {
      name: envTrim("NEXT_PUBLIC_NATIVE_CURRENCY_NAME") ?? preset.nativeCurrency.name,
      symbol: envTrim("NEXT_PUBLIC_NATIVE_CURRENCY_SYMBOL") ?? preset.nativeCurrency.symbol,
      decimals: parsePositiveIntEnv("NEXT_PUBLIC_NATIVE_CURRENCY_DECIMALS", preset.nativeCurrency.decimals),
    },
    contracts: {
      swapRouter: parseAddressEnv("NEXT_PUBLIC_SWAP_ROUTER_ADDRESS", preset.contracts.swapRouter),
      quoterV2: parseAddressEnv("NEXT_PUBLIC_QUOTER_V2_ADDRESS", preset.contracts.quoterV2),
      positionManager: parseAddressEnv("NEXT_PUBLIC_POSITION_MANAGER_ADDRESS", preset.contracts.positionManager),
      factory: parseAddressEnv("NEXT_PUBLIC_V3_FACTORY_ADDRESS", preset.contracts.factory),
    },
    tokens: {
      usdc: usdcToken,
      xu3o8: xu3o8Token,
      vnxau: vnxauToken,
    },
    faucetUrl: envTrim("NEXT_PUBLIC_FAUCET_URL") ?? preset.faucetUrl,
    readMoreUrl: envTrim("NEXT_PUBLIC_NETWORK_INFO_URL") ?? preset.readMoreUrl,
    pools: configuredPools,
    featuredPoolAddress: featuredPool,
  };
}

export const dexChainConfig: DexChainConfig = buildDexChainConfig();

export function walletChainLabel(chainId: number | null): string {
  if (chainId === null) return "Unknown";
  if (chainId === dexChainConfig.chainId) return dexChainConfig.networkDisplayName;
  return `Chain ${chainId}`;
}

export function configuredNetworkMismatchMessage(): string {
  return `Could not switch to ${dexChainConfig.networkDisplayName}. Please change network in your wallet.`;
}
