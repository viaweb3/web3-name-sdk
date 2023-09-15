import {
  type HttpTransport,
  type PublicClient,
  createPublicClient,
  getContract,
  http,
  namehash,
  type GetContractReturnType,
} from 'viem'
import { bscTestnet } from 'viem/chains'
import { createCustomClient } from '.'
import { ResolverAbi } from '../abi/Resolver'
import { ReverseResolverAbi } from '../abi/ReverseResolver'
import { SIDRegistryAbi } from '../abi/SIDRegistry'
import { VerifiedTldHubAbi } from '../abi/VerifiedTldHub'
import { CONTRACTS } from '../constants/contracts'
import { customTldNamehash } from './namehash'

export class ContractUtils {
  /** Get verified TLD hub contract */
  getVerifiedTldHubContract(): GetContractReturnType<
    typeof VerifiedTldHubAbi,
    PublicClient<HttpTransport>
  > {
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
    domain: string,
    tldInfo: TldInfo,
    rpcUrl?: string
  ): Promise<GetContractReturnType<typeof ResolverAbi, PublicClient<HttpTransport>>> {
    const client = createCustomClient(tldInfo, rpcUrl)
    const registryContract = getContract({
      address: tldInfo.registry,
      abi: SIDRegistryAbi,
      publicClient: client,
    })
    console.log('domain', customTldNamehash(domain, tldInfo.identifier.valueOf()))
    const resolverAddr = await registryContract.read.resolver([
      customTldNamehash(domain, tldInfo.identifier.valueOf()),
    ])

    const resolverContract = getContract({
      address:
        BigInt(resolverAddr) > 0 ? resolverAddr : '0xf793A2F34ec6F4F5c4bb2dc2f7D4504d14dc4169',
      abi: ResolverAbi,
      publicClient: client,
    })

    return resolverContract
  }
}
