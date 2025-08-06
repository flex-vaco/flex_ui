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

function EmpProjUtiliList() {
    const  [empProjUtiliList, setEmpProjUtiliList] = useState([]);
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
        axios.get('/empPrjUtili')
        .then(function (response) {
          setEmpProjUtiliList(response.data.empProjUtili);
        })
        .catch(function (error) {
          console.log(error);
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
          navigate("/empUtiliList");
    }

    const handleExcelExport = () => {
      Utils.exportHTMLTableToExcel('utilizationListTable', 'Utilization List', ["Action"])
    };

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
    const totalItems = empProjUtiliList.length;
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const currentItems = empProjUtiliList.slice(startIndex, endIndex);

    return (
      <Layout>
        <div className="list-page-container">
          <div className="list-page-card">
            {/* Header Section */}
            <div className="list-page-header">
              <h1 className="list-page-title">Resource Utilization List</h1>
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
                    ADD UTILIZATION
                  </button>
                </div>
              </div>
            </div>

            {/* Table Section */}
            <div className="list-table-container">
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
                      <td colSpan="8" className="empty-state">
                        <i className="bi bi-graph-up"></i>
                        <p>No utilization records found</p>
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
  
export default EmpProjUtiliList;