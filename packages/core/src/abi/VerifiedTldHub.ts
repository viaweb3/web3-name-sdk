export const VerifiedTldHubAbi = [
  {
    inputs: [{ internalType: 'uint256', name: 'chainId', type: 'uint256' }],
    name: 'getChainInfo',
    outputs: [
      {
        components: [
          { internalType: 'uint256', name: 'chainId', type: 'uint256' },
          { internalType: 'string', name: 'defaultRpc', type: 'string' },
          { internalType: 'address', name: 'registry', type: 'address' },
          { internalType: 'address', name: 'sann', type: 'address' },
        ],
        internalType: 'struct VerifiedTldHub.chainInfo',
        name: '',
        type: 'tuple',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'uint256', name: 'chainId', type: 'uint256' }],
    name: 'getChainTlds',
    outputs: [{ internalType: 'string[]', name: '', type: 'string[]' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'string[]', name: 'tlds', type: 'string[]' }],
    name: 'getTldInfo',
    outputs: [
      {
        components: [
          { internalType: 'string', name: 'tld', type: 'string' },
          { internalType: 'uint256', name: 'identifier', type: 'uint256' },
          { internalType: 'uint256', name: 'chainId', type: 'uint256' },
          { internalType: 'string', name: 'defaultRpc', type: 'string' },
          { internalType: 'address', name: 'registry', type: 'address' },
          { internalType: 'address', name: 'sann', type: 'address' },
        ],
        internalType: 'struct VerifiedTldHub.completeTldInfo[]',
        name: '',
        type: 'tuple[]',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'getTlds',
    outputs: [{ internalType: 'string[]', name: '', type: 'string[]' }],
    stateMutability: 'view',
    type: 'function',
  },
] as const
