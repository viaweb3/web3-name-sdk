import { Web3Name } from './tlds/web3name'

/**
 * Creates a new instance of Web3Name for EVM based chains
 */
export function createWeb3Name({ isDev = false }: { isDev?: boolean } = {}): Web3Name {
  return new Web3Name({ isDev })
}
