import { ApolloClient, InMemoryCache, gql } from '@apollo/client'
import exp from 'constants';

const APIURL= process.env.NEXT_PUBLIC_APIURL!;
const client = new ApolloClient({
    uri: APIURL,
    cache: new InMemoryCache(),
})

export const transfersQuery = gql`
    query USER_TRANSFER($address:Bytes!){
        transfers(first: 20 orderBy:blockTimestamp orderDirection:desc where:{or:[{from: $address},{to: $address}]}) {
            id
            from
            to
            value
            blockTimestamp
        }
    }
  `

export const tokensQuery = gql`
    query TOEKNS($owner:Bytes!,$pageSize:Int,$pageSkip:Int){
        tokenOwners(first:$pageSize skip:$pageSkip where:{owner:$owner}){
            id
            owner
            from
        }
    }
`

export const listQuery = gql`
    query LIST($status:Int!,$pageSize:Int,$pageSkip:Int){
        nftListings(first:$pageSize skip:$pageSkip where:{status:$status}) {
            id
            tokenId
            seller
            nftAddress
            tokenId
            price
            status
            blockTimestamp
        }
  }
`