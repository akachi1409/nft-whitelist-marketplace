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
import moment from "moment";
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
import WLImage from "../../assets/wl.png";
import RobosImage from "../../assets/robos.png";
import ClankImage from "../../assets/clank.png";
import MerchImage from "../../assets/merch.png";
import OtherImage from "../../assets/other.png";
import ClankToken from "../../contracts/ClankToken.json";
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
  const [totalEther, setTotalEther] = useState(0);
  const [totalClank, setTotalClank] = useState(0);
  const [buyMethod, setBuyMethod] = useState(0);
  const [targetAddress, setTargetAddress] = useState("");
  const [discordID, setDiscordID] = useState("");
  const [orderHistory, setOrderHistory] = useState([]);
  const [selectedOrderId, setSelectedOrderId] = useState("");
  const [flag, setFlag] = useState(true);
  const [cartInfo, setCartInfo] = useState([]);
  const [cartEther, setCartEther] = useState(0);
  const [cartClank, setCartClank] = useState(0);

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

  const onInit = () => {
    // setQuantity(0);
    setMode(0);
    setSelectedProject("");
    setAmounts(0);
    setTotalEther(0);
    setTotalClank(0);
  };
  async function onBuy(project) {
    setSelectedProject(project);
    setMode(7);
  }

  async function onAdd(project) {
    setSelectedProject(project);
    setMode(6);
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
        setTargetAddress(newAddress);
        dispatch(connect(newAddress));
      }
    }
    getAddress();
    // eslint-disable-next-line
  }, [userSigner]);

  const onPlus = () => {
    if (amounts>= (selectedProject.wlLimit - selectedProject.listedWl)) {
      notify("There is only " + (selectedProject.wlLimit - selectedProject.listedWl) + " whitelist spot remain.")
      return;
    }
    const newEther = totalEther + selectedProject.etherPrice;
    const newClank = totalClank + selectedProject.clankPrice;
    setAmounts(amounts + 1);
    setTotalEther(Number(newEther.toFixed(2)));
    setTotalClank(newClank);
  };
  const onMinus = () => {
    if (amounts < 1) return;
    console.log("-----------", totalEther, selectedProject.etherPrice);
    const newEther = totalEther - selectedProject.etherPrice;
    const newClank = totalClank - selectedProject.clankPrice;
    setAmounts(amounts - 1);
    setTotalEther(Number(newEther.toFixed(2)));
    setTotalClank(newClank);
  };

  const onAddItem = () => {
    let remain = selectedProject.wlLimit - selectedProject.listedWl;
    console.log("cartInfo", cartInfo)
    cartInfo.map((info)=>{
      console.log("-----------", info)
      remain -= info.quantity;
    })
    if (amounts === remain){
      notify("There is only " + (selectedProject.wlLimit - selectedProject.listedWl) + " whitelist spot remain.")
      return;
    }
    const newCartInfo = {
      img: selectedProject.imageName,
      totalEther: totalEther,
      totalClank: totalClank,
      quantity: amounts,
      projectName: selectedProject.projectName,
    };
    setCartEther(cartEther + totalEther);
    setCartClank(cartClank + totalClank);
    cartInfo.push(newCartInfo);
    setCartInfo(cartInfo);
    setFlag(!flag);
    setMode(5);
  };
  const onBuyEther = () => {
    setBuyMethod(0);
    setMode(10);
  };

  const onBuyClank = () => {
    setBuyMethod(1);
    setMode(10);
  };

  const onPurchase = () => {
    console.log(buyMethod);
    if (buyMethod === 0) {
      onSubmitEther();
    } else if (buyMethod === 1) {
      onSubmitClank();
    }
  };

  const onPurchaseCartClank = async () => {
    try {
      await injectedProvider.send("eth_requestAccounts", []);
      const signer = injectedProvider.getSigner();

      const BOLTS_ADDRESS = "0xbE8f69c0218086923aC35fb311A3dD84baB069E5";
      const contract = new ethers.Contract(
        BOLTS_ADDRESS,
        ClankToken,
        injectedProvider
      );
      const contractSigner = contract.connect(signer);

      const transfer = await contractSigner.transfer(
        ETHER_ADDRESS,
        ethers.utils.parseEther(totalClank.toString())
      );
      cartInfo.map((info) => {
        info.totalEther = 0;
      });
      setCartInfo(cartInfo);

      const data = {
        address: targetAddress,
        discordID: discordID,
        etherCost: 0,
        clankCost: cartClank,
        cartInfo: cartInfo,
      };
      console.log("---------", data);
      axios
        .post(
          `${process.env.REACT_APP_BACKEND_URL}/user/address/insertCart`,
          data
        )
        .then((res) => {
          console.log(`Server response: ${JSON.stringify(res.data, null, 0)}`);
        });
      setMode(0);
    } catch (err) {
      notify("Insufficient funds!");
      // console.log("err", err)
    }
  };
  const onPurchaseCartEther = async () => {
    try {
      await injectedProvider.send("eth_requestAccounts", []);
      const signer = injectedProvider.getSigner();

      // await signer.sendTransaction({
      //   to: ETHER_ADDRESS,
      //   value: ethers.utils.parseEther(cartEther.toString())
      // });
      cartInfo.map((info) => {
        info.totalClank = 0;
      });
      setCartInfo(cartInfo);
      const data = {
        address: targetAddress,
        discordID: discordID,
        etherCost: cartEther,
        clankCost: 0,
        cartInfo: cartInfo,
      };
      console.log("---------", data);
      axios
        .post(
          `${process.env.REACT_APP_BACKEND_URL}/user/address/insertCart`,
          data
        )
        .then((res) => {
          console.log(`Server response: ${JSON.stringify(res.data, null, 0)}`);
        });
      setMode(0);
    } catch (err) {
      notify("Insufficient funds!");
      // console.log("err", err)
    }
  };
  const onSubmitClank = async () => {
    try {
      await injectedProvider.send("eth_requestAccounts", []);
      const signer = injectedProvider.getSigner();
      console.log("-------", totalEther, totalEther.toString());

      const BOLTS_ADDRESS = "0xbE8f69c0218086923aC35fb311A3dD84baB069E5";
      const contract = new ethers.Contract(
        BOLTS_ADDRESS,
        ClankToken,
        injectedProvider
      );
      const contractSigner = contract.connect(signer);

      const transfer = await contractSigner.transfer(
        ETHER_ADDRESS,
        ethers.utils.parseEther(totalClank.toString())
      );
      await transfer.wait();
      const data = {
        address: targetAddress,
        project: selectedProject.projectName,
        image: selectedProject.imageName,
        quantity: amounts,
        discordID: discordID,
        etherCost: 0,
        clankCost: totalClank,
        totalEther: 0,
        totalClank: totalClank,
      };
      axios
        .post(`${process.env.REACT_APP_BACKEND_URL}/user/address/insert`, data)
        .then((res) => {
          console.log(`Server response: ${JSON.stringify(res.data, null, 0)}`);
        });
      setMode(0);
    } catch (err) {
      notify("Insufficient funds!");
      // console.log("err", err)
    }
  };
  const onSubmitEther = async () => {
    try {
      await injectedProvider.send("eth_requestAccounts", []);
      const signer = injectedProvider.getSigner();
      console.log("-------", totalEther, totalEther.toString());

      // await signer.sendTransaction({
      //   // from: address,
      //   to: ETHER_ADDRESS,
      //   value: ethers.utils.parseEther(totalEther.toString())
      // });
      const data = {
        address: targetAddress,
        project: selectedProject.projectName,
        image: selectedProject.imageName,
        quantity: amounts,
        discordID: discordID,
        etherCost: totalEther,
        clankCost: 0,
        totalEther: totalEther,
        totalClank: 0,
      };
      axios
        .post(`${process.env.REACT_APP_BACKEND_URL}/user/address/insert`, data)
        .then((res) => {
          console.log(`Server response: ${JSON.stringify(res.data, null, 0)}`);
        });
      setMode(0);
    } catch (err) {
      notify("Insufficient funds!");
      // console.log("err", err)
    }

    // await transaction.wait();
  };

  const onCart = () => {
    setMode(5);
  };
  const onOrder = () => {
    setMode(8);
    try {
      axios
        .get(
          `${process.env.REACT_APP_BACKEND_URL}/user/address/orders/${address}`
        )
        .then((res) => {
          console.log(`Server response: ${JSON.stringify(res.data, null, 0)}`);
          setOrderHistory(res.data.orders);
          setFlag(!flag);
        });
    } catch (err) {
      console.log("err", err);
    }
  };

  const onSelectOrder = (orderID) => {
    setMode(9);
    setSelectedOrderId(orderID);
  };
  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100vh" }}>
      <Navbar bg="transparent" variant="light" className="navbar-layout">
        <Container>
          <Navbar.Brand onClick={() => onNav("/")}>
            <h2 className="navbar-home">Home</h2>
          </Navbar.Brand>

          <Nav></Nav>

          {blockchain.account === null ? (
            <Nav>
              <Nav.Item className="nav-wallet-layout">
                <Nav.Link className="nav-wallet" onClick={() => onConnect()}>
                  Connect Wallet
                </Nav.Link>
              </Nav.Item>
            </Nav>
          ) : (
            <Nav>
              <Nav.Item className="nav-wallet-layout">
                <Nav.Link className="nav-wallet" onClick={() => onOrder()}>
                  Order History
                </Nav.Link>
              </Nav.Item>
              <Nav.Item className="nav-wallet-layout">
                <Nav.Link className="nav-wallet" onClick={() => onDisconnect()}>
                  Disconnect Wallet
                </Nav.Link>
              </Nav.Item>
              <Nav.Item className="nav-wallet-layout">
                <Nav.Link className="nav-wallet" onClick={() => onCart()}>
                  My Cart
                </Nav.Link>
              </Nav.Item>
              <Nav.Item className="nav-wallet-layout">
                <Nav.Link
                  className="nav-wallet"
                  onClick={() => onNav("/admin")}
                >
                  ..
                </Nav.Link>
              </Nav.Item>
            </Nav>
          )}
        </Container>
      </Navbar>
      <div className="projectPage-layout">
        <div className="projectList-layout">
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
                <h3 className="genesis-modal-title">Whitelist Store</h3>
                <span className="close-btn" onClick={() => onInit()}>
                </span>
              </div>
              <div className="genesis-modal-content-layer">
                {projects.map((item, index) => (
                  <table className="genesis-table">
                    <tr>
                      <td rowSpan="3">
                        <img
                          className="genesis-img"
                          src={
                            `${process.env.REACT_APP_BACKEND_URL}/uploads/` +
                            item.imageName
                          }
                        />
                      </td>
                      <td className="genesis-modal-details">
                        <h3 className="genesis-modal-detail-title">
                          {item.projectName}
                        </h3>
                      </td>
                      <td>
                        <h3 className="genesis-modal-detail-title">Quantity</h3>
                      </td>
                      <td>
                        <h3 className="genesis-modal-detail-title">Price</h3>
                      </td>
                      <td rowSpan="3" className="genesis-modal-button">
                        <div
                          className="genesis-modal-wallet"
                          onClick={() => onBuy(item)}
                        >
                          <h5 className="genesis-btn">Buy Now</h5>
                        </div>
                        <div
                          className="genesis-modal-wallet"
                          onClick={() => onAdd(item)}
                        >
                          <h5 className="genesis-btn">Add To Cart</h5>
                        </div>
                      </td>
                    </tr>
                    <tr>
                      <td rowSpan="2" className="wordbreak">
                        {item.description}
                      </td>
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

                {/* {projects.map((item, index) => (
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
                      <p>{item.description}</p>
                    </div>
                    <div className="genesis-modal-details">
                      <h3 className="genesis-modal-detail-title">
                        Quantity
                      </h3>
                      <p>{item.listedWl}/{item.wlLimit}</p>
                    </div>
                    <div className="genesis-modal-description">
                      <h3 className="genesis-modal-detail-title">Price</h3>
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
                      >
                        <h5 className="genesis-btn">Buy Now</h5>
                      </div>
                      <div
                        className="genesis-modal-wallet"
                      >
                        <h5 className="genesis-btn">Add To Cart</h5>
                      </div>
                    </div>
                  </div>
                ))} */}
              </div>
            </div>
          )}
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
          {/* Show the selecting the number of wl to add cart */}
          {mode === 6 && (
            <div className="project-buy-layout">
              <div className="project-buy-exit-layer">
                <h3 className="project-buy-title">Shopping Cart</h3>
                <span className="close-btn" onClick={() => setMode(0)}>
                </span>
              </div>
              <div className="project-buy-content">
                <div className="project-buy-row">
                  <table className="project-buy-table">
                    <tr>
                      <td>
                        <img
                          className="project-buy-img"
                          src={
                            `${process.env.REACT_APP_BACKEND_URL}/uploads/` +
                            selectedProject.imageName
                          }
                        />
                      </td>
                    </tr>
                    <tr>
                      <table>
                        <tr>
                          <td rowspan="2" className="project-buy-price">
                            Price
                          </td>
                          <td className="project-buy-price">Ether:</td>
                          <td className="project-buy-price">
                            {selectedProject.etherPrice}
                          </td>
                        </tr>
                        <tr>
                          <td className="project-buy-price">Clank:</td>
                          <td className="project-buy-price">
                            {selectedProject.clankPrice}
                          </td>
                        </tr>
                        <tr>
                          <td className="project-buy-price">Quantity</td>
                          <td className="project-buy-price" colspan="2">
                            <div className="project-buy-row">
                              <h5
                                className="project-buy-sign"
                                onClick={() => onMinus()}
                              >
                                -
                              </h5>
                              <h5 className="project-buy-price">{amounts}</h5>
                              <h5
                                className="project-buy-sign"
                                onClick={() => onPlus()}
                              >
                                +
                              </h5>
                            </div>
                          </td>
                        </tr>
                        <tr>
                          <td rowspan="2" className="project-buy-price">
                            Total
                          </td>
                          <td className="project-buy-price">Ether:</td>
                          <td className="project-buy-price">{totalEther}</td>
                        </tr>
                        <tr>
                          <td className="project-buy-price">Clank:</td>
                          <td className="project-buy-price">{totalClank}</td>
                        </tr>
                      </table>
                    </tr>
                    <tr>
                      <div
                        className="project-buy-btn"
                        onClick={() => onAddItem()}
                      >
                        Add To Cart
                      </div>
                    </tr>
                  </table>
                  <table className="project-buy-table">
                    <tr
                      style={{ borderBottom: "1px solid white", height: "10%" }}
                    >
                      <td>
                        <h3 className="project-buy-title">
                          {selectedProject.projectName}
                        </h3>
                      </td>
                    </tr>
                    <tr>
                      <div className="project-buy-description">
                        {selectedProject.description}
                      </div>
                    </tr>
                  </table>
                </div>
              </div>
            </div>
          )}
          {/* Check out for add cart */}
          {mode === 5 && (
            <div className="project-buy-layout">
              <div className="project-buy-exit-layer">
                <h3 className="project-buy-title">Check Out</h3>
                <span className="close-btn" onClick={() => setMode(2)}>
                </span>
              </div>
              <div className="project-buy-content">
                {cartInfo.map((item, index) => (
                  <table className="project-cart-table" key={index}>
                    <tr>
                      <td rowSpan="3">
                        <img
                          className="project-buy-img"
                          src={
                            `${process.env.REACT_APP_BACKEND_URL}/uploads/` +
                            item.img
                          }
                        />
                      </td>
                      <td className="project-buy-title">Project Name</td>
                      <td className="project-buy-title" colSpan="2">
                        Price
                      </td>
                    </tr>
                    <tr>
                      <td rowSpan="2">
                        <h3>{item.projectName}</h3>
                      </td>
                      <td>Ehter</td>
                      <td>Clank</td>
                    </tr>
                    <tr>
                      <td>{item.totalEther}</td>
                      <td>{item.totalClank}</td>
                    </tr>
                  </table>
                ))}

                <table className="project-cart-table">
                  <tr>
                    <td rowspan="2" className="project-buy-price">
                      Total
                    </td>
                    <td className="project-buy-price">Ether:</td>
                    <td className="project-buy-price">{cartEther}</td>
                  </tr>
                  <tr>
                    <td className="project-buy-price">Clank:</td>
                    <td className="project-buy-price">{cartClank}</td>
                  </tr>
                </table>
                <div className="project-buy-description1">
                  1. If you wish allocate a different wallet address to the
                  whitelist allocation, then please update the box below.
                  <br />
                  2. Please include your discord I.D as some projects require
                  this to allocate the Whitelist.
                  <br />
                  3. We cannot update or amend the wallet address after
                  purchase.
                </div>
                <div className="project-buy-add-layout">
                  <div className="project-buy-wallet-layout">
                    <h5 className="project-buy-wallet-title">Wallet Address</h5>
                    <input
                      className="project-buy-wallet-input"
                      value={targetAddress}
                      onChange={(e) => setTargetAddress(e.target.value)}
                    />
                  </div>
                  <div className="project-buy-wallet-layout">
                    <h5 className="project-buy-wallet-title">Discord I.D.</h5>
                    <input
                      className="project-buy-wallet-input"
                      value={discordID}
                      onChange={(e) => setDiscordID(e.target.value)}
                    />
                  </div>
                </div>
                <div style={{ border: "1px solid white", padding: "1em" }}>
                  <div
                    className="project-buy-btn"
                    onClick={() => onPurchaseCartEther()}
                  >
                    Confirm Purchase with Ether
                  </div>
                  <div
                    className="project-buy-btn"
                    onClick={() => onPurchaseCartClank()}
                  >
                    Confirm Purchase with Clank
                  </div>
                  <div className="project-buy-btn" onClick={() => onInit()}>
                    Add More
                  </div>
                </div>
              </div>
            </div>
          )}
          {/* Check Out for Buy Now */}
          {mode === 7 && (
            <div className="project-buy-layout">
              <div className="project-buy-exit-layer">
                <h3 className="project-buy-title">Check Out</h3>
                <span className="close-btn" onClick={() => onInit()}>
                </span>
              </div>
              <div className="project-buy-content">
                <div className="project-buy-row">
                  <table className="project-buy-table">
                    <tr>
                      <td>
                        <img
                          className="project-buy-img"
                          src={
                            `${process.env.REACT_APP_BACKEND_URL}/uploads/` +
                            selectedProject.imageName
                          }
                        />
                      </td>
                    </tr>
                    <tr>
                      <table>
                        <tr>
                          <td className="project-buy-price">Time Remaining</td>
                          <td className="project-buy-price" colSpan="2">
                            {new Date(selectedProject.endTime).getTime() -
                              new Date().getTime() >
                              0 && (
                              <div className="project-buy-description">
                                {Math.floor(
                                  (new Date(selectedProject.endTime).getTime() -
                                    new Date().getTime()) /
                                    (1000 * 60 * 60)
                                ) + " hours"}
                              </div>
                            )}
                            {new Date(selectedProject.endTime).getTime() -
                              new Date().getTime() <=
                              0 && (
                              <div className="project-buy-description">
                                Whitelist has closed
                              </div>
                            )}
                          </td>
                        </tr>
                        <tr>
                          <td rowspan="2" className="project-buy-price">
                            Price
                          </td>
                          <td className="project-buy-price">Ether:</td>
                          <td className="project-buy-price">
                            {selectedProject.etherPrice}
                          </td>
                        </tr>
                        <tr>
                          <td className="project-buy-price">Clank:</td>
                          <td className="project-buy-price">
                            {selectedProject.clankPrice}
                          </td>
                        </tr>
                        <tr>
                          <td className="project-buy-price">Quantity</td>
                          <td className="project-buy-price" colspan="2">
                            <div className="project-buy-row">
                              <h5
                                className="project-buy-sign"
                                onClick={() => onMinus()}
                              >
                                -
                              </h5>
                              <h5 className="project-buy-price">{amounts}</h5>
                              <h5
                                className="project-buy-sign"
                                onClick={() => onPlus()}
                              >
                                +
                              </h5>
                            </div>
                          </td>
                        </tr>
                        <tr>
                          <td rowspan="2" className="project-buy-price">
                            Total
                          </td>
                          <td className="project-buy-price">Ether:</td>
                          <td className="project-buy-price">{totalEther}</td>
                        </tr>
                        <tr>
                          <td className="project-buy-price">Clank:</td>
                          <td className="project-buy-price">{totalClank}</td>
                        </tr>
                      </table>
                    </tr>
                    {new Date(selectedProject.endTime).getTime() -
                      new Date().getTime() >
                      0 && (
                      <tr>
                        <div
                          className="project-buy-btn"
                          onClick={() => onBuyEther()}
                        >
                          Buy Now (Ether)
                        </div>
                      </tr>
                    )}
                    {new Date(selectedProject.endTime).getTime() -
                      new Date().getTime() >
                      0 && (
                      <tr>
                        <div
                          className="project-buy-btn"
                          onClick={() => onBuyClank()}
                        >
                          Buy Now (Clank)
                        </div>
                      </tr>
                    )}
                  </table>
                  <table className="project-buy-table">
                    <tr
                      style={{ borderBottom: "1px solid white", height: "10%" }}
                    >
                      <td>
                        <h3 className="project-buy-title">
                          {selectedProject.projectName}
                        </h3>
                      </td>
                    </tr>
                    <tr>
                      <div className="project-buy-description">
                        {selectedProject.description}
                      </div>
                    </tr>
                    <tr></tr>
                  </table>
                </div>
              </div>
            </div>
          )}
          {/* Show Order List */}
          {mode === 8 && (
            <div className="project-buy-layout">
              <div className="project-buy-exit-layer">
                <h3 className="project-buy-title">My Orders</h3>
                <span className="close-btn" onClick={() => setMode(0)}>
                </span>
              </div>
              <div className="project-order-layout">
                {orderHistory.length > 0 &&
                  orderHistory &&
                  orderHistory.map((item, index) => (
                    <table key={index} className="project-order-table">
                      <tr>
                        <td className="project-order-td">Order ID</td>
                        <td className="project-order-td">{item._id}</td>
                      </tr>
                      <tr>
                        <td className="project-order-td">Order Date</td>
                        <td className="project-order-td">
                          {item.orderDate.split("T")[0] +
                            " " +
                            item.orderDate.split("T")[1].split(".")[0]}
                        </td>
                      </tr>
                      <tr>
                        <td className="project-order-td">ClankCost</td>
                        <td className="project-order-td">{item.clankCost}</td>
                      </tr>
                      <tr>
                        <td className="project-order-td">Ether Cost</td>
                        <td className="project-order-td">{item.etherCost}</td>
                      </tr>
                      <tr>
                        <td colspan="2">
                          <div
                            className="project-buy-btn"
                            onClick={() => onSelectOrder(item._id)}
                          >
                            View Order
                          </div>
                        </td>
                      </tr>
                    </table>
                  ))}
              </div>
            </div>
          )}
          {/* Show One Order */}
          {mode === 9 && (
            <div className="project-buy-layout">
              <div className="project-buy-exit-layer">
                <h3 className="project-buy-title">My Order</h3>
                <span className="close-btn" onClick={() => setMode(0)}>
                </span>
              </div>
              <div className="project-order-layout">
                {orderHistory.length > 0 &&
                  orderHistory &&
                  orderHistory.map((item, index) => {
                    if (item._id !== selectedOrderId) return;
                    return (
                      <table key={index} className="project-order-table">
                        <tr>
                          <td className="project-order-td">Order ID</td>
                          <td className="project-order-td" colSpan="2">
                            {item._id}
                          </td>
                        </tr>
                        <tr>
                          <td className="project-order-td">Wsllet Address</td>
                          <td className="project-order-td" colSpan="2">
                            {item.walletAddress}
                          </td>
                        </tr>
                        <tr>
                          <td className="project-order-td">Discord ID</td>
                          <td className="project-order-td" colSpan="2">
                            {item.discordID}
                          </td>
                        </tr>
                        <tr>
                          <td className="project-order-td">Order Date</td>
                          <td className="project-order-td" colSpan="2">
                            {item.orderDate.split("T")[0] +
                              " " +
                              item.orderDate.split("T")[1].split(".")[0]}
                          </td>
                        </tr>
                        <tr>
                          <td className="project-order-td">ClankCost</td>
                          <td className="project-order-td" colSpan="2">
                            {item.clankCost}
                          </td>
                        </tr>
                        <tr>
                          <td className="project-order-td">Ether Cost</td>
                          <td className="project-order-td" colSpan="2">
                            {item.etherCost}
                          </td>
                        </tr>
                        {item.whitelist.map((wl, index) => (
                          <>
                            <tr key={index}>
                              <td rowSpan="2" className="project-order-td">
                                <img
                                  className="project-order-img"
                                  src={
                                    `${process.env.REACT_APP_BACKEND_URL}/uploads/` +
                                    wl.whitelistPicture
                                  }
                                />
                              </td>
                              <td className="project-order-td" colSpan="2">
                                {wl.whitelistName}
                              </td>
                            </tr>
                            <tr>
                              <td className="project-order-td">Quantity</td>
                              <td>{wl.quantity}</td>
                            </tr>
                          </>
                        ))}
                      </table>
                    );
                  })}
              </div>
            </div>
          )}
          {/* Buy now */}
          {mode === 10 && (
            <div className="project-buy-layout">
              <div className="project-buy-exit-layer">
                {/* <h3 className="project-buy-title">{selectedProject.projectName}</h3> */}
                {/* <span className="close-btn" onClick={() => setMode(0)}>
                  &times;
                </span> */}
              </div>
              <div className="project-buy-content">
                {/* <div className="project-buy-description1">
                  {selectedProject.description}
                </div> */}
                <div className="project-buy-description1">
                  1. If you wish allocate a different wallet address to the
                  whitelist allocation, then please update the box below.
                  <br />
                  2. Please include your discord I.D as some projects require
                  this to allocate the Whitelist.
                  <br />
                  3. We cannot update or amend the wallet address after
                  purchase.
                </div>
                <div className="project-buy-add-layout">
                  <div className="project-buy-wallet-layout">
                    <h5 className="project-buy-wallet-title">Wallet Address</h5>
                    <input
                      className="project-buy-wallet-input"
                      value={targetAddress}
                      onChange={(e) => setTargetAddress(e.target.value)}
                    />
                  </div>
                  <div className="project-buy-wallet-layout">
                    <h5 className="project-buy-wallet-title">Discord I.D.</h5>
                    <input
                      className="project-buy-wallet-input"
                      value={discordID}
                      onChange={(e) => setDiscordID(e.target.value)}
                    />
                  </div>
                </div>
                <div className="project-buy-btn" onClick={() => onPurchase()}>
                  Confirm Purchase
                </div>
                <div className="project-buy-btn" onClick={() => onInit()}>
                  Cancel
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      <ToastContainer />
    </div>
  );
};
export default ProjectPage;
