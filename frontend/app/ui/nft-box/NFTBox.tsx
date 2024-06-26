import Image from "next/image";
import {Button, Card, CardBody, CardHeader, Skeleton, useDisclosure} from "@nextui-org/react";
import React, {useState} from "react";
import {getNftData} from "@/app/lib/api/action";
import {type BaseError, useAccount, useChainId, useWaitForTransactionReceipt, useWriteContract} from "wagmi";
import { waitForTransactionReceipt,readContract } from '@wagmi/core'
import {parseUnits, parseEther} from 'viem'
import {truncateStr} from "@/app/lib/utils/utils"
import {useQuery} from "@tanstack/react-query";
import SellNftBox from "@/app/ui/nft-box/Sell";
import {toast} from "sonner";
import {getNftAddrByNetworkId, getNftMarketAddrByNetworkId} from "@/app/lib/utils/getAddrByNetwork";
import {nftAbi} from "@/constants/HoraceNft.abi";
import {marketAbi} from "@/constants/NFTMarket.abi";
import { wagmiConfig } from "@/app/context/config";

interface nftInfo {
    tokenId: string;
    buyFrom: string;
    nftAddress:string;
    chainId:string;
}
export default function NFTBox(nftInfo:nftInfo) {

    const {isOpen,onOpen,onClose} = useDisclosure();
    const { address, isConnected } = useAccount();
    const chainId = useChainId();
    const [price,setPrice] = useState("")
    const {data,isLoading} = useQuery({
        queryKey:[nftInfo.nftAddress+nftInfo.tokenId.toString(),address],
        queryFn:async () => {
            return await getNftData({
                nftAddress: nftInfo.nftAddress,
                tokenId: nftInfo.tokenId,
                chainId: nftInfo.chainId,
            })
        },
        retry:1,
    })

    const {
        data: sellHash,
        error: sellError,
        writeContract:listNft
    } = useWriteContract({
        mutation:{
            onSuccess:async (hash, variables) => {
                const listReceipt = await waitForTransactionReceipt(wagmiConfig,
                    {hash});
                if (listReceipt.status==="success"){
                    toast.success("list nft success")
                    onClose()
                }
            }
        }
    })

    async function handleApproveSuccess(nftAddress:string,tokenId:string,price:string){
        const marketplaceAddress = getNftMarketAddrByNetworkId(chainId.toString())
        const tokenIdInt = parseUnits(tokenId,0)
        listNft({
            account: address,
            address:marketplaceAddress as `0x${string}`,
            abi:marketAbi,
            functionName: 'list',
            args: [nftAddress as `0x${string}`, parseEther(price,'wei'),tokenIdInt],
        })
    }

    const {
        data: approveHash,
        error,
        writeContract:approve
    } = useWriteContract({
        mutation:{
            onSuccess:async (hash, variables) => {
                const transactionReceipt = await waitForTransactionReceipt(wagmiConfig,
                    {hash});
                if (transactionReceipt.status === "success") {
                    toast.info("approve successfully.");
                    if(variables.args){
                        const nftAddress = variables.address;
                        const tokenId = variables.args[1];
                        console.log(nftAddress,"nftAddress:"+tokenId);
                        console.log("token",tokenId);
                        await handleApproveSuccess(
                            nftAddress!.toString(),
                            tokenId!.toString(),
                            price
                        );
                    }
                }
            },
            onError:(error) => {
                toast.error("Error: "+((error as BaseError).shortMessage || error.message))
            }
        },
    })
    async function nftApprove(){
        if (!isConnected){
            toast.error("Not connected.")
            return
        }
        if (!price){
            toast.error("price must be greater than 0");
            return
        }
        const nftaddress = getNftAddrByNetworkId(chainId.toString())
        const marketplaceAddress = getNftMarketAddrByNetworkId(chainId.toString())
        const tokenId = parseUnits(nftInfo.tokenId,0)
        //getApproved
        const addr = await readContract(wagmiConfig,{
            address: nftaddress as `0x${string}`,
            abi:nftAbi,
            functionName: 'getApproved',
            args: [tokenId],
            account:address
        })
        if (addr === marketplaceAddress){
            console.log("ok",nftaddress)
            await handleApproveSuccess(nftaddress,tokenId.toString(),price)
            return;
        }
        approve({
            address: nftaddress as `0x${string}`,
            abi:nftAbi,
            functionName: 'approve',
            args: [marketplaceAddress as `0x${string}`, tokenId],
        })
    }
    

    return(<>
        <>
            <Card className="py-4 rounded-xl bg-blue-100">
                <CardHeader className="pb-0 pt-2 px-4 flex-col items-start">
                    <Skeleton isLoaded={!isLoading} className="w-3/5 rounded-lg">
                        <h4 className="font-bold text-large">{data?.NFTName}#{nftInfo.tokenId}:{data?.name}</h4>
                    </Skeleton>
                    <Skeleton isLoaded={!isLoading} className="w-3/5 rounded-lg">
                        <p className="text-tiny uppercase font-bold">{data?.description}</p>
                    </Skeleton>
                    <Skeleton isLoaded={!isLoading} className="w-4/5 rounded-lg">
                        <small
                            className="text-default-500">{(nftInfo.buyFrom && nftInfo.buyFrom !== "0x0000000000000000000000000000000000000000") ? "Buy from " + truncateStr(nftInfo.buyFrom, 18) : "Minted"}</small>
                    </Skeleton>
                </CardHeader>
                <CardBody className="overflow-visible py-2 items-center">
                    <Skeleton isLoaded={!isLoading} className="rounded-lg">
                        {data?.imageURI ? (<Image
                            alt={"Owned by " + data?.name + nftInfo.tokenId}
                            className="object-cover rounded-xl"
                            loader={({src, width, quality}) => data?.imageURI + "?" + width}
                            src={data?.imageURI}
                            height="260"
                            width="260"
                        />) : ""}
                    </Skeleton>
                </CardBody>
            </Card>
            <div className="flex justify-center">
                <SellNftBox
                    isVisible={isOpen}
                    name={data?.NFTName+":"+data?.name}
                    onClose={onClose}
                    nftAddress={nftInfo.nftAddress}
                    tokenId={parseInt(nftInfo.tokenId)}
                    imageURI={data?.imageURI}
                    onConfirm={async ()=>{
                        await  nftApprove()
                    }}
                    onPriceChange={value => setPrice(value)}
                />
                <Button radius="full" color="primary" onClick={onOpen} className="mt-2">Sell</Button>
            </div>
        </>
    </>)
}