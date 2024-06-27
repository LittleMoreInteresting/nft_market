
import Image from "next/image";
import {Card, CardHeader, CardBody, Skeleton, Button} from "@nextui-org/react";
import { formatEther,parseUnits } from "viem/utils";
import { useState, useEffect } from "react";
import { toast } from "sonner"
import {type BaseError, useAccount, useChainId, useWriteContract} from "wagmi";
import API, {getNftData} from "@/app/lib/api/action";
import { truncateStr,formatTimestamp } from "@/app/lib/utils/utils"
import {useQuery} from "@tanstack/react-query";
import {waitForTransactionReceipt} from "@wagmi/core";
import {wagmiConfig} from "@/app/context/config";
import {marketAbi} from "@/constants/NFTMarket.abi";
import { signTypedData,readContract,getAccount } from '@wagmi/core'
import {getNftMarketAddrByNetworkId,getTokenAddrByNetworkId} from "@/app/lib/utils/getAddrByNetwork";
import {UpdateListing} from "@/app/components/UpdateListing";
import { tokenAbi } from "@/constants/OBToken.abi"
import { UserRejectedRequestError } from 'viem'

export default function NFTBox({
       price,
       nftAddress,
       tokenId,
       marketPlaceAddress,
       seller,
       getListedNfts,
       blockTimestamp
   }: {
    price: string;
    nftAddress: string;
    tokenId: number;
    marketPlaceAddress: string;
    seller: string;
    getListedNfts: Function;
    blockTimestamp:number;
}) {
    const [showModal, setShowModal] = useState(false);
    const { address, isConnected,connector } = useAccount();
    const chainId = useChainId();
    const hideModal = () => setShowModal(false);
    const {data,isLoading} = useQuery({
        queryKey:[nftAddress+tokenId.toString(),address],
        queryFn:async () => {
            return await getNftData({
                nftAddress: nftAddress,
                tokenId: tokenId.toString(),
                chainId: chainId.toString(),
            })
        },
        retry:1,
    })
    const isOwnedByUser =
        seller === address?.toLowerCase() || seller === undefined;
    const formattedSellerAddress = isOwnedByUser
        ? "you"
        : truncateStr(seller || "", 15);
    const formattedPrice = price?formatEther(parseUnits(price,0)):""
    // action buy
    const {data:hash,isPending,writeContract:buynft} = useWriteContract({
        mutation:{
            onSuccess:async (hash, variables) =>{
                const listReceipt = await waitForTransactionReceipt(wagmiConfig,
                    {hash});
                if (listReceipt.status==="success"){
                    toast.success("buy nft success")
                    getListedNfts()
                }
            },
            onError:(error) => {
                toast.error("Error: "+((error as BaseError).shortMessage || error.message))
            }
        }
    })
    async function buy(){
        const marketplaceAddress = getNftMarketAddrByNetworkId(chainId.toString());
        const obtAddress = getTokenAddrByNetworkId(chainId.toString())
        const deadline = Math.floor(Date.now() / 1000) + 60 * 10;
        const [,name,version,cid,vAddr] = await readContract(wagmiConfig,{
            address:obtAddress,
            abi:tokenAbi,
            functionName:"eip712Domain"
        })
        const nonce = await readContract(wagmiConfig,{
            address:obtAddress,
            abi:tokenAbi,
            functionName:"nonces",
            args:[address as `0x{string}`]
        })
         
        // const { connector } = getAccount(wagmiConfig)
        try {
            const sign = await signTypedData(wagmiConfig,{
                account:address,
                connector:connector,
                domain:{
                    name:name,
                    version:version,
                    chainId:Number(cid),
                    verifyingContract:vAddr
                },
                types:{
                    Permit: [
                        { name: "owner", type: "address" },
                        { name: "spender", type: "address" },
                        { name: "value", type:"uint256"},
                        { name: "nonce", type: "uint256" },
                        { name: "deadline", type: "uint256" }
                    ]
                },
                message:{
                    owner:address as `0x{string}`,
                    spender:marketplaceAddress,
                    value:parseUnits(price,0),
                    nonce:nonce,
                    deadline:BigInt(deadline)
                },
                primaryType:"Permit",
            })
            buynft({
                account: address,
                address:marketplaceAddress as `0x${string}`,
                abi:marketAbi,
                functionName: 'permitBuy',
                args: [nftAddress as `0x${string}`, parseUnits(tokenId.toString(),0),parseUnits(price,0),BigInt(deadline),sign],
            })
        } catch(error){
            console.log(error)
            toast.error("Error: "+((error as UserRejectedRequestError).shortMessage || "error"))
        }
    }
    // buy end
    // Edit

    // Edit end

    return(<>
            <Card className="py-4 rounded-xl bg-blue-100">
                <CardHeader className="pb-0 pt-2 px-4 flex-col items-start">
                    <Skeleton isLoaded={!isLoading} className="w-4/5 rounded-lg">
                    <p className="text-tiny uppercase font-bold">{data?.NFTName} : {tokenId}</p>
                    </Skeleton>
                    <Skeleton isLoaded={!isLoading} className="w-4/5 rounded-lg">
                    <h4 className="font-bold text-large">{formattedPrice} OBT</h4>
                    </Skeleton>
                    <Skeleton isLoaded={!isLoading} className="w-4/5 rounded-lg">
                    <small className="text-default-500">Owned by {formattedSellerAddress}</small>
                    </Skeleton>
                    <Skeleton isLoaded={!isLoading} className="w-4/5 rounded-lg">
                    <small className="text-default-500"> {formatTimestamp(blockTimestamp)}</small>
                    </Skeleton>
                </CardHeader>
                <CardBody className="overflow-visible py-2">
                    <Skeleton isLoaded={!isLoading} className="rounded-lg">
                        {data?.imageURI?(<Image
                        alt={"Owned by " + formattedSellerAddress}
                        className="object-cover rounded-xl"
                        loader={ ({ src, width, quality }) => data?.imageURI}
                        src={data?.imageURI}
                        height="260"
                        width="260"
                    />):""}
                    </Skeleton>
                </CardBody>
            </Card>
        <div className="flex justify-center my-2">
            {isOwnedByUser ? (
                <>
                <UpdateListing
                    isVisible={showModal}
                    tokenId={tokenId}
                    nftAddress={nftAddress}
                    onClose={hideModal}
                    imageURI={data?.imageURI}
                    currentPrice={formattedPrice}
                    refreshNftPage={getListedNfts}
                />
                <Button radius="full" onPress={()=>setShowModal(true)} color="secondary">Edit</Button>
                </>
            ):(
                <Button  radius="full" onPress={buy} color="primary">Buy</Button>
            )}
        </div>

    </>)
}