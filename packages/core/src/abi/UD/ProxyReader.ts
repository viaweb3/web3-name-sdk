export const proxyReaderAbi = [
  {
    inputs: [
      { internalType: 'string[]', name: 'keys', type: 'string[]' },
      { internalType: 'uint256', name: 'tokenId', type: 'uint256' },
    ],
    name: 'getMany',
    outputs: [{ internalType: 'string[]', name: 'values', type: 'string[]' }],
    stateMutability: 'view',
    type: 'function',
  },
] as const
