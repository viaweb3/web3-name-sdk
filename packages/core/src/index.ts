import { Web3Name } from './tlds/web3name'
import { PaymentIdName } from './tlds/paymentId'

/**
 * Creates a new instance of Web3Name for EVM based chains
 */
export function createWeb3Name({
  isDev = false,
  rpcUrl,
  timeout,
}: { isDev?: boolean; rpcUrl?: string; timeout?: number } = {}): Web3Name {
  return new Web3Name({ isDev, rpcUrl, timeout })
}



/**
 * Creates a new instance of PaymentID based chains
 */
export function createPaymentIdName() {
  return new PaymentIdName()
}
