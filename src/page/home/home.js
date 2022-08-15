import React from "react";

import HomePage from "../../components/home/homePage"
import Footer from "../../components/footer/footer";
import { useParams } from "react-router-dom";
function Home() {
    const { projectName } = useParams();
    return (
        <div>
            <HomePage projectName={projectName}/>
            {/* <Footer/> */}
        </div>
    )
}

export default Home