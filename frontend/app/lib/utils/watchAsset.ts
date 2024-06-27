import { createWalletClient, custom } from 'viem'
import { mainnet } from 'viem/chains'
 
export const walletClient = createWalletClient({
  chain: mainnet,
  transport: custom(window.ethereum!),
})

export const watchAssetERC20 = (addr:`0x${string}`,symbol:string,decimals?:number):void =>{

    walletClient.watchAsset({ 
        type: 'ERC20',
        options: {
          address: addr,
          decimals: decimals?decimals:18,
          symbol: symbol,
        },
      })
} 