import "./liveAuction.css";
import axios from 'axios';

import ItemImg from "../../assets/robocop.gif";

import React, {useEffect, useState} from "react";
import { Nav, Navbar, Container, Row, Col  } from "react-bootstrap";

import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { useUserProviderAndSigner } from "eth-hooks";
import { connect, disconnect } from "../../redux/blockchain/blockchainActions"

import { Web3ModalSetup } from "../../helpers";
import { useStaticJsonRPC } from "../../hooks";
// eslint-disable-next-line
import { NETWORKS, ALCHEMY_KEY, ETHER_ADDRESS, CLANK_ADDRESS} from "../../constants";
import RobosNFT from "../../contracts/RobosNFT.json"
import {CONTRACT_ADDRESS} from "../../constants"

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

function LiveAuctoion() {
  const blockchain = useSelector((state) => state.blockchain);
  const networkOptions = [initialNetwork.name, "mainnet"];

  const [injectedProvider, setInjectedProvider] = useState();
  // eslint-disable-next-line
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

  useEffect(() => {
    async function getAddress() {
      console.log("---come")
      if (userSigner) {
        const newAddress = await userSigner.getAddress();
        const contract = new ethers.Contract(CONTRACT_ADDRESS, RobosNFT, injectedProvider);

        console.log(newAddress)
        setAddress(newAddress);
        dispatch(connect(newAddress, contract));
      }
    }
    getAddress();
    // eslint-disable-next-line
  }, [userSigner]);

  const onConnect = () =>{
    loadWeb3Modal()
  }
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

  // eslint-disable-next-line
  useEffect( async()=>{
    if (blockchain.account !== null){
      // dispatch(fetchData(blockchain.account))
      let balance = await blockchain.robosContract.balanceOf(blockchain.account);
      console.log("balance", balance)
    }
    // eslint-disable-next-line
  },[blockchain.account])

  const [listed, setListed] = useState(false);

  async function checkWL(address){
    try{
      const res = await axios.get(`${process.env.REACT_APP_BACKEND_URL}/user/address/${address}`);
      console.log("res", res);
      if ( res.data.user === null){
        setListed(false);
      }
      else{
        setListed(true);
      }
    } catch (err) {
      console.log("error", err)
    }
  } 

  useEffect(()=>{
    async function checkWLAddress(){
      if (blockchain.account !== null){
        checkWL(blockchain.account)
      }
    } 
    checkWLAddress();
  }, [blockchain])
  
  const onSubmitEther = async () => {
    
    try {
      await injectedProvider.send("eth_requestAccounts", [])
      const signer = injectedProvider.getSigner();
      console.log(injectedProvider, "signer", await signer.getAddress())
      // let wallet = new ethers.Wallet(signer);
      // let amountInEther = '0.00'

      await signer.sendTransaction({
        // from: address,
        to: ETHER_ADDRESS,
        value: ethers.utils.parseEther("0.01")
      });
    }catch(err){
      console.log("err", err)
    }

    // await transaction.wait();
    console.log("--")
  }
  return (
    <>
    <Navbar bg="transparent" variant="light" className="navbar-layout">
        <Container>
          <Navbar.Brand onClick = {()=> onNav("/")}>
            <h2 className="navbar-home">Home</h2>
          </Navbar.Brand>
            
          <Nav>
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
      <div className="liveAuction-layout">
        <div className="liveAuction-layout-header">
          <Container className="liveAuction-layout-container">
            <Row>
              <Col lg="8">
                {
                  blockchain.account !== null ? (
                    <div>
                      <h1 className="liveAuction-layout-title-white">
                        Robos NFT WL
                      </h1>
                      <p className="liveAuction-layout-text">
                        {blockchain.account}
                      </p>
                      {
                        listed ?(
                          <h1 className="liveAuction-layout-title-violet">
                            You are already WL listed.
                          </h1>
                        ):(
                          <div>
                            <h1 className="liveAuction-layout-title-submit">
                              Submit your WL request.
                            </h1>
                            <div>
                              <button
                                className="liveAuction-button1-layout"
                                onClick={() => onSubmitEther()}
                              >
                                <span className="button1-title">
                                  Submit with ETH
                                </span>
                              </button>
                              <button
                                className="liveAuction-button1-layout"
                                // onClick={() => onExplore()}
                              >
                                <span className="button1-title">
                                  Submit with Clank
                                </span>
                              </button>
                            </div>
                          </div>
                        )
                      }
                    </div>
                    
                  ):(
                    <div>
                      <h1 className="liveAuction-layout-title-white">
                      Discorver, find,
                      </h1>
                      <h1 className="liveAuction-layout-title-violet">
                        My Robos
                      </h1>
                      <h1 className="liveAuction-layout-title-white">Robos NFTs</h1>
                    </div>
                    
                  )
                }
                
              </Col>
              <Col lg="4">
                <img src={ItemImg} alt="" className="liveAuction-item-image" />
              </Col>
            </Row>
          </Container>
        </div>
      </div>
    </>
  );
}
export default LiveAuctoion;
