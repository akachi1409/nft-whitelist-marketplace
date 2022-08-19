import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { Nav, Navbar, Container, Row, Col } from "react-bootstrap";
import axios from "axios";
import { Grid, GridColumn, GridToolbar } from "@progress/kendo-react-grid";
import { ExcelExport } from "@progress/kendo-react-excel-export";
import '@progress/kendo-theme-default/dist/all.css';

import GenesisImage from "../../assets/genesis.png";
import WLImage from "../../assets/wl.png";
import RobosImage from "../../assets/robos.png";
import ClankImage from "../../assets/clank.png";
import MerchImage from "../../assets/merch.png";
import OtherImage from "../../assets/other.png";
import "./adminPage.css";

function AdminPage() {
  const [mode, setMode] = useState(0);
  const [firstLoad, setFirstLoad] = useState(true);
  const [projects, setProjects] = useState([]);
  const [wldata, setWldata] = useState();
  const [page, setPage] = React.useState({
    skip: 0,
    take: 3,
  });
  const blockchain = useSelector((state) => state.blockchain);
  let navigate = useNavigate();
  useEffect(() => {
    if (blockchain.account === null) {
      navigate("/");
    }
    getProjects();
    setFirstLoad(false);
    /* eslint-disable */
  }, [firstLoad]);

  const onNav = (url) => {
    navigate(url);
  };

  const _export = React.useRef(null);

  const excelExport = () => {
    if (_export.current !== null) {
      _export.current.save();
    }
  };

  async function getProjects() {
    try {
      const res = await axios.get(
        `${process.env.REACT_APP_BACKEND_URL}/project/list`
      );
    //   console.log("res", res);
      if (res.data.success) {
        setProjects(res.data.projects);
      }
    } catch (err) {
      console.log("error", err);
    }
  }

  const getWLProject = async (projectName) => {
    try {
      const res = await axios.get(
        `${process.env.REACT_APP_BACKEND_URL}/project/list/project`
      );
      console.log("res", res, projectName)
      const data = []
      res.data.orders.map((order) => {
        order.whitelist.map((wl) =>{
            if (wl.whitelistName === projectName){
                const temp = {
                    orderNumber: order.orderNumber,
                    totalEther: order.totalEther,
                    totalClank: order.totalClank,
                    clankCost: wl.clankCost,
                    etherCost: wl.etherCost,
                    discordID: order.discordID,
                    orderDate: order.orderDate.split("T")[0]+ " " + order.orderDate.split("T")[1].split(".")[0],
                    walletAddress: order.walletAddress,
                    quantity: wl.quantity,
                    projectName: wl.whitelistName,
                };
                data.push(temp)
            }
            
            
        })
      })
      console.log("data", data);
      setWldata(data);
      setMode(3);
    } catch (err) {
      console.log("error", err);
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100vh" }}>
      <Navbar bg="transparent" variant="light" className="navbar-layout">
        <Container>
          <Navbar.Brand onClick={() => onNav("/")}>
            <h2 className="navbar-home">Home</h2>
          </Navbar.Brand>
          <Nav>
            <Nav.Item className="nav-wallet-layout">
              <Nav.Link className="nav-wallet">Admin</Nav.Link>
            </Nav.Item>
          </Nav>
        </Container>
      </Navbar>
      <div className="adminPage-layout">
        <div className="projectList-layout">
          {/* 6 categories */}
          {mode === 0 && (
            <div className="project-layout">
              <img
                src={GenesisImage}
                alt=""
                className="project-item"
                onClick={() => {
                  setMode(1);
                }}
              />
              <img
                src={WLImage}
                alt=""
                className="project-item"
                onClick={() => {
                  setMode(2);
                }}
              />
              <img
                src={RobosImage}
                alt=""
                className="project-item"
                onClick={() => {
                  setMode(1);
                }}
              />
              <img
                src={ClankImage}
                alt=""
                className="project-item"
                onClick={() => {
                  setMode(1);
                }}
              />
              <img
                src={MerchImage}
                alt=""
                className="project-item"
                onClick={() => {
                  setMode(1);
                }}
              />
              <img
                src={OtherImage}
                alt=""
                className="project-item"
                onClick={() => {
                  setMode(1);
                }}
              />
            </div>
          )}
          {/* To be developed */}
          {mode === 1 && (
            <div className="genesis-modal">
              <div className="genesis-modal-exit-layer">
                <h3 className="genesis-modal-title">To be developed!</h3>
                <span className="close-btn" onClick={() => setMode(0)}>
                  &times;
                </span>
              </div>
            </div>
          )}
          {/* Show the project list here */}
          {mode === 2 && (
            <div className="genesis-modal">
              <div className="genesis-modal-exit-layer">
                <h3 className="genesis-modal-title">Whitelist Admin</h3>
                <span className="close-btn" onClick={() => setMode(0)}>
                  &times;
                </span>
              </div>
              <div className="genesis-modal-content-layer">
                <div
                  className="genesis-modal-wallet"
                  onClick={() => onNav("/create_project")}
                >
                  <h5 className="genesis-btn">Create Project</h5>
                </div>
                {projects.map((item, index) => (
                  <div className="genesis-modal-content-row">
                    <img
                      className="genesis-img"
                      src={
                        `${process.env.REACT_APP_BACKEND_URL}/uploads/` +
                        item.imageName
                      }
                    />
                    <div className="genesis-modal-details">
                      <h3 className="genesis-modal-detail-title">
                        {item.projectName}
                      </h3>
                      {/* <div className="holding-bar"/> */}
                      <p>{item.description}</p>
                    </div>
                    <div className="genesis-modal-description">
                      <h3 className="genesis-modal-detail-title">Price</h3>
                      {/* <div className="holding-bar"/> */}
                      {/* <h4>{item.listedWl}/{item.wlLimit}</h4> */}
                      <div className="genesis-modal-col">
                        <h4 className="genesis-modal-detail-price">
                          {item.etherPrice + " "}Ether
                        </h4>
                        <div className="holding-bar" />
                        <h4 className="genesis-modal-detail-price">
                          {item.clankPrice + " "}Clank
                        </h4>
                      </div>
                    </div>
                    <div className="genesis-modal-button">
                      <div
                        className="genesis-modal-wallet"
                        onClick={() => getWLProject(item.projectName)}
                      >
                        <h5 className="genesis-btn">Download Orders</h5>
                      </div>
                      <div
                        className="genesis-modal-wallet"
                        // onClick={() => onAdd(item)}
                      >
                        <h5 className="genesis-btn">Add To Cart</h5>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          {mode === 3 && (
            <div className="genesis-modal">
              <div className="genesis-modal-exit-layer">
                <h3 className="genesis-modal-title">Whitelist Admin</h3>
                <span className="close-btn" onClick={() => setMode(0)}>
                  &times;
                </span>
              </div>
              <div className="genesis-modal-content-layer">
                <ExcelExport data={wldata} ref={_export}>
                  <Grid
                    data={wldata.slice(page.skip, page.skip + page.take)}
                    onPageChange={(e) => setPage(e.page)}
                    total={wldata.length}
                    skip={page.skip}
                    pageable={true}
                    pageSize={page.take}
                  >
                    <GridToolbar>
                      <button
                        title="Export Excel"
                        className="k-button k-button-md k-rounded-md k-button-solid k-button-solid-primary"
                        onClick={excelExport}
                      >
                        Export to Excel
                      </button>
                    </GridToolbar>
                    <GridColumn field="projectName" title="Project Name"  width="100px"  />
                    <GridColumn field="walletAddress" title="Wallet Address"/>
                    <GridColumn field="orderNumber" title="Order Number"/>
                    <GridColumn field="totalEther" title="Total Ether" width="100px" />
                    <GridColumn field="totalClank" title="Total Clank"  width="100px"  />
                    <GridColumn field="discordID" title="Discord ID"/>
                    <GridColumn field="clankCost" title="Clank Cost" width="100px" />
                    <GridColumn field="etherCost" title="Ether Cost"  width="100px"  />
                    <GridColumn field="quantity" title="Quantity" width="100px" />
                    <GridColumn field="orderDate" title="Date"  width="100px" />
                  </Grid>
                </ExcelExport>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
export default AdminPage;
