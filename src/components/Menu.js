import React, { useState } from "react";
import { useNavigate } from "react-router-dom"
import * as AppFunc from "../lib/AppFunctions";
import "./Menu.css";

const Menu = () => { 
    const navigate = useNavigate();
    const activeUserRole = localStorage.getItem("user_role");
    const activeUser = JSON.parse(localStorage.getItem("user"));
    const notificationsCount = useState(0);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    const handleLogout = () => {
      navigate("/")
      localStorage.removeItem("jwt-access-token");
      localStorage.removeItem("user");
      localStorage.removeItem("user_role");
    }

    const toggleSidebar = () => {
      setIsSidebarOpen(!isSidebarOpen);
    }

    const closeSidebar = () => {
      setIsSidebarOpen(false);
    }

    const handleMenuClick = (path) => {
      navigate(path);
      closeSidebar();
    }

return(
    <>
        {/* Navigation Icons - Menu and Notifications on same line */}
        <div className="navbar-nav me-auto mb-2 mb-lg-0 float-right">
          <div className="nav-icons-container">
            {AppFunc.hasMenuAccess(activeUserRole) && (
              <button 
                className="nav-link main_li sidebar-toggle-btn" 
                onClick={toggleSidebar}
              >
                <i className="bi bi-list fs-4"></i>
              </button>
            )}
            
            <div className="nav-item dropdown ms-2 me-2">
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
            </div>
          </div>
        </div>

        {/* Overlay */}
        {isSidebarOpen && (
          <div 
            className="sidebar-overlay" 
            onClick={closeSidebar}
          ></div>
        )}

        {/* Sidebar */}
        <div className={`sidebar ${isSidebarOpen ? 'sidebar-open' : ''}`}>
          {/* Sidebar Header with Role Details */}
          <div className="sidebar-header">
            <div className="sidebar-title-section">
              <h5 className="sidebar-title">{activeUser.first_name} {activeUser.last_name}</h5>
              <div className="user-role-info">
                <i className="bi bi-person-circle me-2"></i>
                <span className="role-text">Logged in as: {activeUserRole}</span>
              </div>
            </div>
            <button 
              className="sidebar-close-btn"
              onClick={closeSidebar}
            >
              ×
            </button>
          </div>

          {/* Sidebar Menu Items */}
          <div className="sidebar-menu">
            {AppFunc.hasEmployeeAccess(activeUserRole) && (
              <div className="sidebar-item" onClick={() => handleMenuClick('/employees')}>
                <i className="bi bi-people-fill me-2"></i>
                Resource List
              </div>
            )}
            
            {AppFunc.hasProjectAccess(activeUserRole) && (
              <div className="sidebar-item" onClick={() => handleMenuClick('/projects')}>
                <i className="bi bi-folder-fill me-2"></i>
                Projects
              </div>
            )}
            
            {AppFunc.hasClientAccess(activeUserRole) && (
              <div className="sidebar-item" onClick={() => handleMenuClick('/clients')}>
                <i className="bi bi-building-fill me-2"></i>
                Clients
              </div>
            )}
            
            {AppFunc.hasAllocationAccess(activeUserRole) && (
              <div className="sidebar-item" onClick={() => handleMenuClick('/empProjList')}>
                <i className="bi bi-diagram-3-fill me-2"></i>
                Allocations
              </div>
            )}
            
            {AppFunc.hasUtilizationAccess(activeUserRole) && (
              <div className="sidebar-item" onClick={() => handleMenuClick('/empUtiliList')}>
                <i className="bi bi-graph-up me-2"></i>
                Utilization
              </div>
            )}
            
            {AppFunc.hasCategoriesAccess(activeUserRole) && (
              <div className="sidebar-item" onClick={() => handleMenuClick('/categoryList')}>
                <i className="bi bi-tags-fill me-2"></i>
                Categories
              </div>
            )}
            
            {AppFunc.hasUserAccess(activeUserRole) && (
              <div className="sidebar-item" onClick={() => handleMenuClick('/userList')}>
                <i className="bi bi-person-fill me-2"></i>
                Users
              </div>
            )}
            
            {AppFunc.hasLocationAccess(activeUserRole) && (
              <div className="sidebar-item" onClick={() => handleMenuClick('/officeLocations')}>
                <i className="bi bi-geo-alt-fill me-2"></i>
                Office Locations
              </div>
            )}
            
            {AppFunc.hasApproveTimesheetAccess(activeUserRole) && (
              <div className="sidebar-section">
                <div className="sidebar-section-title">
                  <i className="bi bi-clock-fill me-2"></i>
                  Timesheets
                </div>
                <div className="sidebar-submenu">
                  <div className="sidebar-item sub-item" onClick={() => handleMenuClick('/approveTimesheet')}>
                    Approve Timesheets
                  </div>
                  <div className="sidebar-item sub-item" onClick={() => handleMenuClick('/timesheet')}>
                    Timesheets
                  </div>
                </div>
              </div>
            )}
            
            {AppFunc.hasReportAccess(activeUserRole) && (
              <div className="sidebar-section">
                <div className="sidebar-section-title">
                  <i className="bi bi-file-earmark-text-fill me-2"></i>
                  Reports
                </div>
                <div className="sidebar-submenu">
                  <div className="sidebar-item sub-item" onClick={() => handleMenuClick('/forecastHours')}>
                    Forecast Hours
                  </div>
                  <div className="sidebar-item sub-item" onClick={() => handleMenuClick('/availableHours')}>
                    Available Percentage
                  </div>
                </div>
              </div>
            )}
            
            {AppFunc.hasHiringAccess(activeUserRole) && (
              <div className="sidebar-section">
                <div className="sidebar-section-title">
                  <i className="bi bi-person-plus-fill me-2"></i>
                  Hiring Enquires
                </div>
                <div className="sidebar-submenu">
                  <div className="sidebar-item sub-item" onClick={() => handleMenuClick('/enquiredbyme')}>
                    By Me
                  </div>
                  <div className="sidebar-item sub-item" onClick={() => handleMenuClick('/enquiredtome')}>
                    To Me
                  </div>
                </div>
              </div>
            )}
            
            {AppFunc.hasAIChatAccess(activeUserRole) && (
              <div className="sidebar-item" onClick={() => handleMenuClick('/ichat')}>
                <i className="bi bi-chat-dots-fill me-2"></i>
                Explore Resumes
              </div>
            )}
            
            {AppFunc.hasAIChatAccess(activeUserRole) && (
              <div className="sidebar-item" onClick={() => handleMenuClick('/idb')}>
                <i className="bi bi-database-fill me-2"></i>
                Explore Database
              </div>
            )}
          </div>

          {/* Logout Section at Bottom */}
          <div className="sidebar-logout-section">
            <div className="sidebar-item logout-item" onClick={handleLogout}>
              <i className="bi bi-box-arrow-right me-2"></i>
              Logout
            </div>
          </div>
        </div>
    </>
)
}
export default Menu;
