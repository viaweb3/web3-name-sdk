import { createPublicClient, hexToBigInt, hexToString, http, keccak256, stringToHex } from "viem"
import { paymentIdReaderAbi } from "../../abi/paymentId/paymentIdReader"
import { PaymentIdTld, PaymentIdTldCode } from "../../constants/tld"
// import { base } from "viem/chains"
export const gravity = {
    id: 1625,
    name: 'Gravity Alpha Mainnet',
    nativeCurrency: { name: 'G', symbol: 'G', decimals: 18 },
    rpcUrls: {
        default: {
            http: ['https://rpc.gravity.xyz'],
        },
    },
    blockExplorers: {
        default: {
            name: 'Gravity Alpha Mainnet explorer',
            url: 'https://explorer.gravity.xyz',
        },
    },
}

function getTokenIdBigint(domainName: string) {
    const nameHash = keccak256(stringToHex(domainName.split('@')[0]))
    return hexToBigInt(nameHash)
}

function getTldCode(domainName: string): bigint {
    console.log('domain', domainName)
    const parts = domainName.split('@')
    const tld = parts[1] as PaymentIdTld
    return BigInt(PaymentIdTldCode[tld])
}

export class PaymentIdName {
    private client = createPublicClient({
        chain: gravity,
        transport: http('https://rpc.gravity.xyz'),
    })

    async getAddress({ name, chainId }: { name: string, chainId: number }) {
        try {
            const address = await this.client.readContract({
                address: '0xb15dc8a61742A3477daaB7bd9fA249A13a8eC9A2',
                abi: paymentIdReaderAbi,
                functionName: 'addr',
                args: [getTokenIdBigint(name), getTldCode(name), BigInt(chainId)]

            })
            console.log('address', address, 'hex', hexToString(address))
            return chainId === 1 ? address : hexToString(address)
        }
        catch (error) {
            console.error('Error getting PaymentId address', error)
            return null
        }
    }
}