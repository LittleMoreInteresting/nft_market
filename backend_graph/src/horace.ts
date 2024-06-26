import { Address, BigInt } from "@graphprotocol/graph-ts"
import {
  Approval as ApprovalEvent,
  ApprovalForAll as ApprovalForAllEvent,
  OwnershipTransferred as OwnershipTransferredEvent,
  Transfer as TransferEvent,
} from "../generated/Horace/Horace"
import {
  HoraceTransfer,
  TokenOwner,
} from "../generated/schema"

export function handleTransfer(event: TransferEvent): void {
  let entity = new HoraceTransfer(
    event.transaction.hash.concatI32(event.logIndex.toI32()),
  )
  entity.from = event.params.from
  entity.to = event.params.to
  entity.tokenId = event.params.tokenId

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
  updateTokenOwner(event.params.from,event.params.to,event.params.tokenId,event.block.timestamp);
}

function updateTokenOwner(from:Address,to:Address,tokenId:BigInt,timestamp:BigInt):void {
  let tokenOwner = TokenOwner.load(tokenId.toHex())
    if (!tokenOwner) {
      tokenOwner = new TokenOwner(tokenId.toString())
    }
    tokenOwner.from = from;
    tokenOwner.owner = to;
    tokenOwner.blockTimestamp = timestamp
    tokenOwner.save()
}