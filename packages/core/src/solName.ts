import { SolName } from './tlds/sol'

/**
 * Creates a new instance of non-EVM based chains
 */
export function createSolName({ rpcUrl }: { rpcUrl?: string } = {}) {
  return new SolName({ rpcUrl })
}
