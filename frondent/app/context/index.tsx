"use client";

import React, { ReactNode } from 'react'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

import { WagmiProvider,State,cookieStorage, createStorage,http } from 'wagmi';
import {
    arbitrum,
    base,
    mainnet,
    optimism,
    polygon,
    sepolia,
  } from 'wagmi/chains';

import {
    getDefaultConfig,
    RainbowKitProvider,
    getDefaultWallets
} from '@rainbow-me/rainbowkit';
import {
    argentWallet,
    trustWallet,
    ledgerWallet,
  } from '@rainbow-me/rainbowkit/wallets';
import {NextUIProvider} from "@nextui-org/react";
import {useRouter} from 'next/navigation'
import { injected  } from 'wagmi/connectors'
const { wallets } = getDefaultWallets();
const projectId = process.env.NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID as string;
const httpSepolia = process.env.NEXT_PUBLIC_ALCHEMY_HTTP_SEPOLIA as string
const config = getDefaultConfig({
  appName: 'CZ-NFT',
  projectId: projectId,
  wallets: [
    ...wallets,
    {
      groupName: 'Other',
      wallets: [argentWallet, trustWallet, ledgerWallet],
    },
  ],
  chains: [
    //mainnet,
    //polygon,
    //optimism,
    //arbitrum,
    //base,
    sepolia,
  ],
  ssr: true,
  storage: createStorage({
    key:"cz-nft",
    storage: cookieStorage,
  }),
  transports:{
    [sepolia.id]: http(httpSepolia)
  },
  
});
const queryClient = new QueryClient()

export function ContextProvider({children,initialState}: {
    children: ReactNode
    initialState?: State
}) {
    const router = useRouter()

    return (
        <WagmiProvider config={config} initialState={initialState}>
            <QueryClientProvider client={queryClient}>
                <RainbowKitProvider>
                    <NextUIProvider navigate={router.push}>
                        {children}
                    </NextUIProvider>
                </RainbowKitProvider>
            </QueryClientProvider>
        </WagmiProvider>
    )
}