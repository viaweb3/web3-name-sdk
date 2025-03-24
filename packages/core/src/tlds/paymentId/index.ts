import { createPublicClient, hexToBigInt, hexToString, http, keccak256, stringToHex } from 'viem'
import { paymentIdReaderAbi } from '../../abi/paymentId/paymentIdReader'
import { PaymentIdTld, PaymentIdTldCode } from '../../constants/tld'
// import { base } from "viem/chains"

const gravityPublicResolver = "0x94124792020DCEa0fb01caaBD3f891247ce4863d"
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
    const parts = domainName.split('@')
    const tld = parts[1] as PaymentIdTld
    return BigInt(PaymentIdTldCode[tld])
}

export class PaymentIdName {
    private client = createPublicClient({
        chain: gravity,
        transport: http('https://rpc.gravity.xyz'),
    })

    async getAddress({ name, chainId }: { name: string; chainId: number }) {
        try {
            const address = await this.client.readContract({
                address: gravityPublicResolver,
                abi: paymentIdReaderAbi,
                functionName: 'addr',
                args: [getTokenIdBigint(name), getTldCode(name), BigInt(chainId)],
            })
            return chainId === 1 ? address : hexToString(address)
        } catch (error) {
            console.error('Error getting PaymentId address', error)
            return null
        }
    }
}
