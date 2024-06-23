import "@rainbow-me/rainbowkit/styles.css";
import type { Metadata } from 'next'
import { Toaster } from 'sonner';
import { ContextProvider } from '@/app/context'
import { wagmiConfig } from "@/app/context/config"
import '@/app/ui/globals.css';
import Header from "@/app/components/Header";
import { Inter } from "next/font/google";
import { headers } from 'next/headers'
import {
    cookieToInitialState,
} from 'wagmi'
const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
    title: "NFT Market",
    description: "NFT Market",
};
type LayoutProps = {
    children: React.ReactNode;
};

const RootLayout: React.FC<LayoutProps> = ({children}) => {
    const initialState = cookieToInitialState(
        wagmiConfig,
        headers().get('cookie')
    )
    return (
        <html lang="en">
        <body className={inter.className}>
        <ContextProvider initialState={initialState}>
            <Header></Header>
            {children}
            <Toaster position="bottom-right"  expand={true}
                     toastOptions={{
                         classNames: {
                             error: 'bg-red-400',
                             success: 'bg-green-400',
                             warning: 'bg-yellow-400',
                             info: 'bg-blue-400',
                         },
                     }}
            />
        </ContextProvider>
        </body>
        </html>
    )
}

export default RootLayout;