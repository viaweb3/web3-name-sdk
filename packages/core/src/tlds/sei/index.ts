import { getCosmWasmClient } from '@sei-js/core'

export class SeiName {
  async getDomainName({ address }: { address: string }) {
    try {
      const client = await getCosmWasmClient('https://sei-rpc.polkachu.com/')
      // @ts-ignore
      const seiSid = await import('@siddomains/sei-sidjs')
      const SeiID = seiSid.default.default
      const getSeiIDAddress = seiSid.getSeiIDAddress
      const seiId = new SeiID({ client, chainId: 'pacific-1', seiIdAddress: getSeiIDAddress('pacific-1') })
      const name = await seiId.getName(address)
      return name
    } catch (error) {
      console.error('Error getting SEI domain name', error)
      return null
    }
  }

  async getAddress({ name }: { name: string }) {
    try {
      const client = await getCosmWasmClient('https://sei-rpc.polkachu.com/')
      // @ts-ignore
      const seiSid = await import('@siddomains/sei-sidjs')
      const SeiID = seiSid.default.default
      const getSeiIDAddress = seiSid.getSeiIDAddress
      const seiId = new SeiID({ client, chainId: 'pacific-1', seiIdAddress: getSeiIDAddress('pacific-1') })
      const address = await seiId.name(name).getAddress()
      return address
    } catch (error) {
      console.error('Error getting SEI address', error)
      return null
    }
  }
}
