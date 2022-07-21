import React from "react";


import Footer from "../../components/footer/footer";
import Header from "../../components/header/header";
import WlListComponent from "../../components/auth/profile/wlListComponent"
function WlList () {
    return(
        <div>
            <Header title="My NFT" text="Home / Profile / MyNFT"/>
            <WlListComponent/>
            <Footer/>
        </div>
    )
}
export default WlList;