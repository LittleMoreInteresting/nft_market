import {
  BuyNFT as BuyNFTEvent,
  CancelListing as CancelListingEvent,
  NftListed as NftListedEvent,
} from "../generated/NFTMarket/NFTMarket"
import { BuyNFT, CancelListing, NftListed } from "../generated/schema"

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
}
