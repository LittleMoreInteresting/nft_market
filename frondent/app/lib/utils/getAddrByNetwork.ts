import networkMapping from "@/constants/networkMapping.json";
interface NetworkMapping {
    [key: string]: {OBToken:string, NFTMarket: string,HoraceNFT:string };
}
export const getNftAddrByNetworkId = (networkId: string): `0x${string}` => {
    const network = (networkMapping as NetworkMapping)[networkId];
    if (
        network &&
        network.HoraceNFT &&
        network.HoraceNFT.length > 0
    ) {
        return  network.HoraceNFT as `0x${string}`;
    } else {
        return  "" as `0x${string}`;
    }
}
export const getNftMarketAddrByNetworkId = (networkId: string): `0x${string}` => {
    const network = (networkMapping as NetworkMapping)[networkId];
    if (
        network &&
        network.NFTMarket &&
        network.NFTMarket.length > 0
    ) {
        return  network.NFTMarket as `0x${string}`;
    } else {
        return  "" as `0x${string}`;
    }
}

export const getTokenAddrByNetworkId = (networkId: string): `0x${string}` => {
    const network = (networkMapping as NetworkMapping)[networkId];
    if (
        network &&
        network.OBToken &&
        network.OBToken.length > 0
    ) {
        return  network.OBToken  as `0x${string}`;
    } else {
        return  ""  as `0x${string}`;
    }
}