import { getCosmWasmClient } from '@sei-js/core'

export class SeiName {
  private timeout?: number

  constructor({ timeout }: { timeout?: number } = {}) {
    this.timeout = timeout
  }

  private async withTimeout<T>(operation: () => Promise<T>, timeoutMs?: number): Promise<T> {
    const effectiveTimeout = timeoutMs !== undefined ? timeoutMs : this.timeout

    if (!effectiveTimeout) {
      return operation()
    }

    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), effectiveTimeout)

    try {
      return await Promise.race([
        operation(),
        new Promise<T>((_, reject) => {
          setTimeout(() => {
            reject(new Error(`Operation timed out after ${effectiveTimeout}ms`))
          }, effectiveTimeout)
        }),
      ])
    } finally {
      clearTimeout(timeoutId)
    }
  }

  async getDomainName({ address, timeout }: { address: string; timeout?: number }) {
    return this.withTimeout(async () => {
      try {
        const client = await getCosmWasmClient('https://sei-rpc.polkachu.com/')
        // @ts-ignore
        const seiSid = await import('@siddomains/sei-sidjs')
        const SeiID = seiSid.default
        const getSeiIDAddress = seiSid.getSeiIDAddress
        const seiId = new SeiID({ client, chainId: 'pacific-1', seiIdAddress: getSeiIDAddress('pacific-1') })
        const name = await seiId.getName(address)
        return name
      } catch (error) {
        console.error('Error getting SEI domain name', error)
        return null
      }
    }, timeout)
  }

  async getAddress({ name, timeout }: { name: string; timeout?: number }) {
    return this.withTimeout(async () => {
      try {
        const client = await getCosmWasmClient('https://sei-rpc.polkachu.com/')
        // @ts-ignore
        const seiSid = await import('@siddomains/sei-sidjs')
        const SeiID = seiSid.default
        const getSeiIDAddress = seiSid.getSeiIDAddress
        const seiId = new SeiID({ client, chainId: 'pacific-1', seiIdAddress: getSeiIDAddress('pacific-1') })
        const address = await seiId.name(name).getAddress()
        return address
      } catch (error) {
        console.error('Error getting SEI address', error)
        return null
      }
    }, timeout)
  }
}
