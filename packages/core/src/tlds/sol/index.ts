import { Connection, PublicKey, clusterApiUrl } from '@solana/web3.js'

import { resolve, reverseLookup } from '@bonfida/spl-name-service'

export class SolName {
  private rpcUrl?: string
  private connection: Connection
  private timeout?: number

  constructor({ rpcUrl, timeout }: { rpcUrl?: string; timeout?: number }) {
    this.rpcUrl = rpcUrl
    this.timeout = timeout
    this.connection = new Connection(this.rpcUrl || clusterApiUrl('mainnet-beta'), {
      commitment: 'confirmed',
    })
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
      const name = await reverseLookup(this.connection, new PublicKey(address))
      return name
    }, timeout)
  }

  async getAddress({ name, timeout }: { name: string; timeout?: number }) {
    return this.withTimeout(async () => {
      const owner = await resolve(this.connection, name)
      return owner.toBase58()
    }, timeout)
  }
}
