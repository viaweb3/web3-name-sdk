import { ens_normalize } from '@adraffy/ens-normalize'
import { Address, namehash, toHex } from 'viem'

export const normalize = (name: string) => (name ? ens_normalize(name) : name)

// const ZERO_HASH = '0x0000000000000000000000000000000000000000000000000000000000000000'

export function customTldNamehash(inputName: string, identifier: bigint): Address {
  // const identifierBaseNode = keccak256(
  //   concat([hexToBytes(ZERO_HASH), hexToBytes(toHex(identifier, { size: 32 }))])
  // )
  // const tldBaseNode = keccak256(
  //   concat([hexToBytes(identifierBaseNode), hexToBytes(keccak256(toHex('woaf8')))])
  // )
  // const nodeHash2 = keccak256(
  //   concat([hexToBytes(tldBaseNode), hexToBytes(keccak256(toHex('build')))])
  // )

  const fullNameNode = `${inputName}.[${toHex(identifier, { size: 32 }).slice(2)}]`
  return namehash(fullNameNode)
}
