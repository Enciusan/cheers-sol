import { createCivicAuthPlugin } from '@civic/auth-web3/nextjs';

/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    instrumentationHook: true,
  },
  output: 'standalone',
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "ce7y5ltqq4.ufs.sh",
        port: "",
        pathname: "/f/**",
      },
    ],
  },
  env: {
    CIVIC_AUTH_KEY: process.env.CIVIC_AUTH_KEY || 'SomethingToTest',
  },
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
        crypto: false,
        usb: false
      };
    }
    return config;
  },
  reactStrictMode: false,
};

const withCivicAuth = createCivicAuthPlugin({
  clientId: process.env.CIVIC_AUTH_KEY,
  enableSolanaWalletAdapter: true,
  oauthServer: "https://auth.civic.com/oauth",
});

export default withCivicAuth(nextConfig);