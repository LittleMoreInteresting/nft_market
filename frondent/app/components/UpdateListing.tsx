import {
  Modal,
  Input,
  Button,
  Skeleton,
  ModalContent
} from "@nextui-org/react";
import { useState } from "react";
import { ethers } from "ethers";
import Image from "next/image";
import {useContractWrite, useAccount, useChainId} from "wagmi";
import { Narrow, Abi } from "abitype";
import {waitForTransaction, waitForTransactionReceipt} from "@wagmi/core";
import {wagmiConfig} from "@/app/context/config";
import {marketAbi} from "@/constants/NFTMarket.abi";
export interface UpdateListing {
  isVisible: boolean;
  onClose: () => void;
  nftAddress: string;
  tokenId: number;
  imageURI: string | undefined;
  currentPrice?: string | undefined;
  refreshNftPage: Function;
}
import {toast} from "sonner";
import {getNftMarketAddrByNetworkId} from "@/app/lib/utils/getAddrByNetwork";
import {parseEther} from "viem";

export const UpdateListing = ({
  isVisible,
  onClose,
  nftAddress,
  tokenId,
  imageURI,
  currentPrice,
  refreshNftPage,
}: UpdateListing) => {
  const chainId = useChainId();
  const { address,isConnected } = useAccount();
  const [priceToUpdateListingWith, setPriceToUpdateListingWith] = useState<
    string | undefined
  >();
  const handleUpdateListingSuccess = async (hash: any) => {
    const receiptTx = await waitForTransactionReceipt(wagmiConfig,{
      hash:hash,
    });
    if (receiptTx.status === "success") {
      toast.success("Listing updated successfully");
      onClose && onClose();
      setPriceToUpdateListingWith("0");
      await refreshNftPage();
    } else {
      toast.error("Listing updated unsuccessfully");
    }
  };


  const {
    writeContract: cancelListing,
  } = useContractWrite({
    mutation:{
      onError(error) {
        console.log(error);
      },
      async onSuccess(hash,variables) {
        const receiptTx = await waitForTransactionReceipt(wagmiConfig,{
          hash:hash,
        });
        if (receiptTx.status === "success") {
          toast.success("Listing updated successfully");
          onClose && onClose();
          await refreshNftPage();
        } else {
          toast.error("Listing updated unsuccessfully");
        }
      },
    }
  });
  async  function handleCancelListingClick() {
    const marketplaceAddress = getNftMarketAddrByNetworkId(chainId.toString())
    cancelListing({
      address: marketplaceAddress as `0x${string}`,
      abi: marketAbi as Narrow<Abi>,
      functionName: "cancelList",
      account: address,
      args: [nftAddress, tokenId],
    })
  }
  const {
    writeContract: updateListing,
  } = useContractWrite({
    mutation:{
      onError(error) {
        console.log(error);
      },
      async onSuccess(hash,variables) {
        if (hash) {
          await handleUpdateListingSuccess(hash);
        } else {
          toast.error("Listing updated unsuccessfully");
        }
      },
    }
  });
  async function handleUpdateListingClick(){
    if (!isConnected && !priceToUpdateListingWith){
      return
    }
    const marketplaceAddress = getNftMarketAddrByNetworkId(chainId.toString())
    updateListing({
      address: marketplaceAddress as `0x${string}`,
      abi: marketAbi as Narrow<Abi>,
      functionName: "updateListing",
      account: address,
      args: [nftAddress, tokenId,parseEther(priceToUpdateListingWith || "0","wei")],
    })
  }

  return (
    <Modal
      isOpen={isVisible}
      id="regular"
      onClose={onClose}
      title="NFT Details"
      placement="top-center"
      backdrop="opaque"
    ><ModalContent>
      <div
        style={{
          alignItems: "center",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
        }}
      >
        <div className="flex flex-col items-center gap-4 py-4">
          <p className="p-4 text-lg">
            This is your listing. You may either update the listing price or
            cancel it.
          </p>
          <div className="flex flex-col items-end gap-2 border-solid border-2 border-gray-400 rounded p-2 w-fit">
            <div>#{tokenId}</div>
            {imageURI ? (
              <Image
                alt=""
                loader={() => imageURI}
                src={imageURI}
                height="200"
                width="200"
              />
            ) : (
              <Skeleton className="w-5/6 rounded-lg" />
            )}
            <div className="font-bold">{currentPrice} ETH</div>
          </div>
          <Input
              className="px-4"
            label="Update listing price in L1 Currency (ETH)"
            name="New listing price"
            onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
              setPriceToUpdateListingWith(event.target.value);
            }}
            type="number"
          />
          <Button
              id="upate-listing"
              onClick={handleUpdateListingClick}
              type="button"
              color="primary"
          >Update Listing</Button>
          or
          <Button
            id="cancel-listing"
            onClick={handleCancelListingClick}
            type="button"
            color="danger"
          >Cancel Listing</Button>
        </div>
      </div>
    </ModalContent>
    </Modal>
  );
};
