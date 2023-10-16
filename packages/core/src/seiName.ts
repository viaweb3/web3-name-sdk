import { SeiName } from './tlds/sei'

/**
 * Creates a new instance of non-EVM based chains
 */
export function createSeiName() {
  return new SeiName()
}
