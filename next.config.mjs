import { createCivicAuthPlugin } from '@civic/auth-web3/nextjs';

/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    instrumentationHook: true,
  },
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
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
        crypto: false,
      };
    }
    return config;
  },
  reactStrictMode: false,
};
// const civicKey = process.env.NEXT_PUBLIC_CIVIC_AUTH_KEY || "";
// console.log(civicKey);

const withCivicAuth = createCivicAuthPlugin({
  clientId: `${process.env.NEXT_PUBLIC_CIVIC_AUTH_KEY}`,
  enableSolanaWalletAdapter: true,
  oauthServerUrl: 'https://auth.civic.com/oauth',
});

export default withCivicAuth(nextConfig);