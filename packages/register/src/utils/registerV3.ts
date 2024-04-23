import { countCharacters, validateName } from '@web3-name-sdk/core/utils'
import { Address, encodeAbiParameters, Hex } from 'viem'

export const YEAR_IN_SECONDS = 31556952

export function calculateDuration(years: number) {
  return BigInt(parseInt((years * YEAR_IN_SECONDS).toFixed()))
}

export function getBufferedPrice(price: bigint) {
  return price * BigInt(101) / BigInt(100)
}


export function validateNameV3(label: string) {
  const res = validateName(label)
  const len = countCharacters(res)
  if (len < 3 || len > 512) {
    throw new Error('Invalid name')
  }
  return res
}

export function encodeExtraData(usePoints: boolean, referrerAddr?: Address) {
  if (!usePoints && !referrerAddr) return '0x'
  let rewardHookExtraData: Hex = '0x'
  if (referrerAddr) {
    rewardHookExtraData = encodeAbiParameters(
      [{ type: 'address', name: 'referrerAddress' }],
      [referrerAddr]
    )
  }
  const pointHookExtraData = encodeAbiParameters(
    [{ type: 'bool', name: 'useGiftCardPoints' }],
    [usePoints]
  )
  const extraData = encodeAbiParameters(
    [
      {
        components: [
          { type: 'bytes', name: 'QualificationHookExtraData' },
          { type: 'bytes', name: 'PriceHookExtraData' },
          { type: 'bytes', name: 'PointHookExtraData' },
          { type: 'bytes', name: 'RewardHookExtraData' },
        ],
        name: 'extraData',
        type: 'tuple',
      },
    ],
    [
      {
        QualificationHookExtraData: '0x',
        PriceHookExtraData: '0x',
        PointHookExtraData: pointHookExtraData,
        RewardHookExtraData: rewardHookExtraData,
      },
    ]
  )
  return extraData
}
