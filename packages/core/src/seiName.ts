import { SeiName } from './tlds/sei'

/**
 * Creates a new instance of non-EVM based chains
 */
export async function createSeiName() {
  return new SeiName()
}
