import "./projectPage.css";
import React, { useState, useEffect } from "react";
import { Nav, Navbar, Container, Row } from "react-bootstrap";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { useUserProviderAndSigner } from "eth-hooks";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import axios from "axios";
import delay from "delay";
// import https from 'https';
// import moment from "moment";
import {Decimal} from 'decimal.js';
import { connect, disconnect } from "../../redux/blockchain/blockchainActions";

import { Web3ModalSetup } from "../../helpers";
import { useStaticJsonRPC } from "../../hooks";
import {
  NETWORKS,
  ADMIN_ADDRESS,
  // ALCHEMY_KEY,
  ETHER_ADDRESS,
  // CLANK_ADDRESS,
  // CONTRACT_ADDRESS,
  // CLANK_CONTRACT_ADDRESS,
} from "../../constants";

import GenesisImage from "../../assets/genesis.png";
import WLImage from "../../assets/wl.png";
import RobosImage from "../../assets/robos.png";
import ClankImage from "../../assets/clank.png";
import MerchImage from "../../assets/merch.png";
import OtherImage from "../../assets/other.png";
import ClankToken from "../../contracts/ClankToken.json";
import Opensea from "../../assets/footer/opensea.webp"
import Scan from "../../assets/footer/scan.webp"
import Twitter from "../../assets/footer/twitter.webp";
import MuteImg from "../../assets/footer/mute.jpg"
import UnmuteImg from "../../assets/footer/unmute.jpg"
import music from "../../assets/bg.wav"
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
   // eslint-disable-next-line
  const [selectedNetwork, setSelectedNetwork] = useState(networkOptions[0]);

  const [address, setAddress] = useState(null);
  const [projects, setProjects] = useState([]);
  const [mode, setMode] = useState(0);
  const [selectedProject, setSelectedProject] = useState("");
  const [amounts, setAmounts] = useState(0);
  const [totalEther, setTotalEther] = useState(new Decimal (0));
  const [totalClank, setTotalClank] = useState(new Decimal (0));
  const [buyMethod, setBuyMethod] = useState(0);
  const [targetAddress, setTargetAddress] = useState("");
  const [discordID, setDiscordID] = useState("");
  const [orderHistory, setOrderHistory] = useState([]);
  const [selectedOrderId, setSelectedOrderId] = useState("");
  const [flag, setFlag] = useState(true);
  const [cartInfo, setCartInfo] = useState([]);
  const [cartEther, setCartEther] = useState(new Decimal (0));
  const [cartClank, setCartClank] = useState(new Decimal (0));
  const [isAdmin, setIsAdmin] = useState(false);
  const [cartId, setCartId] = useState(0);
  const [remainHours, setRemainHours] = useState(0)
  const [remainMins, setRemainMins] = useState(0)
  const [audio] = useState(new Audio(music))
  const [playing, setPlaying] = useState(false);
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
        `/api/project/list`
      );
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
            endTime: project.endTime
          };
          projects.push(temp);
        })
        setProjects(projects);
      }
      } catch (err) {
        // notify("error" + err);
        console.log("error", err);
      }
  }

  const onBack = () => {
    setMode(2);
    setSelectedProject("");
    setAmounts(0);
    setTotalEther(new Decimal(0));
    setTotalClank(new Decimal(0));
  }
  const onInit = () => {
    setMode(0);
    setSelectedProject("");
    setAmounts(0);
    setTotalEther(new Decimal(0));
    setTotalClank(new Decimal(0));
    setCartInfo([])
  };
  async function onBuy(project) {
    setSelectedProject(project);
    
    setMode(7);
  }

  useEffect(() => {
    const diff = new Date(selectedProject.endTime).getTime() -new Date().getTime()
    const hours = Math.floor(
      (diff) /(1000 * 60 * 60)
      )
    const mins = Math.floor((diff - hours*(1000 * 60 * 60))/(1000*60))
    console.log("--", hours,mins, diff)
    setRemainHours(hours)
    setRemainMins(mins);
  },[selectedProject])

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
        for ( var i = 0 ; i<ADMIN_ADDRESS.length; i++){
          if (newAddress === ADMIN_ADDRESS[i])
          setIsAdmin(true);
        }
        setAddress(newAddress);
        setTargetAddress(newAddress);
        dispatch(connect(newAddress));
      }
    }
    getAddress();
    // eslint-disable-next-line
  }, [userSigner]);

  const onPlus = () => {
    if (amounts>0){
      notify("The maximum whitelist spot is 1 for this project");
      return;
    }
    if (amounts>= (selectedProject.wlLimit - selectedProject.listedWl)) {
      notify("There is only " + (selectedProject.wlLimit - selectedProject.listedWl) + " whitelist spot remain.")
      return;
    }
    const newEther = totalEther.plus(selectedProject.etherPrice);
    const newClank = totalClank.plus(selectedProject.clankPrice);
    setAmounts(amounts + 1);
    setTotalEther(newEther);
    setTotalClank(newClank);
  };
  const onMinus = () => {
    if (amounts < 1) return;
    console.log("-----------", totalEther, selectedProject.etherPrice);
    const newEther = totalEther.minus(selectedProject.etherPrice);
    const newClank = totalClank.minus(selectedProject.clankPrice);
    setAmounts(amounts - 1);
    setTotalEther(newEther);
    setTotalClank(newClank);
  };

  const onAddItem = () => {
    let remain = selectedProject.wlLimit - selectedProject.listedWl;
    console.log("cartInfo", cartInfo)
     // eslint-disable-next-line
    cartInfo.map((info)=>{
      if (info.projectName === selectedProject.projectName){
        remain -= info.quantity;
      }
      
    })
    if (amounts > remain){
      notify("There is only " + (selectedProject.wlLimit - selectedProject.listedWl) + " whitelist spot remain.")
      return;
    }
    const newCartInfo = {
      id: cartId,
      img: selectedProject.imageName,
      totalEther: totalEther,
      totalClank: totalClank,
      quantity: amounts,
      projectName: selectedProject.projectName,
    };
    setCartId(cartId + 1);
    setCartEther(cartEther.plus(totalEther));
    setCartClank(cartClank.plus(totalClank));
    cartInfo.push(newCartInfo);
    setCartInfo(cartInfo);
    setFlag(!flag);
    setMode(5);
  };
  const onBuyEther = () => {
    if (amounts <1) {
      notify("You should buy at least 1 item.");
      return;
    }
    setBuyMethod(0);
    setMode(10);
  };

  const onBuyClank = () => {
    if (amounts <1) {
      notify("You should buy at least 1 item.");
      return;
    }
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
    if (discordID === ""){
      notify("You should input the discord id.");
      return;
    }
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
         // eslint-disable-next-line
      const transfer = await contractSigner.transfer(
        ETHER_ADDRESS,
        ethers.utils.parseEther(cartClank.toFixed()),
        {
          gasLimit: 120000
        }
      );
      await transfer.wait();
       // eslint-disable-next-line
      cartInfo.map((info) => {
        info.totalEther = 0;
      });
      setCartInfo(cartInfo);

      const data = {
        owner: address,
        address: targetAddress,
        discordID: discordID,
        etherCost: 0,
        clankCost: cartClank,
        cartInfo: cartInfo,
      };
      console.log("---------", data);
      axios
        .post(
          `api/user/address/insertCart`,
          data
        )
        .then((res) => {
          console.log(`Server response: ${JSON.stringify(res.data, null, 0)}`);
        });
      onInit();
      setMode(0);
    } catch (err) {
      notify("Insufficient funds!");
      // console.log("err", err)
    }
  };
  const onPurchaseCartEther = async () => {
    if (discordID === ""){
      notify("You should input the discord id.");
      return;
    }
    try {
      await injectedProvider.send("eth_requestAccounts", []);
      const signer = injectedProvider.getSigner();

      await signer.sendTransaction({
        to: ETHER_ADDRESS,
        value: ethers.utils.parseEther(cartEther.toFixed())
      });
       // eslint-disable-next-line
      cartInfo.map((info) => {
        info.totalClank = 0;
      });
      setCartInfo(cartInfo);
      const data = {
        owner: address,
        address: targetAddress,
        discordID: discordID,
        etherCost: cartEther,
        clankCost: 0,
        cartInfo: cartInfo,
      };
      console.log("---------", data);
      axios
        .post(
          `api/user/address/insertCart`,
          data
        )
        .then((res) => {
          console.log(`Server response: ${JSON.stringify(res.data, null, 0)}`);
        });
      onInit();
      setMode(0);
    } catch (err) {
      notify("Insufficient funds!");
      // console.log("err", err)
    }
  };
  const onSubmitClank = async () => {
    if (discordID === ""){
      notify("You should input the discord id.");
      return;
    }
    try {
      const BOLTS_ADDRESS = "0xbE8f69c0218086923aC35fb311A3dD84baB069E5";
      const contract = new ethers.Contract(
        BOLTS_ADDRESS,
        ClankToken,
        injectedProvider
      );
      const signer = injectedProvider.getSigner();
      const contractSigner = contract.connect(signer);
      console.log("-------------", ethers.utils.parseEther(totalClank.toFixed()))
      const transfer = await contractSigner.transfer(
        ETHER_ADDRESS,
        ethers.utils.parseEther(totalClank.toFixed()),
        {
          gasLimit: 120000
        }
      );
      await transfer.wait();
      const data = {
        owner: address,
        address: targetAddress,
        project: selectedProject.projectName,
        image: selectedProject.imageName,
        quantity: amounts,
        discordID: discordID,
        etherCost: 0,
        clankCost: totalClank.toFixed(),
        totalEther: 0,
        totalClank: totalClank.toFixed(),
      };
      axios
        .post(`api/user/address/insert`, data)
        .then((res) => {
          console.log(`Server response: ${JSON.stringify(res.data, null, 0)}`);
        });
      onInit();
      setMode(0);
    } catch (err) {
      notify("Insufficient funds!");
    }
  };
  const onSubmitEther = async () => {
    if (discordID === ""){
      notify("You should input the discord id.");
      return;
    }
    try {
      await injectedProvider.send("eth_requestAccounts", []);
      const signer = injectedProvider.getSigner();
      console.log("-------", totalEther, totalEther.toString());

      await signer.sendTransaction({
        // from: address,
        to: ETHER_ADDRESS,
        value: ethers.utils.parseEther(totalEther.toFixed())
      });
      const data = {
        owner: address,
        address: targetAddress,
        project: selectedProject.projectName,
        image: selectedProject.imageName,
        quantity: amounts,
        discordID: discordID,
        etherCost: totalEther.toFixed(),
        clankCost: 0,
        totalEther: totalEther.toFixed(),
        totalClank: 0,
      };
      console.log("data", data);
      axios
        .post(`api/user/address/insert`, data)
        .then((res) => {
          console.log(`Server response: ${JSON.stringify(res.data, null, 0)}`);
        });
      onInit();
      setMode(0);
    } catch (err) {
      notify("Insufficient funds!");
      // console.log("err", err)
    }
  };

  const onCart = () => {
    setMode(5);
  };
  const onOrder = () => {
    setMode(8);
    try {
      // const instance = axios.create({
      //   httpsAgent: new https.Agent({  
      //     rejectUnauthorized: false
      //   })
      // });
      axios
        .get(
          `api/user/address/orders/${address}`
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

  const onRemoveCheck = (id) => {
    var temp = [];
    // eslint-disable-next-line 
    cartInfo.map((info)=> {
      console.log(info, id);
      if (info.id !== id) {
        temp.push(info);
      }
      else{
        setCartEther(cartEther.minus(info.totalEther));
        setCartClank(cartClank.minus(info.totalClank));
      }
    })
    // console.log(temp);
    setCartInfo (temp);
    setFlag(!flag);
  }

  const toggle = (flag) => setPlaying(flag);

  useEffect(() => {
    playing ? audio.play() : audio.pause();
  },
  [playing]
);

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100vh" }}>
      <div className="bg-class">
        <Navbar bg="transparent" variant="light" className="navbar-layout">
          <Container>
            <Navbar.Brand className="nav-wallet-layout" onClick={() => onNav("/")}>
              <h2 className="navbar-home">Home</h2>
            </Navbar.Brand>
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
                {
                  isAdmin && (
                    <Nav.Item className="nav-wallet-layout">
                      <Nav.Link
                        className="nav-wallet"
                        onClick={() => onNav("/admin")}
                      >
                        ..
                      </Nav.Link>
                    </Nav.Item>
                  )
                }
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
                  <span className="close-btn" onClick={() => setMode(0)}>
                  </span>
                </div>
                <div className="genesis-modal-content-layer">
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
                        <td className="genesis-modal-details" style={{width: "50%"}}>
                          <h3 className="genesis-modal-detail-title">
                            {item.projectName}
                          </h3>
                        </td>
                        <td>
                          <h3 className="genesis-modal-detail-title">Time Remaining</h3>
                        </td>
                        <td>
                          <h3 className="genesis-modal-detail-title">Stock</h3>
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
                        {
                          item.diff>0 ?(
                            <td rowSpan="2">{item.hours + ":" + item.mins}</td>
                          ):(
                            <td rowSpan="2">Closed</td>
                          )
                        }
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
                  <span className="close-btn" onClick={() => onBack()}>
                  </span>
                </div>
                <div className="project-buy-content">
                  <div className="project-buy-row">
                    <table className="project-buy-table">
                      <tr>
                        <td>
                          <img
                          alt=""
                            className="project-buy-img"
                            src={
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
                                  {
                                  remainHours + " hours " + remainMins + " mins"
                                  }
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
                            <td className="project-buy-price">{totalEther.toFixed()}</td>
                          </tr>
                          <tr>
                            <td className="project-buy-price">Clank:</td>
                            <td className="project-buy-price">{totalClank.toFixed()}</td>
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
                  <span className="close-btn" onClick={() => onBack()}>
                  </span>
                </div>
                <div className="project-buy-content">
                  {cartInfo.map((item, index) => (
                    <table className="project-cart-table" key={index}>
                      <tr>
                        <td rowSpan="3">
                          <img
                          alt=""
                            className="project-buy-img"
                            src={
                              item.img
                            }
                          />
                        </td>
                        <td className="project-buy-title">Project Name</td>
                        <td className="project-buy-title" colSpan="2">
                          Price
                        </td>
                        <td>Update</td>
                      </tr>
                      <tr>
                        <td rowSpan="2">
                          <h4>{item.projectName}</h4>
                        </td>
                        <td>Ehter</td>
                        <td>Clank</td>
                        <td rowSpan="2">
                          <div className="project-buy-btn" style={{fontSize: "18px"}} onClick={() => onRemoveCheck(item.id)}>
                            Remove
                          </div>
                        </td>
                      </tr>
                      <tr>
                        <td>{item.totalEther.toFixed()}</td>
                        <td>{item.totalClank.toFixed()}</td>
                      </tr>
                    </table>
                  ))}

                  <table className="project-cart-table">
                    <tr>
                      <td rowspan="2" className="project-buy-price">
                        Total
                      </td>
                      <td className="project-buy-price">Ether:</td>
                      <td className="project-buy-price">{cartEther.toFixed()}</td>
                    </tr>
                    <tr>
                      <td className="project-buy-price">Clank:</td>
                      <td className="project-buy-price">{cartClank.toFixed()}</td>
                    </tr>
                  </table>
                  <div className="project-buy-description1">
                    1. If you wish to allocate a different wallet address to the
                    whitelist allocation, then please update the box below.
                    <br />
                    2. A Discord I.D is mandatory. Additionally if you buy multiples of the same Whitelist, then a different Discord I.D must be used each time.
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
                    <div className="project-buy-btn" onClick={() => onBack()}>
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
                  <span className="close-btn" onClick={() => onBack()}>
                  </span>
                </div>
                <div className="project-buy-content">
                  <div className="project-buy-row">
                    <table className="project-buy-table">
                      <tr>
                        <td>
                          <img
                            alt=""
                            className="project-buy-img"
                            src={
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
                                  {
                                  remainHours + " hours " + remainMins + " mins"
                                  }
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
                            <td className="project-buy-price">{totalEther.toFixed()}</td>
                          </tr>
                          <tr>
                            <td className="project-buy-price">Clank:</td>
                            <td className="project-buy-price">{totalClank.toFixed()}</td>
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
                          <td className="project-order-td">{item.totalClank}</td>
                        </tr>
                        <tr>
                          <td className="project-order-td">Ether Cost</td>
                          <td className="project-order-td">{item.totalEther}</td>
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
                  <span className="close-btn" onClick={() => setMode(8)}>
                  </span>
                </div>
                <div className="project-order-layout">
                  {orderHistory.length > 0 &&
                    orderHistory &&
                    orderHistory.map((item, index) => {
                      // eslint-disable-next-line
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
                              {item.totalClank}
                            </td>
                          </tr>
                          <tr>
                            <td className="project-order-td">Ether Cost</td>
                            <td className="project-order-td" colSpan="2">
                              {item.totalEther}
                            </td>
                          </tr>
                          {item.whitelist.map((wl, index) => (
                            <>
                              <tr key={index}>
                                <td rowSpan="2" className="project-order-td">
                                  <img
                                    alt=""
                                    className="project-order-img"
                                    src={
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
                    1. If you wish to allocate a different wallet address to the
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
                  <div className="project-buy-btn" onClick={() => onBack()}>
                    Cancel
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      <div className="footer-container">
        <Container>
          <section className="footer-section1">
            <div className="footer-section1-layout">
              <a className="footer-sectiion-icon" href="https://etherscan.io/address/0x436f6a8e71F0c26b1690360166f6270021343AAA#code">
                <img
                  alt=""
                  src={Scan}
                  className="footer-sectiion-icon-round"
                />
              </a>
              <a className="footer-sectiion-icon" href="https://etherscan.io/address/0xbE8f69c0218086923aC35fb311A3dD84baB069E5#code">
                <img
                  alt=""
                  src={Scan}
                  className="footer-sectiion-icon-round"
                />
              </a>
              <a className="footer-sectiion-icon" href ="https://twitter.com/pxRobos">
                <img
                  alt=""
                  src={Twitter}
                  className="footer-sectiion-icon-round"
                />
              </a>
              
              <a className="footer-sectiion-icon" href="https://opensea.io/collection/robosnft">
                <img
                  alt=""
                  src={Opensea}
                  className="footer-sectiion-icon-round"
                />
              </a>
              {
                playing ? (
                  <div className="footer-sectiion-icon" onClick={() => toggle(false)}>
                    <img
                      alt=""
                      src={MuteImg}
                      className="footer-sectiion-icon-round"
                    />
                  </div>
                ):(
                  <div className="footer-sectiion-icon" onClick={() => toggle(true)}>
                    <img
                      alt=""
                      src={UnmuteImg}
                      className="footer-sectiion-icon-round"
                    />
                  </div>
                )
              }
              
            </div>
            <Row>
              <p className="footer-sectiion1-text">
                <a className="footer-sectiion1-span" href = "https://robosnft.com/"> RobosNFT.com</a> is a connection from the past to the present to the future
              </p>
            </Row>
          </section>
          <section className="footer-copyright">
            <Row>
              <p className="footer-copyright-text">
              Copyright 2022 Robos. All Rights Reserved.
              </p>
            </Row>
          </section>
        </Container>
      </div>
      <ToastContainer />
    </div>
  );
};
export default ProjectPage;
