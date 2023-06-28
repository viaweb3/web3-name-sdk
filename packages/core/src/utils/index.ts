import { ethers, providers } from 'ethers'
import { abi as resolverAbi } from '../abi/Resolver.json'
import { abi as sidAbi } from '../abi/SID.json'

export function getSIDContract(chainId: number, provider: providers.Provider): ethers.Contract {
  return new ethers.Contract(getContractAddr(chainId), sidAbi, provider)
}

export function getResolverContract({
  resolverAddr,
  provider,
}: {
  resolverAddr: string
  provider: providers.Provider
}) {
  return new ethers.Contract(resolverAddr, resolverAbi, provider)
}

export function getChainId(address: string) {
  const suffix = address.split('.')[1]
  switch (suffix) {
    case '.eth':
      return 1
    case '.bnb':
      return 56
    case '.arb':
      return 42161
    default:
      return 1
  }
}

function getContractAddr(chainId: number) {
  const id = chainId
  if ([97].includes(id)) {
    return '0xfFB52185b56603e0fd71De9de4F6f902f05EEA23'
  } else if ([1, 3, 4, 5].includes(id)) {
    return '0x00000000000C2E074eC69A0dFb2997BA6C7d2e1e'
  } else if ([56].includes(id)) {
    return '0x08CEd32a7f3eeC915Ba84415e9C07a7286977956'
  } else if ([421613].includes(id)) {
    return '0x1f70fc8de5669eaa8C9ce72257c94500DC5ff2E4'
  } else if ([42161].includes(id)) {
    return '0x4a067EE58e73ac5E4a43722E008DFdf65B2bF348'
  }

  return ''
}
