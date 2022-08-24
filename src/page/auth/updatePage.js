import React from "react";

import UpdatePageComp from "../../components/auth/UpdatePage/updatePageComp"
import { useParams } from "react-router-dom";

function UpdatePage(){
    const { projectID } = useParams();

    return(
        <div>
            <UpdatePageComp projectID={projectID} />
        </div>
    )
}
export default UpdatePage