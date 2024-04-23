import React from 'react'
import ReactDOM from 'react-dom/client'
import {
  getDefaultWallets,
  RainbowKitProvider,
} from '@rainbow-me/rainbowkit'
import { configureChains, createConfig, WagmiConfig } from 'wagmi'
import { publicProvider } from 'wagmi/providers/public'
import { mainnet, bsc, bscTestnet, arbitrum, arbitrumGoerli } from 'wagmi/chains'
import '@rainbow-me/rainbowkit/styles.css'
import './index.css'
import { RouterProvider } from 'react-router-dom'
import router from './router.jsx'


// const { chains, publicClient, webSocketPublicClient } = configureChains(
//   [mainnet, bscTestnet, bsc, arbitrum, arbitrumGoerli],
//   [
//     publicProvider(),
//   ])
// const { connectors } = getDefaultWallets({
//   appName: 'SIDjs example',
//   chains,
// })
// const config = createConfig({
//   autoConnect: true,
//   connectors,
//   publicClient,
//   webSocketPublicClient,
// })

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    {/*<WagmiConfig config={config}>*/}
    {/*  <RainbowKitProvider chains={chains}>*/}
    <RouterProvider router={router} />
    {/*  </RainbowKitProvider>*/}
    {/*</WagmiConfig>*/}
  </React.StrictMode>,
)
