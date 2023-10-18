import chai, { expect } from 'chai'
import chaiAsPromised from 'chai-as-promised'
import { createWeb3Name } from '../src'
import { createInjName } from '../src/injName'
import { createSeiName } from '../src/seiName'
import { createSolName } from '../src/solName'

chai.use(chaiAsPromised)

describe('SID V3 Name resolving', () => {
  it('it should properly resolve domain', async () => {
    const web3Name = createWeb3Name()
    const address = await web3Name.getAddress('foryou.kkk1')
    expect(address).to.be.not.null
  }).timeout(10000)

  it('it should properly resolve address', async () => {
    const web3Name = createWeb3Name()
    const domain = await web3Name.getDomainName({
      queryChainIdList: [97],
      address: '0x2886D6792503e04b19640C1f1430d23219AF177F',
    })
    expect(domain).to.be.not.null
  }).timeout(10000)
  it('it should properly get text record', async () => {
    const web3Name = createWeb3Name()
    const record = await web3Name.getDomainRecord({ name: 'wagmi-dev.eth', key: 'avatar' })
    expect(record).to.be.not.null
  }).timeout(10000)

  it('it should properly resolve metadata', async () => {
    const web3Name = createWeb3Name()
    const metadata = await web3Name.getMetadata({ name: 'foryou.kkk1' })
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
    expect(domain).to.be.eq('testtest.inj')
  }).timeout(10000)

  it('it should properly resolve .gno domains', async () => {
    const web3Name = createWeb3Name()
    const domain = await web3Name.getAddress('morning.gno')

    expect(domain).to.be.not.null
  }).timeout(10000)

  it('it should properly resolve .gno address', async () => {
    const web3Name = createWeb3Name()
    const domain = await web3Name.getDomainName({
      address: '0x8031a6dfc7709066A13DDC22A38bD5a6Fc71EE02',
      queryChainIdList: [10200],
    })

    expect(domain).to.be.eq('morning.gno')
  }).timeout(10000)
})
