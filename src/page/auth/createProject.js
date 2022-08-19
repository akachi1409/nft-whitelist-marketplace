import React from "react";


import Header from "../../components/header/header";
import CreatePageComp from "../../components/auth/CreatePage/CreatePageComp";
function CreatePage () {
    return(
        <div>
            {/* <Header title="Create Project" text="Home / Create Project"/> */}
            <CreatePageComp/>
            {/* <Footer/> */}
        </div>
    )
}
export default CreatePage;