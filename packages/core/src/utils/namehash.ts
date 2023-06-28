import { ens_normalize } from '@adraffy/ens-normalize'
import { decodeLabelhash, isEncodedLabelhash } from './labels'
import { concat, keccak256 } from 'ethers/lib/utils'

export const normalize = (name: string) => (name ? ens_normalize(name) : name)

export function namehash(inputName: string): string {
  let node = ''
  for (let i = 0; i < 32; i++) {
    node += '00'
  }

  if (inputName) {
    const labels = inputName.split('.')

    for (let i = labels.length - 1; i >= 0; i--) {
      let labelSha
      if (isEncodedLabelhash(labels[i])) {
        labelSha = decodeLabelhash(labels[i])
      } else {
        let normalisedLabel = normalize(labels[i])
        labelSha = keccak256(normalisedLabel)
      }

      node = keccak256(concat([node, labelSha]))
    }
  }

  return '0x' + node
}
