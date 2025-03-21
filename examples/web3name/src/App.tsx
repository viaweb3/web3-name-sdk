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
  evmSlow: {
    title: 'EVM Slow RPC Test',
    domainName: 'vitalik.eth',
    address: '0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045',
    protocol: 'EVM',
    description: 'Testing EVM with a slow RPC to verify timeout',
    rpcUrl: 'https://eth-mainnet.nodereal.io/v1/1659dfb40aa24bbb8153a677b98064d7',
  },
  evmFake: {
    title: 'EVM Fake RPC Test',
    domainName: 'vitalik.eth',
    address: '0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045',
    protocol: 'EVM',
    description: 'Testing EVM with a non-existent RPC to test timeout',
    rpcUrl: 'https://fake-rpc-endpoint.example.com',
  },
  solana: {
    title: 'Solana Test',
    domainName: 'bonfida.sol',
    address: '9qvG1zUp8xF1Bi4m6UdRNby1BAAuaDrUxSpv4CmRRMjL',
    protocol: 'Solana',
    description: 'Testing Solana name resolution with timeout parameter',
  },
  sei: {
    title: 'Sei Test',
    domainName: 'allen.sei',
    address: 'sei1g9gf07p3v33j4dn988d99nwnf3pxpxj8xvvq6d',
    protocol: 'Sei',
    description: 'Testing Sei name resolution with timeout parameter',
  },
  injective: {
    title: 'Injective Test',
    domainName: 'allen.inj',
    address: 'inj1g9gf07p3v33j4dn988d99nwnf3pxpxj8n4c5v2',
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
        <h1>Web3Name SDK Timeout Testing</h1>
        <p className="description">
          Testing timeout functionality for EVM, Solana, Sei, and Injective protocols. Each protocol supports timeout
          both during initialization and method calls.
        </p>
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
