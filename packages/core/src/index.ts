import { ConstructorFragment, namehash } from 'ethers/lib/utils'
import { getChainId, getResolverContract, getSIDContract } from './utils'
import { availableChains } from './constants/chains'
import { ethers } from 'ethers'

export class SID {
  async getDomainName(address: string, chainId?: number) {
    const reverseNode = `${address.slice(2)}.addr.reverse`
    const reverseNamehash = namehash(reverseNode)
    try {
      const chains = chainId ? [chainId] : availableChains
      for (const _id of chains) {
        const sidContract = getSIDContract(_id)
        const resolverAddr = await sidContract.resolver(reverseNamehash)
        if (parseInt(resolverAddr, 16) === 0) {
          continue
        }
        const resolverContract = getResolverContract({
          resolverAddr,
          chainId: _id,
        })
        const name = await resolverContract.name(reverseNamehash)
        if (name) {
          return name
        }
      }

      return null
    } catch (e) {
      console.log(`Error getting name for reverse record of ${address}`, e)
      return null
    }
  }
}

export function createSID() {
  return new SID()
}
