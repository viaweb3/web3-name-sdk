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
export async function createSolName() {
  const SolName = (await import('./tlds/sol')).SolName
  return new SolName()
}

export async function createSeiName() {
  const SeiName = (await import('./tlds/sei')).SeiName
  return new SeiName()
}

export async function createInjName() {
  const InjName = (await import('./tlds/inj')).InjName
  return new InjName()
}
