import React,{ useState, useEffect} from 'react'
import { Link, useNavigate } from "react-router-dom"
import Swal from 'sweetalert2'
import axios from 'axios'
import Layout from "../components/Layout"
import * as Utils from "../lib/Utils"
import * as AppFunc from "../lib/AppFunctions";
import APP_CONSTANTS from "../appConstants";
import Pagination from "../components/Pagination";
import "./ListPages.css";
import Loader from "../components/Loader";

function ProjectList() {
    const [isLoading, setIsLoading] = useState(false);
    const [projectList, setProjectList] = useState([]);
    const hasReadOnlyAccess = AppFunc.activeUserRole === APP_CONSTANTS.USER_ROLES.PRODUCER;

    const navigate = useNavigate();

    const handleAddButtonClick = () => {
      navigate("/projectCreate");
    }

    useEffect(() => {
        fetchProjectList()
    }, [])
  
    const fetchProjectList = () => {
        setIsLoading(true);
        axios.get('/projects')
        .then(function (response) {
          setProjectList(response.data.projects);
          setFilteredList(response.data.projects);
          setSearchKeys(Object.keys(response?.data?.projects[0]))
        })
        .catch(function (error) {
          console.log(error);
        })
        .finally(() => {
            setIsLoading(false);
        })
    }

    const handleDelete = (project_id) => {
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
                axios.get(`/projects/delete/${project_id}`)
                .then(function (response) {
                    Swal.fire({
                        icon: 'success',
                        title: 'Project deleted successfully!',
                        showConfirmButton: false,
                        timer: 1500
                    })
                    fetchProjectList()
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

  const [filteredList, setFilteredList] = useState(projectList);
  const [searchKey, setSearchKey] = useState("");
  const  [inputType, setInputType] = useState("text");
  const  [searchKeys, setSearchKeys] = useState([])

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const handleSearch = (event) => {
    event.stopPropagation();
    const searchValue = event.target.value.toString().toLowerCase();
    let dbVal = "";
    const fList = projectList.filter((item) => {
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
    Utils.exportHTMLTableToExcel('projectListTable', 'Project List', ["Action"])
  };

  const searchKeysToIgnore = ["project_id", "client_id","clientDetails"];

  const getStatusBadgeClass = (status) => {
    const statusLower = status?.toLowerCase();
    if (statusLower === 'active' || statusLower === 'ongoing') return 'status-active';
    if (statusLower === 'completed' || statusLower === 'finished') return 'status-completed';
    if (statusLower === 'pending' || statusLower === 'on hold') return 'status-pending';
    if (statusLower === 'cancelled' || statusLower === 'terminated') return 'status-cancelled';
    return 'status-pending';
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
              <h1 className="list-page-title">Project List</h1>
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
                      <option key={k} value={k}>{k.replace(/_/g, ' ').toUpperCase()}</option> : ""
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
                    hidden={hasReadOnlyAccess}
                    onClick={handleAddButtonClick}
                    className="add-btn"
                  >
                    <i className="bi bi-plus-square"></i>
                    ADD PROJECT
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
                <table className="table list-table" id='projectListTable'>
                  <thead>
                    <tr>
                      <th hidden={hasReadOnlyAccess}>Action</th>
                      <th>Client Name</th>
                      <th>Project Name</th>
                      <th>Project Location</th>
                      <th>Contact Person</th>
                      <th>Contact Email</th>
                      <th>Contact Phone</th>
                      <th>Start Date</th>
                      <th>Expected End Date</th>
                      <th>Actual End Date</th>
                      <th>Project Status</th>
                      <th>Technologies Involved</th>
                      <th>Head Count</th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentItems.length === 0 ? (
                      <tr>
                        <td colSpan="13" className="empty-state">
                          <i className="bi bi-folder-x"></i>
                          <p>No projects found</p>
                        </td>
                      </tr>
                    ) : (
                      currentItems.map((projectDetails, key) => {
                        return (
                          <tr key={key}>
                            <td hidden={hasReadOnlyAccess}>
                              <div className="action-buttons-cell">
                                <button
                                  onClick={() => handleDelete(projectDetails.project_id)}
                                  className="delete-btn"
                                  title="Delete Project"
                                >
                                  <i className="bi bi-trash"></i>
                                </button>
                                <Link
                                  className="edit-btn"
                                  to={`/projectEdit/${projectDetails.project_id}`}
                                  title="Edit Project"
                                >
                                  <i className="bi bi-pencil"></i>
                                </Link>
                              </div>
                            </td>
                            <td>
                              <Link
                                className="client-link"
                                to={`/clientShow/${projectDetails.clientDetails.client_id}`}
                              >
                                {projectDetails.clientDetails.name}
                              </Link>
                            </td>
                            <td>
                              <Link
                                className="project-link"
                                to={`/projectShow/${projectDetails.project_id}`}
                              >
                                {projectDetails.project_name}
                              </Link>
                            </td>
                            
                            <td>{projectDetails.project_location}</td>

                            <td>{projectDetails.contact_person}</td>
                            <td>{projectDetails.contact_email}</td>
                            <td>{projectDetails.contact_phone}</td>
                            <td>{Utils.formatDateYYYYMMDD(projectDetails.start_date)}</td>
                            <td>{Utils.formatDateYYYYMMDD(projectDetails.expected_end_date)}</td>
                            <td>{Utils.formatDateYYYYMMDD(projectDetails.actual_end_date)}</td>
                            <td>
                              <span className={`status-badge ${getStatusBadgeClass(projectDetails.status)}`}>
                                {projectDetails.status}
                              </span>
                            </td>
                            <td>{projectDetails.technologies_required}</td>
                            <td>{projectDetails.head_count}</td>
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
  
export default ProjectList;