import { dexChainConfig } from "@/lib/chain-config";

/** Shared copy for meta tags, Open Graph, Twitter Card, and OG image. */
export const LINK_PREVIEW_DESCRIPTION = `This is a fork of IguanaDEX built on ${dexChainConfig.networkDisplayName}.`;

/** Linked from the upper attribution bar (“IguanaDEX”). */
export const IGUANADEX_HOME_URL = "https://iguanadex.com/";

/** “Read more” in the attribution bar (network info/docs). */
export const ATTRIBUTION_READ_MORE_URL = dexChainConfig.readMoreUrl;

/** Chain faucet (app menu “Get XTZ”). */
export const NETWORK_FAUCET_URL = dexChainConfig.faucetUrl;
