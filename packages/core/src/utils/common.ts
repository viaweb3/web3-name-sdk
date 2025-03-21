import { http, createPublicClient, PublicClient, Address } from 'viem'
import { mainnet, goerli, sepolia } from 'viem/chains'
import { TldInfo } from '../types/tldInfo'

export function createCustomClient(
  tldInfo: TldInfo,
  rpcUrl?: string,
  timeout?: number,
  signal?: AbortSignal
): PublicClient {
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
      contracts: {
        multicall3: {
          address: '0xcA11bde05977b3631167028862bE2a173976CA11',
        },
      },
    },
    transport: http(rpcUrl || tldInfo.defaultRpc, {
      timeout: timeout,
      fetchOptions: { signal },
    }),
    batch: {
      multicall: {
        wait: 10,
      },
    },
  })

  return client
}

const v2Tlds = new Set(['bnb', 'arb', 'eth'])
export function isV2Tld(tld: string) {
  return v2Tlds.has(tld)
}

export function isEthChain(chainId: number) {
  const ethChains = new Set<number>([mainnet.id, goerli.id, sepolia.id])
  return ethChains.has(chainId)
}

export function getChainFromId(chainId: number) {
  switch (chainId) {
    case 1:
      return mainnet
    case 5:
      return goerli
    case 11155111:
      return sepolia

    default:
      return mainnet
  }
}

export function getBaseContractFromChainId(chainId: number): Address {
  switch (chainId) {
    case 1:
    case 11155111:
      return '0x57f1887a8bf19b14fc0df6fd9b2acc9af147ea85'
    case 56:
      return '0xE3b1D32e43Ce8d658368e2CBFF95D57Ef39Be8a6'
    case 97:
      return '0x888A2BA9787381000Cd93CA4bd23bB113f03C5Af'
    case 42161:
      return '0x5d482d501b369f5ba034dec5c5fb7a50d2d6ca20'
    default:
      return '0x57f1887a8bf19b14fc0df6fd9b2acc9af147ea85'
  }
}
