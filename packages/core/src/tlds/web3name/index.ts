import { createPublicClient, http, namehash } from 'viem'
import { normalize } from 'viem/ens'
import { TLD } from '../../constants/tld'
import { getChainFromId, isEthChain, isV2Tld } from '../../utils/common'
import { ContractReader } from '../../utils/contract'
import { tldNamehash } from '../../utils/namehash'
import { validateName } from '../../utils/validate'
import { UDResolver } from '../UD'
import { LensProtocol } from '../lens'

type GetDomainNameProps = {
  queryChainIdList?: number[]
  queryTldList?: string[]
  address: string
  rpcUrl?: string
}

export class Web3Name {
  private contractReader: ContractReader

  constructor({ isDev = false }: { isDev?: boolean }) {
    this.contractReader = new ContractReader(isDev)
  }

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
  async getDomainName({ address, queryChainIdList, queryTldList, rpcUrl }: GetDomainNameProps): Promise<string | null> {
    if (queryChainIdList?.length && queryTldList?.length) {
      console.warn('queryChainIdList and queryTldList cannot be used together, queryTldList will be ignored')
    }

    try {
      // Calculate reverse node and namehash
      const reverseNode = `${normalize(address).slice(2)}.addr.reverse`
      const reverseNamehash = namehash(reverseNode)

      const hubContract = this.contractReader.getVerifiedTldHubContract()

      // Fetch TLDs from requested chains
      const chainTlds: string[] = []
      for await (const chainId of queryChainIdList ?? []) {
        const tlds = await hubContract.read.getChainTlds([BigInt(chainId)])

        if (isEthChain(chainId)) {
          // Put ENS at the end of the list
          const ethTld = tlds.filter((e) => e !== TLD.ENS).at(0)
          if (ethTld) chainTlds.push(ethTld)
          chainTlds.push(TLD.ENS)
        } else {
          const tldName = tlds.at(0)
          if (tldName) chainTlds.push(tldName)
        }
      }

      const tlds = queryTldList ?? []
      // Fetch all TLDs if no TLDs are specified
      if (tlds.length === 0) {
        const allTlds = await hubContract.read.getTlds()
        tlds.push(...allTlds)
      }

      // Use chain TLDs if queryChainIdList is specified
      const reqTlds = queryChainIdList?.length ? chainTlds : tlds
      const tldInfoList = await this.contractReader.getTldInfo(reqTlds)

      const resList: (string | null)[] = []
      for await (const tld of tldInfoList) {
        if (!tld.tld) continue
        let name = ''

        try {
          if (tld.tld === TLD.ENS) {
            const contract = await this.contractReader.getReverseResolverContract(reverseNamehash, tld, rpcUrl)
            name = (await contract?.read.name([reverseNamehash])) ?? ''
          } else {
            const contract = await this.contractReader.getResolverContractByTld(reverseNamehash, tld, rpcUrl)
            if (queryTldList?.length) {
              if (isV2Tld(tld.tld)) {
                const containsTldNameFunction = await this.contractReader.containsTldNameFunction(
                  contract.address,
                  tld,
                  rpcUrl,
                )
                if (containsTldNameFunction) {
                  name = await contract.read.tldName([reverseNamehash, tld.identifier])
                } else {
                  name = await contract.read.name([reverseNamehash])
                }
                // if (!containsTldNameFunction) throw 'TLD name is not supported for this TLD'
              } else {
                name = await contract.read.tldName([reverseNamehash, tld.identifier])
              }
            } else {
              name = await contract.read.name([reverseNamehash])
            }
          }
        } catch (error) {
          // console.error(`Error getting name for ${address} from ${tld.tld}`, error)
          continue
        }

        if (name) {
          const reverseAddress = await this.getAddress(name, { rpcUrl })
          if (reverseAddress?.toLowerCase() === address.toLowerCase()) {
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
        const tldInfoList = await this.contractReader.getTldInfo([tld])
        const publicClient = createPublicClient({
          chain: getChainFromId(Number(tldInfoList[0].chainId)),
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
  async getDomainNames({ address, queryChainIdList, queryTldList, rpcUrl }: GetDomainNameProps): Promise<string[]> {
    if (queryChainIdList?.length && queryTldList?.length) {
      console.warn('queryChainIdList and queryTldList cannot be used together, queryTldList will be ignored')
    }

    const resList: Set<string> = new Set([])
    try {
      // Calculate reverse node and namehash
      const reverseNode = `${address.toLowerCase().slice(2)}.addr.reverse`
      const reverseNamehash = namehash(reverseNode)

      const hubContract = this.contractReader.getVerifiedTldHubContract()

      // Fetch TLDs from requested chains
      const chainTlds: string[] = []
      for (const chainId of queryChainIdList ?? []) {
        const tlds = await hubContract.read.getChainTlds([BigInt(chainId)])

        if (isEthChain(chainId)) {
          // Put ENS at the end of the list
          const ethTld = tlds.filter((e) => e !== TLD.ENS).at(0)
          if (ethTld) chainTlds.push(ethTld)
          chainTlds.push(TLD.ENS)
        } else {
          const tldName = tlds.at(0)
          if (tldName) chainTlds.push(tldName)
        }
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

      for (const tld of tldInfoList) {
        if (!tld.tld) continue
        let name = ''
        try {
          if (tld.tld === TLD.ENS) {
            const contract = await this.contractReader.getReverseResolverContract(reverseNamehash, tld, rpcUrl)
            name = (await contract?.read.name([reverseNamehash])) ?? ''
          } else {
            const contract = await this.contractReader.getResolverContractByTld(reverseNamehash, tld)
            if (queryTldList?.length) {
              if (isV2Tld(tld.tld)) {
                const containsTldNameFunction = await this.contractReader.containsTldNameFunction(contract.address, tld)
                if (!containsTldNameFunction) throw 'TLD name is not supported for this TLD'
              }
              name = await contract.read.tldName([reverseNamehash, tld.identifier])
            } else {
              name = await contract.read.name([reverseNamehash])
            }
          }
        } catch (error) {
          continue
        }

        if (name) {
          const reverseAddress = await this.getAddress(name, { rpcUrl })
          if (reverseAddress === address) {
            resList.add(name)
          }
        }
      }

      if (queryTldList?.includes(TLD.LENS)) {
        const lensName = await LensProtocol.getDomainName(address)
        if (lensName) resList.add(lensName)
      } else if (queryTldList?.includes(TLD.CRYPTO)) {
        const UD = new UDResolver()
        const name = await UD.getName(address)
        name && resList.add(name)
      }

      return Array.from(resList)
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
   * Get domain metadata from name.
   *
   * @param {{ name: string; rpcUrl?: string }} { name, rpcUrl }
   * @return {*}
   * @memberof Web3Name
   */
  async getMetadata({ name, rpcUrl }: { name: string; rpcUrl?: string }) {
    const tld = name.split('.').pop()?.toLowerCase()
    if (!tld) {
      return null
    }
    try {
      const tldInfo = await this.contractReader.getTldInfo([tld])
      if (!tldInfo || !tldInfo.at(0)?.sann) {
        return null
      }

      const metadata = await this.contractReader.getTldMetadata(name, tldInfo[0], rpcUrl)
      const res = await fetch(metadata).then((res) => res.json())
      return res
    } catch (error) {
      console.error(`Error getting metadata for ${name}`, error)
    }
  }

  /**
   * Get domain avatar from name.
   *
   * @param {{ name: string; key: string; rpcUrl?: string }} { name, rpcUrl }
   * @return {*}
   * @memberof Web3Name
   */
  async getDomainAvatar({ name, rpcUrl }: { name: string; key: string; rpcUrl?: string }): Promise<string | undefined> {
    const metadata = await this.getMetadata({ name, rpcUrl })
    return metadata?.image
  }

  /**
   * Get domain content hash from name.
   *
   * @param {{ name: string; rpcUrl?: string }} { name, rpcUrl }
   * @return {*}  {(Promise<string | undefined>)}
   * @memberof Web3Name
   */
  async getContentHash({ name, rpcUrl }: { name: string; rpcUrl?: string }): Promise<string | undefined> {
    const tld = name.split('.').pop()?.toLowerCase()
    if (!tld) {
      return undefined
    }
    try {
      const tldInfo = (await this.contractReader.getTldInfo([tld])).at(0)
      if (!tldInfo) throw 'TLD not found'

      const namehash = tldNamehash(normalize(name), isV2Tld(tld) ? undefined : tldInfo.identifier)
      const contenthash = await this.contractReader.getContenthash(namehash, tldInfo, rpcUrl)
      if (!contenthash || contenthash === '0x') return undefined
      return contenthash
    } catch (error) {
      console.error(`Error getting content hash for ${name}`, error)
    }
  }

  /**
   * Retrieves the ABI (Application Binary Interface) for a given name on the Web3Name system.
   * @param name - The name for which to retrieve the ABI.
   * @param rpcUrl - Optional RPC URL to use for retrieving the ABI.
   * @returns The ABI for the specified name, or undefined if the TLD (Top-Level Domain) is not found.
   */
  // async getABI({ name, rpcUrl }: { name: string; rpcUrl?: string }) {
  //   const tld = name.split('.').pop()?.toLowerCase()
  //   if (!tld) {
  //     return undefined
  //   }
  //   try {
  //     const tldInfo = (await this.contractReader.getTldInfo([tld])).at(0)
  //     if (!tldInfo) throw 'TLD not found'

  //     const namehash = tldNamehash(normalize(name), isV2Tld(tld) ? undefined : tldInfo.identifier)
  //     const abi = await this.contractReader.getABI(namehash, tldInfo, rpcUrl)
  //     return abi
  //   } catch (error) {
  //     console.error(`Error getting content hash for ${name}`, error)
  //   }
  // }
}
