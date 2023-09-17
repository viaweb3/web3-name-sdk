import { PublicClient, createPublicClient, http } from 'viem'

export function createCustomClient(tldInfo: TldInfo, rpcUrl?: string): PublicClient {
  const client = createPublicClient({
    chain: {
      id: Number(tldInfo.chainId),
      rpcUrls: {
        default: { http: [rpcUrl || tldInfo.defaultRpc] },
        public: { http: [rpcUrl || tldInfo.defaultRpc] },
      },
      name: '',
      network: '',
      nativeCurrency: {
        decimals: 18,
        name: '',
        symbol: '',
      },
    },
    transport: http(),
  })

  return client
}

const v2Tlds = new Set(['bnb', 'arb', 'eth'])
export function isV2Tld(tld: string) {
  return v2Tlds.has(tld)
}
