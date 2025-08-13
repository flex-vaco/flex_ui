import React,{ useState, useEffect} from 'react'
import { Link, useNavigate } from "react-router-dom"
import Swal from 'sweetalert2'
import axios from 'axios'
import Layout from "../../components/Layout"
import * as Utils from "../../lib/Utils"
import Pagination from "../../components/Pagination";
import "../ListPages.css";
import Loader from "../../components/Loader";

function LineOfBusinessList() {
    const [isLoading, setIsLoading] = useState(false);
    const [lineOfBusinessList, setLineOfBusinessList] = useState([])
    const navigate = useNavigate();

    // Pagination state
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);

    const handleAddButtonClick = () => {
      navigate("/lineOfBusinessCreate");
    }

    useEffect(() => {
        fetchLineOfBusinessList()
    }, [])
  
    const fetchLineOfBusinessList = () => {
        setIsLoading(true);
        axios.get('/lineOfBusiness')
        .then(function (response) {
          setLineOfBusinessList(response.data.lineOfBusiness);
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
                axios.get(`/lineOfBusiness/delete/${id}`)
                .then(function (response) {
                    Swal.fire({
                        icon: 'success',
                        title: 'Line of Business deleted successfully!',
                        showConfirmButton: false,
                        timer: 1500
                    })
                    fetchLineOfBusinessList()
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

    const handleExcelExport = () => {
      Utils.exportHTMLTableToExcel('lineOfBusinessListTable', 'Line of Business List', ["Action"])
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
    const totalItems = lineOfBusinessList.length;
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const currentItems = lineOfBusinessList.slice(startIndex, endIndex);

    return (
      <Layout>
        <div className="list-page-container">
          <div className="list-page-card">
            {/* Header Section */}
            <div className="list-page-header">
              <h1 className="list-page-title">Line of Business List</h1>
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
                    onClick={handleAddButtonClick}
                    className="add-btn"
                  >
                    <i className="bi bi-plus-square"></i>
                    ADD LINE OF BUSINESS
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
                <table className="table list-table" id='lineOfBusinessListTable'>
                  <thead>
                    <tr>
                      <th>Action</th>
                      <th>Line of Business Name</th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentItems.length === 0 ? (
                      <tr>
                        <td colSpan="3" className="empty-state">
                          <i className="bi bi-briefcase"></i>
                          <p>No line of business found</p>
                        </td>
                      </tr>
                    ) : (
                      currentItems.map((lineOfBusiness, key) => {
                        return (
                          <tr key={key}>
                            <td style={{ textAlign: 'center' }}>
                              <div className="action-buttons-cell">
                                <button
                                  onClick={() => handleDelete(lineOfBusiness.id)}
                                  className="delete-btn"
                                  title="Delete Line of Business"
                                >
                                  <i className="bi bi-trash"></i>
                                </button>
                                <Link
                                  className="edit-btn"
                                  to={`/lineOfBusinessEdit/${lineOfBusiness.id}`}
                                  title="Edit Line of Business"
                                >
                                  <i className="bi bi-pencil"></i>
                                </Link>
                                <Link
                                  className="view-btn"
                                  to={`/lineOfBusinessShow/${lineOfBusiness.id}`}
                                  title="View Line of Business"
                                >
                                  <i className="bi bi-eye"></i>
                                </Link>
                              </div>
                            </td>
                            <td>
                              <Link
                                className="client-link"
                                to={`/lineOfBusinessShow/${lineOfBusiness.id}`}
                              >
                                {lineOfBusiness.name}
                              </Link>
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
  
export default LineOfBusinessList; 