import React from "react";
import {Navbar, NavbarBrand, NavbarContent, NavbarItem, Link, Button} from "@nextui-org/react";
import { ConnectButton } from "@rainbow-me/rainbowkit";
function Header(){

    return (<div>
        <nav className="p-5 border-b-2 flex flex-row justify-between  text-black items-center">
            <Link href="/" className="mr-4  p-6"><h1 className="py-4 px-4  text-black font-bold text-3xl">NFT MarketPlace</h1></Link>
            <div className="flex  flex-row items-center ">
                <Link href="/" className="mr-4  text-black p-6">
                    Market
                </Link>
                <Link href="/my-nft" className="mr-4  text-black p-6">
                Horace NFT
                </Link>
                <Link href="/faucet" className="mr-4  text-black p-6">
                    OBT Faucet
                </Link>
                <ConnectButton/>
            </div>
        </nav>
    </div>)
}

export default Header