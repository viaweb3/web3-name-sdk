import { providers } from 'ethers'
import { namehash } from 'viem/ens'
import { UDResolver } from './UD'
import { TLD } from './constants/tld'
import { LensProtocol } from './lens'
import { ContractUtils } from './utils/contract'
import { validateName } from './utils/validate'

type GetDomainNameProps = {
  queryChainIdList?: number[]
  queryTldList?: string[]
  address: string
}

export class SID {
  private contractUtils = new ContractUtils()

  async getDomainName({
    address,
    queryChainIdList,
    queryTldList,
  }: GetDomainNameProps): Promise<string | null> {
    try {
      const reverseNode = `${address.slice(2)}.addr.reverse`
      const reverseNamehash = namehash(reverseNode)

      const hubContract = this.contractUtils.getVerifiedTldHubContract()

      const chainTlds: string[] = []
      for (const chainId of queryChainIdList ?? []) {
        const tlds = await hubContract.read.getChainTlds([BigInt(chainId)])
        chainTlds.push(...tlds)
      }

      const tlds = queryTldList ?? []
      if (tlds.length === 0) {
        const allTlds = await hubContract.read.getTlds()
        tlds.push(...allTlds)
      }

      const reqTlds = queryChainIdList?.length
        ? tlds.filter((tld) => chainTlds.includes(tld))
        : tlds
      const tldInfoList = await this.contractUtils.getTldInfo(reqTlds)

      const resList: (string | null)[] = []
      for await (const tld of tldInfoList) {
        if (!tld.tld) continue
        const baseContract = await this.contractUtils.getReverseResolverContract(reverseNode, tld)
        const name = await baseContract.read.name([reverseNamehash])
        resList.push(name)
      }

      if (queryTldList?.includes(TLD.LENS)) {
        const lensName = await LensProtocol.getDomainName(address)
        if (lensName) {
          return lensName
        }
      } else if (queryTldList?.includes(TLD.CRYPTO)) {
        const UD = new UDResolver()
        return await UD.getName(address)
      } else {
        return resList.at(0) ?? null
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

    if (tld !== TLD.ENS && tld !== TLD.LENS && tld !== TLD.CRYPTO) {
      validateName(domain)
    }
    try {
      if (tld === TLD.ENS) {
        return await providers.getDefaultProvider().resolveName(domain)
      }

      if (tld === TLD.LENS) {
        return await LensProtocol.getAddress(domain)
      }

      if (tld === TLD.CRYPTO) {
        const UD = new UDResolver()
        return await UD.getAddress(domain)
      }

      // Get TLD info from verified TLD hub
      const tldInfoList = await this.contractUtils.getTldInfo([tld])
      // Get resolver contract from registry contract
      const resolverContract = await this.contractUtils.getResolverContractByTld(
        domain,
        tldInfoList[0],
        rpcUrl
      )
      // Get address from resolver contract
      const res = await resolverContract.read.addr([namehash(domain)])
      return res ?? null
    } catch (error) {
      console.error(`Error getting address for ${domain}`, error)
      return null
    }
  }
}

export function createSID() {
  return new SID()
}
