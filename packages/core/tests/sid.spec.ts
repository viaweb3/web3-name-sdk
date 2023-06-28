import chai, { expect } from 'chai'
import chaiAsPromised from 'chai-as-promised'
import { createSID } from '../src'

chai.use(chaiAsPromised)

describe('SID Name resolving', () => {
  it('it should properly resolve address', async () => {
    const sid = createSID()
    const domainName = await sid.getDomainName('0xb5932a6b7d50a966aec6c74c97385412fb497540')
    expect(domainName).to.be.eq('spaceid.eth')
  }).timeout(10000)

  it('it should properly resolve .lens address', async () => {
    const sid = createSID()
    const domainName = await sid.getDomainName('0xd80EFA68b50D21E548B9Cdb092eBc6e5BcA113E7')
    expect(domainName).to.be.eq('bts_official.lens')
  }).timeout(10000)

  it('it should properly resolve address based on chain ID', async () => {
    const sid = createSID()
    const domainName = await sid.getDomainName('0xb5932a6b7d50a966aec6c74c97385412fb497540', 56)
    expect(domainName).to.be.eq('spaceid.bnb')
  }).timeout(10000)

  it('it should properly resolve a .bnb domain name', async () => {
    const sid = createSID()
    const address = await sid.getAddress('spaceid.bnb')
    expect(address?.toLowerCase()).to.be.eq('0xb5932a6b7d50a966aec6c74c97385412fb497540')
  }).timeout(10000)

  it('it should properly resolve a .arb domain name', async () => {
    const sid = createSID()
    const address = await sid.getAddress('spaceid.arb')
    expect(address?.toLowerCase()).to.be.eq('0xb5932a6b7d50a966aec6c74c97385412fb497540')
  }).timeout(10000)

  it('it should properly resolve a .lens domain name', async () => {
    const sid = createSID()
    const address = await sid.getAddress('bts_official.lens')
    expect(address?.toLowerCase()).to.be.eq('0xd80efa68b50d21e548b9cdb092ebc6e5bca113e7')
  }).timeout(10000)

  it('it should throw error with invalid .bnb domain name', async () => {
    const sid = createSID()
    expect(sid.getAddress('xz.bnb')).to.rejectedWith(Error)
  })
})
