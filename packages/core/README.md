# web3-name-sdk

Web3 Name SDK is an universal web3 identity solution for name resolution. Developers can easily get access to **.eth, .bnb, .arb, .lens, .crypto** names and more.

## Get Started

Developers can resolve web3 domain name or reverse resolve address with web3 name SDK with zero configuration.

### Install

`npm install @web3-name-sdk/core`

### Quick Start

#### 1. Setup client

``` typescript
import { createWeb3Name } from '@web3-name-sdk/core'

const web3Name = createWeb3Name()
```

#### 2. Resolve a domain name

You can get address from domain name with a single request:

``` typescript
const address = await web3name.getAddress('spaceid.bnb')
// expect: '0xb5932a6b7d50a966aec6c74c97385412fb497540'

const address = await web3name.getAddress('bts_official.lens')
// expect: '0xd80efa68b50d21e548b9cdb092ebc6e5bca113e7'

const address = await web3name.getAddress('beresnev.crypto')
// expect: '0x6ec0deed30605bcd19342f3c30201db263291589'
```

#### 3. Resolve an address

There are optional parameters in the method to select your target chain or TLD (top-level domain).

By providing chain IDs, you can resolve addresses on selected chains and get an available domain name from all TLDs deployed on these chains.

``` typescript
// Resolve an address from BNB Chain
const name = await web3name.getDomainName({
  address: '0xb5932a6b7d50a966aec6c74c97385412fb497540',
  queryChainIdList: [56],
})
// expect: spaceid.bnb
```

By providing TLDs, address can be resolved from the selected TLDs and get an available TLD primary name.

``` typescript
// Resolve an address from BNB Chain
const name = await web3name.getDomainName({
  address: '0xb5932a6b7d50a966aec6c74c97385412fb497540',
  queryTldList: ['arb'],
})
// expect: spaceid.arb
```

#### 4. Record

Domain text records can be fetched by providing domain name and the key. For example, the avatar record of `spaceid.bnb` is returned from this method given key name `avatar`:

``` typescript
const record = await sid.getDomainRecord({ name: 'spaceid.bnb', key: 'avatar' })
```
