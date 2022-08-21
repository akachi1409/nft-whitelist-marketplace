import React from "react";


import Header from "../../components/header/header";
import WlListComponent from "../../components/auth/profile/wlListComponent"
import { useParams } from "react-router-dom";

function WlList () {
    const { projectName } = useParams();
    return(
        <div>
            <Header title="My NFT" text="Home / Profile / MyNFT"/>
            <WlListComponent projectName = {projectName}/>
            {/* <Footer/> */}
        </div>
    )
}
export default WlList;