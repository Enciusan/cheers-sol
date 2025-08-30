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
        usb: false
      };
    }
    return config;
  },
  reactStrictMode: false,
};

const withCivicAuth = createCivicAuthPlugin({
  clientId: process.env.NEXT_PUBLIC_CIVIC_AUTH_KEY,
  enableSolanaWalletAdapter: true,
  oauthServer: "https://auth.civic.com/oauth",
  autoRedirect: false,
  // Exclude app paths from authentication since authentication is now handled by middleware2
  exclude: ["/", "/chat", "/links", "/missions", "/profile", "/referral", "/settings"],

});

export default withCivicAuth(nextConfig);