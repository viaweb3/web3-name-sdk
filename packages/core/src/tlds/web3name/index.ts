import { Address, createPublicClient, Hash, http, namehash } from 'viem'
import { normalize } from 'viem/ens'
import { TLD } from '../../constants/tld'
import { createCustomClient, getChainFromId, isEthChain, isV2Tld } from '../../utils/common'
import { ContractReader } from '../../utils/contract'
import { tldNamehash } from '../../utils'
import { validateName } from '../../utils'
import { UDResolver } from '../UD'
import { LensProtocol } from '../lens'
import { TldInfo } from '../../types/tldInfo'
import { BatchGetDomainNameProps, BatchGetReturn, GetDomainNameProps } from '../../types'
import { SIDRegistryAbi } from '../../abi/SIDRegistry'
import { ResolverAbi } from '../../abi/Resolver'

export class Web3Name {
  private contractReader: ContractReader
  private resolverContractCache: Map<string, any> = new Map()
  private tldNameFunctionCache = new Map<string, any>()

  constructor({ isDev = false, rpcUrl, timeout }: { isDev?: boolean; rpcUrl?: string; timeout?: number } = {}) {
    this.contractReader = new ContractReader(isDev, rpcUrl, timeout)
  }

  private async getTldInfoList({
    queryTldList,
    queryChainIdList,
    rpcUrl,
    timeout,
    signal,
  }: Omit<GetDomainNameProps, 'address'> & { signal?: AbortSignal }) {
    const hubContract = this.contractReader.getVerifiedTldHubContract(timeout, signal)
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
    return await this.contractReader.getTldInfo(reqTlds, timeout, signal)
  }

  private async getResolverContract(tld: TldInfo, reverseNamehash: Hash, rpcUrl?: string, timeout?: number) {
    return tld.tld === TLD.ENS
      ? await this.contractReader.getReverseResolverContract(reverseNamehash, tld, rpcUrl, timeout)
      : await this.contractReader.getResolverContractByTld(reverseNamehash, tld, rpcUrl, timeout)
  }

  private async isHasTldNameFunction(
    address: Address,
    tld: TldInfo,
    reverseNamehash: Hash,
    rpcUrl?: string,
    timeout?: number
  ) {
    let containsTldNameFunction
    if (this.resolverContractCache.has(`${address}_${tld.tld}`)) {
      containsTldNameFunction = this.resolverContractCache.get(`${address}_${tld.tld}`)
    } else {
      containsTldNameFunction = await this.contractReader.containsTldNameFunction(address, tld, rpcUrl, timeout)
      this.resolverContractCache.set(`${address}_${tld.tld}`, containsTldNameFunction)
    }
    const res = {
      functionName: containsTldNameFunction ? 'tldName' : 'name',
      args: containsTldNameFunction ? [reverseNamehash, tld.identifier] : [reverseNamehash],
    }
    return res
  }

  private async getDomainNameByTld(
    address: string,
    reverseNamehash: Hash,
    tld: TldInfo,
    isTldName: boolean,
    rpcUrl?: string,
    timeout?: number
  ) {
    let name: string | null = null

    try {
      if (tld.tld === TLD.ENS) {
        const contract = await this.contractReader.getReverseResolverContract(reverseNamehash, tld, rpcUrl, timeout)
        name = (await contract?.read.name([reverseNamehash])) ?? ''
      } else {
        const contract = await this.contractReader.getResolverContractByTld(reverseNamehash, tld, rpcUrl, timeout)
        if (isTldName) {
          if (isV2Tld(tld.tld)) {
            const containsTldNameFunction = await this.contractReader.containsTldNameFunction(
              contract.address,
              tld,
              rpcUrl,
              timeout
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
    }

    if (name) {
      const reverseAddress = await this.getAddress(name, { rpcUrl, timeout })
      if (reverseAddress?.toLowerCase() === address.toLowerCase()) {
        return name
      } else {
        return null
      }
    }
    return name
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
  async getDomainName({
    address,
    queryChainIdList,
    queryTldList,
    rpcUrl,
    timeout,
  }: GetDomainNameProps): Promise<string | null> {
    return this.contractReader.withTimeout(async (signal) => {
      if (queryChainIdList?.length && queryTldList?.length) {
        console.warn('queryChainIdList and queryTldList cannot be used together, queryTldList will be ignored')
      }

      try {
        // Calculate reverse node and namehash
        const reverseNode = `${normalize(address).slice(2)}.addr.reverse`
        const reverseNamehash = namehash(reverseNode)

        // Fetch TLDs from requested chains
        const tldInfoList = await this.getTldInfoList({
          queryChainIdList,
          queryTldList,
          rpcUrl,
          timeout,
          signal,
        })

        const resList: (string | null)[] = []
        for await (const tld of tldInfoList) {
          if (!tld.tld) continue
          const isTldName = !!queryTldList?.length
          let name = await this.getDomainNameByTld(address, reverseNamehash, tld, isTldName, rpcUrl, timeout)
          if (name) {
            resList.push(name)
            break
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
        if (e instanceof Error && e.name === 'AbortError') {
          throw new Error(`Request timed out after ${timeout || this.contractReader.getTimeout()}ms`)
        }
        console.log(`Error getting name for reverse record of ${address}`, e)
        return null
      }
    }, timeout)
  }

  /**
   * Batch resolve a list of addresses to their corresponding domain names.
   * This method aggregates multiple resolver calls to improve efficiency.
   * It will return an array of objects containing the address and its resolved domain name.
   *
   * @param {Address[]} addressList - The list of addresses to resolve.
   * @param {TldInfo} tldInfo - The TLD information used for resolving.
   * @return {*}  {(Promise<BatchGetReturn | null>)} - A promise that resolves to an array of objects, each containing the address and its corresponding domain name, or null if an error occurs.
   * @memberof Web3Name
   */
  private async batchResolve(
    addressList: Address[],
    tldInfo: TldInfo,
    isTldName: boolean,
    rpcUrl?: string,
    timeout?: number
  ): Promise<BatchGetReturn | null> {
    const client = createCustomClient(tldInfo, rpcUrl, timeout)
    try {
      // addr to Hash
      const reverseAddress = addressList.map((address) => {
        const reverseNode = `${normalize(address).slice(2)}.addr.reverse`
        const reverseNamehash = namehash(reverseNode)
        return {
          reverseNamehash,
        }
      })
      // get resolver contract by multicall
      const resolverContractCalls = reverseAddress.map(({ reverseNamehash }) => {
        return {
          address: tldInfo.registry,
          abi: SIDRegistryAbi,
          functionName: 'resolver',
          args: [reverseNamehash],
        }
      })
      const resolverContract = (
        await client.multicall({
          contracts: resolverContractCalls,
        })
      ).map((v: any, index) => {
        return {
          address: v.result,
          reverseNamehash: reverseAddress[index].reverseNamehash,
        }
      })
      // get tld name function to resolve
      const tldNameFunctionResults: {
        functionName: string
        reverseNamehash: `0x${string}`
        args: (bigint | `0x${string}`)[]
      }[] = []
      for (const { address, reverseNamehash } of resolverContract) {
        const cacheKey = `${address}_${reverseNamehash}_${isTldName}`
        if (this.tldNameFunctionCache.has(cacheKey)) {
          tldNameFunctionResults.push({
            ...this.tldNameFunctionCache.get(cacheKey),
            reverseNamehash,
          })
        } else {
          if (isTldName) {
            const data = await this.isHasTldNameFunction(address, tldInfo, reverseNamehash, rpcUrl, timeout)
            this.tldNameFunctionCache.set(cacheKey, data)
            tldNameFunctionResults.push({
              ...data,
              reverseNamehash,
            })
          } else {
            const data = {
              functionName: 'name',
              args: [reverseNamehash],
            }
            this.tldNameFunctionCache.set(cacheKey, data)
            tldNameFunctionResults.push({
              ...data,
              reverseNamehash,
            })
          }
        }
      }
      // batch get results
      const calls = resolverContract.map(({ address, reverseNamehash }) => {
        const { functionName, args } = tldNameFunctionResults.find((item) => item.reverseNamehash === reverseNamehash)!
        return {
          address,
          abi: ResolverAbi,
          functionName,
          args,
        }
      })
      const domainRes = (
        await client.multicall({
          contracts: calls,
        })
      ).map((v: any) => v.result)
      const res: BatchGetReturn = []
      // check name if is right
      const verifiedRes = await this.batchGetAddress({ nameList: domainRes, tldInfo })
      const verifiedAddress = verifiedRes?.map(({ address }) => address)
      addressList.forEach((address, index) => {
        if (address.toLowerCase() === verifiedAddress?.[index]?.toLowerCase()) {
          res.push({
            address,
            domain: domainRes[index],
          })
        } else {
          res.push({
            address,
            domain: null,
          })
        }
      })
      return res ?? null
    } catch (e) {
      console.log(`Error getting names for addresses`, e)
      return null
    }
  }

  async batchGetDomainNameByTld({
    addressList,
    queryTld,
    rpcUrl,
    timeout,
  }: {
    addressList: Address[]
    queryTld: string
    rpcUrl?: string
    timeout?: number
  }): Promise<BatchGetReturn | null> {
    return this.contractReader.withTimeout(async (signal) => {
      if (!addressList?.length) return []
      const tldInfoList = await this.getTldInfoList({ queryTldList: [queryTld!] })
      const tldInfo = tldInfoList.find((tld) => tld.tld === queryTld)
      if (!tldInfo) {
        return null
      }
      try {
        const res = await this.batchResolve(addressList, tldInfo, true, rpcUrl, timeout)
        return res
      } catch (error) {
        console.log('error: ', error)
        return null
      }
    }, timeout)
  }

  async batchGetDomainNameByChainId({
    addressList,
    queryChainId,
    rpcUrl,
    timeout,
  }: {
    addressList: Address[]
    queryChainId: number
    rpcUrl?: string
    timeout?: number
  }): Promise<BatchGetReturn | null> {
    return this.contractReader.withTimeout(async (signal) => {
      if (!addressList?.length) return []
      const tldInfoList = await this.getTldInfoList({ queryChainIdList: [queryChainId!] })
      const tldInfo = tldInfoList.find((tld) => tld.chainId === BigInt(queryChainId!))
      if (!tldInfo) {
        return null
      }
      try {
        const res = await this.batchResolve(addressList, tldInfo, false, rpcUrl, timeout)
        return res
      } catch (error) {
        console.log('error: ', error)
        return null
      }
    }, timeout)
  }

  private async batchGetAddress({
    nameList,
    tldInfo,
    rpcUrl,
    timeout,
  }: {
    nameList: string[]
    tldInfo: TldInfo
    rpcUrl?: string
    timeout?: number
  }): Promise<BatchGetReturn | null> {
    if (!nameList?.length) return []
    const client = createCustomClient(tldInfo, rpcUrl, timeout)
    try {
      const verifiedNames: string[] = nameList.map((name) => {
        const normalizedDomain = TLD.LENS === tldInfo.tld ? name : normalize(name)
        const namehash = tldNamehash(normalizedDomain, isV2Tld(tldInfo.tld) ? undefined : tldInfo.identifier)
        return namehash
      })
      const resolveContractCalls = verifiedNames.map((namehash) => {
        return {
          address: tldInfo.registry,
          abi: SIDRegistryAbi,
          functionName: 'resolver',
          args: [namehash],
        }
      })
      const resolverContracts = (
        await client.multicall({
          contracts: resolveContractCalls,
        })
      ).map((v: any, index) => {
        return {
          address: v.result,
          namehash: verifiedNames[index],
        }
      })
      const getAddressCalls = resolverContracts.map(({ address, namehash }) => {
        return {
          address,
          abi: ResolverAbi,
          functionName: 'addr',
          args: [namehash],
        }
      })
      const res = (
        await client.multicall({
          contracts: getAddressCalls,
        })
      ).map((v: any, index) => {
        return {
          address: v.result ?? null,
          domain: nameList[index],
        }
      })
      return res
    } catch (error) {
      console.log(`Error getting address for names`, error)
      return null
    }
  }

  async batchGetDomainName({
    addressList,
    queryChainIdList,
    queryTldList,
    rpcUrl,
    timeout,
  }: BatchGetDomainNameProps): Promise<BatchGetReturn | null> {
    return this.contractReader.withTimeout(async (signal) => {
      if (queryChainIdList?.length && queryTldList?.length) {
        console.warn('queryChainIdList and queryTldList cannot be used together, queryTldList will be ignored')
      }
      if (!addressList.length) return []
      let curAddr = addressList[0]
      try {
        // Fetch TLDs from requested chains
        const tldInfoList = await this.getTldInfoList({ queryChainIdList, queryTldList, rpcUrl })
        const resList: BatchGetReturn = []
        const isIncludeLens = queryTldList?.includes(TLD.LENS)
        const isIncludeCrypto = queryTldList?.includes(TLD.CRYPTO)
        for await (const address of addressList) {
          curAddr = address
          // Calculate reverse node and namehash
          const reverseNode = `${normalize(address).slice(2)}.addr.reverse`
          const reverseNamehash = namehash(reverseNode)
          let nameRes: string | null = null
          for await (const tld of tldInfoList) {
            if (!tld.tld) continue
            const isTldName = !!queryTldList?.length
            nameRes = await this.getDomainNameByTld(address, reverseNamehash, tld, isTldName, rpcUrl, timeout)
            if (nameRes) {
              break
            }
          }
          if (!nameRes && isIncludeLens) {
            nameRes = await LensProtocol.getDomainName(address)
          }
          if (!nameRes && isIncludeCrypto) {
            const UD = new UDResolver()
            nameRes = await UD.getName(address)
          }
          resList.push({ address, domain: nameRes })
        }
        return resList
      } catch (e) {
        console.log(`Error getting name for reverse record of ${curAddr}`, e)
        return null
      }
    }, timeout)
  }

  /**
   * Get address from name. If coinType is specified, it will return ENSIP-9 address for that coinType.
   *
   * @param {string} name
   * @param {{ coinType?: number; rpcUrl?: string; timeout?: number }} { coinType, rpcUrl, timeout }
   * @return {*}  {(Promise<string | null>)}
   * @memberof Web3Name
   */
  async getAddress(
    name: string,
    { coinType, rpcUrl, timeout }: { coinType?: number; rpcUrl?: string; timeout?: number } = {}
  ): Promise<string | null> {
    return this.contractReader.withTimeout(async (signal) => {
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
          const data = await fetch('https://spaceapi.prd.space.id/rpc/1')
          const rpcUrlConfig = await data.json()
          const tldInfoList = await this.contractReader.getTldInfo([tld])
          const publicClient = createPublicClient({
            chain: getChainFromId(Number(tldInfoList[0].chainId)),
            transport: http(
              rpcUrl ||
                'https://rpc.ankr.com/eth/01048c161385f5499bbe8f88cf68ce3d713c908be21217de37266424d49fefd7' ||
                rpcUrlConfig.url,
              {
                timeout: timeout,
                fetchOptions: { signal },
              }
            ),
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
        const resolverContract = await this.contractReader.getResolverContractByTld(
          namehash,
          tldInfo,
          rpcUrl,
          timeout,
          signal
        )
        // Get address from resolver contract
        const res =
          coinType !== undefined
            ? await resolverContract.read.addr([namehash, BigInt(coinType)])
            : await resolverContract.read.addr([namehash])
        return res
      } catch (error) {
        if (error instanceof Error && error.name === 'AbortError') {
          throw new Error(`Request for ${name} timed out`)
        }
        console.error(`Error getting address for ${name}`, error)
        return null
      }
    }, timeout)
  }

  /**
   * Get available domain list from address.
   *
   * @param {GetDomainNameProps} { address, queryChainIdList, queryTldList }
   * @return {*}  {Promise<string[]>}
   * @memberof Web3Name
   */
  async getDomainNames({
    address,
    queryChainIdList,
    queryTldList,
    rpcUrl,
    timeout,
  }: GetDomainNameProps): Promise<string[]> {
    return this.contractReader.withTimeout(async (signal) => {
      if (queryChainIdList?.length && queryTldList?.length) {
        console.warn('queryChainIdList and queryTldList cannot be used together, queryTldList will be ignored')
      }

      const resList: Set<string> = new Set([])
      try {
        // Calculate reverse node and namehash
        const reverseNode = `${address.toLowerCase().slice(2)}.addr.reverse`
        const reverseNamehash = namehash(reverseNode)

        const hubContract = this.contractReader.getVerifiedTldHubContract(timeout)

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
              const contract = await this.contractReader.getResolverContractByTld(reverseNamehash, tld, rpcUrl)
              if (queryTldList?.length) {
                if (isV2Tld(tld.tld)) {
                  const containsTldNameFunction = await this.contractReader.containsTldNameFunction(
                    contract.address,
                    tld,
                    rpcUrl
                  )
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
    }, timeout)
  }

  /**
   * Get domain record from name and key.
   *
   * @param {{ name: string; key: string; rpcUrl?: string; timeout?: number }} { name, key, rpcUrl, timeout }
   * @return {*}
   * @memberof Web3Name
   */
  async getDomainRecord({
    name,
    key,
    rpcUrl,
    timeout,
  }: {
    name: string
    key: string
    rpcUrl?: string
    timeout?: number
  }) {
    return this.contractReader.withTimeout(async (signal) => {
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
    }, timeout)
  }

  /**
   * Get domain metadata from name.
   *
   * @param {{ name: string; rpcUrl?: string; timeout?: number }} { name, rpcUrl, timeout }
   * @return {*}
   * @memberof Web3Name
   */
  async getMetadata({ name, rpcUrl, timeout }: { name: string; rpcUrl?: string; timeout?: number }) {
    return this.contractReader.withTimeout(async (signal) => {
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
    }, timeout)
  }

  /**
   * Get domain avatar from name.
   *
   * @param {{ name: string; rpcUrl?: string; timeout?: number }} { name, rpcUrl, timeout }
   * @return {*}
   * @memberof Web3Name
   */
  async getDomainAvatar({
    name,
    key,
    rpcUrl,
    timeout,
  }: {
    name: string
    key: string
    rpcUrl?: string
    timeout?: number
  }): Promise<string | undefined> {
    return this.contractReader.withTimeout(async (signal) => {
      const metadata = await this.getMetadata({ name, rpcUrl, timeout })
      return metadata?.image
    }, timeout)
  }

  /**
   * Get domain content hash from name.
   *
   * @param {{ name: string; rpcUrl?: string; timeout?: number }} { name, rpcUrl, timeout }
   * @return {*}  {(Promise<string | undefined>)}
   * @memberof Web3Name
   */
  async getContentHash({
    name,
    rpcUrl,
    timeout,
  }: {
    name: string
    rpcUrl?: string
    timeout?: number
  }): Promise<string | undefined> {
    return this.contractReader.withTimeout(async (signal) => {
      const tld = name.split('.').pop()?.toLowerCase()
      if (!tld) {
        return undefined
      }
      try {
        const tldInfo = await this.contractReader.getTldInfo([tld])
        if (!tldInfo) throw 'TLD not found'

        const namehash = tldNamehash(normalize(name), isV2Tld(tld) ? undefined : tldInfo[0].identifier)
        const contenthash = await this.contractReader.getContenthash(namehash, tldInfo[0], rpcUrl)
        if (!contenthash || contenthash === '0x') return undefined
        return contenthash
      } catch (error) {
        console.error(`Error getting content hash for ${name}`, error)
      }
    }, timeout)
  }

  /**
   * Retrieves the ABI (Application Binary Interface) for a given name on the Web3Name system.
   * @param name - The name for which to retrieve the ABI.
   * @param rpcUrl - Optional RPC URL to use for retrieving the ABI.
   * @returns The ABI for the specified name, or undefined if the TLD (Top-Level Domain) is not found.
   */
  // async getABI({ name, rpcUrl, timeout }: { name: string; rpcUrl?: string; timeout?: number }) {
  //   const tld = name.split('.').pop()?.toLowerCase()
  //   if (!tld) {
  //     return undefined
  //   }
  //   try {
  //     const tldInfo = (await this.contractReader.getTldInfo([tld], timeout)).at(0)
  //     if (!tldInfo) throw 'TLD not found'

  //     const namehash = tldNamehash(normalize(name), isV2Tld(tld) ? undefined : tldInfo.identifier)
  //     const abi = await this.contractReader.getABI(namehash, tldInfo, rpcUrl, timeout)
  //     return abi
  //   } catch (error) {
  //     console.error(`Error getting content hash for ${name}`, error)
  //   }
  // }
}
