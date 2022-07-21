import React, { useState, useEffect } from "react";
import { Container, Row } from "react-bootstrap";
import Table from "react-bootstrap/Table";
import Button from 'react-bootstrap/Button';

import axios from "axios";

import "./mynft.css";
function WlListComponent() {
  const [firstLoad, setFirstLoad] = useState(true);
  const [data, setData] = useState([]);
  useEffect(() => {
    async function fetchData() {
      if (firstLoad) {
        const res = await axios.get(
          `${process.env.REACT_APP_BACKEND_URL}/user/address/list`
        );
        console.log("res", res);
        setData(res.data.users);
      }
      setFirstLoad(true);
    }
    fetchData();
  }, [firstLoad]);

  const downloadText = () => {
    const fileData = JSON.stringify(data);
    const blob = new Blob([fileData], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.download = "whitelist.json";
    link.href = url;
    link.click();
  }
  return (
    <div className="mynft-layout">
      <Container>
        <div className="mynft-title-layout">
          <h2 className="mynft-title">Project: Test</h2>
          <div className="bottomBar"></div>
        </div>
        {
          data.length>0 &&(
            <Row>
              <div className="align-left">
                <Button variant="primary" onClick={()=>downloadText()}>Download</Button>
              </div>
            </Row>
          )
        }
        <Row>
          <Table striped bordered hover className="mynft-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Address</th>
              </tr>
            </thead>
            <tbody>
              {data.length > 0 && data.map((item, index) => 
              <tr key ={index}>
                <td className="white-color">{item.user_id}</td>
                <td className="white-color">{item.address}</td>
              </tr>)}
            </tbody>
          </Table>
        </Row>
      </Container>
    </div>
  );
}
export default WlListComponent;
