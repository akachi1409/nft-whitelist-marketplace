import "./CreatePageComp.css";
import { Container, Row } from "react-bootstrap";
import React, { useState } from "react";
import axios from "axios";

function CreatePageComp() {
  const [name, setName] = useState("");
  const [limit, setLimit] = useState(0);

  const onSubmit = async () => {
    try {
      const data = {
        name: name,
        limit: limit,
        address: "0xe8c125A440c049D08969d20657F46f87C8e659a5"
      };
      axios
        .post(`${process.env.REACT_APP_BACKEND_URL}/project/insert`, data)
        .then((res) => {
          console.log(`Server response: ${JSON.stringify(res, null, 0)}`);
        });
    } catch (err) {
      console.log("err", err);
    }
  };
  return (
    <div className="login-layout">
      <Container>
        <Row>
          <h2 className="login-title">Create Project</h2>
        </Row>
        <br />
        <Row>
          <input
            placeholder="Project Name"
            className="login-input"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </Row>
        <br />
        <Row>
          <input
            placeholder="WL Address Limit"
            className="login-input"
            value={limit}
            onChange={(e) => setLimit(e.target.value)}
          />
        </Row>
        <br />

        <Row>
          <button className="login-submit" onClick = {()=> onSubmit()}>Submit</button>
          {/* <Button2 title="Login"></Button2> */}
        </Row>
        <br />
      </Container>
    </div>
  );
}
export default CreatePageComp;
