import { expect } from 'chai'
import { createSID } from '../src'

describe('SID Name resolving', () => {
  it('it should properly resolve address', async () => {
    const sid = createSID()
    const domainName = await sid.getDomainName('0xb5932a6b7d50a966aec6c74c97385412fb497540')
    expect(domainName).to.be.eq('spaceid.eth')
  }).timeout(10000)
})
