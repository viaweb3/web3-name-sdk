# @web3-name-sdk/register

## Installation

---

Install @web3-name-sdk/register, alongside peer dependency [Ethers v5](https://www.npmjs.com/package/ethers/v/5.7.2).

```
npm install @web3-name-sdk/register ethers@5.7.2
```

## Example

Register a .bnb domain

```typescript
import SIDRegister from '@web3-name-sdk/register'
import { providers } from 'ethers'

async function registerDomain(label: String) {
  // detect provider
  if (window.ethereum) {
    const provider = new providers.Web3Provider(window.ethereum)
    // switch to bsc
    await provider.send('wallet_switchEthereumChain', [{ chainId: '0x38' }])
    // connect wallet
    await provider.send('eth_requestAccounts', [])
    // get signer
    const signer = provider.getSigner()
    // get address
    const address = await signer.getAddress()
    // init SIDRegister
    const register = new SIDRegister({ signer, chainId: 56 })
    // check if available
    const available = await register.getAvailable(label)
    // get price
    const price = await register.getRentPrice(label, 1)
    // register for one year
    await register.register(label, address, 1, {
      setPrimaryName: true, // set as primary name, default is false,
      referrer: 'test.bnb', // referrer domain, default is null
    })
  }
}
```

Register a .arb domain

```typescript
import SIDRegister from '@web3-name-sdk/register'
import { providers } from 'ethers'

async function registerDomain(label: String) {
  // detect provider
  if (window.ethereum) {
    const provider = new providers.Web3Provider(window.ethereum)
    // switch to arbitrum one
    await provider.send('wallet_switchEthereumChain', [{ chainId: '0xA4B1' }])
    // connect wallet
    await provider.send('eth_requestAccounts', [])
    // get signer
    const signer = provider.getSigner()
    // get address
    const address = await signer.getAddress()
    // init SIDRegister
    const register = new SIDRegister({ signer, chainId: 42161 })
    // check if available
    const available = await register.getAvailable(label)
    // get price
    const price = await register.getRentPrice(label, 1)
    // register for one year
    await register.register(label, address, 1, {
      setPrimaryName: true, // set as primary name, default is false,
      referrer: 'test.bnb', // referrer domain, default is null
    })
  }
}
```

Register a .eth domain

```typescript
import SIDRegister from '@web3-name-sdk/register'
import { providers } from 'ethers'

async function registerEthDomain(label: String) {
  // detect provider
  if (window.ethereum) {
    const provider = new providers.Web3Provider(window.ethereum)
    // switch to bsc
    await provider.send('wallet_switchEthereumChain', [{ chainId: '0x1' }])
    // connect wallet
    await provider.send('eth_requestAccounts', [])
    // get signer
    const signer = provider.getSigner()
    // get address
    const address = await signer.getAddress()
    // init SIDRegister
    const register = new SIDRegister({ signer, chainId: 56 })
    // check if available
    const available = await register.getAvailable(label)
    // get price
    const price = await register.getRentPrice(label, 1)
    // register for one year
    await register.register(label, address, 1, {
      // wait for commit to be valid
      onCommitSuccess: (waitTime) => {
        return new Promise((resolve) => {
          setTimeout(resolve, waitTime * 1000)
        })
      },
    })
  }
}
```

### SIDRegister Interface

``` typescript
/**
  * Get the rent price for a name.
  * @param label
  * @param year number of registration years
  */
async getRentPrice(label: String, year:Number):Promise<BigNumber>
```

``` typescript
/**
 * check if the domain is available for registration
 * @param label
 */

async getAvailable(label: string): Promise<boolean>

```

``` typescript
 /**
 * register a domain
 * @param label
 * @param address the address to register
 * @param year
 * @param options.referrer optional parameter. the referrer domain. only work for .bnb and .arb domain
 * @param options.setPrimaryName optional parameter. register and set the domain as primary name. only work for .bnb and .arb domain
 * @param options.onCommitSuccess optional parameter. callback function when the commitment is successful. only required for .eth domain
 */
async register(label: string, address: string, year: number, options?: RegisterOptions):Promise<string>
```
