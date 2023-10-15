import { SolName } from './tlds/sol'

/**
 * Creates a new instance of non-EVM based chains
 */
export async function createSolName() {
  return new SolName()
}
