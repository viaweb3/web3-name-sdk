import { ethers } from 'ethers'
import { namehash } from 'ethers/lib/utils'
import { availableChains, rpcUrls } from './constants/chains'
import { ChainId } from './types/chains'
import { getResolverContract, getSIDContract } from './utils'

export class SID {
  async getDomainName(address: string, chainId?: ChainId) {
    const reverseNode = `${address.slice(2)}.addr.reverse`
    const reverseNamehash = namehash(reverseNode)
    try {
      const chains = chainId ? [chainId] : availableChains
      for (const _id of chains) {
        const provider = new ethers.providers.JsonRpcProvider(rpcUrls[_id], _id)
        const sidContract = getSIDContract(_id, provider)
        const resolverAddr = await sidContract.resolver(reverseNamehash)
        if (parseInt(resolverAddr, 16) === 0) {
          continue
        }
        const resolverContract = getResolverContract({
          resolverAddr,
          provider,
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
