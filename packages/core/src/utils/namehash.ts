import { ens_normalize } from '@adraffy/ens-normalize'
import { Address, namehash, toHex } from 'viem'

export const normalize = (name: string) => (name ? ens_normalize(name) : name)

// const ZERO_HASH = '0x0000000000000000000000000000000000000000000000000000000000000000'

export function tldNamehash(inputName: string, identifier?: bigint): Address {
  if (!identifier) return namehash(inputName)
  const fullNameNode = `${inputName}.[${toHex(identifier, { size: 32 }).slice(2)}]`
  return namehash(fullNameNode)
}
