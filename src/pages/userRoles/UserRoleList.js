import React,{ useState, useEffect} from 'react';
import { Link, useNavigate } from "react-router-dom";
import axios from 'axios';
import Layout from "../../components/Layout";
import * as AppFunc from "../../lib/AppFunctions";
import APP_CONSTANTS from "../../appConstants";
import * as Utils from "../../lib/Utils";
import Pagination from "../../components/Pagination";
import "../ListPages.css";
import Loader from "../../components/Loader";
import Swal from 'sweetalert2'

function UserRoleList() {
    const [isLoading, setIsLoading] = useState(false);
    const [userRoleList, setUserRoleList] = useState([])
    const hasReadOnlyAccess = !(AppFunc.activeUserRole === APP_CONSTANTS.USER_ROLES.ADMINISTRATOR || AppFunc.activeUserRole === APP_CONSTANTS.USER_ROLES.LOB_ADMIN);
    
    // Pagination state
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);
    
    const navigate = useNavigate(); 

    const handleAddButtonClick = () => {
      navigate("/userRoleCreate");
    }

    useEffect(() => {
        fetchUserRoleList()
    }, [])
    
    const fetchUserRoleList = () => {
        setIsLoading(true);
        axios.get('/userRoles')
        .then(function (response) {
          setUserRoleList(response.data.userRoles);
        })
        .catch(function (error) {
          console.log(error);
          Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'Failed to fetch user roles'
          });
        })
        .finally(() => {
            setIsLoading(false);
        })
    }

    const handleExcelExport = () => {
      Utils.exportHTMLTableToExcel('userRoleListTable', 'User Role List', ["Action"])
    };

    // Pagination handlers
    const handlePageChange = (page) => {
      setCurrentPage(page);
    };

    const handleItemsPerPageChange = (newItemsPerPage) => {
      setItemsPerPage(newItemsPerPage);
      setCurrentPage(1); // Reset to first page when changing items per page
    };

    // Calculate pagination
    const totalItems = userRoleList.length;
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const currentItems = userRoleList.slice(startIndex, endIndex);
    
    return (
      <Layout>
        <div className="list-page-container">
          <div className="list-page-card">
            {/* Header Section */}
            <div className="list-page-header">
              <h1 className="list-page-title">User Role List</h1>
            </div>

            {/* Action Buttons */}
            <div className="search-controls">
              <div className="search-row">
                <div className="search-input-group" style={{ flex: '0 1 auto' }}>
                  {/* Placeholder for future search functionality */}
                </div>
                
                <div className="action-buttons">
                  <button
                    type="button"
                    onClick={handleExcelExport}
                    className="excel-btn"
                  >
                    <i className="bi bi-filetype-xls"></i>
                    EXCEL
                  </button>
                  
                  <button 
                    type="button"
                    hidden={hasReadOnlyAccess}
                    onClick={handleAddButtonClick}
                    className="add-btn"
                  >
                    <i className="bi bi-plus-square"></i>
                    ADD ROLE
                  </button>
                </div>
              </div>
            </div>

            {/* Table Section */}
            <div className="list-table-container">
              {isLoading ? (
                  <Loader 
                    size="large" 
                    variant="spinner" 
                    containerHeight="200px"
                  />
                ) : (
                  <table className="table list-table" id='userRoleListTable'>
                    <thead>
                      <tr>
                        <th hidden={hasReadOnlyAccess}>Action</th>
                        <th>Role</th>
                        <th>Display Name</th>
                        <th>Description</th>
                        <th>Line of Business</th>
                      </tr>
                    </thead>
                    <tbody>
                      {currentItems.length === 0 ? (
                        <tr>
                          <td colSpan="6" className="empty-state">
                            <i className="bi bi-shield"></i>
                            <p>No user roles found</p>
                          </td>
                        </tr>
                      ) : (
                        currentItems.map((userRole, key) => {
                          return (
                            <tr key={key}>
                              <td hidden={hasReadOnlyAccess}>
                                <div className="action-buttons-cell">
                                  <Link
                                    className="edit-btn"
                                    to={`/userRoleEdit/${userRole.role_id}`}
                                    title="Edit Role"
                                  >
                                    <i className="bi bi-pencil"></i>
                                  </Link>
                                </div>
                              </td>
                              <td>
                                <Link
                                  className="page-link"
                                  to={`/userRoleEdit/${userRole.role_id}`}
                                >
                                  {userRole.role}
                                </Link>
                              </td>
                              <td>
                                {userRole.name || 'N/A'}
                              </td>
                              <td>
                                <div style={{ maxWidth: '300px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                  {userRole.role_description}
                                </div>
                              </td>
                              <td>
                                {userRole.line_of_business_name || 'N/A'}
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
              )}
            </div>

            {/* Pagination */}
            {totalItems > 0 && (
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                totalItems={totalItems}
                itemsPerPage={itemsPerPage}
                onPageChange={handlePageChange}
                onItemsPerPageChange={handleItemsPerPageChange}
              />
            )}
          </div>
        </div>
      </Layout>
    );
}
  
export default UserRoleList
