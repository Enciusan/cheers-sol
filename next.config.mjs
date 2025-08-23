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
    NEXT_PUBLIC_CIVIC_AUTH_KEY: 'abd95fef-09c6-4d1f-bb77-78507c257642',
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
  clientId: 'abd95fef-09c6-4d1f-bb77-78507c257642',
  enableSolanaWalletAdapter: true,
  oauthServer: "https://auth.civic.com/oauth",
});

export default withCivicAuth(nextConfig);