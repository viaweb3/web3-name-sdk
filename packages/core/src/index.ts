import { SolName } from './tlds/sol'
import { Web3Name } from './tlds/web3name'

export function createWeb3Name() {
  return new Web3Name()
}

export function createSolName() {
  return new SolName()
}
