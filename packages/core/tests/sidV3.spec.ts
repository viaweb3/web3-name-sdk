import chai, { expect } from 'chai'
import chaiAsPromised from 'chai-as-promised'
import { createInjName, createSeiName, createSolName, createWeb3Name } from '../src'

chai.use(chaiAsPromised)

describe('SID V3 Name resolving', () => {
  it('it should properly resolve domain', async () => {
    const web3Name = createWeb3Name()
    const address = await web3Name.getAddress('gigic.woaf8')
    expect(address).to.be.not.null
  }).timeout(10000)

  it('it should properly resolve address', async () => {
    const web3Name = createWeb3Name()
    const domain = await web3Name.getDomainName({
      queryChainIdList: [97],
      address: '0x2886D6792503e04b19640C1f1430d23219AF177F',
    })
    console.log(domain)
    expect(domain).to.be.not.null
  }).timeout(10000)
  it('it should properly get text record', async () => {
    const web3Name = createWeb3Name()
    const record = await web3Name.getDomainRecord({ name: 'wagmi-dev.eth', key: 'avatar' })
    console.log(record)
    expect(record).to.be.not.null
  }).timeout(10000)

  it('it should properly resolve metadata', async () => {
    const web3Name = createWeb3Name()
    const metadata = await web3Name.getMetadata({ name: 'foryou.kkk1' })
    console.log(metadata)
    expect(metadata).to.be.not.null
  }).timeout(10000)

  it('it should properly resolve address using SNS', async () => {
    const web3Name = createSolName()
    const domain = await web3Name.getDomainName({
      address: 'Crf8hzfthWGbGbLTVCiqRqV5MVnbpHB1L9KQMd6gsinb',
    })
    expect(domain).to.be.eq('bonfida')
  }).timeout(10000)

  it('it should properly resolve address using Sei Name', async () => {
    const web3Name = createSeiName()
    const domain = await web3Name.getDomainName({
      address: 'sei1tmew60aj394kdfff0t54lfaelu3p8j8lz93pmf',
    })
    expect(domain).to.be.eq('allen.sei')
  }).timeout(10000)

  it('it should properly resolve address using Inj Name', async () => {
    const web3Name = createInjName()
    const domain = await web3Name.getDomainName({
      address: 'inj10zvhv2a2mam8w7lhy96zgg2v8d800xcs7hf2tf',
    })

    console.log(domain)
    expect(domain).to.be.eq('testtest.inj')
  }).timeout(10000)
})
