import { createWeb3Name } from '@web3-name-sdk/core'
import { createSeiName } from '@web3-name-sdk/core/seiName'
import { useEffect, useState } from 'react'
import './App.css'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'

function App() {
  const [address, setAddress] = useState('')
  useEffect(() => {
    const web3Name = createWeb3Name()
    web3Name.getAddress('allen.bnb').then((e) => {
      setAddress(e ?? 'not found')
    })

    const seiName = createSeiName()
    seiName.getAddress({ name: 'allen.sei' }).then((e) => {
      console.log('seiName', e)
    })
  }, [])
  return (
    <>
      <div>
        <a href="https://vitejs.dev" target="_blank">
          <img src={viteLogo} className="logo" alt="Vite logo" />
        </a>
        <a href="https://react.dev" target="_blank">
          <img src={reactLogo} className="logo react" alt="React logo" />
        </a>
      </div>
      <h1>Vite + React</h1>
      <div className="card">[allen.bnb] address is {address}</div>
      <p className="read-the-docs">Click on the Vite and React logos to learn more</p>
    </>
  )
}

export default App
