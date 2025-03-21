import { Web3Name } from './tlds/web3name'
import { PaymentIdName } from './tlds/paymentId'

/**
 * Creates a new instance of Web3Name for EVM based chains
 */
export function createWeb3Name({ isDev = false, rpcUrl }: { isDev?: boolean; rpcUrl?: string } = {}): Web3Name {
  return new Web3Name({ isDev, rpcUrl })
}



/**
 * Creates a new instance of PaymentID based chains
 */
export function createPaymentIdName() {
  return new PaymentIdName()
}
