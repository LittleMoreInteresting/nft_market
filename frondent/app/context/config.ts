import {cookieStorage, createConfig, createStorage, http} from "wagmi";
import {sepolia} from "wagmi/chains";
import { injected  } from 'wagmi/connectors'
const httpSepolia = process.env.NEXT_PUBLIC_ALCHEMY_HTTP_SEPOLIA as string

export const wagmiConfig = createConfig({
    chains: [sepolia],
    connectors: [injected()], 
    //ssr: false,
    // storage: createStorage({
    //     key:"nft-market",
    //     storage: cookieStorage,
    // }),
    transports:{
        [sepolia.id]: http(httpSepolia),
    },
})



