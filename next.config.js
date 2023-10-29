/** @type {import('next').NextConfig} */
const nextConfig = {

  output: 'export',

  images: {
    loader: 'custom',
    loaderFile: './utils/imageloader.ts',
  },
  reactStrictMode: true,
  compiler: {
    // Enables the styled-components SWC transform
    styledComponents: {
      ssr: true,
    }
  },
  webpack(config) {
    config.module.rules.push({
      test: /\.svg$/i,
      issuer: /\.[jt]sx?$/,
      use: ['@svgr/webpack'],
    })

    return config
  },
}

module.exports = nextConfig
