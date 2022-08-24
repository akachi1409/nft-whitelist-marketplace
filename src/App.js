// import logo from './logo.svg';
import "./App.css";

import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import React from "react";


import Home from "./page/home/home";
import WlList from "./page/auth/wlList"
import CreateProject from "./page/auth/createProject"
import ProjectList from "./page/project/projectList"
import UpdatePage from "./page/auth/updatePage"
// import CreateItem from "./page/item/createItem";
import Admin from "./page/home/admin"
function App() {
  return (
    <div>
      <Router>
        <Routes>
          <Route path="/project/:projectName" element={<Home/>}></Route>
          <Route path="/wllist/:projectName" element={<WlList/>}></Route>
          <Route path="/create_project" element={<CreateProject/>}></Route>
          <Route path="/update_project/:projectName" element={<UpdatePage/>}></Route>
          <Route path="/" element={<ProjectList/>}></Route>
          <Route path="/admin" element={<Admin/>}></Route>
        </Routes>
      </Router>
    </div>
  );
}

export default App;
