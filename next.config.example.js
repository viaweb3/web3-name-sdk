/** @type {import('next').NextConfig} */
const webpack = require('webpack')

const nextConfig = {
  webpack: (config, { isServer }) => {
    // Resolve aliases for SID packages
    config.resolve.alias = {
      ...config.resolve.alias,
      '@siddomains/injective-sidjs': require.resolve('@siddomains/injective-sidjs'),
      '@siddomains/sei-sidjs': require.resolve('@siddomains/sei-sidjs'),
    }

    // Add fallbacks for Node.js core modules
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      crypto: require.resolve('crypto-browserify'),
      stream: require.resolve('stream-browserify'),
      buffer: require.resolve('buffer/'),
    }

    // Add required plugins
    config.plugins.push(
      new webpack.ProvidePlugin({
        Buffer: ['buffer', 'Buffer'],
      }),
      new webpack.DefinePlugin({
        'import.meta.webpackHot': JSON.stringify({}),
        'import.meta.url': JSON.stringify(''),
        'import.meta': JSON.stringify({}),
      })
    )

    // Handle module resolution for .mjs files
    config.module.rules.push({
      test: /\.m?js$/,
      type: 'javascript/auto',
      resolve: {
        fullySpecified: false,
      },
    })

    // Configure Babel for SID and Injective packages
    config.module.rules.push({
      test: /\.m?js$/,
      include: /node_modules\/(@injectivelabs|@siddomains|@web3-name-sdk)/,
      resolve: {
        fullySpecified: false,
      },
      use: {
        loader: require.resolve('babel-loader'),
        options: {
          presets: [['@babel/preset-env', { targets: { browsers: 'last 2 versions' } }]],
          plugins: [
            '@babel/plugin-transform-private-methods',
            '@babel/plugin-transform-private-property-in-object',
            ['@babel/plugin-transform-runtime', { regenerator: true }],
          ],
          sourceType: 'unambiguous',
          compact: false,
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
  transpilePackages: [
    '@siddomains/injective-sidjs',
    '@injectivelabs/sdk-ts',
    '@injectivelabs/networks',
    '@injectivelabs/ts-types',
    '@web3-name-sdk/core',
  ],
}

module.exports = nextConfig
