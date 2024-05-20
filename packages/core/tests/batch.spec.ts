import chai, { expect } from 'chai'
import chaiAsPromised from 'chai-as-promised'
import { createWeb3Name } from '../src'

chai.use(chaiAsPromised)

describe('SID Name resolving', () => {

  it('it should properly batch resolve address based on tld', async () => {
    const sid = createWeb3Name()
    const res = await sid.batchGetDomainName({
      addressList: [
        '0xb5932a6b7d50a966aec6c74c97385412fb497540',
        '0xc65BD7BCb3840DE1Be048de380CAC92f0B01b606',
      ],
      queryTldList: ['bnb', 'zeta'],
    })
    expect(res?.at(0)?.domain).to.be.eq('spaceid.bnb')
    expect(res?.at(1)?.domain).to.be.eq('zetans.zeta')
  }).timeout(120_000)
  it('it should properly batch resolve address based on chain ID', async () => {
    const sid = createWeb3Name()
    const res = await sid.batchGetDomainName({
      addressList: [
        '0xb5932a6b7d50a966aec6c74c97385412fb497540',
        '0xc65BD7BCb3840DE1Be048de380CAC92f0B01b606',
      ],
      queryChainIdList: [56, 7000],
    })
    expect(res?.at(0)?.domain).to.be.eq('spaceid.bnb')
    expect(res?.at(1)?.domain).to.be.eq('zetans.zeta')
  }).timeout(120_000)
})
