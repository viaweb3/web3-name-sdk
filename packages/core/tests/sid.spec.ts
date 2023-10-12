import chai, { expect } from 'chai'
import chaiAsPromised from 'chai-as-promised'
import { createWeb3Name } from '../src'

chai.use(chaiAsPromised)

describe('SID Name resolving', () => {
  it('it should properly resolve address', async () => {
    const sid = createWeb3Name()
    const domainName = await sid.getDomainName({
      address: '0xb5932a6b7d50a966aec6c74c97385412fb497540',
    })
    expect(domainName).to.be.eq('spaceid.eth')
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
      queryTldList: ['arb'],
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
})
