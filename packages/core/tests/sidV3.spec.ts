import chai, { expect } from 'chai'
import chaiAsPromised from 'chai-as-promised'
import { createWeb3Name } from '../src'

chai.use(chaiAsPromised)

describe('SID V3 Name resolving', () => {
  it('it should properly resolve domain', async () => {
    const sid = createWeb3Name()
    const address = await sid.getAddress('gigic.woaf8')
    expect(address).to.be.not.null
  }).timeout(10000)

  it('it should properly resolve address', async () => {
    const sid = createWeb3Name()
    const domain = await sid.getDomainName({
      queryChainIdList: [97],
      address: '0x2886D6792503e04b19640C1f1430d23219AF177F',
    })
    console.log(domain)
    expect(domain).to.be.not.null
  }).timeout(10000)
  it('it should properly get text record', async () => {
    const sid = createWeb3Name()
    const record = await sid.getDomainRecord({ name: 'wagmi-dev.eth', key: 'avatar' })
    console.log(record)
    expect(record).to.be.not.null
  }).timeout(10000)
})
