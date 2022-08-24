import React, { Component } from "react";

import "./footer.css";
import { Container, Row } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
// import Mono_Logo from "../../assets/footer/Logo.png";
import Facebook from "../../assets/footer/facebook.png";
import Twitter from "../../assets/footer/twitter.webp";
import Google from "../../assets/footer/google.png";
// import Twitch from "../../assets/footer/twitter.png";
import Opensea from "../../assets/footer/opensea.webp"
import Scan from "../../assets/footer/scan.webp"
function Footer () {
  let navigate = useNavigate();
  const onNav = (url) => {
    navigate(url);
  };
    return (
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
            </div>
            <Row>
              <p className="footer-sectiion1-text">
                <span className="footer-sectiion1-span">Robos</span> is a connection from the past to the present to the future
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
    );
}

export default Footer;
