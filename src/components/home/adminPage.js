import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { Nav, Navbar, Container} from "react-bootstrap";
import axios from "axios";
import { Grid, GridColumn, GridToolbar } from "@progress/kendo-react-grid";
import { ExcelExport } from "@progress/kendo-react-excel-export";
import '@progress/kendo-theme-default/dist/all.css';
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

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
  const notify = (msg) => toast(msg);

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
        `api/project/list`
      );
    //   console.log("res", res);
      if (res.data.success) {
        const projects = []
         // eslint-disable-next-line
        res.data.projects.map((project)=>{
          const diff = new Date(project.endTime).getTime() -new Date().getTime()
          const hours = Math.floor(
            (diff) /(1000 * 60 * 60)
            )
          const mins = Math.floor((diff - hours*(1000 * 60 * 60))/(1000*60))
          // console.log("project", project, diff, hours, mins, diff>0)
          const temp = {
            projectName: project.projectName,
            imageName: project.imageName,
            description: project.description,
            listedWl: project.listedWl,
            wlLimit: project.wlLimit,
            hours: hours,
            mins: mins,
            diff: diff,
            etherPrice: project.etherPrice,
            clankPrice: project.clankPrice,
            endTime: project.endTime,
            projectID: project._id
          };
          projects.push(temp);
        })
        setProjects(projects);
      }
    } catch (err) {
      console.log("error", err);
    }
  }

  const getWLProject = async (projectName) => {
    try {
      const res = await axios.get(
        `api/project/project  `
      );
      console.log("res", res, projectName)
      const data = []
      res.data.orders.map((order) => {
        order.whitelist.map((wl) =>{
            if (wl.whitelistName === projectName){
                const temp = {
                  owner: order.owner,
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

  const onRemoveProject = async (projectID) => {
    const res = await axios.delete(`api/project/delete/${projectID}`)
    if (res.status === 200 && res.data.success===true){
      notify("Project is removed")
      navigate("/")
    }
    if (res.status === 500){
      notify("Server Error")
    }
  }

  const getAllWLProject = async () => {
    try {
        const res = await axios.get(
          `api/project/project`
        );
        const data = []
        res.data.orders.map((order) => {
          order.whitelist.map((wl) =>{
            console.log("order", order);
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
          })
        })
        console.log("data", data);
        setWldata(data);
        setMode(3);
      } catch (err) {
        console.log("error", err);
      }
  }
  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100vh" }} className="adminPage">
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
                <div
                  className="genesis-modal-wallet"
                  onClick={() => getAllWLProject()}
                >
                  <h5 className="genesis-btn">Download All Order History</h5>
                </div>
                {projects.map((item, index) => (
                  <table className="genesis-table">
                    <tr>
                      <td rowSpan="3">
                        <img
                          className="genesis-img"
                          alt=""
                          src={item.imageName}
                        />
                      </td>
                      
                      <td
                        className="genesis-modal-details"
                        style={{ width: "50%" }}
                      >
                        <h3 className="genesis-modal-detail-title">
                          {item.projectName}
                        </h3>
                      </td>
                      <td>
                        <h3 className="genesis-modal-detail-title">
                          Time Remaining
                        </h3>
                      </td>
                      <td>
                        <h3 className="genesis-modal-detail-title">Stock</h3>
                      </td>
                      <td>
                        <h3 className="genesis-modal-detail-title">Price</h3>
                      </td>
                      <td rowSpan="3" style={{flexDirection: "column"}}>
                        <div
                          className="genesis-modal-wallet"
                          onClick={() => getWLProject(item.projectName)}
                        >
                          <h5 className="genesis-btn">Download Orders</h5>
                        </div>
                        <div
                          className="genesis-modal-wallet"
                          onClick={() => onRemoveProject(item.projectID)}
                        >
                          <h5 className="genesis-btn">Remove</h5>
                        </div>
                        <div
                          className="genesis-modal-wallet"
                          onClick={() => onNav("/update_project/" + item.projectID)}
                        >
                          <h5 className="genesis-btn">Update</h5>
                        </div>
                      </td>
                    </tr>
                    <tr>
                      <td rowSpan="2" className="wordbreak">
                        {item.description}
                      </td>
                      {item.diff > 0 ? (
                        <td rowSpan="2">{item.hours + ":" + item.mins}</td>
                      ) : (
                        <td rowSpan="2">Closed</td>
                      )}
                      <td rowSpan="2">
                        <p>
                          {item.listedWl}/{item.wlLimit}
                        </p>
                      </td>
                      <td>
                        <h4 className="genesis-modal-detail-price">
                          {item.etherPrice + " "}Ether
                        </h4>
                      </td>
                    </tr>
                    <tr>
                      <td>
                        <h4 className="genesis-modal-detail-price">
                          {item.clankPrice + " "}Clank
                        </h4>
                      </td>
                    </tr>
                  </table>
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
                    <GridColumn
                      field="projectName"
                      title="Project Name"
                      width="100px"
                    />
                    <GridColumn field="walletAddress" title="Purchase Wallet Address" />
                    <GridColumn field="owner" title="Whitelist Allocation" />
                    <GridColumn field="orderNumber" title="Order Number" />
                    <GridColumn
                      field="totalEther"
                      title="Total Ether"
                      width="100px"
                    />
                    <GridColumn
                      field="totalClank"
                      title="Total Clank"
                      width="100px"
                    />
                    <GridColumn field="discordID" title="Discord ID" />
                    <GridColumn
                      field="clankCost"
                      title="Clank Cost"
                      width="100px"
                    />
                    <GridColumn
                      field="etherCost"
                      title="Ether Cost"
                      width="100px"
                    />
                    <GridColumn
                      field="quantity"
                      title="Quantity"
                      width="100px"
                    />
                    <GridColumn field="orderDate" title="Date" width="100px" />
                  </Grid>
                </ExcelExport>
              </div>
            </div>
          )}
        </div>
      </div>
      <ToastContainer/>
    </div>
  );
}
export default AdminPage;
