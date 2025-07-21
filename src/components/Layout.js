import React from "react";
import Navbar from "./Navbar"
import Menubar from "./Menubar";
import * as AppFunc from "../lib/AppFunctions";

const Layout = ({ children }) => {
  return (
    <div className="container-fluid">
      <Navbar/>
      {AppFunc.userIsEmployee() ? "" : <Menubar/>}
      <div className="main_container pt-3 col-11 margin-center">
        {children}
      </div>
    </div>
  );
};

export default Layout;
