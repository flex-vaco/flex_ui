import React,{ useState, useEffect} from 'react'
import { Link, useNavigate } from "react-router-dom"
import Swal from 'sweetalert2'
import axios from 'axios'
import Layout from "../../components/Layout"
import * as Utils from "../../lib/Utils"
import * as AppFunc from "../../lib/AppFunctions";
import APP_CONSTANTS from "../../appConstants";
import Pagination from "../../components/Pagination";
import "../ListPages.css";
import Loader from "../../components/Loader";

function WorkRequestList() {
    const [isLoading, setIsLoading] = useState(false);
    const [workRequestList, setWorkRequestList] = useState([]);
    const hasReadOnlyAccess = AppFunc.activeUserRole === APP_CONSTANTS.USER_ROLES.EMPLOYEE;

    const navigate = useNavigate();

    const handleAddButtonClick = () => {
      navigate("/workRequestCreate");
    }

    useEffect(() => {
        fetchWorkRequestList()
    }, [])
  
    const fetchWorkRequestList = () => {
        setIsLoading(true);
        axios.get('/workRequest')
        .then(function (response) {
          setWorkRequestList(response.data.workRequests);
          setFilteredList(response.data.workRequests);
          setSearchKeys(Object.keys(response?.data?.workRequests[0] || {}))
        })
        .catch(function (error) {
          console.log(error);
        })
        .finally(() => {
            setIsLoading(false);
        })
    }

    const handleDelete = (id) => {
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
                axios.get(`/workRequest/delete/${id}`)
                .then(function (response) {
                    Swal.fire({
                        icon: 'success',
                        title: 'Work Request deleted successfully!',
                        showConfirmButton: false,
                        timer: 1500
                    })
                    fetchWorkRequestList()
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

  const [filteredList, setFilteredList] = useState(workRequestList);
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
    const fList = workRequestList.filter((item) => {
      if (searchKey.includes("date")) {
        dbVal = Utils.formatDateYYYYMMDD(item[`${searchKey}`]).toString();
      } else {
        dbVal = item[`${searchKey}`]?.toString().toLowerCase() || "";
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
    Utils.exportHTMLTableToExcel('workRequestListTable', 'Work Request List', ["Action"])
  };

  const searchKeysToIgnore = ["id", "service_line_id", "project_id", "submitted_by", "submitted_at", "created_at", "updated_at"];

  const getStatusBadgeClass = (status) => {
    const statusLower = status?.toLowerCase();
    if (statusLower === 'draft') return 'status-pending';
    if (statusLower === 'submitted') return 'status-active';
    if (statusLower === 'approved') return 'status-completed';
    if (statusLower === 'rejected') return 'status-cancelled';
    if (statusLower === 'in_progress') return 'status-active';
    if (statusLower === 'completed') return 'status-completed';
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
              <h1 className="list-page-title">Work Request List</h1>
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
                    ADD WORK REQUEST
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
                <table className="table list-table" id='workRequestListTable'>
                  <thead>
                    <tr>
                      <th hidden={hasReadOnlyAccess}>Action</th>
                      <th>Title</th>
                      <th>Service Line</th>
                      <th>Project</th>
                      <th>Duration</th>
                      <th>Hours/Week</th>
                      <th>Capability Areas</th>
                      <th>Assigned Resources</th>
                      <th>Status</th>
                      <th>Submitted By</th>
                      <th>Submitted At</th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentItems.length === 0 ? (
                      <tr>
                        <td colSpan="10" className="empty-state">
                          <i className="bi bi-clipboard-data"></i>
                          <p>No work requests found</p>
                        </td>
                      </tr>
                    ) : (
                      currentItems.map((workRequest, key) => {
                        return (
                          <tr key={key}>
                            <td hidden={hasReadOnlyAccess}>
                              <div className="action-buttons-cell">
                                <button
                                  onClick={() => handleDelete(workRequest.id)}
                                  className="delete-btn"
                                  title="Delete Work Request"
                                >
                                  <i className="bi bi-trash"></i>
                                </button>
                                <Link
                                  className="edit-btn"
                                  to={`/workRequestEdit/${workRequest.id}`}
                                  title="Edit Work Request"
                                >
                                  <i className="bi bi-pencil"></i>
                                </Link>
                              </div>
                            </td>
                            <td>
                              <Link
                                className="project-link"
                                to={`/workRequestShow/${workRequest.id}`}
                              >
                                {workRequest.title}
                              </Link>
                            </td>
                            <td>{workRequest.service_line_name || '-'}</td>
                            <td>{workRequest.project_name || '-'}</td>
                            <td>
                              {Utils.formatDateYYYYMMDD(workRequest.duration_from)} - {Utils.formatDateYYYYMMDD(workRequest.duration_to)}
                            </td>
                            <td>{workRequest.hours_per_week}</td>
                            <td>{workRequest.capability_areas || '-'}</td>
                            <td>{workRequest.assigned_resources || '-'}</td>
                            <td>
                              <span className={`status-badge ${getStatusBadgeClass(workRequest.status)}`}>
                                {workRequest.status?.replace('_', ' ').toUpperCase()}
                              </span>
                            </td>
                            <td>{workRequest.first_name} {workRequest.last_name}</td>
                            <td>{Utils.formatDateYYYYMMDD(workRequest.submitted_at)}</td>
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
  
export default WorkRequestList; 