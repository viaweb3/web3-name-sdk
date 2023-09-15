import chai, { expect } from 'chai'
import chaiAsPromised from 'chai-as-promised'
import { createSID } from '../src'
import { namehash } from 'viem'

chai.use(chaiAsPromised)

describe('SID Name resolving', () => {
  it('it should properly resolve address', async () => {
    const sid = createSID()
    const domainName = await sid.getAddress('build.woaf8')
    expect(domainName).to.be.eq('spaceid.eth')
  }).timeout(10000)
})
