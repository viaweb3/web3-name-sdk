import chai, { expect } from 'chai'
import chaiAsPromised from 'chai-as-promised'
import { createWeb3Name } from '../src'
import { validateName } from '../src/utils'

chai.use(chaiAsPromised)

describe('SID Name resolving', () => {
  // it('it should properly validate', async () => {
  //   const validate2 = validateName('1.bnb')
  //   expect(validate2).to.be.null
  // })

  // it('it should properly validate', async () => {
  //   const validate = validateName('1.zeta')
  //   expect(validate).to.be.eq('1.zeta')
  // })

  it('it should properly resolve address', async () => {
    const sid = createWeb3Name()

    const domainName = await sid.getMetadata({
      name: '966905.bnb',
    })

    expect(domainName).to.be.not.null
  }).timeout(10000)

  it('it should properly resolve address', async () => {
    const sid = createWeb3Name()

    const domainName = await sid.getAddress('olddomain.eth')
    expect(domainName).to.be.eq('0xd03D02A3490218123Da4b4994538Af9EA2Ee5D05')
  }).timeout(10000)
  it('it should properly resolve .lens address', async () => {
    const sid = createWeb3Name()
    const domainName = await sid.getDomainName({
      address: '0xd80EFA68b50D21E548B9Cdb092eBc6e5BcA113E7',
      queryTldList: ['lens'],
    })
    expect(domainName).to.be.eq('bts_official.lens')
  }).timeout(10000)
  it('it should properly resolve address based on chain ID', async () => {
    const sid = createWeb3Name()
    const domainName = await sid.getDomainName({
      address: '0xb5932a6b7d50a966aec6c74c97385412fb497540',
      queryChainIdList: [56],
      // queryTldList: ['bnb'],
    })
    expect(domainName).to.be.eq('spaceid.bnb')
  }).timeout(10000)
  it('it should properly resolve address based on tld', async () => {
    const sid = createWeb3Name()
    const domainName = await sid.getDomainName({
      address: '0xb5932a6b7d50a966aec6c74c97385412fb497540',
      queryTldList: ['bnb'],
    })
    expect(domainName).to.be.eq('spaceid.bnb')
  }).timeout(10000)
  it('it should properly resolve a .bnb domain name', async () => {
    const sid = createWeb3Name()
    const address = await sid.getAddress('spaceid.bnb')
    expect(address?.toLowerCase()).to.be.eq('0xb5932a6b7d50a966aec6c74c97385412fb497540')
  }).timeout(10000)
  it('it should properly resolve a .arb domain name', async () => {
    const sid = createWeb3Name()
    const address = await sid.getAddress('spaceid.arb')
    expect(address?.toLowerCase()).to.be.eq('0xb5932a6b7d50a966aec6c74c97385412fb497540')
  }).timeout(10000)
  it('it should properly resolve a .lens domain name', async () => {
    const sid = createWeb3Name()
    const address = await sid.getAddress('bts_official.lens')
    expect(address?.toLowerCase()).to.be.eq('0xd80efa68b50d21e548b9cdb092ebc6e5bca113e7')
  }).timeout(10000)
  it('it should properly resolve .crypto domain', async () => {
    const sid = createWeb3Name()
    const domainName = await sid.getAddress('beresnev.crypto')
    expect(domainName).to.be.eq('0x6ec0deed30605bcd19342f3c30201db263291589')
  }).timeout(10000)
  it('it should throw an error with none .crypto address', async () => {
    const sid = createWeb3Name()
    const domainName = await sid.getDomainName({
      address: '0x6ec0deed30605bcd19342f3c30201db263291589',
      queryTldList: ['crypto'],
    })
    expect(domainName).to.be.null
  }).timeout(10000)
  it('it should throw error with invalid .bnb domain name', async () => {
    const sid = createWeb3Name()
    expect(sid.getAddress('xz.bnb')).to.rejectedWith(Error)
  })

  it('it should properly resolve address with custom RPC', async () => {
    const sid = createWeb3Name()

    const domainName = await sid.getAddress('registry.arb', {
      rpcUrl: 'https://arb1.arbitrum.io/rpc',
    })

    expect(domainName).to.be.not.null
  }).timeout(10000)

  it('it should properly fetch metadata with custom RPC', async () => {
    const sid = createWeb3Name()

    const domainName = await sid.getMetadata({
      name: 'registry.arb',
      rpcUrl: 'https://arb1.arbitrum.io/rpc',
    })

    expect(domainName).to.be.not.null
  }).timeout(10000)

  it('it should properly resolve address with custom RPC', async () => {
    const sid = createWeb3Name()

    const domainName = await sid.getDomainName({
      address: '0x8d27d6235d9d8EFc9Eef0505e745dB67D5cD2918',
      rpcUrl: 'https://arb1.arbitrum.io/rpc',
    })

    expect(domainName).to.be.not.null
  }).timeout(10000)
})
