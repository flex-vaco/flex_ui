import React,  { useState } from "react";
import { useNavigate } from "react-router-dom"
import * as AppFunc from "../lib/AppFunctions";

const Menu = () => { 
    const navigate = useNavigate();
    const activeUserRole = localStorage.getItem("user_role");
    const notificationsCount = useState(0);

    const handleLogout = () => {
      navigate("/")
      localStorage.removeItem("jwt-access-token");
      localStorage.removeItem("user");
      localStorage.removeItem("user_role");
    }

return(
        <ul className="navbar-nav me-auto mb-2 mb-lg-0 float-right">
          {AppFunc.hasMenuAccess(activeUserRole) ?
            <li className="nav-item dropdown ms-3 me-3">
              <a className="nav-link dropdown-toggle main_li" href="#" id="navbarDropdownemp" role="button" data-bs-toggle="dropdown" aria-expanded="false">
                Menu
              </a>
              <ul className="dropdown-menu" aria-labelledby="navbarDropdownemp">
                {AppFunc.hasEmployeeAccess(activeUserRole) ? <li><a className="dropdown-item" href="/employees">Resource List</a></li>: ""}
                {AppFunc.hasProjectAccess(activeUserRole) ? <li><a className="dropdown-item" href="/projects">Projects</a></li>: ""}
                {AppFunc.hasClientAccess(activeUserRole) ? <li><a className="dropdown-item" href="/clients">Clients</a></li>: ""}
                {AppFunc.hasAllocationAccess(activeUserRole) ? <li><a className="dropdown-item" href="/empProjList">Allocations</a></li>: ""}
                {AppFunc.hasUtilizationAccess(activeUserRole) ? <li><a className="dropdown-item" href="/empUtiliList">Utilization</a></li> : ""}
                {AppFunc.hasCategoriesAccess(activeUserRole) ? <li><a className="dropdown-item" href="/categoryList">Categories</a></li> : ""}
                {AppFunc.hasUserAccess(activeUserRole) ? <li><a className="dropdown-item" href="/userList">Users</a></li> : ""}
                {AppFunc.hasLocationAccess(activeUserRole) ? <li><a className="dropdown-item" href="/officeLocations">Office Locations</a></li> : ""}
                {AppFunc.hasApproveTimesheetAccess(activeUserRole) ? <li className="nav-item dropdown"><a className="dropdown-item" href="#">Timesheets</a>
                <ul className="dropdown-submenu">
                            <li><a className="dropdown-item" href="/approveTimesheet">Approve Timesheets</a></li>
                            <li><a className="dropdown-item" href="/timesheet">Timesheets</a></li>
                        </ul>
                  
                </li> : ""}
                {AppFunc.hasReportAccess(activeUserRole) ? <li className="nav-item dropdown"><a className="dropdown-item" href="#">Reports</a>
                <ul className="dropdown-submenu">
                            <li><a className="dropdown-item" href="/forecastHours">Forecast Hours</a></li>
                            <li><a className="dropdown-item" href="/availableHours">Available Percentage</a></li>
                        </ul>
                  
                </li> : ""}
                {AppFunc.hasHiringAccess(activeUserRole) ? <li className="nav-item dropdown"><a className="dropdown-item" href="#">Hiring Enquires</a>
                <ul className="dropdown-submenu">
                            <li><a className="dropdown-item" href="/enquiredbyme">By Me</a></li>
                            <li><a className="dropdown-item" href="/enquiredtome">To Me</a></li>
                        </ul>
                  
                </li> : ""}
                {AppFunc.hasAIChatAccess(activeUserRole) ? <li><a className="dropdown-item" href="/ichat">Explore Resumes</a></li> : ""}
                {AppFunc.hasAIChatAccess(activeUserRole) ? <li><a className="dropdown-item" href="/idb">Explore Database</a></li> : ""}
              </ul>
            </li> : ""}
            <li className="nav-item dropdown ms-2 me-2">
              <a className="nav-link" href="#" id="navbarDropdownNotifications" role="button" data-bs-toggle="dropdown" aria-expanded="false">
                <i className="bi bi-bell-fill"></i>
                {notificationsCount > 0 && (
                  <span className="badge bg-danger">{notificationsCount}</span>
                )}
              </a>
              <ul className="dropdown-menu" aria-labelledby="navbarDropdownNotifications">
                {notificationsCount > 0 ? (
                  <>
                    <li>
                      <a className="dropdown-item" href="#">
                        New Notification 1
                      </a>
                    </li>
                    <li>
                      <a className="dropdown-item" href="#">
                        New Notification 2
                      </a>
                    </li>
                    <li>
                      <a className="dropdown-item" href="#">
                        See All Notifications
                      </a>
                    </li>
                  </>
                ) : (
                  <li>
                    <a className="dropdown-item" href="#">
                      No Notifications
                    </a>
                  </li>
                )}
              </ul>
            </li>
            <li className="nav-item dropdown ms-2 me-2">
              <a className="nav-link dropdown-toggle" href="#" id="navbarDropdownuser" role="button" data-bs-toggle="dropdown" aria-expanded="false">
                <img src="/images/img_avatar1.png" alt="Avatar Logo" className="rounded-pill nav_profileimg"/>
              </a>
              <ul className="dropdown-menu" aria-labelledby="navbarDropdownuser">
                <li><a className="dropdown-item" href="#">Role: {activeUserRole}</a></li>
                <li> 
                  <a className="dropdown-item"
                    onClick={handleLogout}
                    type="submit"
                  >
                    <i className="bi bi-box-arrow-right"> Logout</i>
                  </a>
                </li>
              </ul>
            </li>
            
        </ul> 
)
}
export default Menu;
