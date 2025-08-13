import React,{ useState, useEffect} from 'react'
import { Link, useNavigate } from "react-router-dom"
import Swal from 'sweetalert2'
import axios from 'axios'
import Layout from "../../components/Layout"
import * as Utils from "../../lib/Utils"
import EmployeeProfileModal from '../../components/employee/EmployeeProfileModal'
import * as AppFunc from "../../lib/AppFunctions";
import APP_CONSTANTS from "../../appConstants";
import Pagination from "../../components/Pagination";
import "../ListPages.css";
import Loader from "../../components/Loader";

function EmpProjUtiliList() {
    const [isLoading, setIsLoading] = useState(false);
    const  [empProjUtiliList, setEmpProjUtiliList] = useState([]);
    const [searchKeys, setSearchKeys] = useState([]);
    const [inputType, setInputType] = useState("text");
    const [modalIsOpen, setIsOpen] = useState(false);
    const [empModalDetails, setEmpModalDetails] = useState({});
    const hasReadOnlyAccess = AppFunc.activeUserRole === APP_CONSTANTS.USER_ROLES.PRODUCER;

    // Pagination state
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);

    const navigate = useNavigate();

    const handleAddButtonClick = () => {
      navigate("/empProjUtiliCreate");
    }

    useEffect(() => {
        fetchEmpProjUtiliList()
    }, [])
    
    const fetchEmpProjUtiliList = () => {
        setIsLoading(true);
        axios.get('/empPrjUtili')
        .then(function (response) {
          setEmpProjUtiliList(response.data.empProjUtili);
          setFilteredList(response.data.empProjUtili);
          // Only allow filtering by Project Name and Resource Name
          setSearchKeys(["project_name", "resource_name"]);
        })
        .catch(function (error) {
          console.log(error);
        })
        .finally(() => {
            setIsLoading(false);
        })
    }

    const handleDelete = (emp_proj_utili_id) => {
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
                axios.get(`/empPrjUtili/delete/${emp_proj_utili_id}`)
                .then(function (response) {
                    Swal.fire({
                        icon: 'success',
                        title: 'Utilization deleted successfully!',
                        showConfirmButton: false,
                        timer: 1500
                    })
                    fetchEmpProjUtiliList();
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
    }

    const [filteredList, setFilteredList] = useState(empProjUtiliList);
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
    
        const fList = empProjUtiliList.filter((item) => {
          if (searchKey === "project_name") {
            dbVal = item?.projectDetails?.project_name?.toLowerCase() || "";
          } else if (searchKey === "resource_name") {
            dbVal = `${item?.empDetails?.first_name} ${item?.empDetails?.last_name}`.toLowerCase() || "";
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
      setInputType("text"); // Always text input for project name and resource name
    };

    const handleSearchRefreshClick = () => {
      window.location.reload(true);
    };

    const handleExcelExport = () => {
      Utils.exportHTMLTableToExcel('utilizationListTable', 'Utilization List', ["Action"])
    };

    // No need for searchKeysToIgnore since we're only showing specific keys

    const openEmpDetailsModal = (empId) => {
      axios.get(`/employees/${empId}`)
        .then((response) => {
          setEmpModalDetails(response.data.employees[0])
        })
        .catch((error) => {
          console.log(error);
        })
      setIsOpen(true);
    }

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
              <h1 className="list-page-title">Utilization List</h1>
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
                    {searchKeys.map((k) => 
                      <option key={k} value={k}>{k.replace(/_/g, ' ').toUpperCase()}</option>
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
                    ADD UTILIZATION
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
                <table className="table list-table" id='utilizationListTable'>
                  <thead>
                    <tr>
                      <th hidden={hasReadOnlyAccess}>Action</th>
                      <th>Project Name</th>
                      <th>Resource Name</th>
                      <th>Week Starting</th>
                      <th>Project Hours per Week</th>
                      <th>Allocation Hours per Week</th>
                      <th>Forecast Hours per Week</th>
                      <th>PTO Hours per Week</th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentItems.length === 0 ? (
                      <tr>
                        <td colSpan="10" className="empty-state">
                          <i className="bi bi-graph-up"></i>
                          <p>No utilizations found</p>
                        </td>
                      </tr>
                    ) : (
                      currentItems.map((empProjUtili, key) => {
                        return (
                          <tr key={key}>
                            <td hidden={hasReadOnlyAccess}>
                              <div className="action-buttons-cell">
                                <button
                                  onClick={() => handleDelete(empProjUtili.emp_proj_utili_id)}
                                  className="delete-btn"
                                  title="Delete Utilization"
                                >
                                  <i className="bi bi-trash"></i>
                                </button>
                                <Link
                                  className="edit-btn"
                                  to={`/empProjUtiliEdit/${empProjUtili.emp_proj_utili_id}`}
                                  title="Edit Utilization"
                                >
                                  <i className="bi bi-pencil"></i>
                                </Link>
                              </div>
                            </td>
                            <td>
                              <Link
                                className="project-link"
                                to={`/projectShow/${empProjUtili.projectDetails.project_id}`}
                              >
                                {empProjUtili.projectDetails.project_name}
                              </Link>
                            </td>
                            <td>
                              <a href="javascript:void(0)" id={key} key={key} onClick={(e) => openEmpDetailsModal(empProjUtili.empDetails.emp_id)}>
                                {empProjUtili.empDetails.first_name}, 
                                {empProjUtili.empDetails.last_name}
                              </a>
                            </td>
                            <td>{Utils.formatDateYYYYMMDD(empProjUtili.week_starting)}</td>
                            <td>{empProjUtili.proj_hours_per_week}</td>
                            <td>{empProjUtili.allc_work_hours_per_week}</td>
                            <td>{empProjUtili.forecast_hours_per_week}</td>
                            <td>{empProjUtili.pto_hours_per_week}</td>
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

        {/* Employee Profile Modal */}
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
  
export default EmpProjUtiliList;