import {
  Address,
  createPublicClient,
  getContract,
  toFunctionSelector,
  hexToBigInt,
  hexToNumber,
  http,
  keccak256,
  type GetContractReturnType,
  type HttpTransport,
  type PublicClient,
  withTimeout,
} from 'viem'
import { bscTestnet, mainnet } from 'viem/chains'
import { ResolverAbi } from '../abi/Resolver'
import { ReverseResolverAbi } from '../abi/ReverseResolver'
import { SANNContractAbi } from '../abi/SANN'
import { SIDRegistryAbi } from '../abi/SIDRegistry'
import { TldBaseContractAbi } from '../abi/TldBase'
import { VerifiedTldHubAbi } from '../abi/VerifiedTldHub'
import { CONTRACTS } from '../constants/contracts'
import { TldInfo } from '../types/tldInfo'
import { createCustomClient, getBaseContractFromChainId } from './common'

const DEFAULT_RPC_URL = 'https://ethereum-rpc.publicnode.com'
const RPC_API_URL = 'https://spaceapi.prd.space.id/rpc/1'

export class ContractReader {
  private isDev: boolean
  private rpcUrl?: string
  private timeout?: number

  constructor(isDev: boolean, rpcUrl?: string, timeout?: number) {
    this.isDev = isDev
    this.rpcUrl = rpcUrl || DEFAULT_RPC_URL
    if (!rpcUrl) {
      this.initRpcUrl().then((url) => {
        this.rpcUrl = url
      })
    }
    this.timeout = timeout
  }

  private async initRpcUrl(): Promise<string> {
    try {
      const response = await fetch(RPC_API_URL)
      const data = await response.json()
      return data.url ?? DEFAULT_RPC_URL
    } catch (error) {
      console.error('Error fetching RPC URL:', error)
      return DEFAULT_RPC_URL
    }
  }

  getTimeout() {
    return this.timeout
  }

  /**
   * Get current RPC URL
   * If user didn't provide one, it may be dynamically fetched from API
   * @returns Current RPC URL
   */
  getRpcUrl(): string {
    return this.rpcUrl || DEFAULT_RPC_URL
  }

  async withTimeout<T>(operation: (signal: AbortSignal) => Promise<T>, timeoutMs?: number): Promise<T> {
    const effectiveTimeout = timeoutMs !== undefined ? timeoutMs : this.timeout

    if (!effectiveTimeout) {
      return operation(new AbortController().signal)
    }

    const controller = new AbortController()

    try {
      return await Promise.race([
        operation(controller.signal),
        new Promise<T>((_, reject) => {
          setTimeout(() => {
            controller.abort()
            reject(new Error(`Operation timed out after ${effectiveTimeout}ms`))
          }, effectiveTimeout)
        }),
      ])
    } finally {
      if (!controller.signal.aborted) {
        controller.abort()
      }
    }
  }

  /** Get verified TLD hub contract */
  getVerifiedTldHubContract(
    timeout?: number,
    signal?: AbortSignal
  ): GetContractReturnType<typeof VerifiedTldHubAbi, PublicClient<HttpTransport>> {
    const ethClient = createPublicClient({
      chain: this.isDev ? bscTestnet : mainnet,
      transport: http(this.isDev ? undefined : this.rpcUrl, {
        timeout: timeout,
        fetchOptions: { signal },
      }),
    })

    const hubContract = getContract({
      address: this.isDev ? CONTRACTS.verifiedTldHubTest : CONTRACTS.verifiedTldHub,
      abi: VerifiedTldHubAbi,
      client: {
        public: ethClient,
      },
    })

    return hubContract
  }

  async getTldInfo(tldList: string[], timeout?: number, signal?: AbortSignal) {
    const hubContract = this.getVerifiedTldHubContract(timeout, signal)
    const tldInfoList = await hubContract.read.getTldInfo([tldList])
    return tldInfoList.filter((e) => !!e.tld)
  }

  /** Get resolver contract by TLD */
  async getResolverContractByTld(
    namehash: Address,
    tldInfo: TldInfo,
    rpcUrl?: string,
    timeout?: number,
    signal?: AbortSignal
  ): Promise<GetContractReturnType<typeof ResolverAbi, PublicClient<HttpTransport>>> {
    const client = createCustomClient(tldInfo, rpcUrl, timeout, signal)
    const registryContract = getContract({
      address: tldInfo.registry,
      abi: SIDRegistryAbi,
      client: {
        public: client,
      },
    })

    const resolverAddr = await registryContract.read.resolver([namehash])
    if (!hexToNumber(resolverAddr)) {
      throw 'resolver address is null'
    }

    const resolverContract = getContract({
      address: resolverAddr,
      abi: ResolverAbi,
      client: {
        public: client,
      },
    })
    return resolverContract
  }

  /** Get reverse resolver contract (V2 only) */
  async getReverseResolverContract(
    reverseNamehash: Address,
    tldInfo: TldInfo,
    rpcUrl?: string,
    timeout?: number,
    signal?: AbortSignal
  ): Promise<GetContractReturnType<typeof ReverseResolverAbi, PublicClient<HttpTransport>> | undefined> {
    if (!tldInfo.defaultRpc) return undefined

    const client = createCustomClient(tldInfo, rpcUrl, timeout, signal)
    const registryContract = getContract({
      address: tldInfo.registry,
      abi: SIDRegistryAbi,
      client: {
        public: client,
      },
    })
    const resolverAddr = await registryContract.read.resolver([reverseNamehash])
    const resolverContract = getContract({
      address: resolverAddr ?? '',
      abi: ReverseResolverAbi,
      client: {
        public: client,
      },
    })

    return resolverContract
  }

  async getTldMetadata(domain: string, tldInfo: TldInfo, rpcUrl?: string, timeout?: number, signal?: AbortSignal) {
    const tokenId = hexToBigInt(keccak256(Buffer.from(domain.split('.')[0])))

    const client = createCustomClient(tldInfo, rpcUrl, timeout, signal)
    const sannContract = getContract({
      address: tldInfo.sann,
      abi: SANNContractAbi,
      client: {
        public: client,
      },
    })

    const tldBaseContractAddr =
      tldInfo.identifier === BigInt(0)
        ? getBaseContractFromChainId(Number(tldInfo.chainId))
        : await sannContract.read.tldBase([BigInt(`${tldInfo.identifier}`)])

    if (tldInfo.chainId === BigInt(mainnet.id)) {
      return `https://metadata.ens.domains/mainnet/${tldBaseContractAddr}/${tokenId}`
    }

    const tldBaseContract = getContract({
      address: tldBaseContractAddr,
      abi: TldBaseContractAbi,
      client: {
        public: client,
      },
    })
    const metadata = await tldBaseContract.read.tokenURI([tokenId])
    return metadata
  }

  // Read content hash from resolver contract
  async getContenthash(namehash: Address, tldInfo: TldInfo, rpcUrl?: string, timeout?: number, signal?: AbortSignal) {
    const resolver = await this.getResolverContractByTld(namehash, tldInfo, rpcUrl, timeout, signal)
    const functionExists = await this.resolverFunctionExists(
      resolver.address,
      'contenthash(bytes32)',
      tldInfo,
      rpcUrl,
      timeout,
      signal
    )
    if (!functionExists) return undefined
    const contentHash = await resolver.read.contenthash([namehash])
    return contentHash
  }

  // Read content hash from resolver contract
  async getABI(namehash: Address, tldInfo: TldInfo, rpcUrl?: string, timeout?: number, signal?: AbortSignal) {
    const resolver = await this.getResolverContractByTld(namehash, tldInfo, rpcUrl, timeout, signal)
    const functionExists = await this.resolverFunctionExists(
      resolver.address,
      'ABI(bytes32, uint256)',
      tldInfo,
      rpcUrl,
      timeout,
      signal
    )
    if (!functionExists) return undefined
    const contentHash = await resolver.read.ABI([namehash, BigInt(1)])
    return contentHash
  }

  async containsTldNameFunction(
    resolverAddr: Address,
    tldInfo: TldInfo,
    rpcUrl?: string,
    timeout?: number,
    signal?: AbortSignal
  ): Promise<boolean> {
    const client = createCustomClient(tldInfo, rpcUrl, timeout, signal)
    const bytecode = await client.getBytecode({ address: resolverAddr })
    const selector = toFunctionSelector('tldName(bytes32, uint256)')
    return bytecode?.includes(selector.slice(2)) ?? false
  }

  async resolverFunctionExists(
    resolverAddr: Address,
    functionName: string,
    tldInfo: TldInfo,
    rpcUrl?: string,
    timeout?: number,
    signal?: AbortSignal
  ): Promise<boolean> {
    const client = createCustomClient(tldInfo, rpcUrl, timeout, signal)
    const bytecode = await client.getBytecode({ address: resolverAddr })
    const selector = toFunctionSelector(functionName)
    return bytecode?.includes(selector.slice(2)) ?? false
  }
}
