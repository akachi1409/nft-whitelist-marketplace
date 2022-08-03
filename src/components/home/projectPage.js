import "./projectPage.css";
import React, { useState, useEffect } from "react"
import { Nav, Navbar, Container, Row, Col } from "react-bootstrap";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { useUserProviderAndSigner } from "eth-hooks";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import axios from "axios";
import delay from "delay";
import { connect, disconnect } from "../../redux/blockchain/blockchainActions";

import { Web3ModalSetup } from "../../helpers";
import { useStaticJsonRPC } from "../../hooks";
import { NETWORKS, ADMIN_ADDRESS, ALCHEMY_KEY, ETHER_ADDRESS, CLANK_ADDRESS, CONTRACT_ADDRESS, CLANK_CONTRACT_ADDRESS} from "../../constants";

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
  const [projects, setProjects] = useState([])
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
    if (injectedProvider && injectedProvider.provider && typeof injectedProvider.provider.disconnect == "function") {
      await injectedProvider.provider.disconnect();
    }
    setTimeout(() => {
      window.location.reload();
    }, 1);
  };

  const onDisconnect = async () =>{
    await web3Modal.clearCachedProvider();
    if (injectedProvider && injectedProvider.provider && typeof injectedProvider.provider.disconnect == "function") {
      await injectedProvider.provider.disconnect();
    }
    setTimeout(() => {
      window.location.reload();
    }, 1);
    dispatch(disconnect());
  }

  async function getProjects() {
    try{
        const res = await axios.get(`${process.env.REACT_APP_BACKEND_URL}/project/list`);
      console.log("res", res);
      if (res.data.success){
        setProjects(res.data.projects)
      }
    }catch(err){
        console.log("error", err)
    }
  }

  useEffect(()=>{
    async function checkProjects(){
        getProjects();
    }
    checkProjects();
  }, [blockchain])

  useEffect(() => {
    async function getAddress() {
      if (userSigner) {
        const newAddress = await userSigner.getAddress();
        // const contract = new ethers.Contract(CONTRACT_ADDRESS, RobosNFT, injectedProvider);
        // console.log("chainId",  selectedChainId);
        if (selectedChainId !== 1){
          notify("You should change your chain to Mainnet!")
          await delay(3000);
          onDisconnect()
        }
        console.log(newAddress)
        setAddress(newAddress);
        dispatch(connect(newAddress));
      }
    }
    getAddress();
    // eslint-disable-next-line
  }, [userSigner]);
  return (
    <>
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
            
            <div className="projectTable-layout">
                {/* {
                blockchain.account === ADMIN_ADDRESS && ( */}
                    <div className="projectBtn-layout">
                        <div className="projectCreate-Btn" onClick={()=> onNav('/create_project')}>
                            Create Project
                        </div>
                    </div>
                {/* )} */}
                
                <table>
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
                </table>
            </div>
        </div>
      </div>
    </>
  );
};
export default ProjectPage;
