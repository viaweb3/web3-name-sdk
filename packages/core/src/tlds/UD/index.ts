import { Address, createPublicClient, getContract, http, namehash } from 'viem'
import { polygon } from 'viem/chains'
import { proxyReaderAbi } from '../../abi/UD/ProxyReader'
import { unsRegistryAbi } from '../../abi/UD/UNSRegistry'

export class UDResolver {
  private proxyReaderAddress = '0x423F2531bd5d3C3D4EF7C318c2D1d9BEDE67c680' as `0x{string}`
  private unsRegistryAddress = '0xa9a6A3626993D487d2Dbda3173cf58cA1a9D9e9f' as `0x{string}`

  /**
   * Resolve address from name
   * @param domain
   * @returns
   */
  async getAddress(domain: string) {
    const client = createPublicClient({
      chain: polygon,
      transport: http(),
    })

    const proxyReaderContract = getContract({
      address: this.proxyReaderAddress,
      abi: proxyReaderAbi,
      client: client,
    })

    const keys = ['crypto.ETH.address']
    const res = await proxyReaderContract.read.getMany([keys, BigInt(namehash(domain))])
    return res.at(0) || null
  }

  /**
   * Resolve name from address
   * @param address
   * @returns
   */
  async getName(address: string) {
    const client = createPublicClient({
      chain: polygon,
      transport: http(),
    })

    const registryContract = getContract({
      address: this.unsRegistryAddress,
      abi: unsRegistryAbi,
      client: client,
    })

    const res = await registryContract.read.reverseNameOf([address as Address])

    // Only support .crypto
    if (!res.endsWith('.crypto')) {
      return null
    }
    return res
  }
}
