'use client'
import React, {useState, useEffect, useMemo} from "react";
import { useAccount, useChainId } from "wagmi";

import API from "@/app/lib/api/action";
import NFTBox from "@/app/components/NFTBox";
import SellBox from "@/app/components/SellBox";

// import {useQuery} from "@tanstack/react-query";
import { useQuery } from '@apollo/client';
import { listQuery } from '@/app/lib/api/thegraph'
import {Button,useDisclosure} from "@nextui-org/react";
import {getNftMarketAddrByNetworkId} from "@/app/lib/utils/getAddrByNetwork";
export default function Home() {
    const [listedNfts, setListedNfts] = useState([]);
    const [isWeb3Enabled, setIsWeb3Enabled] = useState(false);
    const { address } = useAccount();
    const chainId = useChainId();
    const {isOpen,onOpen,onClose} = useDisclosure();
    const marketplaceAddress = getNftMarketAddrByNetworkId(chainId.toString())
    
    // var query = useQuery({
    //     queryKey:[address,chainId],
    //     queryFn:getListedNfts
    // });
    const [pageSize,setPageSize] = useState(20)
    const [currentPage, setCurrentPage] = useState(1);
    const pageSkip = useMemo(()=>{
        return pageSize *(currentPage-1)
    },[pageSize,currentPage])
    const { loading, error:qe, data,refetch } = useQuery(listQuery,{
        variables:{status:1,pageSize:pageSize,pageSkip:pageSkip},
    });
    const getListedNfts = async () => {
        refetch()
    };
    useEffect(() => {
        //@ts-ignore
        if (typeof window.ethereum !== "undefined") {
            setIsWeb3Enabled(true);
        } else {
            setIsWeb3Enabled(false);
        }
    }, [address, chainId]);

    return (
    <>
        <div className="container mx-auto ">
            <div className="flex flex-row p-5 justify-between items-center">
                <p className="px-4 font-bold text-2xl">Recently Listed</p>
                <Button color="secondary" onClick={onOpen}  >List NFT</Button>
                
            </div>
            <div className="flex flex-wrap">
                {!loading && data ? (
                    data.nftListings && data.nftListings.length > 0 ? (
                        data.nftListings .map((nft: any) => {
                            const {price, nftAddress, tokenId, marketPlaceAddress, seller,blockTimestamp} =
                                nft;
                            return (
                                <div className="m-2" key={`${nftAddress}${tokenId}`}>
                                    <NFTBox
                                        price={price}
                                        nftAddress={nftAddress}
                                        tokenId={tokenId}
                                        marketPlaceAddress={marketPlaceAddress}
                                        seller={seller}
                                        key={`${nftAddress}${tokenId}`}
                                        getListedNfts={getListedNfts}
                                        blockTimestamp={blockTimestamp}
                                    />
                                </div>
                            );
                        })
                    ) : (
                        <div className="flex justify-center items-center h-screen w-full">
                            <div className="text-center text-4xl text-gray-600">No Ntfs</div>
                        </div>
                    )
                ) : (
                    <div>Web3 Currently Not Enabled</div>
                )}
            </div>
            <div className="flex justify-center">
                <SellBox
                    isVisible={isOpen}
                    onClose={onClose}
                    onSellSuccess={getListedNfts}
                />
            </div>
        </div>
    </>
    );
}
