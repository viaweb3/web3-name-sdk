import { createWeb3Name } from '@web3-name-sdk/core'
import { createSeiName } from '@web3-name-sdk/core/seiName'
import { createInjName } from '@web3-name-sdk/core/injName'
import { createSolName } from '@web3-name-sdk/core/solName'
import { useState } from 'react'
import './App.css'

const TIMEOUT_PRESETS = {
  veryShort: 100, // Intentionally short to test timeout
  normal: 5000, // Normal timeout (5s)
  long: 15000, // Long timeout (15s)
  invalid: -1, // Invalid timeout value
}

type Protocol = 'EVM' | 'Solana' | 'Sei' | 'Injective'
type Method = 'getAddress' | 'getDomainName' | 'getMetadata' | 'getContentHash'

type TestCase = {
  title: string
  domainName: string
  address: string
  protocol: Protocol
  description: string
  rpcUrl?: string
}

const TEST_CASES: Record<string, TestCase> = {
  evm: {
    title: 'EVM Test',
    domainName: 'vitalik.eth',
    address: '0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045',
    protocol: 'EVM',
    description: 'Testing EVM name resolution with timeout parameter',
  },
  evmFake: {
    title: 'EVM Fake RPC Test',
    domainName: 'vitalik.eth',
    address: '0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045',
    protocol: 'EVM',
    description: 'Testing EVM with a non-existent RPC to test timeout',
    rpcUrl: 'https://fake-rpc-endpoint.example.com',
  },
  arb: {
    title: 'Arbitrum Test',
    domainName: 'registry.arb',
    address: '0x8d27d6235d9d8EFc9Eef0505e745dB67D5cD2918',
    protocol: 'EVM',
    description: 'Testing Arbitrum name resolution',
  },
  bnb: {
    title: 'BNB Chain Test',
    domainName: 'spaceid.bnb',
    address: '0xb5932a6b7d50a966aec6c74c97385412fb497540',
    protocol: 'EVM',
    description: 'Testing BNB Chain name resolution',
  },
  zeta: {
    title: 'ZETA Chain Test',
    domainName: 'allen.zeta',
    address: '0x84A6B518D592d6e4b8f1C00bc69F97439564f90B',
    protocol: 'EVM',
    description: 'Testing ZETA Chain name resolution',
  },
  lens: {
    title: 'Lens Protocol Test',
    domainName: 'bts_official.lens',
    address: '0xd80EFA68b50D21E548B9Cdb092eBc6e5BcA113E7',
    protocol: 'EVM',
    description: 'Testing Lens Protocol name resolution',
  },
  crypto: {
    title: 'Unstoppable Domains Test',
    domainName: 'beresnev.crypto',
    address: '0x6ec0deed30605bcd19342f3c30201db263291589',
    protocol: 'EVM',
    description: 'Testing Unstoppable Domains name resolution',
  },
  solana: {
    title: 'Solana Test',
    domainName: 'bonfida.sol',
    address: 'Crf8hzfthWGbGbLTVCiqRqV5MVnbpHB1L9KQMd6gsinb',
    protocol: 'Solana',
    description: 'Testing Solana name resolution with timeout parameter',
  },
  sei: {
    title: 'Sei Test',
    domainName: 'allen.sei',
    address: 'sei1tmew60aj394kdfff0t54lfaelu3p8j8lz93pmf',
    protocol: 'Sei',
    description: 'Testing Sei name resolution with timeout parameter',
  },
  injective: {
    title: 'Injective Test',
    domainName: 'allen.inj',
    address: 'inj1xw0d9lcjjnqq4v3lqk8ek9r0cxwpr4s8dxy44h',
    protocol: 'Injective',
    description: 'Testing Injective name resolution with timeout parameter',
  },
}

function App() {
  const [currentTimeout, setCurrentTimeout] = useState(TIMEOUT_PRESETS.normal)
  const [currentTest, setCurrentTest] = useState<TestCase>(TEST_CASES.evm)
  const [currentMethod, setCurrentMethod] = useState<Method>('getAddress')
  const [result, setResult] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [elapsedTime, setElapsedTime] = useState(0)

  const runTest = async () => {
    setLoading(true)
    setError('')
    setResult('')
    setElapsedTime(0)
    const startTime = Date.now()

    try {
      let resultValue = null

      switch (currentTest.protocol) {
        case 'EVM': {
          const web3Name = createWeb3Name({ rpcUrl: currentTest.rpcUrl })
          switch (currentMethod) {
            case 'getAddress':
              resultValue = await web3Name.getAddress(currentTest.domainName, { timeout: currentTimeout })
              break
            case 'getDomainName':
              resultValue = await web3Name.getDomainName({ address: currentTest.address, timeout: currentTimeout })
              break
            case 'getMetadata':
              resultValue = await web3Name.getMetadata({ name: currentTest.domainName, timeout: currentTimeout })
              break
            case 'getContentHash':
              resultValue = await web3Name.getContentHash({ name: currentTest.domainName, timeout: currentTimeout })
              break
          }
          break
        }
        case 'Solana': {
          const solName = createSolName({ timeout: currentTimeout })
          switch (currentMethod) {
            case 'getAddress':
              resultValue = await solName.getAddress({ name: currentTest.domainName, timeout: currentTimeout })
              break
            case 'getDomainName':
              resultValue = await solName.getDomainName({ address: currentTest.address, timeout: currentTimeout })
              break
          }
          break
        }
        case 'Sei': {
          const seiName = createSeiName({ timeout: currentTimeout })
          switch (currentMethod) {
            case 'getAddress':
              resultValue = await seiName.getAddress({ name: currentTest.domainName, timeout: currentTimeout })
              break
            case 'getDomainName':
              resultValue = await seiName.getDomainName({ address: currentTest.address, timeout: currentTimeout })
              break
          }
          break
        }
        case 'Injective': {
          const injName = createInjName({ timeout: currentTimeout })
          switch (currentMethod) {
            case 'getAddress':
              resultValue = await injName.getAddress({ name: currentTest.domainName, timeout: currentTimeout })
              break
            case 'getDomainName':
              resultValue = await injName.getDomainName({ address: currentTest.address, timeout: currentTimeout })
              break
          }
          break
        }
      }

      const endTime = Date.now()
      setElapsedTime(endTime - startTime)
      setResult(resultValue ? JSON.stringify(resultValue, null, 2) : 'not found')
    } catch (err) {
      const endTime = Date.now()
      setElapsedTime(endTime - startTime)
      setError(err instanceof Error ? err.message : 'Unknown error occurred')
    } finally {
      setLoading(false)
    }
  }

  // Get available methods for current protocol
  const getAvailableMethods = (protocol: Protocol): Method[] => {
    switch (protocol) {
      case 'EVM':
        return ['getAddress', 'getDomainName', 'getMetadata', 'getContentHash']
      case 'Solana':
      case 'Sei':
      case 'Injective':
        return ['getAddress', 'getDomainName']
      default:
        return ['getAddress']
    }
  }

  return (
    <div className="dark-theme-container">
      <div className="header">
        <h1>Web3Name SDK Testing</h1>
      </div>

      {/* Protocol selection */}
      <div className="card test-card">
        <h3>Select Protocol</h3>
        <div className="test-select">
          {Object.values(TEST_CASES).map((testCase) => (
            <button
              key={testCase.title}
              onClick={() => {
                setCurrentTest(testCase)
                // Reset method if not available in new protocol
                if (!getAvailableMethods(testCase.protocol).includes(currentMethod)) {
                  setCurrentMethod(getAvailableMethods(testCase.protocol)[0])
                }
              }}
              className={currentTest.title === testCase.title ? 'active' : ''}
            >
              {testCase.title}
            </button>
          ))}
        </div>
        <div className="test-description">
          <p>
            <strong>Current Test:</strong> {currentTest.title}
          </p>
          <p>{currentTest.description}</p>
          <p>
            <strong>Domain:</strong> {currentTest.domainName}
          </p>
          <p>
            <strong>Address:</strong> {currentTest.address}
          </p>
          {currentTest.rpcUrl && (
            <p>
              <strong>RPC URL:</strong> {currentTest.rpcUrl}
            </p>
          )}
        </div>
      </div>

      {/* Method selection */}
      <div className="card method-card">
        <h3>Select Method</h3>
        <div className="method-select">
          {getAvailableMethods(currentTest.protocol).map((method) => (
            <button
              key={method}
              onClick={() => setCurrentMethod(method)}
              className={currentMethod === method ? 'active' : ''}
            >
              {method}
            </button>
          ))}
        </div>
      </div>

      {/* Timeout settings */}
      <div className="card timeout-card">
        <h3>Select Timeout Duration</h3>
        <div className="timeout-select">
          {Object.entries(TIMEOUT_PRESETS).map(([name, value]) => (
            <button
              key={name}
              onClick={() => setCurrentTimeout(value)}
              className={currentTimeout === value ? 'active' : ''}
            >
              {name} ({value}ms)
            </button>
          ))}
        </div>
        <div className="actions">
          <button className="primary" onClick={runTest} disabled={loading}>
            {loading ? 'Testing...' : `Run ${currentMethod} with ${currentTimeout}ms Timeout`}
          </button>
        </div>
      </div>

      {/* Test results */}
      <div className="card result-card">
        <h3>Test Results</h3>
        {loading && (
          <div className="loading">
            <div className="spinner"></div>
            <p>Request in progress...</p>
          </div>
        )}
        {error && (
          <div className="error">
            <h4>❌ Error</h4>
            <p>{error}</p>
            <p>Request time: {elapsedTime}ms</p>
          </div>
        )}
        {!error && result && (
          <div className="success">
            <h4>✅ Success</h4>
            <div className="result-content">
              <pre>{result}</pre>
              <p>Request time: {elapsedTime}ms</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default App
