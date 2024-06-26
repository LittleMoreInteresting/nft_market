import { Address, BigInt } from "@graphprotocol/graph-ts"
import {
  BuyNFT as BuyNFTEvent,
  CancelListing as CancelListingEvent,
  NftListed as NftListedEvent,
} from "../generated/NFTMarket/NFTMarket"
import { BuyNFT, CancelListing, NftListed,NftListing } from "../generated/schema"

export function handleBuyNFT(event: BuyNFTEvent): void {
  let entity = new BuyNFT(
    event.transaction.hash.concatI32(event.logIndex.toI32()),
  )
  entity.buyer = event.params.buyer
  entity.nftAddress = event.params.nftAddress
  entity.tokenId = event.params.tokenId
  entity.price = event.params.price

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()

  const id = buildId(event.params.nftAddress,event.params.tokenId);
  let listed = NftListing.load(id)
  if (listed){
    listed.status = 3;
    listed.save()
  }
}

export function handleCancelListing(event: CancelListingEvent): void {
  let entity = new CancelListing(
    event.transaction.hash.concatI32(event.logIndex.toI32()),
  )
  entity.seller = event.params.seller
  entity.nftAddress = event.params.nftAddress
  entity.tokenId = event.params.tokenId

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash
  entity.save()

  const id = buildId(event.params.nftAddress,event.params.tokenId);
  let listed = NftListing.load(id)
  if (listed){
    listed.status = 2;
    listed.save()
  }
}

export function handleNftListed(event: NftListedEvent): void {
 
  let entity = new NftListed(
    event.transaction.hash.concatI32(event.logIndex.toI32()),
  )

  entity.seller = event.params.seller
  entity.nftAddress = event.params.nftAddress
  entity.tokenId = event.params.tokenId
  entity.price = event.params.price
  entity.old_price = event.params.old_price

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()

  const id = buildId(event.params.nftAddress,event.params.tokenId);
  let list = NftListing.load(id)
  if (!list){
    list = new NftListing(id)
  }
  list.seller = event.params.seller
  list.nftAddress = event.params.nftAddress
  list.tokenId = event.params.tokenId
  list.price = event.params.price
  list.blockTimestamp = event.block.timestamp
  list.status = 1
  list.save()
}

function buildId(nftAddr:Address,tokenId:BigInt): string {
  return nftAddr.toHexString() +"."+ tokenId.toString();
}