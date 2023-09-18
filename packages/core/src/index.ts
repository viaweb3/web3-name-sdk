import { createPublicClient, http } from 'viem'
import { mainnet } from 'viem/chains'
import { namehash, normalize } from 'viem/ens'
import { UDResolver } from './UD'
import { TLD, exampleTld } from './constants/tld'
import { LensProtocol } from './lens'
import { isV2Tld } from './utils'
import { ContractReader } from './utils/contract'
import { tldNamehash } from './utils/namehash'
import { validateName } from './utils/validate'

type GetDomainNameProps = {
  queryChainIdList?: number[]
  queryTldList?: string[]
  address: string
}

export class Web3Name {
  private contractReader = new ContractReader()

  async getDomainName({ address, queryChainIdList, queryTldList }: GetDomainNameProps): Promise<string | null> {
    try {
      // Calculate reverse node and namehash
      const reverseNode = `${address.toLowerCase().slice(2)}.addr.reverse`
      const reverseNamehash = namehash(reverseNode)

      const hubContract = this.contractReader.getVerifiedTldHubContract()

      // Fetch TLDs from requested chains
      const chainTlds: string[] = []
      for (const chainId of queryChainIdList ?? []) {
        const tlds = await hubContract.read.getChainTlds([BigInt(chainId)])
        chainTlds.push(...tlds)
      }

      const tlds = queryTldList ?? []
      // Fetch all TLDs if no TLDs are specified
      if (tlds.length === 0) {
        const allTlds = await hubContract.read.getTlds()
        tlds.push(...allTlds)
      }

      const reqTlds = queryChainIdList?.length ? tlds.filter((tld) => chainTlds.includes(tld)) : tlds
      const tldInfoList = await this.contractReader.getTldInfo(reqTlds)

      const resList: (string | null)[] = []

      const tempInfo = [...tldInfoList]

      for await (const tld of tempInfo) {
        if (!tld.tld) continue
        let name = ''
        if (isV2Tld(tld.tld)) {
          const contract = await this.contractReader.getReverseResolverContract(reverseNode, tld)
          name = await contract.read.name([reverseNamehash])
        } else {
          const contract = await this.contractReader.getResolverContractByTld(reverseNamehash, tld)
          name = await contract.read.tldNames([reverseNamehash, tld.identifier])
        }
        resList.push(name)
        break
      }

      if (queryTldList?.includes(TLD.LENS)) {
        const lensName = await LensProtocol.getDomainName(address)
        return lensName || null
      } else if (queryTldList?.includes(TLD.CRYPTO)) {
        const UD = new UDResolver()
        return await UD.getName(address)
      } else {
        return resList.at(0) ?? null
      }
    } catch (e) {
      console.log(`Error getting name for reverse record of ${address}`, e)
      return null
    }
  }

  async getAddress(domain: string, { rpcUrl }: { rpcUrl?: string } = {}): Promise<string | null> {
    const tld = domain.split('.').pop()?.toLowerCase()
    if (!tld) {
      return null
    }
    const normalizedDomain = TLD.LENS === tld ? domain : normalize(domain)

    if (tld !== TLD.ENS && tld !== TLD.LENS && tld !== TLD.CRYPTO) {
      validateName(normalizedDomain)
    }

    try {
      if (tld === TLD.ENS) {
        const publicClient = createPublicClient({
          chain: mainnet,
          transport: http(),
        })
        return await publicClient.getEnsAddress({
          name: normalizedDomain,
        })
      }

      if (tld === TLD.LENS) {
        return await LensProtocol.getAddress(domain)
      }

      if (tld === TLD.CRYPTO) {
        const UD = new UDResolver()
        return await UD.getAddress(domain)
      }

      // Get TLD info from verified TLD hub
      const tldInfoList = await this.contractReader.getTldInfo([tld])

      // TODO:
      const tldInfo = [...tldInfoList, exampleTld][0]

      if (!tldInfo) {
        throw 'TLD not found'
      }

      const namehash = tldNamehash(normalizedDomain, isV2Tld(tld) ? undefined : tldInfo.identifier)
      // Get resolver contract from registry contract
      const resolverContract = await this.contractReader.getResolverContractByTld(namehash, tldInfo, rpcUrl)
      // Get address from resolver contract
      const res = await resolverContract.read.addr([namehash])
      return res
    } catch (error) {
      console.error(`Error getting address for ${domain}`, error)
      return null
    }
  }

  async getDomainNames({ address, queryChainIdList, queryTldList }: GetDomainNameProps) {
    try {
      // Calculate reverse node and namehash
      const reverseNode = `${address.toLowerCase().slice(2)}.addr.reverse`
      const reverseNamehash = namehash(reverseNode)

      const hubContract = this.contractReader.getVerifiedTldHubContract()

      // Fetch TLDs from requested chains
      const chainTlds: string[] = []
      for (const chainId of queryChainIdList ?? []) {
        const tlds = await hubContract.read.getChainTlds([BigInt(chainId)])
        chainTlds.push(...tlds)
      }

      const tlds = queryTldList ?? []
      // Fetch all TLDs if no TLDs are specified
      if (tlds.length === 0) {
        const allTlds = await hubContract.read.getTlds()
        tlds.push(...allTlds)
      }

      const reqTlds = queryChainIdList?.length ? tlds.filter((tld) => chainTlds.includes(tld)) : tlds
      const tldInfoList = await this.contractReader.getTldInfo(reqTlds)

      const resList: (string | null)[] = []
      const tempInfo = [...tldInfoList]

      for await (const tld of tempInfo) {
        if (!tld.tld) continue
        let name = ''
        if (isV2Tld(tld.tld)) {
          const contract = await this.contractReader.getReverseResolverContract(reverseNode, tld)
          name = await contract.read.name([reverseNamehash])
        } else {
          const contract = await this.contractReader.getResolverContractByTld(reverseNamehash, tld)
          name = await contract.read.tldNames([reverseNamehash, tld.identifier])
        }
        resList.push(name)
      }

      if (queryTldList?.includes(TLD.LENS)) {
        const lensName = await LensProtocol.getDomainName(address)
        resList.push(lensName || null)
      } else if (queryTldList?.includes(TLD.CRYPTO)) {
        const UD = new UDResolver()
        resList.push(await UD.getName(address))
      }

      return resList
    } catch (e) {
      console.log(`Error getting name for reverse record of ${address}`, e)
      return null
    }
  }
}

export function createWeb3Name() {
  return new Web3Name()
}
