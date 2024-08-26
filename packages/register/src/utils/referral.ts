// @ts-ignore
import { namehash } from '@siddomains/sidjs'
import { ReferralSupportedChainId } from '../types'

const emptySignature = [
  '0x0000000000000000000000000000000000000000',
  '0x0000000000000000000000000000000000000000000000000000000000000000',
  0,
  0,
  '0x0000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000',
]

function getApiUrl() {
  return 'https://api.prd.space.id/v1/sign-referral'
}

export async function getReferralSignature(domain: string, chainId: ReferralSupportedChainId) {
  if (!domain || !chainId) return emptySignature
  try {
    const res = await fetch(getApiUrl(), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        domain,
        chainId,
      }),
    })
    const signReferral = await res.json()

    if (signReferral) {
      return [
        signReferral.referrerAddress,
        namehash(domain),
        Number(signReferral.referralCount),
        Number(signReferral.signedAt),
        signReferral.signature,
      ]
    } else {
      throw new Error('sign referral fail')
    }
  } catch (e) {
    console.error(e)
    throw new Error('sign referral fail')
  }
}
