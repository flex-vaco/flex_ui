import React from 'react'
import { BrowserRouter as Router, Routes, Route } from "react-router-dom"
import Login from "./pages/Login"
import UpdatePassword from "./pages/UpdatePassword";

import EmpList from "./pages/EmpList"
import EmpCreate from "./pages/EmpCreate"
import EmpEdit from "./pages/EmpEdit"
import EmpShow from "./pages/EmpShow"

import ProjectList from "./pages/ProjectList"
import ProjectCreate from "./pages/ProjectCreate"
import ProjectEdit from "./pages/ProjectEdit"
import ProjectShow from "./pages/ProjectShow"

import EmpProjAlocCreate from "./pages/EmpProjAlocCreate";
import EmpProjAlocList from "./pages/EmpProjAlocList";
import EmpProjAlocEdit from "./pages/EmpProjAlocEdit";

import EmpProjUtiliCreate from "./pages/utilization/EmpProjUtiliCreate";
import EmpProjUtiliList from "./pages/utilization/EmpProjUtiliList";
import EmpProjUtiliEdit from "./pages/utilization/EmpProjUtiliEdit";

import EmpFilteredList from './pages/EmpFilteredList'
import Home from './pages/Home'

import UserCreate from "./pages/UserCreate";
import UserList from "./pages/UserList";
import UserEdit from "./pages/UserEdit";

import ForecastHours from "./pages/reports/ForecastHours";
import AvailableHours from "./pages/reports/AvailableHours";

import ClientList from "./pages/clients/ClientList"
import ClientCreate from "./pages/clients/ClientCreate"
import ClientEdit from "./pages/clients/ClientEdit"
import ClientShow from "./pages/clients/ClientShow"
import InteliChat from "./pages/aiChat/InteliChat";
import ResetPassword from "./pages/ResetPassword";
import TimeSheet from './pages/timesheet/Timesheet';
import ApproveTimesheet from './pages/timesheet/ApproveTimesheetList';
import ApproveEmpTimesheet from './pages/timesheet/ApproveEmpTimesheet';
import Dashboard from "./pages/Dashboard";
import HireResource from "./pages/HireResource";
import IntelliDB from './pages/aiChat/InteliDB'
import CategoryCreate from "./pages/categories/CategoryCreate";
import CategoryEdit from "./pages/categories/CategoryEdit";
import CategoryList from "./pages/categories/CategoryList";

import EnquiredByMe from "./pages/hirings/EnquiredByMe";
import EnquiredToMe from "./pages/hirings/EnquiredToMe";

import OfficeLocationList from "./pages/officeLocations/OfficeLocationList"
import OfficeLocationCreate from "./pages/officeLocations/OfficeLocationCreate"
import OfficeLocationEdit from "./pages/officeLocations/OfficeLocationEdit"

import LineOfBusinessList from "./pages/lineOfBusiness/LineOfBusinessList"
import LineOfBusinessCreate from "./pages/lineOfBusiness/LineOfBusinessCreate"
import LineOfBusinessEdit from "./pages/lineOfBusiness/LineOfBusinessEdit"
import LineOfBusinessShow from "./pages/lineOfBusiness/LineOfBusinessShow"

function App() {
  const needsPasswordReset = JSON.parse(localStorage.getItem("user"))?.needsPasswordReset || null;
  const isLoggedIn= ((localStorage.getItem("user") !== null) && (needsPasswordReset !== 1));

  return (
    <Router>
      <Routes>
          <Route exact path="/"  element={<Login/>} />
          <Route path="/employees"  element={isLoggedIn ? <EmpList/> : <Login/>} />
          <Route path="/empCreate"  element={isLoggedIn ? <EmpCreate/> : <Login/>} />
          <Route path="/empEdit/:id"  element={isLoggedIn ? <EmpEdit/> : <Login/>} />
          <Route path="/empShow/:id"  element={isLoggedIn ? <EmpShow/> : <Login/>} />
          <Route path="/filter/:searchSkill?"  element={isLoggedIn ? <EmpFilteredList/> : <Login/>} />
          <Route path="/home"  element={isLoggedIn ? <Home/> : <Login/>} />
          <Route path="/create"   element={isLoggedIn ? <EmpCreate/> : <Login/>} />
          <Route path="/edit/:id"  element={isLoggedIn ? <EmpEdit/> : <Login/>} />
          <Route path="/show/:id"  element={isLoggedIn ? <EmpShow/> : <Login/>} />
          <Route path="/projects"  element={isLoggedIn ? <ProjectList/> : <Login/>} />
          <Route path="/projectCreate"  element={isLoggedIn ? <ProjectCreate/> : <Login/>} />
          <Route path="/projectEdit/:id"  element={isLoggedIn ? <ProjectEdit/> : <Login/>} />
          <Route path="/projectShow/:id"  element={isLoggedIn ? <ProjectShow/> : <Login/>} />
          <Route path="/empProjCreate"  element={isLoggedIn ? <EmpProjAlocCreate/> : <Login/>} />
          <Route path="/empProjList"  element={isLoggedIn ? <EmpProjAlocList/> : <Login/>} />
          <Route path="/empProjEdit/:id"  element={isLoggedIn ? <EmpProjAlocEdit/> : <Login/>} />
          <Route path="/empProjUtiliCreate"  element={isLoggedIn ? <EmpProjUtiliCreate/> : <Login/>} />
          <Route path="/empUtiliList"  element={isLoggedIn ? <EmpProjUtiliList/> : <Login/>} />
          <Route path="/empProjUtiliEdit/:id"  element={isLoggedIn ? <EmpProjUtiliEdit/> : <Login/>} />
          <Route path="/userCreate"  element={isLoggedIn ? <UserCreate/> : <Login/>} />
          <Route path="/userList"  element={isLoggedIn ? <UserList/> : <Login/>} />
          <Route path="/userEdit/:id"  element={isLoggedIn ? <UserEdit/> : <Login/>} />
          <Route path="/forecastHours"  element={isLoggedIn ? <ForecastHours/> : <Login/>} />
          <Route path="/availableHours"  element={isLoggedIn ? <AvailableHours/> : <Login/>} />
          <Route path="/clients"  element={isLoggedIn ? <ClientList/> : <Login/>} />
          <Route path="/clientCreate"  element={isLoggedIn ? <ClientCreate/> : <Login/>} />
          <Route path="/clientEdit/:id"  element={isLoggedIn ? <ClientEdit/> : <Login/>} />
          <Route path="/clientShow/:id"  element={isLoggedIn ? <ClientShow/> : <Login/>} />
          <Route path="/ichat"  element={isLoggedIn ? <InteliChat/> : <Login/>} />
          <Route path="/resetPassword"  element={(needsPasswordReset === 1) ? <ResetPassword/> : <Login/>} />
          <Route path="/timesheet"  element={isLoggedIn ? <TimeSheet/> : <Login/>} />
          <Route path="/approveTimesheet"  element={isLoggedIn ? <ApproveTimesheet/> : <Login/>} />
          <Route path="/approveEmpTimesheet/:project_id/:emp_id"  element={isLoggedIn ? <ApproveEmpTimesheet/> : <Login/>} />
          <Route path="/dashboard"  element={isLoggedIn ? <Dashboard/> : <Login/>} />
          <Route path="/hireResource"  element={isLoggedIn ? <HireResource/> : <Login/>} />
          <Route path="/idb"  element={isLoggedIn ? <IntelliDB/> : <Login/>} />
          <Route path="/categoryCreate"  element={isLoggedIn ? <CategoryCreate/> : <Login/>} />
          <Route path="/categoryList"  element={isLoggedIn ? <CategoryList/> : <Login/>} />
          <Route path="/categoryEdit/:id"  element={isLoggedIn ? <CategoryEdit/> : <Login/>} />
          <Route path="/enquiredbyme"  element={isLoggedIn ? <EnquiredByMe/> : <Login/>} />
          <Route path="/enquiredtome"  element={isLoggedIn ? <EnquiredToMe/> : <Login/>} />
          <Route exact path="/updatePassword"  element={<UpdatePassword/>} />
          <Route path="/officeLocations"  element={isLoggedIn ? <OfficeLocationList/> : <Login/>} />
          <Route path="/officeLocationCreate"  element={isLoggedIn ? <OfficeLocationCreate/> : <Login/>} />
          <Route path="/officeLocationEdit/:id"  element={isLoggedIn ? <OfficeLocationEdit/> : <Login/>} />
          <Route path="/lineOfBusiness"  element={isLoggedIn ? <LineOfBusinessList/> : <Login/>} />
          <Route path="/lineOfBusinessCreate"  element={isLoggedIn ? <LineOfBusinessCreate/> : <Login/>} />
          <Route path="/lineOfBusinessEdit/:id"  element={isLoggedIn ? <LineOfBusinessEdit/> : <Login/>} />
          <Route path="/lineOfBusinessShow/:id"  element={isLoggedIn ? <LineOfBusinessShow/> : <Login/>} />
      </Routes>
    </Router>
  );
}

export default App;
