/**
 * Important: TLD is only used for none-Toolkit TLDs.
 * Toolkit TLDs (manta, mode, zkf, etc.) are resolved by the Toolkit contract
 */
export enum TLD {
  ENS = 'eth',
  BNB = 'bnb',
  ARB = 'arb',
  LENS = 'lens',
  CRYPTO = 'crypto',
  SOL = 'sol',
}

export enum PaymentIdTld {
  // Wallets
  METAMASK = 'metamask',
  OKX_WALLET = 'okxwallet',
  PHANTOM = 'phantom',
  BINANCE_WALLET = 'binancewallet',
  TRUEST_WALLET = 'truestwallet',
  COINBASE_WALLET = 'coinbasewallet',
  BITGET_WALLET = 'bitgetwallet',
  SAFE = 'safe',
  RABBY_WALLET = 'rabbywallet',
  GATE_WALLET = 'gatewallet',

  // Exchanges
  BINANCE = 'binance',
  OKX = 'okx',
  HTX = 'htx',
  COINBASE = 'coinbase',
  KRAKEN = 'kraken',
  BYBIT = 'bybit',
  BITGET = 'bitget',
  KUCOIN = 'kucoin',
  UPBIT = 'upbit',
  GATE = 'gate',
}

export const PaymentIdTldCode: Record<PaymentIdTld, number> = {
  // Wallets
  [PaymentIdTld.METAMASK]: 1000,
  [PaymentIdTld.OKX_WALLET]: 1001,
  [PaymentIdTld.PHANTOM]: 1002,
  [PaymentIdTld.BINANCE_WALLET]: 1003,
  [PaymentIdTld.TRUEST_WALLET]: 1004,
  [PaymentIdTld.COINBASE_WALLET]: 1005,
  [PaymentIdTld.BITGET_WALLET]: 1006,
  [PaymentIdTld.SAFE]: 1007,
  [PaymentIdTld.RABBY_WALLET]: 1008,
  [PaymentIdTld.GATE_WALLET]: 1009,

  // Exchanges
  [PaymentIdTld.BINANCE]: 0,
  [PaymentIdTld.OKX]: 1,
  [PaymentIdTld.HTX]: 2,
  [PaymentIdTld.COINBASE]: 3,
  [PaymentIdTld.KRAKEN]: 4,
  [PaymentIdTld.BYBIT]: 5,
  [PaymentIdTld.BITGET]: 6,
  [PaymentIdTld.KUCOIN]: 8,
  [PaymentIdTld.UPBIT]: 9,
  [PaymentIdTld.GATE]: 10,
}

export const exampleTld = {
  tld: 'woaf8',
  identifier: BigInt('2615353277007099930642231241208939993573210331169845997366433981082573'),
  registry: '0x4a343ed86c8591eE644e115258ba5763e1Fa00B8' as `0x${string}`,
  chainId: BigInt(97),
  defaultRpc: 'https://data-seed-prebsc-1-s1.binance.org:8545',
}
