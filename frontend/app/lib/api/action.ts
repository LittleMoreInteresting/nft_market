import axios, { AxiosResponse } from "axios";

const serverUrl = process.env.NEXT_PUBLIC_SERVER_URL!;

class Api {
    private baseUrl: string;

    constructor(baseUrl: string) {
        this.baseUrl = baseUrl;
    }

    // 封装获取 NFT Metadata 的请求
    async getNFTMetaData(
        nftAddress: string,
        tokenId: string,
        chainId: string
    ): Promise<AxiosResponse<any>> {
        const url = `${this.baseUrl}/nft/metaData/getNFTMetadata`;
        try {
            const response = await axios.get(url, {
                params: { nftAddress, tokenId, chainId },
            } as any);
            return response.data;
        } catch (error) {
            throw error;
        }
    }

    // 封装获取 all listed NFTs 的请求
    async getListedNftPage(
        page: number,
        pageSize: number,
        marketPlaceAddr:string,
    ): Promise<AxiosResponse<any>> {
        const url = `${this.baseUrl}/nft/listed/listedPage`;
        try {
            const response = await axios.get(url, {
                params: { page, pageSize,marketPlaceAddr },
            } as any);
            return response.data;
        } catch (error) {
            throw error;
        }
    }
}

const API = new Api(serverUrl)
export default  API;

interface selfNft {
    nftAddress?: string;
    owner: string;
    chainId: string;
    page: number;
    pageSize: number;
}
export async function GetSelfNftList(req:selfNft){
    const url = `${serverUrl}/nft/self-page/list`;
    try {
        const response = await axios.get(url, {
            params: req,
        } as any);
        return response.data;
    } catch (error) {
        throw error;
    }
}

export async function getNftData({nftAddress,tokenId,chainId}:{
    nftAddress:string,
    tokenId:string,
    chainId:string
}) {
    const respData = await API.getNFTMetaData(
        nftAddress,
        tokenId.toString(),
        "0x" +  parseInt(chainId).toString(16)
    );
    const metadata = respData.data.normalized_metadata;
    if (!metadata) {
        throw new Error('metadata not found!')
    }
    const NFTName = respData.data.name
    const imageURI = metadata.image
    const name = metadata.name
    const description = metadata.description
    return { metadata,NFTName,imageURI,name,description}
}