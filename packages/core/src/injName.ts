import { InjName } from './tlds/inj'

/**
 * Creates a new instance of non-EVM based chains
 * @param {Object} options - Configuration options
 * @param {number} [options.timeout] - Optional timeout in milliseconds for requests
 */
export function createInjName({ timeout }: { timeout?: number } = {}) {
  return new InjName({ timeout })
}
