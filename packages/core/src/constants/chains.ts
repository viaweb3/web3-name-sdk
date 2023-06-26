export const availableChains: ChainId[] = [1, 56, 42161]

export const rpcUrls: {
  [key in ChainId]: string
} = {
  1: 'https://cloudflare-eth.com',
  56: 'https://bsc-dataseed.binance.org/',
  42161: 'https://arb1.arbitrum.io/rpc',
}
