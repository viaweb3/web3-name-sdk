import { Signer } from 'ethers'

type SupportedChainId = 1 | 56 | 42161 | 97 | 421613
type ReferralSupportedChainId = 56 | 42161 | 97 | 421613
type SIDRegisterOptions = {
  signer: Signer
  sidAddress?: string
  chainId: SupportedChainId
}

type RegisterOptions = {
  referrer?: string
  setPrimaryName?: boolean
  onCommitSuccess?: (waitTime: number) => Promise<void>
}

export { SIDRegisterOptions, RegisterOptions, SupportedChainId, ReferralSupportedChainId }
