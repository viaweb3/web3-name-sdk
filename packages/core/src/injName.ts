import { InjName } from './tlds/inj'

/**
 * Creates a new instance of non-EVM based chains
 */
export async function createInjName() {
  return new InjName()
}
