import { InjName } from './tlds/inj'
import { SeiName } from './tlds/sei'
import { SolName } from './tlds/sol'
import { Web3Name } from './tlds/web3name'

/**
 * Creates a new instance of Web3Name for EVM based chains
 */
export function createWeb3Name() {
  return new Web3Name()
}

/**
 * Creates a new instance of non-EVM based chains
 */
export function createSolName() {
  return new SolName()
}

export function createSeiName() {
  return new SeiName()
}

export function createInjName() {
  return new InjName()
}
