import { Address, Client, PublicClient } from 'viem'

export interface DomainResolver {
  getDomainName(address: string, reverseNamehash: Hash, tld: TldInfo, rpcUrl?: string): Promise<string | null>
}

export type GetDomainNameProps = {
  queryChainIdList?: number[]
  queryTldList?: string[]
  address: string
  rpcUrl?: string
  timeout?: number
  queryTld?: string
  queryChainId?: number
}

export type BatchGetDomainNameProps = {
  addressList: Address[]
  queryChainIdList?: number[]
  queryTldList?: string[]
  rpcUrl?: string
  timeout?: number
}
export type BatchGetReturn = { address: Address; domain: string | null }[]

export interface TimeoutOptions {
  timeout?: number
}

export interface RpcOptions {
  rpcUrl?: string
  timeout?: number
}

export interface Web3NameOptions {
  isDev?: boolean
  rpcUrl?: string
  timeout?: number
}
