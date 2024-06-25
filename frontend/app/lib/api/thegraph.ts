import { ApolloClient, InMemoryCache, gql } from '@apollo/client'

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
   