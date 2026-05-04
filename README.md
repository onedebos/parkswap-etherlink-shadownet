# xDex UI

Minimal Next.js frontend for the Tezos X Previewnet `USDC / xU3O8` pool (xDex).

## Run locally

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## What it does

- Connects to an injected wallet like MetaMask or Rabby
- Detects whether the wallet is on Tezos X Previewnet (`128064`)
- Shows live `USDC` and `XU3O8` wallet balances
- Reads the live pool price from the deployed pool
- Quotes swaps with the deployed quoter
- Approves tokens for swap and liquidity
- Swaps `USDC ↔ XU3O8`
- Adds a full-range liquidity position with fixed defaults

## Wired contracts

- `USDC`: `0xB155450Fbbe8B5bF1F584374243c7bdE5609Ab1f`
- `XU3O8`: `0xfBe9F61Da390178c9D1Bfa2d870B2916CE7e53BB`
- `Pool`: `0xEfa19F1EB8608c19c84a7F74aB3cf8D1F92a3aA4`
- `SwapRouter`: `0xc79Eb5Bd60Ac7cBF1C36fdCe0FF208B3b016947C`
- `QuoterV2`: `0x156Aa25435Dd3A2B5D1E6881d651eE345A089c55`
- `NonfungiblePositionManager`: `0xa87C8dd5FC8633Cf9452a03c8c604Ec5787d22d2`

## Notes

- The app can target Previewnet or Testnet defaults via `NEXT_PUBLIC_DEPLOYMENT_NETWORK`
- The swap flow is intentionally MVP-simple and uses `amountOutMinimum = 0`
- The liquidity action uses the existing fee tier `2500` and full-range ticks
