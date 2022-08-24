import React from "react";

import UpdatePageComp from "../../components/auth/UpdatePage/updatePageComp"
import { useParams } from "react-router-dom";

function UpdatePage(){
    const { projectName } = useParams();

    return(
        <div>
            <UpdatePageComp projectName={projectName} />
        </div>
    )
}
export default UpdatePage