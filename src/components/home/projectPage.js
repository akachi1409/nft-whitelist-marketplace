import "./projectPage.css";
import React, { useState, useEffect } from "react";
import { Nav, Navbar, Container, Row, Col } from "react-bootstrap";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { useUserProviderAndSigner } from "eth-hooks";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import axios from "axios";
import delay from "delay";
import { connect, disconnect } from "../../redux/blockchain/blockchainActions";

import { Web3ModalSetup } from "../../helpers";
import { useStaticJsonRPC } from "../../hooks";
import {
  NETWORKS,
  ADMIN_ADDRESS,
  ALCHEMY_KEY,
  ETHER_ADDRESS,
  CLANK_ADDRESS,
  CONTRACT_ADDRESS,
  CLANK_CONTRACT_ADDRESS,
} from "../../constants";

import GenesisImage from "../../assets/genesis.png";
import WLImage from "../../assets/wl.jpg";
import RobosImage from "../../assets/robos.png";
import ClankImage from "../../assets/clank.jpg";
import MerchImage from "../../assets/merch.png";
import OtherImage from "../../assets/other.jpg";
const { ethers } = require("ethers");
const initialNetwork = NETWORKS.mainnet;
// const NETWORKCHECK = true;
// const USE_BURNER_WALLET = false;
// const USE_NETWORK_SELECTOR = false;
const web3Modal = Web3ModalSetup();

const ProjectPage = () => {
  const dispatch = useDispatch();
  let navigate = useNavigate();
  const notify = (msg) => toast(msg);

  const blockchain = useSelector((state) => state.blockchain);
  const networkOptions = [initialNetwork.name, "mainnet"];
  const [injectedProvider, setInjectedProvider] = useState();
  const [selectedNetwork, setSelectedNetwork] = useState(networkOptions[0]);

  const [address, setAddress] = useState(null);
  const [projects, setProjects] = useState([]);
  const [mode, setMode] = useState(0);
  const [selectedProject, setSelectedProject] = useState("");
  const [amounts, setAmounts] = useState(0);
  const targetNetwork = NETWORKS[selectedNetwork];

  // const blockExplorer = targetNetwork.blockExplorer;

  // load all your providers
  const localProvider = useStaticJsonRPC([
    process.env.REACT_APP_PROVIDER
      ? process.env.REACT_APP_PROVIDER
      : targetNetwork.rpcUrl,
  ]);
  // const mainnetProvider = useStaticJsonRPC(providers);
  // Use your injected provider from 🦊 Metamask or if you don't have it then instantly generate a 🔥 burner wallet.
  const userProviderAndSigner = useUserProviderAndSigner(
    injectedProvider,
    localProvider
  );
  const userSigner = userProviderAndSigner.signer;

  const selectedChainId =
    userSigner &&
    userSigner.provider &&
    userSigner.provider._network &&
    userSigner.provider._network.chainId;

  const onNav = (url) => {
    navigate(url);
  };

  const onConnect = () => {
    loadWeb3Modal();
  };
  const loadWeb3Modal = async () => {
    const provider = await web3Modal.connect();
    // console.log("provider:", provider, selectedChainId)
    setInjectedProvider(new ethers.providers.Web3Provider(provider));

    provider.on("chainChanged", (chainId) => {
      console.log("chainId:", chainId);
      if (chainId !== "0x1") {
        notify("You should connect to mainnet!");
        return;
      }
      // console.log(`chain changed to ${chainId}! updating providers`);
      setInjectedProvider(new ethers.providers.Web3Provider(provider));
    });

    provider.on("accountsChanged", () => {
      console.log(`account changed!`);
      setInjectedProvider(new ethers.providers.Web3Provider(provider));
    });

    // Subscribe to session disconnection
    provider.on("disconnect", (code, reason) => {
      console.log(code, reason);
      logoutOfWeb3Modal();
    });
    // eslint-disable-next-line
  };

  const logoutOfWeb3Modal = async () => {
    await web3Modal.clearCachedProvider();
    if (
      injectedProvider &&
      injectedProvider.provider &&
      typeof injectedProvider.provider.disconnect == "function"
    ) {
      await injectedProvider.provider.disconnect();
    }
    setTimeout(() => {
      window.location.reload();
    }, 1);
  };

  const onDisconnect = async () => {
    await web3Modal.clearCachedProvider();
    if (
      injectedProvider &&
      injectedProvider.provider &&
      typeof injectedProvider.provider.disconnect == "function"
    ) {
      await injectedProvider.provider.disconnect();
    }
    setTimeout(() => {
      window.location.reload();
    }, 1);
    dispatch(disconnect());
  };

  async function getProjects() {
    try {
      const res = await axios.get(
        `${process.env.REACT_APP_BACKEND_URL}/project/list`
      );
      console.log("res", res);
      if (res.data.success) {
        setProjects(res.data.projects);
      }
    } catch (err) {
      console.log("error", err);
    }
  }

  async function onBuy(project){
    setSelectedProject(project)
    setMode(7)
  }

  useEffect(() => {
    async function checkProjects() {
      getProjects();
    }
    checkProjects();
  }, [blockchain]);

  useEffect(() => {
    async function getAddress() {
      if (userSigner) {
        const newAddress = await userSigner.getAddress();
        // const contract = new ethers.Contract(CONTRACT_ADDRESS, RobosNFT, injectedProvider);
        // console.log("chainId",  selectedChainId);
        if (selectedChainId !== 1) {
          notify("You should change your chain to Mainnet!");
          await delay(3000);
          onDisconnect();
        }
        console.log(newAddress);
        setAddress(newAddress);
        dispatch(connect(newAddress));
      }
    }
    getAddress();
    // eslint-disable-next-line
  }, [userSigner]);
  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100vh" }}>
      <Navbar bg="transparent" variant="light" className="navbar-layout">
        <Container>
          <Navbar.Brand onClick={() => onNav("/")}>
            <h2 className="navbar-home">Home</h2>
          </Navbar.Brand>

          <Nav></Nav>
          <Nav>
            {blockchain.account === null ? (
              <Nav.Item className="nav-wallet-layout">
                <Nav.Link className="nav-wallet" onClick={() => onConnect()}>
                  Connect Wallet
                </Nav.Link>
              </Nav.Item>
            ) : (
              <Nav.Item className="nav-wallet-layout">
                <Nav.Link className="nav-wallet" onClick={() => onDisconnect()}>
                  Disconnect Wallet
                </Nav.Link>
              </Nav.Item>
            )}
          </Nav>
        </Container>
      </Navbar>
      <div className="projectPage-layout">
        <div className="projectList-layout">
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
          {mode === 2 && (
            <div className="genesis-modal">
              <div className="genesis-modal-exit-layer">
                <h3 className="genesis-modal-title">Whitelist Store</h3>
                <span className="close-btn" onClick={() => setMode(0)}>
                  &times;
                </span>
              </div>
              <div className="genesis-modal-content-layer">
                {projects.map((item, index) => (
                  <div className="genesis-modal-content-row">
                    <img className="genesis-img"
                    src = {`${process.env.REACT_APP_BACKEND_URL}/uploads/` + item.imageName}/>
                    <div className="genesis-modal-details">
                      <h3 className="genesis-modal-detail-title">{item.projectName}</h3>
                      {/* <div className="holding-bar"/> */}
                      <p>{item.description}</p>
                    </div>
                    <div className="genesis-modal-description">
                      <h3 className="genesis-modal-detail-title">Price</h3>
                      {/* <div className="holding-bar"/> */}
                      {/* <h4>{item.listedWl}/{item.wlLimit}</h4> */}
                      <div className="genesis-modal-col">
                        <h4 className="genesis-modal-detail-price">{item.etherPrice+" "}Ether</h4>
                        <div className="holding-bar"/>
                        <h4 className="genesis-modal-detail-price">{item.clankPrice+ " "}Clank</h4>
                      </div>
                    </div>
                    <div className="genesis-modal-button">
                      <div className="genesis-modal-wallet" onClick= {()=> onBuy(item)}><h5 className="genesis-btn">Buy Now</h5></div>
                      <div className="genesis-modal-wallet"><h5 className="genesis-btn">Add To Cart</h5></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
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
          {
            mode === 7 && (
              <div className="project-buy-layout">
                <div className="project-buy-exit-layer">
                  <h3 className="project-buy-title">Buy WL</h3>
                  <span className="close-btn" onClick={() => setMode(0)}>
                    &times;
                  </span>
                </div>
                <div className="project-buy-content">
                  <h3 className="project-buy-title">{selectedProject.projectName}</h3>
                  <div className="project-buy-row">
                    <img className="project-buy-img"
                    src = {`${process.env.REACT_APP_BACKEND_URL}/uploads/` + selectedProject.imageName}/>
                    <div className="project-buy-description">{selectedProject.description}</div>
                  </div>
                  <div className="project-buy-row">
                    <h5 className="project-buy-price">Ether: </h5>
                    <h5 className="project-buy-price">{selectedProject.etherPrice}</h5>
                  </div>
                  <div className="project-buy-row">
                    <h5 className="project-buy-price">Clank: </h5>
                    <h5 className="project-buy-price">{selectedProject.clankPrice}</h5>
                  </div>
                  <div className="project-buy-row">
                    <h5 className="project-buy-price">Quantity: </h5>
                    <h5 className="project-buy-sign" onClick={()=> setAmounts(amounts+ 1)}>+</h5>
                    <h5 className="project-buy-price">{amounts}</h5>
                    <h5 className="project-buy-sign" onClick={()=> setAmounts(amounts- 1)}>-</h5>
                  </div>
                  <div className="project-buy-row">
                    <div className="project-buy-btn">Buy Now</div>
                  </div>
                </div>
              </div>
            )
          }
          {/* <div className="projectTable-layout"> */}
          {/* {
                blockchain.account === ADMIN_ADDRESS && ( */}
          {/* <div className="projectBtn-layout">
                        <div className="projectCreate-Btn" onClick={()=> onNav('/create_project')}>
                            Create Project
                        </div>
                    </div> */}
          {/* )} */}
          {/* <table>
                    <thead>
                        <tr className="projectTable-row">
                            <th className="projectTable-th">#</th>
                            <th className="projectTable-th">Project Name</th>
                            <th className="projectTable-th">Project Creator</th>
                            <th className="projectTable-th">Whitelisted Users</th>
                            <th className="projectTable-th">Total Whitelists</th>
                            <th className="projectTable-th">Project Image</th>

                            <th className="projectTable-th">WL List</th>
                        </tr>
                    </thead>
                    <tbody>
                        {
                            projects.map((item, index)=>(
                                <tr className="projectTable-row" key={index}>
                                    <td className="projectTable-td">{index}</td>
                                    <td className="projectTable-td link" onClick={()=> onNav('/project/'+ item.projectName)}>{item.projectName}</td>
                                    <td className="projectTable-td">{item.adminAddress}</td>
                                    <td className="projectTable-td">{item.listedWl}</td>
                                    <td className="projectTable-td">{item.wlLimit}</td>
                                    <td className="projectTable-td">
                                        <img className="projectTable-img"
                                        src = {`${process.env.REACT_APP_BACKEND_URL}/uploads/` + item.imageName}/></td>
                                    <td className="projectTable-td link" onClick = {()=> onNav('/wllist/' + item.projectName)}>Download WL list</td>
                                </tr>
                            ))
                        }
                    </tbody>
                </table> */}
          {/* </div> */}
        </div>
      </div>
    </div>
  );
};
export default ProjectPage;
