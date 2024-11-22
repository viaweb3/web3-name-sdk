import { Web3Name } from './tlds/web3name'

/**
 * Creates a new instance of Web3Name for EVM based chains
 */
export function createWeb3Name({ isDev = false, rpcUrl }: { isDev?: boolean; rpcUrl?: string } = {}): Web3Name {
  return new Web3Name({ isDev, rpcUrl })
}
