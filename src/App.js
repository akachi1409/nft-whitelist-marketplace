// import logo from './logo.svg';
import "./App.css";

import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import React from "react";


import Home from "./page/home/home";
import WlList from "./page/auth/wlList"
import CreateProject from "./page/auth/createProject"
import ProjectList from "./page/project/projectList"
// import CreateItem from "./page/item/createItem";

function App() {
  return (
    <div>
      <Router>
        <Routes>
          <Route path="/project/:projectName" element={<Home/>}></Route>
          <Route path="/wllist" element={<WlList/>}></Route>
          <Route path="/create_project" element={<CreateProject/>}></Route>
          <Route path="/" element={<ProjectList/>}></Route>
        </Routes>
      </Router>
    </div>
  );
}

export default App;
