'use client'

import React, {useMemo, useState} from "react";
import {
    Button,
    Input,
    Modal,
    ModalBody,
    ModalContent,
    ModalFooter,
    ModalHeader,
    useDisclosure
} from "@nextui-org/react";
import {
    useAccount,
    useChainId,
    type BaseError,
    useWaitForTransactionReceipt,
    useWriteContract
} from "wagmi";
import { toast } from 'sonner'
import  { GetSelfNftList } from "@/app/lib/api/action";
// import { useQuery } from '@tanstack/react-query'
import NFTBox from "@/app/ui/nft-box/NFTBox"
import {nftAbi} from "@/constants/HoraceNft.abi"
import { getNftAddrByNetworkId } from '@/app/lib/utils/getAddrByNetwork'

import SellPriceBox from "@/app/ui/nft-box/Sell";
import {PressEvent} from "@react-types/shared";
import {waitForTransactionReceipt} from "@wagmi/core";
import {wagmiConfig} from "@/app/context/config";
import { useQuery } from '@apollo/client';
import { tokensQuery } from '@/app/lib/api/thegraph'
export default function MyNFT() {
    const { address,isConnected } = useAccount();
    const chainId = useChainId();
    const selfList = async () => {
        const nftAddress = getNftAddrByNetworkId(chainId.toString())
        const response = await GetSelfNftList({
            nftAddress:nftAddress,
            chainId:chainId.toString(),
            owner:address as string,
            page:1,
            pageSize:10,
        });
        var resData = response.data;
        if (resData && resData.length > 0) {
            return resData
        } else {
            return []
        }
    }
    // var query = useQuery({
    //     queryKey:[address,chainId],
    //     queryFn:selfList,
    //     enabled:isConnected
    // });
    const [pageSize,setPageSize] = useState(20)
    const [currentPage, setCurrentPage] = useState(1);
    const pageSkip = useMemo(()=>{
        return pageSize *(currentPage-1)
    },[pageSize,currentPage])
    const { loading, error:qe, data } = useQuery(tokensQuery,{
        variables:{owner:address,pageSize:pageSize,pageSkip:pageSkip},
    });
    
    const nftAddress = getNftAddrByNetworkId(chainId.toString())
    // mint nft
    const {
        data: hash,
        isPending,
        writeContract
    } = useWriteContract({
        mutation:{
            onSuccess:async (hash, variables) => {
                if (hash){
                    toast.info("Transaction Hash:"+hash)
                }
                const listReceipt = await waitForTransactionReceipt(wagmiConfig,{
                    hash
                })
                if (listReceipt.status == "success"){
                    toast.success("mint success !!!")
                    selfList()
                }
            },
            onError: async (error) => {
                toast.error("Error: "+((error as BaseError).shortMessage || error.message))
            }
        }
    })
    
    async function mintNft() {
        if (!isConnected){
            toast.error("Not connected.")
            return
        }
        writeContract({
            address: nftAddress as `0x${string}`,
            abi:nftAbi,
            functionName: 'mintNft',
            args: [],
        })
    }

    
    return (

        <>
            <div className="container mx-auto ">
                <div className="flex flex-row p-5 justify-between items-center">
                    <p className="px-4 font-bold text-2xl"> Horace NFT List</p>
                    <Button color="secondary" onClick={mintNft}  >Mint NFT</Button>
                </div>

                <div className="flex flex-wrap">
                {!loading && data ? (
                    data.tokenOwners.map((nft:any) => {
                        const {id, from} = nft;
                        
                        return (
                            <div className="m-2" key={id}>
                            <NFTBox
                                tokenId={id}
                                chainId={chainId.toString()}
                                nftAddress={nftAddress}
                                buyFrom={from}
                            />
                            </div>
                        )
                    })

                ): (
                    <div className="flex justify-center items-center h-screen w-full">
                        <div className="text-center text-4xl text-gray-600">No Ntfs</div>
                    </div>
                )}
                </div>
      <div className="flex flex-col gap-5">
      <div className="flex gap-2">
        <Button
          size="sm"
          variant="flat"
          color="secondary"
          onPress={() => setCurrentPage((prev) => (prev > 1 ? prev - 1 : prev))}
        >
          Previous
        </Button>
        <Button
          size="sm"
          variant="flat"
          color="secondary"
          onPress={() => setCurrentPage((prev) => (prev < 10 ? prev + 1 : prev))}
        >
          Next
        </Button>
      </div>
    </div>
            </div>
        </>
    )
}