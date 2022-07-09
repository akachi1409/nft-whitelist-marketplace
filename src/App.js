// import logo from './logo.svg';
import "./App.css";

import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import React from "react";


import Home from "./page/home/home";

// import CreateItem from "./page/item/createItem";

import ConnectWallet from "./page/wallet/connetWallet";
function App() {
  return (
    <div>
      <Router>
        <Routes>
          {/* <Route exact path="/create_item" element={<CreateItem />}></Route> */}
          <Route
            exact
            path="/connect_wallet"
            element={<ConnectWallet />}
          ></Route>
          <Route path="/*" element={<Home />}></Route>
        </Routes>
      </Router>
    </div>
  );
}

export default App;
