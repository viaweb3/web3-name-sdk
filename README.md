# web3-name-sdk

Web3 Name SDK is an universal web3 identity solution for domain name resolution. Developers can easily get access to **.eth, .bnb, .arb, .lens, .crypto** names and more.

## Get Started

Developers can resolve web3 domain name or reverse resolve address with web3 name SDK with zero configuration.

### Install

`npm install @web3-name-sdk/core viem`

If you are using `next.js`, please add the following configuration in your `next.config.js` in order to transpile commonjs dependencies:

```typescript
const nextConfig = {
  transpilePackages: ['@web3-name-sdk/core'],
}
```

### Quick Start

#### 1. Setup client

```typescript
import { createWeb3Name } from '@web3-name-sdk/core'

const web3Name = createWeb3Name()
```

#### 2. Resolve a domain name

You can get address from domain name with a single request:

```typescript
const address = await web3name.getAddress('spaceid.bnb')
// expect: '0xb5932a6b7d50a966aec6c74c97385412fb497540'

const address = await web3name.getAddress('bts_official.lens')
// expect: '0xd80efa68b50d21e548b9cdb092ebc6e5bca113e7'

const address = await web3name.getAddress('beresnev.crypto')
// expect: '0x6ec0deed30605bcd19342f3c30201db263291589'

const address = await web3name.getAddress('registry.gno')
// expect: '0x2886D6792503e04b19640C1f1430d23219AF177F'
```

##### Multichain address resolution

Domain resolution for other chains can be provided by adding `coinType` param to `getAddress()`.

```typescript
import { convertEVMChainIdToCoinType } from '@ensdomains/address-encoder'
const address = await web3name.getAddress('gnome.gno', { coinType: convertEVMChainIdToCoinType(1) })
// expect: 0x4348d45967552d0176d465170b7375ed22dc627b
```

#### 3. Resolve an address

There are optional parameters in the method to select your target chain or TLD (top-level domain).

By providing chain IDs, you can resolve addresses on selected chains and get an available domain name from all TLDs deployed on these chains.

```typescript
// Resolve an address from Gnosis Chiado
const name = await web3name.getDomainName({
  address: '0x2886D6792503e04b19640C1f1430d23219AF177F',
  queryChainIdList: [10200],
})
// expect: lydia.gno
```

By providing TLDs, address can be resolved from the selected TLDs and get an available TLD primary name.

```typescript
// Resolve an address from .gno TLD
const name = await web3name.getDomainName({
  address: '0x2886D6792503e04b19640C1f1430d23219AF177F',
  queryTldList: ['gno'],
})
// expect: genome.gno
```

#### 4. Batch resolve addresses

You need to provide your target chain client and then provide optional parameters in the method. The method returns an list containing the address and its corresponding domain.

```typescript
const res = await web3Name.batchGetDomainNameByTld({
  addressList: ['0x2886d6792503e04b19640c1f1430d23219af177f', '0xb5932a6b7d50a966aec6c74c97385412fb497540'],
  queryTld: 'bnb',
})
// expect: [{address: '0x2886d6792503e04b19640c1f1430d23219af177f', domain: 'goodh.bnb'}, {address: '0xb5932a6b7d50a966aec6c74c97385412fb497540', domain: 'spaceid.bnb'}]

const res = await web3Name.batchGetDomainNameByChainId({
  addressList: ['0x77777775b611f0f3d90ccb69ef425a62b35afa7c', '0x3506fbe85e19bf025b228ec58f143ba342c3c608'],
  queryChainId: 42_161,
})
// expect: [{address: '0x77777775b611f0f3d90ccb69ef425a62b35afa7c', domain: 'megantrhopus.arb'}, {address: '0x3506fbe85e19bf025b228ec58f143ba342c3c608', domain: 'idgue.arb'}]
```

#### 5. Record

Domain text records can be fetched by providing domain name and the key. For example, the avatar record of `spaceid.bnb` is returned from this method given key name `avatar`:

```typescript
const record = await sid.getDomainRecord({ name: 'spaceid.bnb', key: 'avatar' })
```

#### 6. Metadata

Domain metadata can be fetched by SDK directly.

```typescript
// requesting
const metadata = await web3Name.getMetadata({ name: 'public.gno' })
```

### Non-EVM name services

As an all-in-one domain name SDK, non-EVM web3 domain name services are also included. Now we support SNS (Solana Name Service, .sol), Sei Name Service (.sei) and Injective Name Service (.inj).

#### 1. Solana Name Service (.sol)

Install additional corresponding dependencies for Solana environment:

```bash
npm install @solana/web3 @bonfida/spl-name-service
```

Create client and query domains:

```typescript
import { createSolName } from '@web3-name-sdk/core/solName'

const web3Name = createSolName()
const domain = await web3Name.getDomainName({
  address: 'Crf8hzfthWGbGbLTVCiqRqV5MVnbpHB1L9KQMd6gsinb',
}) // expect: bonfida
```

#### 2. Sei Name Service (.sei)

Install additional corresponding dependencies for Sei environment:

```bash
npm install @sei-js/core @siddomains/sei-sidjs
```

Create client and query domains:

```typescript
import { createSeiName } from '@web3-name-sdk/core/seiName'

const web3Name = createSeiName()
const domain = await web3Name.getDomainName({
  address: 'sei1tmew60aj394kdfff0t54lfaelu3p8j8lz93pmf',
}) // expect: allen.sei
```

#### 3. Injective Name Service (.inj)

Install additional corresponding dependencies for Injective environment:

```bash
npm install @siddomains/injective-sidjs '@injectivelabs/networks' '@injectivelabs/ts-types'
```

Create client and query domains:

```typescript
import { createInjName } from '@web3-name-sdk/core/injName'

const web3Name = createInjName()
const domain = await web3Name.getDomainName({
  address: 'inj10zvhv2a2mam8w7lhy96zgg2v8d800xcs7hf2tf',
}) // expect: testtest.inj
```

### Use your own RPC

We are using popular public RPC services by default to make it easier to use. But in some cases developers may prefer to use arbitrary RPC, so we provide optional parameter `rpcUrl` for each function that allows developers to use their own RPC to make requests.

For example, you can put custom rpcUrl as a parameter in `getAddress` function.

```typescript
// Use custom RPC url (https://arb1.arbitrum.io/rpc)
const address = await web3name.getAddress('registry.arb', {
  rpcUrl: 'https://arb1.arbitrum.io/rpc',
})
// expect: '0x8d27d6235d9d8EFc9Eef0505e745dB67D5cD2918'
```

For other functions, it's also possible to have a custom `rpcUrl` in the request.

```typescript
// Use custom RPC url (https://arb1.arbitrum.io/rpc)
const address = await web3name.getMetaData('registry.arb', {
  rpcUrl: 'https://arb1.arbitrum.io/rpc',
})
// expect: '0x8d27d6235d9d8EFc9Eef0505e745dB67D5cD2918'
```

### Request Timeout Control

The SDK provides timeout control for all network requests. You can set timeouts in two ways:

#### 1. Global Timeout

Set a global timeout when creating the client:

```typescript
// Set a 5-second timeout for all requests
const web3Name = createWeb3Name({ timeout: 5000 })
const solName = createSolName({ timeout: 5000 })
const seiName = createSeiName({ timeout: 5000 })
const injName = createInjName({ timeout: 5000 })
```

#### 2. Per-Request Timeout

Override the global timeout for specific requests:

```typescript
// Set a 10-second timeout for this specific request
const address = await web3name.getAddress('vitalik.eth', { timeout: 10000 })

// Timeout can be combined with other options
const address = await web3name.getAddress('registry.arb', {
  rpcUrl: 'https://arb1.arbitrum.io/rpc',
  timeout: 5000,
})

// Works with all methods
const name = await web3name.getDomainName({
  address: '0x2886D6792503e04b19640C1f1430d23219AF177F',
  queryChainIdList: [10200],
  timeout: 5000,
})

const metadata = await web3name.getMetadata({
  name: 'spaceid.bnb',
  timeout: 5000,
})
```

If a request exceeds the timeout duration, it will throw an error with a message indicating the timeout. The timeout applies to all network operations, including name resolution, reverse lookups, and metadata fetches.
