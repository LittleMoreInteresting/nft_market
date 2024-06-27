'use client'
import {Button, Card,CardFooter,CardBody} from "@nextui-org/react";
import {Listbox, ListboxItem, Chip, ScrollShadow, Avatar} from "@nextui-org/react";
import React, {useState, useEffect, useRef, cache} from "react";
import {
    useAccount,
    useChainId,
    type BaseError,
    useWriteContract
  } from "wagmi";
  import { formatEther } from "viem"
import { readContract,waitForTransactionReceipt,getBalance } from '@wagmi/core'
import { wagmiConfig } from "@/app/context/config"
import { toast } from 'sonner'
import { tokenAbi } from "@/constants/OBToken.abi"
import {getTokenAddrByNetworkId} from "@/app/lib/utils/getAddrByNetwork"
import { transfersQuery } from "@/app/lib/api/thegraph";
import {truncateStr} from "@/app/lib/utils/utils"
import { useQuery } from '@apollo/client';
import { watchAssetERC20 } from "@/app/lib/utils/watchAsset"
export default function Faucet(){
    const { address,isConnected } = useAccount();
    const ZERO_ADDR = '0x0000000000000000000000000000000000000000'
    const chainId = useChainId();
    const [balance,setBalance] = useState("0")
    const [transfers,setTransfers] = useState([]);
    const tonkenAddr = getTokenAddrByNetworkId(chainId.toString());
    const wagmiContractConfig = {
        abi:tokenAbi,
        address: tonkenAddr
    }
    const { loading, error:qe, data } = useQuery(transfersQuery,{
        variables:{address}
    });
    const getAccountBalance = async ()=>{
        const balance = await getBalance(wagmiConfig, {
            address:address as `0x${string}`,
            token: wagmiContractConfig.address,
            unit: 'ether', 
        })
         
        setBalance(formatEther(balance.value)) 
        // const result = await GetOBTTransferLog(address!)
        // setTransfers(result)
        // console.log("result",result)
    }
    useEffect(()=>{
        if(isConnected){
          getAccountBalance()
          
        }
    },[address, chainId])

    const {
        data: hash,
        error,
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
                console.log(listReceipt)
                if (listReceipt.status == "success"){
                    getAccountBalance()
                    toast.success("mint success !!!")
                }
            },
            onError:async (error) => {
                toast.error("Error: "+((error as BaseError).shortMessage || error.message))
            }
        }
    })
    
    async function faucet() {
        if (!isConnected){
            toast.error("Not connected.")
            return
        }
        writeContract({
          ...wagmiContractConfig,
          functionName: 'faucet',
          args:[],
          account:address,
        })
    }
    async function addToWallte() {
        watchAssetERC20(tonkenAddr,"OBT")
    }
    return(<>
        <div className="flex flex-col items-center justify-between p-15 my-10">
        <div className="flex flex-row p-5 justify-between items-center">
                    <p className="px-4 font-bold text-2xl">OBT Faucet</p>
                    <Button color="secondary"  onClick={addToWallte} >Add OBT To Wallte</Button>
                </div>
            <Card className="col-span-12 w-[300px] h-[350px] bg-gradient-to-r from-indigo-500 from-10% via-sky-500 via-30% to-emerald-500 to-90%">
                <CardBody>
                    Balance: 
                    <div className="justify-center text-2xl text-center m-auto w-[150px] h-[200px]">{balance} OBT</div>
                </CardBody>
            <CardFooter className="absolute bg-black/60 bottom-0 z-10 border-t-1 border-default-600 dark:border-default-100">
                <Button onClick={faucet} isLoading={isPending}>Faucet</Button>
                <span className=" text-white px-3">0.1 OBT/day.</span>
            </CardFooter>
            </Card>
            <div className="w-full max-w-[300px] border-small px-1 py-2 rounded-small border-default-200 dark:border-default-100">
            <Listbox
                topContent="Transfer records"
                classNames={{
                base: "max-w-xs",
                list: "max-h-[300px] overflow-scroll",
                }}
                
                label="Assigned to"
                variant="flat"
            >
                {!loading && data && data.transfers.map((item:{id:string,to:string,from:string,value:bigint}) => (
                <ListboxItem key={item.id} textValue={item.to}>
                    <div className="flex gap-2 items-center">
                    <div className="flex flex-col">
                        <span className="text-small">
                            {item.from===ZERO_ADDR && <>faucet</>}
                            {item.from!==ZERO_ADDR && truncateStr(item.from,15)+" => " + truncateStr(item.to,15)}
                        </span>
                        <span className="text-tiny text-default-400">
                            {formatEther(item.value)} OBT
                        </span>
                    </div>
                    </div>
                </ListboxItem>
                ))}
            </Listbox> 
            </div>
        </div>
    </>)
}