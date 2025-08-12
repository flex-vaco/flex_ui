import React,{ useState, useEffect} from 'react'
import { Link, useNavigate } from "react-router-dom"
import Swal from 'sweetalert2'
import axios from 'axios'
import Layout from "../../components/Layout"
import * as Utils from "../../lib/Utils"
import Pagination from "../../components/Pagination";
import "../ListPages.css";
import Loader from "../../components/Loader";
function ClientList() {
    const [isLoading, setIsLoading] = useState(false);
    const [clientList, setClientList] = useState([])
    const navigate = useNavigate();

    // Pagination state
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);

    const handleAddButtonClick = () => {
      navigate("/clientCreate");
    }

    useEffect(() => {
        fetchClientList()
    }, [])
  
    const fetchClientList = () => {
        setIsLoading(true);
        axios.get('/clients')
        .then(function (response) {
          setClientList(response.data.clients);
        })
        .catch(function (error) {
          console.log(error);
        })
        .finally(() => {
            setIsLoading(false);
        })
    }

    const handleDelete = (client_id) => {
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
                axios.get(`/clients/delete/${client_id}`)
                .then(function (response) {
                    Swal.fire({
                        icon: 'success',
                        title: 'Client deleted successfully!',
                        showConfirmButton: false,
                        timer: 1500
                    })
                    fetchClientList()
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
      Utils.exportHTMLTableToExcel('clientListTable', 'Client List', ["Action"])
    };

    const getStatusBadgeClass = (status) => {
      const statusLower = status?.toLowerCase();
      if (statusLower === 'active') return 'status-active';
      if (statusLower === 'inactive') return 'status-inactive';
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
    const totalItems = clientList.length;
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const currentItems = clientList.slice(startIndex, endIndex);

    return (
      <Layout>
        <div className="list-page-container">
          <div className="list-page-card">
            {/* Header Section */}
            <div className="list-page-header">
              <h1 className="list-page-title">Client List</h1>
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
                    ADD CLIENT
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
                <table className="table list-table" id='clientListTable'>
                  <thead>
                    <tr>
                      <th>Action</th>
                      <th>Client Name</th>
                      <th>Client Location</th>
                      <th>Contact Person</th>
                      <th>Contact Email</th>
                      <th>Contact Phone</th>
                      <th>Client Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentItems.length === 0 ? (
                      <tr>
                        <td colSpan="7" className="empty-state">
                          <i className="bi bi-building"></i>
                          <p>No clients found</p>
                        </td>
                      </tr>
                    ) : (
                      currentItems.map((clientDetails, key) => {
                        return (
                          <tr key={key}>
                            <td>
                              <div className="action-buttons-cell">
                                <button
                                  onClick={() => handleDelete(clientDetails.client_id)}
                                  className="delete-btn"
                                  title="Delete Client"
                                >
                                  <i className="bi bi-trash"></i>
                                </button>
                                <Link
                                  className="edit-btn"
                                  to={`/clientEdit/${clientDetails.client_id}`}
                                  title="Edit Client"
                                >
                                  <i className="bi bi-pencil"></i>
                                </Link>
                                <Link
                                  className="view-btn"
                                  to={`/clientShow/${clientDetails.client_id}`}
                                  title="View Client"
                                >
                                  <i className="bi bi-eye"></i>
                                </Link>
                              </div>
                            </td>
                            <td>
                              <Link
                                className="client-link"
                                to={`/clientShow/${clientDetails.client_id}`}
                              >
                                {clientDetails.name}
                              </Link>
                            </td>
                            <td>{clientDetails.location}</td>
                            <td>{clientDetails.client_contact_person}</td>
                            <td>{clientDetails.client_contact_email}</td>
                            <td>{clientDetails.client_contact_phone}</td>
                            <td>
                              <span className={`status-badge ${getStatusBadgeClass(clientDetails.status)}`}>
                                {clientDetails.status}
                              </span>
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
  
export default ClientList;