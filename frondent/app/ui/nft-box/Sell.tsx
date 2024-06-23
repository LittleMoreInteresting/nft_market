import React from "react";
import {
    Modal,
    ModalContent,
    ModalHeader,
    ModalBody,
    ModalFooter,
    Button,
    Input,
} from "@nextui-org/react";
import {PressEvent} from "@react-types/shared";
import Image from "next/image";
export interface SellNftProps {
    isVisible: boolean;
    onClose: () => void;
    nftMarketPlaceAbi?: object;
    marketPlaceAddress?: string;
    nftAddress: string;
    tokenId: number;
    name:string;
    imageURI: string | undefined;
    currentPrice?: string | undefined;
    onPriceChange:(value:string) => void
    onConfirm?: () => void;
}
export default function SellNftBox({
                                       isVisible,
                                       onClose,
                                       nftMarketPlaceAbi,
                                       marketPlaceAddress,
                                       nftAddress,
                                       tokenId,
                                       imageURI,
                                       currentPrice,
                                       onConfirm,
                                       name,
                                       onPriceChange,
                                   }:SellNftProps) {

    return (
        <>
            <Modal
                isOpen={isVisible}
                placement="top-center"
                backdrop="opaque"
                onClose={onClose}
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
                                label="TokenId"
                                variant="bordered"
                                isDisabled
                                value={tokenId.toString()}
                            />
                            <Input
                                autoFocus
                                isRequired
                                label="Price"
                                placeholder="0.00001"
                                variant="bordered"
                                endContent="ETH"
                                value={currentPrice}
                                type="number"
                                onValueChange={onPriceChange}
                            />
                        </ModalBody>
                        <ModalFooter>
                            <Button color="danger" variant="flat" onPress={onClose}>
                                Close
                            </Button>
                            <Button color="primary" onPress={onConfirm} >
                                Confirm
                            </Button>
                        </ModalFooter>
                    </>
                </ModalContent>
            </Modal>
        </>
    );
}