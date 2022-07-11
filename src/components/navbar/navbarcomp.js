import React, {useEffect, useState} from "react";
import { Nav, Navbar, Container } from "react-bootstrap";

import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { useUserProviderAndSigner } from "eth-hooks";
import { connect, disconnect } from "../../redux/blockchain/blockchainActions"
import "./navbarcomp.css";

import { Web3ModalSetup } from "../../helpers";
import { useStaticJsonRPC } from "../../hooks";
import { NETWORKS, ALCHEMY_KEY } from "../../constants";
const { ethers } = require("ethers");

const initialNetwork = NETWORKS.mainnet;
// const NETWORKCHECK = true;
// const USE_BURNER_WALLET = false;
// const USE_NETWORK_SELECTOR = false;
const web3Modal = Web3ModalSetup();
// eslint-disable-next-line
const providers = [
  "https://eth-mainnet.gateway.pokt.network/v1/lb/611156b4a585a20035148406",
  `https://eth-mainnet.alchemyapi.io/v2/${ALCHEMY_KEY}`,
  "https://rpc.scaffoldeth.io:48544",
];


function NavbarComp() {
  const networkOptions = [initialNetwork.name, "mainnet"];

  const [injectedProvider, setInjectedProvider] = useState();
  const [address, setAddress] = useState();
  // eslint-disable-next-line
  const [selectedNetwork, setSelectedNetwork] = useState(networkOptions[0]);

  const targetNetwork = NETWORKS[selectedNetwork];

  // const blockExplorer = targetNetwork.blockExplorer;
  
  // load all your providers
  const localProvider = useStaticJsonRPC([
    process.env.REACT_APP_PROVIDER ? process.env.REACT_APP_PROVIDER : targetNetwork.rpcUrl,
  ]);
  // const mainnetProvider = useStaticJsonRPC(providers);
  // Use your injected provider from 🦊 Metamask or if you don't have it then instantly generate a 🔥 burner wallet.
  const userProviderAndSigner = useUserProviderAndSigner(injectedProvider, localProvider);
  const userSigner = userProviderAndSigner.signer;

  const logoutOfWeb3Modal = async () => {
    await web3Modal.clearCachedProvider();
    if (injectedProvider && injectedProvider.provider && typeof injectedProvider.provider.disconnect == "function") {
      await injectedProvider.provider.disconnect();
    }
    setTimeout(() => {
      window.location.reload();
    }, 1);
  };

  const loadWeb3Modal = async () => {
    console.log("----")
    const provider = await web3Modal.connect();
    setInjectedProvider(new ethers.providers.Web3Provider(provider));

    provider.on("chainChanged", chainId => {
      console.log(`chain changed to ${chainId}! updating providers`);
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

  // useEffect(() => {
  //   if (web3Modal.cachedProvider) {
  //     loadWeb3Modal();
  //   }
  // }, [loadWeb3Modal]);

  // eslint-disable-next-line
  useEffect(() => {
    async function getAddress() {
      console.log("---come")
      if (userSigner) {
        const newAddress = await userSigner.getAddress();
        
        console.log(newAddress)
        setAddress(newAddress);
        dispatch(connect(address));
      }
    }
    getAddress();
    // eslint-disable-next-line
  }, [userSigner]);

  const onConnect = () =>{
    loadWeb3Modal()
  }
  const blockchain = useSelector((state) => state.blockchain);
  const dispatch = useDispatch();

  let navigate = useNavigate();

  const onNav = (url) =>{
    navigate(url)
  }

  
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
  useEffect(()=>{
    console.log("blockchain", blockchain)
  }, [blockchain])
  return (
    <>
      <Navbar bg="transparent" variant="light" className="navbar-layout">
        <Container>
          <Navbar.Brand onClick = {()=> onNav("/")}>
            <h2 className="navbar-home">Home</h2>
          </Navbar.Brand>
            
          <Nav>
            {/* <Nav.Link onClick = {()=> onNav("/")}>Home</Nav.Link> */}
            {/* <Nav.Link onClick = {()=> onNav("/create_item")}>Create Item</Nav.Link> */}
            {/* <Nav.Link href="/blog">Blog</Nav.Link> */}
          </Nav>
          <Nav>
          {blockchain.account === null  ? (
            <Nav.Item className="nav-wallet-layout">
              <Nav.Link className="nav-wallet" onClick = {()=>onConnect()}>
                Connect Wallet
              </Nav.Link>
            </Nav.Item>
          ):(
            <Nav.Item className="nav-wallet-layout">
              <Nav.Link className="nav-wallet" onClick = {()=>onDisconnect()}>
                Disconnect Wallet
              </Nav.Link>
            </Nav.Item>
          )
          }
          </Nav>
        </Container>
      </Navbar>
    </>
  );
}
export default NavbarComp;
