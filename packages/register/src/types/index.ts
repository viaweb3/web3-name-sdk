import { PublicClient, WalletClient, Chain, Hex, Address } from 'viem'
import { Signer } from 'ethers'

type SupportedChainId = 1 | 56 | 42161 | 97 | 421613
type ReferralSupportedChainId = 56 | 42161 | 97 | 421613
type SIDRegisterOptions = {
  signer: Signer
  sidAddress?: string
  chainId: SupportedChainId
}
type SIDRegisterOptionsV3 = {
  publicClient: PublicClient
  walletClient: WalletClient
  identifier: string,
  controllerAddr: Address,
  resolverAddr: Address,
  simulateAccount?: Address,
  simulateValue?: string,
}

type RegisterOptions = {
  referrer?: string
  setPrimaryName?: boolean
  onCommitSuccess?: (waitTime: number) => Promise<void>
}
type RegisterOptionsV3 = {
  referrer?: Address
  usePoint?: boolean
  setPrimaryName?: boolean
}

export {
  SIDRegisterOptions,
  RegisterOptions,
  SupportedChainId,
  ReferralSupportedChainId,
  SIDRegisterOptionsV3,
  RegisterOptionsV3,
}
