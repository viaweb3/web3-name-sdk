import { SeiName } from './tlds/sei'

/**
 * Creates a new instance of non-EVM based chains
 * @param {Object} options - Configuration options
 * @param {number} [options.timeout] - Optional timeout in milliseconds for requests
 */
export function createSeiName({ timeout }: { timeout?: number } = {}) {
  return new SeiName({ timeout })
}
