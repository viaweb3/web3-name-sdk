import logo from './assets/logo.svg'
import { NavLink } from 'react-router-dom'
import { SIDRegisterV3, validateNameV3 } from '@web3-name-sdk/register'
import { createPublicClient, createWalletClient, custom, http } from 'viem'
import { gnosisChiado } from 'viem/chains'

function Home() {
  const handleClick = async () => {
    if (window.ethereum) {
      const publicClient = createPublicClient({
        chain: gnosisChiado,
        transport: http(),
      })
      const walletClient = createWalletClient({
        chain: gnosisChiado,
        transport: custom(window.ethereum),
      })
      const address = await walletClient.getAddresses()
      // get address
      const register = new SIDRegisterV3({
        publicClient,
        walletClient,
        identifier: '274997945614032132263423446017095573970170942858695765128406315342190546',
        controllerAddr: '0xd7b837a0e388b4c25200983bdaa3ef3a83ca86b7',
        resolverAddr: '0x6D3B3F99177FB2A5de7F9E928a9BD807bF7b5BAD',
        // simulateAccount:address[0],
        // simulateValue:'0.1'
      })
      const normalizedLabel = validateNameV3('test124')
      // check if available
      const available = await register.getAvailable(normalizedLabel)
      console.log(available)
      // get price
      const price = await register.getRentPrice(normalizedLabel, 1)
      console.log(price)
      // register for one year
      await register.register(normalizedLabel, address[0], 1, {
          setPrimaryName: false, // 可选参数
      })
    }
  }
  return (
    <>
      <a href='https://www.space.id' target='_blank' rel='noreferrer'>
        <img src={logo} width={500} className='mt-10' />
      </a>
      <p className='text-xl font-bold mt-5'>One-stop Web3 Domain & Identity Platform</p>
      <ul className='mt-5 list-disc text-left'>
        <li>
          <NavLink to='/register' className=''>Register Example</NavLink>
        </li>
        <li>
          <NavLink to='/registerv3' className=''>RegisterV3 Example</NavLink>
        </li>
      </ul>
      <button className='btn btn-primary' onClick={handleClick}>Test</button>
    </>
  )
}

export default Home
