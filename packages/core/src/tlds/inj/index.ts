// @ts-ignore
import InjectiveID from '@siddomains/injective-sidjs'
// @ts-ignore
import { getInjectiveIDAddress } from '@siddomains/injective-sidjs'
import { getNetworkEndpoints, Network } from '@injectivelabs/networks'
import { ChainId } from '@injectivelabs/ts-types'

export class InjName {
  async getDomainName({ address }: { address: string }) {
    try {
      const endpoints = getNetworkEndpoints(Network.Mainnet)
      const injectiveId = new InjectiveID({
        grpc: endpoints.grpc,
        chainId: ChainId.Mainnet,
        injectiveIdAddress: getInjectiveIDAddress(ChainId.Mainnet),
      })

      const name = await injectiveId.getName(address)
      return name
    } catch (error) {
      console.error('Error getting SEI domain name', error)
      return null
    }
  }

  async getAddress({ name }: { name: string }) {
    try {
      const endpoints = getNetworkEndpoints(Network.Mainnet)
      const injectiveId = new InjectiveID({
        grpc: endpoints.grpc,
        chainId: ChainId.Mainnet,
        injectiveIdAddress: getInjectiveIDAddress(ChainId.Mainnet),
      })
      const address = await injectiveId.name(name).getAddress()
      return address
    } catch (error) {
      console.error('Error getting SEI address', error)
      return null
    }
  }
}
