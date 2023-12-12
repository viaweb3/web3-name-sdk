import whitelist from '../constants/whitelist'
import { ens_normalize } from '@adraffy/ens-normalize'
// @ts-ignore
import { validate as ensValidate } from '@ensdomains/ens-validation'
import { isV2Tld } from './common'
import { isEncodedLabelhash } from './labels'
import { normalize } from './namehash'

export function validateName(name: string) {
  if (!name) {
    throw new Error('Invalid name')
  }
  const labelArr = name.split('.')
  let domain = name
  let suffix = ''
  if (labelArr.length > 1) {
    domain = labelArr.slice(0, labelArr.length - 1).join('.')
    suffix = labelArr[labelArr.length - 1]
  }
  if (labelArr.length === 3 && suffix.toLowerCase() === 'bnb' && labelArr[1].toLowerCase() === 'eth') {
    domain = labelArr[0]
  }
  const hasEmptyLabels = labelArr.filter((e) => e.length < 1).length > 0
  if (hasEmptyLabels) throw new Error('Domain cannot have empty labels')

  if (!validateLabelLength(domain, !isV2Tld(suffix)) && !whitelist.includes(name.toLowerCase())) {
    throw new Error('Invalid name')
  }
  if (!validateDomains(domain)) throw new Error('Invalid name')
  const normalizedArray = labelArr.map((label) => {
    return isEncodedLabelhash(label) ? label : normalize(label)
  })
  try {
    return normalizedArray.join('.')
  } catch (e) {
    throw e
  }
}

function validateLabelLength(name: string, allowShortLabel = false) {
  if (!name) {
    return false
  }
  const len = countCharacters(name)
  if (len > 512 || (!allowShortLabel && len < 3)) {
    return false
  }
  let normalizedValue
  try {
    normalizedValue = normalize(name)
  } catch (e) {
    normalizedValue = name
  }
  if (normalizedValue.length > 512 || (!allowShortLabel && len < 3)) {
    return false
  }
  return true
}

function validateDomains(value: string) {
  const nospecial = /^[^*|\\":<>[\]{}`\\\\()';@&$]+$/u
  const blackList = /[\u0000-\u002c\u002e-\u002f\u003a-\u005e\u0060\u007b-\u007f\u200b\u200c\u200d\ufeff]/g

  return nospecial.test(value) && !blackList.test(value) && ensValidate(value)
}

/**
 * Count the number of characters in a string.
 * @param str The string to count characters.
 * @returns The number of characters in the string.
 */
export function countCharacters(str: string): number {
  const normalizedStr = ens_normalize(str)
  const regex = /[\u0000-\uffff]|\p{L}|\p{Emoji}(?!\p{M})/gu
  const matches = normalizedStr.match(regex)
  return matches ? matches.length : 0
}
