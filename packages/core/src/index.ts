import { providers } from 'ethers'
import { namehash } from 'viem/ens'
import { availableChains, rpcUrls } from './constants/chains'
import { TLD } from './constants/tld'
import { LensProtocol } from './lens'
import { getResolverContract, getResolverContractByTld, getSIDContract, getTldInfo } from './utils'
import { validateName } from './utils/validate'

export class SID {
  /**
   * Get domain name for address
   *
   * @param {string} address
   * @param {ChainId} [chainId]
   * @return {(Promise<string | null>)} domain name
   * @memberof SID
   */
  async getDomainName(address: string, chainId?: number): Promise<string | null> {
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

  async getAddress(domain: string, { rpcUrl }: { rpcUrl?: string } = {}): Promise<string | null> {
    const tld = domain.split('.').pop()
    if (!tld) {
      return null
    }

    if (tld !== TLD.ENS && tld !== TLD.LENS) {
      validateName(domain)
    }
    try {
      if (tld === TLD.ENS) {
        return await providers.getDefaultProvider().resolveName(domain)
      }

      if (tld === TLD.LENS) {
        return await LensProtocol.getAddress(domain)
      }

      // Get TLD info from verified TLD hub
      const tldInfoList = await getTldInfo([tld])
      // Get resolver contract from registry contract
      const resolverContract = await getResolverContractByTld(domain, tldInfoList[0], rpcUrl)
      // Get address from resolver contract
      const res = await resolverContract.read.addr([namehash(domain)])
      return res ?? null
    } catch (error) {
      console.error(`Error getting address for ${domain}`, error)
      return null
    }
  }

  async getResolver(domain: string, chainId: number, provider: providers.Provider) {
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
