import {
  Address,
  createPublicClient,
  getContract,
  hexToNumber,
  http,
  namehash,
  type GetContractReturnType,
  type HttpTransport,
  type PublicClient,
} from 'viem'
import { bscTestnet } from 'viem/chains'
import { createCustomClient } from '.'
import { ResolverAbi } from '../abi/Resolver'
import { ReverseResolverAbi } from '../abi/ReverseResolver'
import { ReverseResolverV3Abi } from '../abi/ReverserResolverV3'
import { SIDRegistryAbi } from '../abi/SIDRegistry'
import { VerifiedTldHubAbi } from '../abi/VerifiedTldHub'
import { CONTRACTS } from '../constants/contracts'

export class ContractReader {
  /** Get verified TLD hub contract */
  getVerifiedTldHubContract(): GetContractReturnType<typeof VerifiedTldHubAbi, PublicClient<HttpTransport>> {
    const bnbClient = createPublicClient({
      chain: bscTestnet,
      transport: http(),
    })

    const hubContract = getContract({
      address: CONTRACTS.verifiedTldHub,
      abi: VerifiedTldHubAbi,
      publicClient: bnbClient,
    })

    return hubContract
  }

  /** Get reverse resolver contract */
  async getReverseResolverContract(
    reverseNode: string,
    tldInfo: TldInfo
  ): Promise<GetContractReturnType<typeof ReverseResolverAbi, PublicClient<HttpTransport>>> {
    const client = createCustomClient(tldInfo)
    const registryContract = getContract({
      address: tldInfo.registry,
      abi: SIDRegistryAbi,
      publicClient: client,
    })
    const resolverAddr = await registryContract.read.resolver([namehash(reverseNode)])
    const resolverContract = getContract({
      address: resolverAddr ?? '',
      abi: ReverseResolverAbi,
      publicClient: client,
    })

    return resolverContract
  }

  async getReverseResolverV3Contract(
    reverseNode: string,
    tldInfo: TldInfo
  ): Promise<GetContractReturnType<typeof ReverseResolverV3Abi, PublicClient<HttpTransport>>> {
    const client = createCustomClient(tldInfo)
    const registryContract = getContract({
      address: tldInfo.registry,
      abi: SIDRegistryAbi,
      publicClient: client,
    })
    console.log('reverseNode', namehash(reverseNode))
    const resolverAddr = await registryContract.read.resolver([namehash(reverseNode)])

    if (!resolverAddr) {
      throw new Error(
        'Resolver address is null. Please check if the reverse node is registered on the registry contract'
      )
    }
    const resolverContract = getContract({
      address: resolverAddr,
      abi: ReverseResolverV3Abi,
      publicClient: client,
    })

    return resolverContract
  }

  async getTldInfo(tldList: string[]) {
    const hubContract = this.getVerifiedTldHubContract()
    const tldInfoList = await hubContract.read.getTldInfo([tldList])
    return tldInfoList.filter((e) => !!e.tld)
  }

  /**
   * Get resolver contract by TLD
   *
   * @export
   * @param {string} domain
   * @param {TldInfo} tldInfo
   * @param {string} [rpcUrl]
   * @return {*}
   */
  async getResolverContractByTld(
    namehash: Address,
    tldInfo: TldInfo,
    rpcUrl?: string
  ): Promise<GetContractReturnType<typeof ResolverAbi, PublicClient<HttpTransport>>> {
    const client = createCustomClient(tldInfo, rpcUrl)
    const registryContract = getContract({
      address: tldInfo.registry,
      abi: SIDRegistryAbi,
      publicClient: client,
    })

    const resolverAddr = await registryContract.read.resolver([namehash])
    if (!hexToNumber(resolverAddr)) {
      throw 'resolver address is null'
    }

    const resolverContract = getContract({
      address: resolverAddr,
      abi: ResolverAbi,
      publicClient: client,
    })

    return resolverContract
  }
}
