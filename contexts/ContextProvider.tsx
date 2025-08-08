"use client";
import { CivicAuthProvider } from "@civic/auth-web3/nextjs";
import { ConnectionProvider, WalletProvider } from "@solana/wallet-adapter-react";
import { WalletModalProvider } from "@solana/wallet-adapter-react-ui";
import { clusterApiUrl } from "@solana/web3.js";
import { FC, ReactNode } from "react";

// const ReactUIWalletModalProviderDynamic = dynamic(
//   async () => (await import("@solana/wallet-adapter-react-ui")).WalletModalProvider,
//   { ssr: false }
// );

// const WalletContextProvider: FC<{ children: ReactNode }> = ({ children }) => {
//   const { networkConfiguration } = useNetworkConfiguration();
//   const network = networkConfiguration as WalletAdapterNetwork;

//   const wallets = useMemo(
//     () => [new PhantomWalletAdapter(), new SolflareWalletAdapter()],
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//     [network]
//   );

// const onError = useCallback((error: WalletError) => {
//   notify({
//     type: "error",
//     message: error.message ? `${error.name}: ${error.message}` : error.name,
//   });
//   console.error(error);
// }, []);

//   return (
//     <ConnectionProvider endpoint={clusterApiUrl("mainnet-beta")}>
//       <WalletProvider wallets={wallets} autoConnect={false}>
//         <ReactUIWalletModalProviderDynamic>
//           <CivicAuthProvider>{children}</CivicAuthProvider>
//         </ReactUIWalletModalProviderDynamic>
//       </WalletProvider>
//     </ConnectionProvider>
//   );
// };

export const ContextProvider: FC<{ children: ReactNode }> = ({ children }) => {
  return (
    <ConnectionProvider endpoint={clusterApiUrl("devnet")}>
      <WalletProvider wallets={[]} autoConnect>
        <WalletModalProvider>
          <CivicAuthProvider>{children}</CivicAuthProvider>
        </WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
};
