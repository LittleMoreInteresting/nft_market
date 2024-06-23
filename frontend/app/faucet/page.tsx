'use client'
import {Button, Card,CardFooter,CardBody} from "@nextui-org/react";
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
export default function Faucet(){
    const { address,isConnected } = useAccount();
    const chainId = useChainId();
    const [balance,setBalance] = useState("0")
    const wagmiContractConfig = {
        abi:tokenAbi,
        address: getTokenAddrByNetworkId(chainId.toString())
    }
    const getAccountBalance = async ()=>{
        const balance = await getBalance(wagmiConfig, {
            address:address as `0x${string}`,
            token: wagmiContractConfig.address,
            unit: 'ether', 
        })
        console.log(balance)
        setBalance(formatEther(balance.value))
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


    return(<>
        <div className="flex flex-col items-center justify-between p-15 my-10">
            <Card className="col-span-12 w-[300px] h-[350px] bg-gradient-to-r from-indigo-500 from-10% via-sky-500 via-30% to-emerald-500 to-90%">
                <CardBody>
                    Balance: 
                    <div className="justify-center text-2xl text-center m-auto w-[150px] h-[200px]">{balance} OBT</div>
                </CardBody>
            <CardFooter className="absolute bg-black/60 bottom-0 z-10 border-t-1 border-default-600 dark:border-default-100">
                <Button onClick={faucet} isLoading={isPending}>Faucet</Button>
                <span className=" text-white px-3">0.1 Sepolia OBT/day.</span>
            </CardFooter>
            </Card>
        </div>
    </>)
}