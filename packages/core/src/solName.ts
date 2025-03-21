import { SolName } from './tlds/sol'

/**
 * Creates a new instance of non-EVM based chains
 * @param {Object} options - Configuration options
 * @param {string} [options.rpcUrl] - Optional RPC URL for the Solana network
 * @param {number} [options.timeout] - Optional timeout in milliseconds for requests
 */
export function createSolName({ rpcUrl, timeout }: { rpcUrl?: string; timeout?: number } = {}) {
  return new SolName({ rpcUrl, timeout })
}
