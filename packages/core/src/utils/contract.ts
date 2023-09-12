import { createPublicClient, getContract, http, namehash } from 'viem'
import { bscTestnet } from 'viem/chains'
import { ResolverAbi } from '../abi/Resolver'
import { ReverseResolverAbi } from '../abi/ReverseResolver'
import { SIDRegistryAbi } from '../abi/SIDRegistry'
import { VerifiedTldHubAbi } from '../abi/VerifiedTldHub'
import { CONTRACTS } from '../constants/contracts'
import { createCustomClient } from '.'

export class ContractUtils {
  /** Get verified TLD hub contract */
  getVerifiedTldHubContract() {
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
  async getReverseResolverContract(reverseNode: string, tldInfo: TldInfo) {
    const client = createCustomClient(tldInfo)
    const registryContract = getContract({
      address: tldInfo.registry,
      abi: SIDRegistryAbi,
      publicClient: client,
    })
    const resolverAddr = await registryContract.read.resolver([namehash(reverseNode)])
    const hubContract = getContract({
      address: resolverAddr,
      abi: ReverseResolverAbi,
      publicClient: client,
    })

    return hubContract
  }

  async getTldInfo(tldList: string[]) {
    const hubContract = this.getVerifiedTldHubContract()
    const tldInfoList = await hubContract.read.getTldInfo([tldList])
    return tldInfoList
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
  async getResolverContractByTld(domain: string, tldInfo: TldInfo, rpcUrl?: string) {
    const client = createCustomClient(tldInfo, rpcUrl)
    const registryContract = getContract({
      address: tldInfo.registry,
      abi: SIDRegistryAbi,
      publicClient: client,
    })
    const resolverAddr = await registryContract.read.resolver([namehash(domain)])
    const resolverContract = getContract({
      address: resolverAddr,
      abi: ResolverAbi,
      publicClient: client,
    })

    return resolverContract
  }
}
