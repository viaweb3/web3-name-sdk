import { createPublicClient, http } from 'viem'
import { mainnet } from 'viem/chains'
import { namehash, normalize } from 'viem/ens'
import { UDResolver } from './UD'
import { TLD } from './constants/tld'
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

  /**
   * Get domain name from address.
   * If queryChainIdList is specified, it will return domain name from that chain.
   * If queryTldList is specified, it will return domain name from that TLDs with the order.
   * If neither is specified, it will return domain name from all TLDs.
   * It's not recommended to use queryChainIdList and queryTldList together.
   *
   * @param {GetDomainNameProps} { address, queryChainIdList, queryTldList }
   * @return {*}  {(Promise<string | null>)}
   * @memberof Web3Name
   */
  async getDomainName({ address, queryChainIdList, queryTldList }: GetDomainNameProps): Promise<string | null> {
    if (queryChainIdList?.length && queryTldList?.length) {
      console.warn('queryChainIdList and queryTldList cannot be used together, queryTldList will be ignored')
    }

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

      // If queryChainIdList is specified, only fetch TLDs from those chains
      const reqTlds = queryChainIdList?.length ? chainTlds : tlds
      const tldInfoList = await this.contractReader.getTldInfo(reqTlds)

      const resList: (string | null)[] = []
      for await (const tld of tldInfoList) {
        if (!tld.tld) continue
        let name = ''
        if (isV2Tld(tld.tld)) {
          const contract = await this.contractReader.getReverseResolverContract(reverseNode, tld)
          name = await contract.read.name([reverseNamehash])
        } else {
          const contract = await this.contractReader.getResolverContractByTld(reverseNamehash, tld)
          if (queryChainIdList?.length) {
            name = await contract.read.name([reverseNamehash])
          } else {
            name = await contract.read.tldName([reverseNamehash, tld.identifier])
          }
        }
        if (name) {
          const reverseAddress = await this.getAddress(name)
          if (reverseAddress === address) {
            resList.push(name)
            break
          }
        }
      }

      if (queryTldList?.includes(TLD.LENS)) {
        const lensName = await LensProtocol.getDomainName(address)
        if (lensName) resList.push(lensName)
      } else if (queryTldList?.includes(TLD.CRYPTO)) {
        const UD = new UDResolver()
        const udName = await UD.getName(address)
        if (udName) resList.push(udName)
      }

      return resList.at(0) ?? null
    } catch (e) {
      console.log(`Error getting name for reverse record of ${address}`, e)
      return null
    }
  }

  /**
   * Get address from name. If coinType is specified, it will return ENSIP-9 address for that coinType.
   *
   * @param {string} name
   * @param {{ coinType?: number; rpcUrl?: string }} { coinType, rpcUrl }
   * @return {*}  {(Promise<string | null>)}
   * @memberof Web3Name
   */
  async getAddress(
    name: string,
    { coinType, rpcUrl }: { coinType?: number; rpcUrl?: string } = {}
  ): Promise<string | null> {
    const tld = name.split('.').pop()?.toLowerCase()
    if (!tld) {
      return null
    }
    const normalizedDomain = TLD.LENS === tld ? name : normalize(name)

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
        return await LensProtocol.getAddress(name)
      }

      if (tld === TLD.CRYPTO) {
        const UD = new UDResolver()
        return await UD.getAddress(name)
      }

      // Get TLD info from verified TLD hub
      const tldInfoList = await this.contractReader.getTldInfo([tld])
      const tldInfo = tldInfoList.at(0)
      if (!tldInfo) {
        throw 'TLD not found'
      }

      const namehash = tldNamehash(normalizedDomain, isV2Tld(tld) ? undefined : tldInfo.identifier)
      // Get resolver contract from registry contract
      const resolverContract = await this.contractReader.getResolverContractByTld(namehash, tldInfo, rpcUrl)
      // Get address from resolver contract
      const res =
        coinType !== undefined
          ? await resolverContract.read.addr([namehash, BigInt(coinType)])
          : await resolverContract.read.addr([namehash])
      return res
    } catch (error) {
      console.error(`Error getting address for ${name}`, error)
      return null
    }
  }

  /**
   * Get available domain list from address.
   *
   * @param {GetDomainNameProps} { address, queryChainIdList, queryTldList }
   * @return {*}  {Promise<string[]>}
   * @memberof Web3Name
   */
  async getDomainNames({ address, queryChainIdList, queryTldList }: GetDomainNameProps): Promise<string[]> {
    if (queryChainIdList?.length && queryTldList?.length) {
      console.warn('queryChainIdList and queryTldList cannot be used together, queryTldList will be ignored')
    }

    const resList: string[] = []
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

      // If queryChainIdList is specified, only fetch TLDs from those chains
      const reqTlds = queryChainIdList?.length ? chainTlds : tlds
      const tldInfoList = await this.contractReader.getTldInfo(reqTlds)

      const tempInfo = [...tldInfoList]

      for await (const tld of tempInfo) {
        if (!tld.tld) continue
        let name = ''
        if (isV2Tld(tld.tld)) {
          const contract = await this.contractReader.getReverseResolverContract(reverseNode, tld)
          name = await contract.read.name([reverseNamehash])
        } else {
          const contract = await this.contractReader.getResolverContractByTld(reverseNamehash, tld)
          if (queryChainIdList?.length) {
            name = await contract.read.name([reverseNamehash])
          } else {
            name = await contract.read.tldName([reverseNamehash, tld.identifier])
          }
        }

        if (name) {
          const reverseAddress = await this.getAddress(name)
          if (reverseAddress === address) {
            resList.push(name)
          }
        }
      }

      if (queryTldList?.includes(TLD.LENS)) {
        const lensName = await LensProtocol.getDomainName(address)
        if (lensName) resList.push(lensName)
      } else if (queryTldList?.includes(TLD.CRYPTO)) {
        const UD = new UDResolver()
        const name = await UD.getName(address)
        name && resList.push(name)
      }

      return resList
    } catch (e) {
      console.log(`Error getting name for reverse record of ${address}`, e)
      return []
    }
  }

  /**
   * Get domain record from name and key.
   *
   * @param {{ name: string; key: string; rpcUrl?: string }} { name, key, rpcUrl }
   * @return {*}
   * @memberof Web3Name
   */
  async getDomainRecord({ name, key, rpcUrl }: { name: string; key: string; rpcUrl?: string }) {
    const tld = name.split('.').pop()?.toLowerCase()
    if (!tld) {
      return null
    }

    try {
      const normalizedDomain = TLD.LENS === tld ? name : normalize(name)

      const tldInfoList = await this.contractReader.getTldInfo([tld])
      const tldInfo = tldInfoList[0]
      if (!tldInfo) {
        throw 'TLD not found'
      }

      const namehash = tldNamehash(normalizedDomain, isV2Tld(tld) ? undefined : tldInfo.identifier)
      // Get resolver contract from registry contract
      const resolverContract = await this.contractReader.getResolverContractByTld(namehash, tldInfo, rpcUrl)
      const record = await resolverContract.read.text([namehash, key])
      return record
    } catch (error) {
      console.error(`Error getting address for ${name}`, error)
      return null
    }
  }

  /**
   * Get domain avatar from name.
   *
   * @param {{ name: string; key: string; rpcUrl?: string }} { name, rpcUrl }
   * @return {*}
   * @memberof Web3Name
   */
  async getDomainAvatar({ name, rpcUrl }: { name: string; key: string; rpcUrl?: string }) {
    return await this.getDomainRecord({ name, key: 'avatar', rpcUrl })
  }
}

export function createWeb3Name() {
  return new Web3Name()
}
