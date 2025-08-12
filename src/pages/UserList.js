import React,{ useState, useEffect} from 'react'
import { Link, useNavigate } from "react-router-dom"
import Swal from 'sweetalert2'
import axios from 'axios'
import Layout from "../components/Layout"
import * as Utils from "../lib/Utils"
import Pagination from "../components/Pagination";
import "./ListPages.css";
import Loader from "../components/Loader";

function UserList() {
    const [isLoading, setIsLoading] = useState(false);
    const  [userList, setUserList] = useState([])
    const  [searchKeys, setSearchKeys] = useState([])
    const  [inputType, setInputType] = useState("text");

    // Pagination state
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);

    useEffect(() => {
        fetchUserList()
    }, [])
  
    const fetchUserList = () => {
        setIsLoading(true);
        axios.get('/users')
        .then(function (response) {
          setUserList(response.data.users);
          setFilteredList(response.data.users);
          setSearchKeys(Object.keys(response?.data?.users[0]))
        })
        .catch(function (error) {
          console.log(error);
        })
        .finally(() => {
            setIsLoading(false);
        })
    }
    const navigate = useNavigate();
    const handleAddButtonClick = () => {
      navigate("/userCreate");
    }
    const handleDelete = (user_id) => {
        Swal.fire({
            title: 'Are you sure?',
            text: "You won't be able to revert this!",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Yes, delete it!'
          }).then((result) => {
            if (result.isConfirmed) {
                axios.get(`/users/delete/${user_id}`)
                .then(function (response) {
                    Swal.fire({
                        icon: 'success',
                        title: 'User deleted successfully!',
                        showConfirmButton: false,
                        timer: 1500
                    })
                    fetchUserList()
                })
                .catch(function (error) {
                    Swal.fire({
                         icon: 'error',
                        title: 'An Error Occured!',
                        showConfirmButton: false,
                        timer: 1500
                    })
                });
            }
          })
    }
    const [filteredList, setFilteredList] = useState(userList);
    const [searchKey, setSearchKey] = useState("");

    const handleSearch = (event) => {
      event.stopPropagation();
      const searchValue = event.target.value.toString().toLowerCase();
      let dbVal = "";
      const fList = userList.filter((item) => {
        if (searchKey.includes("date")) {
          dbVal = Utils.formatDateYYYYMMDD(item[`${searchKey}`]).toString();
        } else {
          dbVal = item[`${searchKey}`].toString().toLowerCase();
        }
        return dbVal.includes(searchValue);
      });
      setFilteredList(fList);
      setCurrentPage(1); // Reset to first page when searching
    };

    const handleSearchKeyChange = (event) => {
      event.stopPropagation();
      if (event.target.value === "-select-"){
        document.getElementById("search-value").value = "";
      } else {
        setSearchKey(event.target.value);
      }
      
      (event.target.value.includes("date")) ? setInputType("date") : setInputType("text");
    };

    const handleSearchRefreshClick = () => {
      window.location.reload(true);
    };

    const handleExcelExport = () => {
      Utils.exportHTMLTableToExcel('userListTable', 'User List', ["Action"])
    };

    const searchKeysToIgnore = ["password","user_id"];

    // Pagination handlers
    const handlePageChange = (page) => {
      setCurrentPage(page);
    };

    const handleItemsPerPageChange = (newItemsPerPage) => {
      setItemsPerPage(newItemsPerPage);
      setCurrentPage(1); // Reset to first page when changing items per page
    };

    // Calculate pagination
    const totalItems = filteredList.length;
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const currentItems = filteredList.slice(startIndex, endIndex);
    
    return (
      <Layout>
        <div className="list-page-container">
          <div className="list-page-card">
            {/* Header Section */}
            <div className="list-page-header">
              <h1 className="list-page-title">User List</h1>
            </div>

            {/* Search Controls */}
            <div className="search-controls">
              <div className="search-row">
                <div className="search-input-group">
                  <span className="search-icon">
                    <i className="bi bi-search"></i>
                  </span>
                  <select 
                    className="search-select" 
                    name="searchKey" 
                    id="search-key"  
                    onChange={handleSearchKeyChange}
                  > 
                    <option value="-select-">-- Search Key --</option>
                    {searchKeys.map((k) => (!searchKeysToIgnore.includes(k)) ? 
                      <option key={k} value={k}>{k.toLocaleUpperCase()}</option> : ""
                    )}
                  </select>
                  <input 
                    className="search-input" 
                    id="search-value" 
                    type={inputType} 
                    placeholder="Type a value" 
                    onChange={handleSearch} 
                  />
                </div>
                
                <button 
                  className="search-refresh-btn"
                  onClick={handleSearchRefreshClick}
                >
                  <i className="bi bi-arrow-counterclockwise"></i>
                  Refresh
                </button>

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
                    onClick={handleAddButtonClick}
                    className="add-btn"
                  >
                    <i className="bi bi-plus-square"></i>
                    ADD USER
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
                  <table className="table list-table" id='userListTable'>
                    <thead>
                      <tr>
                        <th>Action</th>
                        <th>Name</th>
                        <th>Email</th>
                        <th>Role</th>
                      </tr>
                    </thead>
                    <tbody>
                      {currentItems.length === 0 ? (
                        <tr>
                          <td colSpan="4" className="empty-state">
                            <i className="bi bi-people"></i>
                            <p>No users found</p>
                          </td>
                        </tr>
                      ) : (
                        currentItems.map((usersList, key) => {
                          return (
                            <tr key={key}>
                              <td>
                                <div className="action-buttons-cell">
                                  <button
                                    onClick={() => handleDelete(usersList.user_id)}
                                    className="delete-btn"
                                    title="Delete User"
                                  >
                                    <i className="bi bi-trash"></i>
                                  </button>
                                  <Link
                                    className="edit-btn"
                                    to={`/userEdit/${usersList.user_id}`}
                                    title="Edit User"
                                  >
                                    <i className="bi bi-pencil"></i>
                                  </Link>
                                </div>
                              </td>
                              <td>
                                {usersList.first_name}, {usersList.last_name}
                              </td>
                              <td>{usersList.email}</td>
                              <td>{usersList.role.toUpperCase()}</td>
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
  
export default UserList;