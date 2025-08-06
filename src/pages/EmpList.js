import React,{ useState, useEffect} from 'react'
import { Link, useNavigate } from "react-router-dom"
import Swal from 'sweetalert2'
import axios from 'axios'
import Layout from "../components/Layout"
import * as Utils from "../lib/Utils"
import EmployeeProfileModal from '../components/employee/EmployeeProfileModal'
import Pagination from "../components/Pagination";
import "./ListPages.css";

function EmpList() {
    const [empList, setEmpList] = useState([]);
    const navigate = useNavigate();
    const [inputType, setInputType] = useState("text");
    const [filteredList, setFilteredList] = useState(empList);
    const [searchKey, setSearchKey] = useState("");
    const [searchKeys, setSearchKeys] = useState([]);
    const [modalIsOpen, setIsOpen] = useState(false);
    const [empModalDetails, setEmpModalDetails] = useState({})

    // Pagination state
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);

    const handleAddButtonClick = () => {
      navigate("/empCreate");
    }

    useEffect(() => {
        fetchEmpList()
    }, [])

  const openModal = (empId) => {
    axios.get(`/employees/${empId}`)
      .then((response) => {
        setEmpModalDetails(response.data.employees[0])
      })
      .catch((error) => {
        console.log(error);
      })
    setIsOpen(true);
  }

    const fetchEmpList = () => {
        axios.get('/employees')
        .then(function (response) {
          setEmpList(response.data.employees);
          setFilteredList(response.data.employees);
          setSearchKeys(Object.keys(response?.data?.employees[0]))
        })
        .catch(function (error) {
          console.log(error);
        })
    }
  
    const handleDelete = (emp_id) => {
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
                axios.get(`/employees/delete/${emp_id}`)
                .then(function (response) {
                    Swal.fire({
                        icon: 'success',
                        title: 'Resource deleted successfully!',
                        showConfirmButton: false,
                        timer: 1500
                    })
                    fetchEmpList()
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
    };

    const handleSearch = (event) => {
      event.stopPropagation();
     if (!searchKey || searchKey === "-select-") {
        Swal.fire({
          title: 'Select Search Key ',
          text: "Please select a key and then type value!",
          icon: 'warning',
          showCancelButton: false,
          confirmButtonColor: '#3085d6',
          confirmButtonText: 'OK'
        });
      } else {
        const searchValue = event.target.value?.toString().toLowerCase();
        let dbVal = "";
        const fList = empList.filter((item) => {
          if (searchKey.includes("date")) {
            dbVal = Utils.formatDateYYYYMMDD(item[`${searchKey}`]).toString();
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
      Utils.exportHTMLTableToExcel('empListTable', 'Resource List', ["Action"])
    };

    const searchKeysToIgnore = [
      "emp_id",
      "project_id",
      "emp_proj_aloc_id",
      "empDetails",
      "projectDetails", 
      "profile_picture",
      "resume",
      "employment_type",
      "profile_information",
      "resume",
      "education",
      "manager_email"
    ];

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
              <h1 className="list-page-title">Resource List</h1>
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
                    ADD RESOURCE
                  </button>
                </div>
              </div>
            </div>

            {/* Table Section */}
            <div className="list-table-container">
              <table className="table list-table" id='empListTable'>
                <thead>
                  <tr>
                    <th>Action</th>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Designation</th>
                    <th>Primary Skills</th>
                    <th>Secondary Skills</th>
                    <th>Status</th>
                    <th>Exp.(yrs.)</th>
                    <th>Rate/hr</th>
                    <th>Vaco Join Date</th>
                    <th>Home Location</th>
                    <th>Office Location</th>
                    <th>Manager</th>
                    <th>Manager Email</th>
                    <th>On Site</th>
                    <th>Resume</th>
                  </tr>
                </thead>
                <tbody>
                  {currentItems.length === 0 ? (
                    <tr>
                      <td colSpan="16" className="empty-state">
                        <i className="bi bi-people"></i>
                        <p>No resources found</p>
                      </td>
                    </tr>
                  ) : (
                    currentItems.map((empDetails, key) => {
                      return (
                        <tr key={key} onClick={(e) => openModal(empDetails.emp_id)}>
                          <td>
                            <div className="action-buttons-cell">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDelete(empDetails.emp_id);
                                }}
                                className="delete-btn"
                                title="Delete Resource"
                              >
                                <i className="bi bi-trash"></i>
                              </button>
                              <Link
                                className="edit-btn"
                                to={`/empEdit/${empDetails.emp_id}`}
                                title="Edit Resource"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <i className="bi bi-pencil"></i>
                              </Link>
                            </div>
                          </td>
                          <td>
                            {empDetails.first_name}, {empDetails.last_name}
                          </td>
                          <td>{empDetails.email}</td>
                          <td>{empDetails.designation}</td>
                          <td>{empDetails.primary_skills}</td>
                          <td>{empDetails.secondary_skills}</td>
                          <td>
                            <span className={`status-badge ${empDetails.status === 'Active' ? 'status-active' : 'status-inactive'}`}>
                              {empDetails.status}
                            </span>
                          </td>
                          <td>{empDetails.total_work_experience_years}</td>
                          <td>{empDetails.rate_per_hour}</td>
                          <td>{Utils.formatDateYYYYMMDD(empDetails.vaco_join_date)}</td>
                          <td>{empDetails.home_location_city}</td>
                          <td>{empDetails.office_location_city}</td>
                          <td>{empDetails.manager_name}</td>
                          <td>{empDetails.manager_email}</td>
                          <td>{empDetails.is_onsite ? "YES" : "NO"}</td>
                          <td>
                            <a
                              href={
                                empDetails.resume
                                  ? `${process.env.REACT_APP_API_BASE_URL}/uploads/resume/${empDetails.resume}`
                                  : null
                              }
                              target="_blank" 
                              rel="noreferrer"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <i className="bi bi-person-lines-fill"></i>
                            </a>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
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
          isOpen={modalIsOpen} 
          onClose={() => setIsOpen(false)} 
          employee={empModalDetails}
        />
      </Layout>
    );
}
  
export default EmpList;