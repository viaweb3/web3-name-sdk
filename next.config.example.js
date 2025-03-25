/** @type {import('next').NextConfig} */
const webpack = require('webpack')

const nextConfig = {
  webpack: (config, { isServer }) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      '@siddomains/injective-sidjs': require.resolve('@siddomains/injective-sidjs'),
      '@siddomains/sei-sidjs': require.resolve('@siddomains/sei-sidjs'),
    }

    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      net: false,
      tls: false,
      http: require.resolve('stream-http'),
      https: require.resolve('https-browserify'),
      crypto: require.resolve('crypto-browserify'),
      stream: require.resolve('stream-browserify'),
      buffer: require.resolve('buffer/'),
      path: false,
      zlib: false,
      querystring: false,
      os: false,
      url: false,
    }

    if (!isServer) {
      config.resolve.alias = {
        ...config.resolve.alias,
        axios: require.resolve('axios'),
      }
    }

    config.plugins.push(
      new webpack.ProvidePlugin({
        Buffer: ['buffer', 'Buffer'],
        process: 'process/browser',
      })
    )

    config.module.rules.push({
      test: /\.m?js$/,
      type: 'javascript/auto',
      resolve: {
        fullySpecified: false,
      },
    })

    config.module.rules.push({
      test: /\.m?js$/,
      include: /node_modules\/(@injectivelabs|@siddomains|@web3-name-sdk)/,
      use: {
        loader: require.resolve('babel-loader'),
        options: {
          presets: [['@babel/preset-env', { targets: { browsers: 'last 2 versions' } }]],
          plugins: ['@babel/plugin-transform-runtime'],
          sourceType: 'unambiguous',
          cacheDirectory: true,
        },
      },
    })

    if (!isServer) {
      config.resolve.mainFields = ['browser', 'main', 'module']
    }

    return config
  },
  reactStrictMode: true,
  transpilePackages: ['@siddomains/injective-sidjs', '@injectivelabs/sdk-ts', '@web3-name-sdk/core'],
}

module.exports = nextConfig
