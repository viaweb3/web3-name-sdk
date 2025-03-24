import { Connection, PublicKey } from '@solana/web3.js'

import { resolve, getPrimaryDomain } from '@bonfida/spl-name-service'

export class SolName {
  private rpcUrl?: string
  private connection: Connection
  private timeout?: number

  constructor({ rpcUrl, timeout }: { rpcUrl?: string; timeout?: number }) {
    this.rpcUrl = rpcUrl
    this.timeout = timeout
    ;(this.connection = new Connection(
      this.rpcUrl || 'https://mainnet.helius-rpc.com/?api-key=beb45bba-fbb6-4e37-a66c-31915a2c5109'
    )),
      {
        commitment: 'confirmed',
      }
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
        const name = await getPrimaryDomain(this.connection, new PublicKey(address))
        return name.reverse + '.sol'
      } catch (error) {
        return null
      }
    }, timeout)
  }

  async getAddress({ name, timeout }: { name: string; timeout?: number }) {
    return this.withTimeout(async () => {
      try {
        const owner = await resolve(this.connection, name)
        return owner.toBase58()
      } catch (error) {
        return null
      }
    }, timeout)
  }
}
