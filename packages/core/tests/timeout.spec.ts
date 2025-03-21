import { createWeb3Name } from '@web3-name-sdk/core'
import { expect } from 'chai'

describe('Timeout Tests', function () {
  let sdk = createWeb3Name({
    timeout: 5000,
  })

  it('getAddress should timeout after 10s', async function () {
    this.timeout(50000)
    try {
      await sdk.getAddress('raygen.bnb', {
        rpcUrl: 'https://httpstat.us/200?sleep=50000',
        timeout: 10000,
      })
      expect.fail('Expected timeout error was not thrown')
    } catch (error: any) {
      expect(error.message).to.include('timed out')
    }
  })

  it('getMetadata should timeout after 10s', async function () {
    this.timeout(50000)
    try {
      await sdk.getMetadata({
        name: 'raygen.bnb',
        rpcUrl: 'https://httpstat.us/200?sleep=50000',
        timeout: 10000,
      })
      expect.fail('Expected timeout error was not thrown')
    } catch (error: any) {
      expect(error.message).to.include('timed out')
    }
  })

  it('getContentHash should timeout after 10s', async function () {
    this.timeout(50000)
    try {
      await sdk.getContentHash({
        name: 'raygen.bnb',
        rpcUrl: 'https://httpstat.us/200?sleep=50000',
        timeout: 10000,
      })
      expect.fail('Expected timeout error was not thrown')
    } catch (error: any) {
      expect(error.message).to.include('timed out')
    }
  })

  it('getDomainName should timeout after 10s', async function () {
    this.timeout(50000)
    try {
      await sdk.getDomainName({
        address: '0x2886D6792503e04b19640C1f1430d23219AF177F',
        queryChainId: 56,
        rpcUrl: 'https://httpstat.us/200?sleep=50000',
        timeout: 10000,
      })
      expect.fail('Expected timeout error was not thrown')
    } catch (error: any) {
      expect(error.message).to.include('timed out')
    }
  })

  it('getDomainAvatar should timeout after 10s', async function () {
    this.timeout(50000)
    try {
      await sdk.getDomainAvatar({
        name: 'raygen.bnb',
        key: '',
        rpcUrl: 'https://httpstat.us/200?sleep=50000',
        timeout: 10000,
      })
      expect.fail('Expected timeout error was not thrown')
    } catch (error: any) {
      expect(error.message).to.include('timed out')
    }
  })

  it('getDomainNames should timeout after 10s', async function () {
    this.timeout(50000)
    try {
      await sdk.getDomainNames({
        address: '0x2886D6792503e04b19640C1f1430d23219AF177F',
        queryChainId: 56,
        rpcUrl: 'https://httpstat.us/200?sleep=50000',
        timeout: 10000,
      })
      expect.fail('Expected timeout error was not thrown')
    } catch (error: any) {
      expect(error.message).to.include('timed out')
    }
  })

  it('getDomainRecord should timeout after 10s', async function () {
    this.timeout(50000)
    try {
      await sdk.getDomainRecord({
        name: 'raygen.bnb',
        key: '56',
        rpcUrl: 'https://httpstat.us/200?sleep=50000',
        timeout: 10000,
      })
      expect.fail('Expected timeout error was not thrown')
    } catch (error: any) {
      expect(error.message).to.include('timed out')
    }
  })

  it('batchGetDomainName should timeout after 10s', async function () {
    this.timeout(50000)
    try {
      await sdk.batchGetDomainName({
        addressList: ['0x2886D6792503e04b19640C1f1430d23219AF177F'],
        queryChainIdList: [56],
        rpcUrl: 'https://httpstat.us/200?sleep=50000',
        timeout: 10000,
      })
      expect.fail('Expected timeout error was not thrown')
    } catch (error: any) {
      expect(error.message).to.include('timed out')
    }
  })

  it('batchGetDomainNameByTld should timeout after 10s', async function () {
    this.timeout(50000)
    try {
      await sdk.batchGetDomainNameByTld({
        addressList: ['0x2886D6792503e04b19640C1f1430d23219AF177F'],
        queryTld: 'bnb',
        rpcUrl: 'https://httpstat.us/200?sleep=50000',
        timeout: 10000,
      })
      expect.fail('Expected timeout error was not thrown')
    } catch (error: any) {
      expect(error.message).to.include('timed out')
    }
  })

  it('batchGetDomainNameByChainId should timeout after 10s', async function () {
    this.timeout(50000)
    try {
      await sdk.batchGetDomainNameByChainId({
        addressList: ['0x2886D6792503e04b19640C1f1430d23219AF177F'],
        queryChainId: 56,
        rpcUrl: 'https://httpstat.us/200?sleep=50000',
        timeout: 10000,
      })
      expect.fail('Expected timeout error was not thrown')
    } catch (error: any) {
      expect(error.message).to.include('timed out')
    }
  })
})
