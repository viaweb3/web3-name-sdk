import { Connection, PublicKey, clusterApiUrl } from '@solana/web3.js'

import { resolve, reverseLookup } from '@bonfida/spl-name-service'

export class SolName {
  private rpcUrl?: string
  private connection: Connection
  constructor({ rpcUrl }: { rpcUrl?: string }) {
    this.rpcUrl = rpcUrl
    this.connection = new Connection(this.rpcUrl || clusterApiUrl('mainnet-beta'))
  }

  async getDomainName({ address }: { address: string }) {
    const name = await reverseLookup(this.connection, new PublicKey(address))
    return name
  }

  async getAddress({ name }: { name: string }) {
    const owner = await resolve(this.connection, name)
    return owner.toBase58()
  }
}
