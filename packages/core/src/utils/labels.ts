import { labelhash as _labelhash } from 'viem'

export function isEncodedLabelhash(hash: string) {
  return hash.startsWith('[') && hash.endsWith(']') && hash.length === 66
}

export function decodeLabelhash(hash: string) {
  if (!(hash.startsWith('[') && hash.endsWith(']'))) {
    throw Error('Expected encoded labelhash to start and end with square brackets')
  }

  if (hash.length !== 66) {
    throw Error('Expected encoded labelhash to have a length of 66')
  }

  return `0x${hash.slice(1, -1)}`
}

export function labelhash(unnormalizedLabelOrLabelhash: string) {
  return _labelhash(unnormalizedLabelOrLabelhash)
}
