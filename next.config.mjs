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

const withCivicAuth = createCivicAuthPlugin({
  clientId: "463405db-c4f3-4367-b816-548f3a7c839d",
  enableSolanaWalletAdapter: true,
  oauthServerUrl: "https://auth.civic.com/oauth",
});

export default withCivicAuth(nextConfig);