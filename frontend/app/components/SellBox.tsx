import React from "react";
import { useMemo,useState } from 'react';
import {
    Modal,
    ModalContent,
    ModalHeader,
    ModalBody,
    ModalFooter,
    Button,
    Input,
} from "@nextui-org/react";
import Image from "next/image";
 
import  {getNftData} from "@/app/lib/api/action";
import { toast } from "sonner"
import {type BaseError, useAccount, useChainId,  useWriteContract} from "wagmi";
import { waitForTransactionReceipt } from '@wagmi/core'
import {parseUnits, parseEther} from 'viem'
import {getNftAddrByNetworkId, getNftMarketAddrByNetworkId} from "@/app/lib/utils/getAddrByNetwork";
import {nftAbi} from "@/constants/HoraceNft.abi";
import {marketAbi} from "@/constants/NFTMarket.abi";
import { wagmiConfig } from "@/app/context/config";
export interface SellNftProps {
    isVisible: boolean;
    onClose: () => void;
    onSellSuccess?:() => void;
}
export default function SellBox({
                        isVisible,
                        onClose}:SellNftProps) {
    const chainId = useChainId();
    const { address, isConnected } = useAccount();
    const [imageURI,setImageURI] = useState("")
    const [nftAddress,setNftAddr] = useState("0x43CBe3CB4f095D1d7230e427aA4582638B2BF1A8")
    const [tokenId,setTokenId] = useState("")
    const [price,setPrice] = useState("")
    const [name,setName] = useState("")
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
                        handleApproveSuccess(
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
        const address = getNftAddrByNetworkId(chainId.toString())
        const marketplaceAddress = getNftMarketAddrByNetworkId(chainId.toString())
        
        approve({
            address: address as `0x${string}`,
            abi:nftAbi,
            functionName: 'approve',
            args: [marketplaceAddress as `0x${string}`, parseUnits(tokenId,0)],
        })
    }
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
    const nftData = useMemo(async () => {
        if(nftAddress && tokenId){
           try{
            var result = await getNftData({
                nftAddress:nftAddress,
                tokenId:tokenId,
                chainId:chainId.toString()
            })
            console.log(result)
            setName(result.name)
            setImageURI(result.imageURI)
            return result;
           }catch(err){
            console.log(err) 
            setName("")
            setImageURI("")
           }
        }
    },[nftAddress, tokenId]);                           
    const clearValue = ()=>{
        console.log("clearValue")
        setName("")
        setImageURI("")
        setTokenId("")
        setPrice("")
        onClose()
    }
    return (
        <>
            <Modal
                isOpen={isVisible}
                placement="top-center"
                backdrop="opaque"
                onClose={clearValue}
            >
                <ModalContent>
                    <>
                        <ModalHeader className="flex flex-col gap-1">Sell {name}</ModalHeader>
                        <ModalBody>
                            {imageURI ? (<Image
                                className="object-cover rounded-xl"
                                src={imageURI}
                                alt={name}
                                loader={({src, width, quality}) => imageURI + "?" + width}
                                height="360"
                                width="360"
                            />) : ""}
                            <Input
                                label="NFT Address"
                                variant="bordered"
                                value={nftAddress}
                                onValueChange={setNftAddr}
                            />
                            <Input
                                label="TokenId"
                                variant="bordered"
                                value={tokenId}
                                onValueChange={setTokenId}
                            />
                            <Input
                                autoFocus
                                isRequired
                                label="Price"
                                placeholder="0.00001"
                                variant="bordered"
                                endContent="OBT"
                                value={price}
                                type="number"
                                onValueChange={setPrice}
                            />
                        </ModalBody>
                        <ModalFooter>
                            <Button color="danger" variant="flat" onPress={clearValue}>
                                Close
                            </Button>
                            <Button color="primary" onPress={nftApprove} >
                                Confirm
                            </Button>
                        </ModalFooter>
                    </>
                </ModalContent>
            </Modal>
        </>
    );
}