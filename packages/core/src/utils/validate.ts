import whitelist from '../constants/whitelist'
// @ts-ignore
import { validate as ensValidate } from '@ensdomains/ens-validation'
// @ts-ignore
import { toArray } from 'lodash'
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
  if (!validateLabelLength(domain) && !whitelist.includes(name.toLowerCase())) {
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

function validateLabelLength(name: string) {
  if (!name) {
    return false
  }
  const len = toArray(name).length
  if (len < 3 || len > 512) {
    return false
  }
  let normalizedValue
  try {
    normalizedValue = normalize(name)
  } catch (e) {
    normalizedValue = name
  }
  if (normalizedValue.length < 3 || normalizedValue.length > 512) {
    return false
  }
  return true
}

function validateDomains(value: string) {
  const nospecial = /^[^*|\\":<>[\]{}`\\\\()';@&$]+$/u
  const blackList = /[\u0000-\u002c\u002e-\u002f\u003a-\u005e\u0060\u007b-\u007f\u200b\u200c\u200d\ufeff]/g

  return nospecial.test(value) && !blackList.test(value) && ensValidate(value)
}
