import React from "react";
import { Nav, Navbar, NavDropdown, Container } from "react-bootstrap";

import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { connect } from "../../redux/blockchain/blockchainActions"
// import Web3 from "web3";
// import Web3Modal from "web3modal";

import "./navbarcomp.css";

function NavbarComp() {
  const blockchain = useSelector((state) => state.blockchain);

  let navigate = useNavigate();
  const dispatch = useDispatch();

  const onNav = (url) =>{
    navigate(url)
  }

  const onConnect = async() =>{
    try{
      dispatch(connect());
      // Get network provider and web3 instance.

      // const web3 = await getWeb3();

      // Use web3 to get the user's accounts.
      
      // Get the contract instance.
      // const instance = new web3.eth.Contract(
      //   abi,
      //   contractAddress,
      // );

      // console.log('instance', instance)
    }catch(e){
      console.log(e);
    }
  }
  return (
    <>
      <Navbar bg="transparent" variant="light" className="navbar-layout">
        <Container>
          <Navbar.Brand onClick = {()=> onNav("/")}>
            {/* <img src={NavImg} alt="" />
            <img src={CatinaImg} alt=""/> */}
            <h2 className="navbar-home">Home</h2>
          </Navbar.Brand>
            
          <Nav>
            {/* <Nav.Link onClick = {()=> onNav("/")}>Home</Nav.Link> */}
            {/* <Nav.Link onClick = {()=> onNav("/explore")}>Explore Collection</Nav.Link> */}
            {/* <NavDropdown title="Activity">
              <NavDropdown.Item href="/activity1">Activity1</NavDropdown.Item>
              <NavDropdown.Item href="/activity2">Activity2</NavDropdown.Item>
            </NavDropdown> */}
            {/* <Nav.Link onClick = {()=> onNav("/create_item")}>Create Item</Nav.Link> */}
            {/* <Nav.Link onClick = {()=> onNav("/auction")}>Auctions</Nav.Link> */}
            {/* <Nav.Link href="/blog">Blog</Nav.Link> */}
            {/* <Nav.Link href="/help">Help</Nav.Link> */}
            
          </Nav>
          <Nav>
          {blockchain.account === null  ? (
            <Nav.Item className="nav-wallet-layout">
              <Nav.Link className="nav-wallet" onClick = {()=>onConnect()}>
                Connect Wallet
              </Nav.Link>
            </Nav.Item>
          ):(
            <NavDropdown title="Profile">
              <NavDropdown.Item onClick={()=> onNav("/mynft")}>
                My NFT
              </NavDropdown.Item>
              {/* <NavDropdown.Item href="/profile">My profile</NavDropdown.Item> */}
              {/* <NavDropdown.Item href="/activity2">Activity2</NavDropdown.Item> */}
            </NavDropdown>
          )
          }
          </Nav>
        </Container>
      </Navbar>
    </>
  );
}
export default NavbarComp;
