import { providers } from 'ethers'
import { namehash } from 'ethers/lib/utils'
import { availableChains, rpcUrls } from './constants/chains'
import { TLD } from './constants/tld'
import { getResolverContract, getSIDContract } from './utils'
import { LensProtocol } from './lens'

export class SID {
  /**
   * Get domain name for address
   *
   * @param {string} address
   * @param {ChainId} [chainId]
   * @return {(Promise<string | null>)} domain name
   * @memberof SID
   */
  async getDomainName(address: string, chainId?: ChainId): Promise<string | null> {
    const reverseNode = `${address.slice(2)}.addr.reverse`
    const reverseNamehash = namehash(reverseNode)
    try {
      const chains = chainId ? [chainId] : availableChains
      for (const _id of chains) {
        const provider = new providers.JsonRpcProvider(rpcUrls[_id], _id)
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

      const lensName = await LensProtocol.getDomainName(address)
      if (lensName) {
        return lensName
      }

      return null
    } catch (e) {
      console.log(`Error getting name for reverse record of ${address}`, e)
      return null
    }
  }

  async getAddress(domain: string) {
    try {
      const tld = domain.split('.').pop()
      if (!tld) {
        return null
      }

      if (tld === TLD.ENS) {
        return await providers.getDefaultProvider().resolveName(domain)
      }

      if (tld === TLD.ARB) {
        const provider = new providers.JsonRpcProvider(rpcUrls[42161], 42161)
        const resolver = await this.getResolver(domain, 42161, provider)
        const res = await resolver?.getAddress()
        return res ?? null
      }

      if (tld === TLD.LENS) {
        return await LensProtocol.getAddress(domain)
      }

      const provider = new providers.JsonRpcProvider(rpcUrls[56], 56)
      const resolver = await this.getResolver(domain, 56, provider)
      const res = await resolver?.getAddress()
      return res ?? null
    } catch (error) {
      console.error(`Error getting address for ${domain}`, error)
      return null
    }
  }

  async getResolver(domain: string, chainId: ChainId, provider: providers.Provider) {
    let currentName = domain
    let currentNamehash = namehash(currentName)
    while (true) {
      if (currentName === '' || currentName === '.') {
        return null
      }
      if (!currentName.includes('.')) {
        return null
      }
      const sidContract = getSIDContract(chainId, provider)
      const resolverAddr = await sidContract.resolver(currentNamehash)
      if (resolverAddr !== null) {
        const resolverContract = getResolverContract({
          resolverAddr,
          provider,
        })
        if (currentName !== domain && !(await resolverContract.supportsInterface('0x9061b923'))) {
          return null
        }

        const resolver = new providers.Resolver(
          provider as providers.BaseProvider,
          resolverAddr,
          domain
        )
        return resolver
      }
      currentName = currentName.split('.').slice(1).join('.')
      currentNamehash = namehash(currentName)
    }
  }
}

export function createSID() {
  return new SID()
}
