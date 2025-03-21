import { createWeb3Name, createPaymentIdName } from '../../../packages/core'
import { useEffect, useState } from 'react'
import './App.css'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'

function App() {
  const [domain, setDomain] = useState('') // 用户输入的域名
  const [chainId, setChainId] = useState('') // 用户输入的 chainId
  const [address, setAddress] = useState('') // 查询结果
  const [loading, setLoading] = useState(false) // 加载状态

  useEffect(() => {
    const handleLookup = async () => {
      if (!domain) {
        setAddress('')
        return
      }

      setLoading(true)
      try {
        const web3Name = createWeb3Name()
        const payMentIdName = createPaymentIdName()

        const parsedChainId = chainId ? parseInt(chainId, 10) : 1 // 默认使用 1
        const res = domain.includes('@')
          ? await payMentIdName.getAddress({ name: domain, chainId: parsedChainId })
          : await web3Name.getAddress(domain)

        setAddress(res ?? 'Notfound')
      } catch (error) {
        setAddress('Failed')
        console.error(error)
      }
      setLoading(false)
    }

    // 防抖（用户停止输入 500ms 后再查询）
    const timeout = setTimeout(() => {
      handleLookup()
    }, 500)

    return () => clearTimeout(timeout)
  }, [domain, chainId]) // 监听 chainId 变化，实时更新查询

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

      <div className="card">
        <input
          type="text"
          placeholder="search"
          value={domain}
          onChange={(e) => setDomain(e.target.value)}
          style={{ padding: '8px', fontSize: '16px', width: '250px', marginBottom: '10px' }}
        />
      </div>

      <div className="card">
        <input
          type="number"
          placeholder=" Chain ID（default 1）"
          value={chainId}
          onChange={(e) => setChainId(e.target.value)}
          style={{ padding: '8px', fontSize: '16px', width: '250px', marginBottom: '10px' }}
        />
      </div>

      <div style={{ fontSize: '18px' }}>
        {loading ? 'search...' : domain ? `[${domain}] (Chain ID: ${chainId || 1}) address: ${address}` : 'search'}
      </div>

      <p className="read-the-docs">Click on the Vite and React logos to learn more</p>
    </>
  )
}

export default App