import chai, { expect } from 'chai'
import chaiAsPromised from 'chai-as-promised'
import { createWeb3Name } from '../src'

chai.use(chaiAsPromised)

describe('SID V3 Name resolving', () => {
  it('it should properly resolve address', async () => {
    const sid = createWeb3Name()
    const address = await sid.getAddress('gigic.woaf8')
    expect(address).to.be.not.null
  }).timeout(10000)
})
