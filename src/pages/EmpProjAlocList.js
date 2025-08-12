import React,{ useState, useEffect} from 'react'
import { Link, useNavigate } from "react-router-dom"
import Swal from 'sweetalert2'
import axios from 'axios'
import Layout from "../components/Layout"
import * as Utils from "../lib/Utils"
import EmployeeProfileModal from '../components/employee/EmployeeProfileModal'
import * as AppFunc from "../lib/AppFunctions";
import APP_CONSTANTS from "../appConstants";
import Pagination from "../components/Pagination";
import "./ListPages.css";
import Loader from "../components/Loader";

function EmpProjAlocList() {
    const [isLoading, setIsLoading] = useState(false);
    const  [empProjAlocList, setEmpProjAlocList] = useState([])
    const  [searchKeys, setSearchKeys] = useState([]);
    const [inputType, setInputType] = useState("text");
    const [modalIsOpen, setIsOpen] = useState(false);
    const [empModalDetails, setEmpModalDetails] = useState({});
    const hasReadOnlyAccess = AppFunc.activeUserRole === APP_CONSTANTS.USER_ROLES.PRODUCER;
    const navigate = useNavigate(); 

    // Pagination state
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);

    const handleAddButtonClick = () => {
      navigate("/empProjCreate");
    }

    useEffect(() => {
        fetchEmpProjAlocList()
    }, [])
    const url = "empPrjAloc";
    const fetchEmpProjAlocList = () => {
      setIsLoading(true);
      axios.get(`/${url}`)
      .then(function (response) {
        setEmpProjAlocList(response.data.empProjAlloc);
        setFilteredList(response.data.empProjAlloc);
        const defaultKeys = Object.keys(response?.data?.empProjAlloc[0]);
        const extraKeys = ["project_name"]; // add any other custom keys like employee_name, etc.
        setSearchKeys([...defaultKeys, ...extraKeys]);
      })
      .catch(function (error) {
        console.log(error);
      })
      .finally(() => {
          setIsLoading(false);
      })
  }

    const handleDelete = (emp_proj_aloc_id) => {
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
                axios.get(`/${url}/delete/${emp_proj_aloc_id}`)
                .then(function (response) {
                    Swal.fire({
                        icon: 'success',
                        title: 'Allocation deleted successfully!',
                        showConfirmButton: false,
                        timer: 1500
                    })
                    fetchEmpProjAlocList();
                })
                .catch(function (error) {
                    Swal.fire({
                         icon: 'error',
                        title: 'An Error Occured!',
                        text: error,
                        showConfirmButton: false,
                        timer: 1500
                    })
                });
            }
          })
    };

    const [filteredList, setFilteredList] = useState(empProjAlocList);
    const [searchKey, setSearchKey] = useState("");

    const handleSearch = (event) => {
      event.stopPropagation();
    
      if (!searchKey || searchKey === "-select-") {
        Swal.fire({
          title: 'Select Search Key ',
          text: "Please select a key to search!",
          icon: 'warning',
          showCancelButton: false,
          confirmButtonColor: '#3085d6',
          confirmButtonText: 'OK'
        });
      } else {
        const searchValue = event.target.value?.toString().toLowerCase();
        let dbVal = "";
    
        const fList = empProjAlocList.filter((item) => {
          if (searchKey === "project_name") {
            dbVal = item?.projectDetails?.project_name?.toLowerCase() || "";
          } else if (searchKey.includes("date")) {
            dbVal = Utils.formatDateYYYYMMDD(item[`${searchKey}`])?.toString();
          } else {
            dbVal = item[`${searchKey}`]?.toString().toLowerCase();
          }
    
          return dbVal?.includes(searchValue);
        });
    
        setFilteredList(fList);
        setCurrentPage(1); // Reset to first page when searching
      }
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
      Utils.exportHTMLTableToExcel('allocationListTable', 'Allocation List', ["Action"])
    };

    const searchKeysToIgnore = ["emp_id","project_id","emp_proj_aloc_id","empDetails", "projectDetails"];

    const openEmpDetailsModal = (empId) => {
      axios.get(`/employees/${empId}`)
        .then((response) => {
          setEmpModalDetails(response.data.employees[0])
        })
        .catch((error) => {
          console.log(error);
        })
      setIsOpen(true);
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
              <h1 className="list-page-title">Allocation List</h1>
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
                    id="searchKey" 
                    onChange={handleSearchKeyChange}
                  > 
                    <option value="-select-">-- Select Key --</option>
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
                  hidden={modalIsOpen}
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
                    hidden={hasReadOnlyAccess}
                    onClick={handleAddButtonClick}
                    className="add-btn"
                  >
                    <i className="bi bi-plus-square"></i>
                    ADD ALLOCATION
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
                <table className="table list-table" id='allocationListTable'>
                  <thead>
                    <tr>
                      <th hidden={hasReadOnlyAccess}>Action</th>
                      <th>Project Name</th>
                      <th>Resource Name</th>
                      <th>Start Date</th>
                      <th>End Date</th>
                      <th>Work Location</th>
                      <th>Hours per Day</th>
                      <th>Rate Per Hour (USD)</th>
                      <th>Shift Start Time</th>
                      <th>Shift End Time</th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentItems.length === 0 ? (
                      <tr>
                        <td colSpan="10" className="empty-state">
                          <i className="bi bi-diagram-3"></i>
                          <p>No allocations found</p>
                        </td>
                      </tr>
                    ) : (
                      currentItems.map((empProjAlloc, key) => {
                        return (
                          <tr key={key}>
                            <td hidden={hasReadOnlyAccess}>
                              <div className="action-buttons-cell">
                                <button
                                  onClick={() => handleDelete(empProjAlloc.emp_proj_aloc_id)}
                                  className="delete-btn"
                                  title="Delete Allocation"
                                >
                                  <i className="bi bi-trash"></i>
                                </button>
                                <Link
                                  className="edit-btn"
                                  to={`/empProjEdit/${empProjAlloc.emp_proj_aloc_id}`}
                                  title="Edit Allocation"
                                >
                                  <i className="bi bi-pencil"></i>
                                </Link>
                              </div>
                            </td>
                            <td>
                              <Link
                                className="project-link"
                                to={`/projectShow/${empProjAlloc.projectDetails.project_id}`}
                              >
                                {empProjAlloc.projectDetails.project_name}
                              </Link>
                            </td>
                            <td>
                              <a href='#' id={key} key={key} onClick={(e) => openEmpDetailsModal(empProjAlloc.empDetails.emp_id)}>
                                {empProjAlloc.empDetails.first_name}, 
                                {empProjAlloc.empDetails.last_name}
                              </a>
                            </td>
                            <td>{Utils.formatDateYYYYMMDD(empProjAlloc.start_date)}</td>
                            <td>{Utils.formatDateYYYYMMDD(empProjAlloc.end_date)}</td>
                            <td>{empProjAlloc.work_location}</td>
                            <td>{empProjAlloc.hours_per_day}</td>
                            <td>{empProjAlloc.rate_per_hour}</td>
                            <td>{empProjAlloc.shift_start_time}</td>
                            <td>{empProjAlloc.shift_end_time}</td>
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

        <EmployeeProfileModal
          modelstatus={modalIsOpen}
          close={() => setIsOpen(false)}
          employee={empModalDetails}
          hideAddInListBtn={true}
          hideHireBtn={true}
        />
      </Layout>
    );
}
  
export default EmpProjAlocList;