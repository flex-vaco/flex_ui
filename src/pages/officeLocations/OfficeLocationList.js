import React,{ useState, useEffect} from 'react'
import { Link, useNavigate } from "react-router-dom"
import axios from 'axios'
import Layout from "../../components/Layout"
import * as Utils from "../../lib/Utils"
import Pagination from "../../components/Pagination";
import "../ListPages.css";
import Loader from "../../components/Loader";

function OfficeLocationList() {
    const [isLoading, setIsLoading] = useState(false);
    const [locationList, setLocationList] = useState([])
    const navigate = useNavigate();

    // Pagination state
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);

    const handleAddButtonClick = () => {
      navigate("/officeLocationCreate");
    }

    useEffect(() => {
      fetchLocationList()
    }, [])
  
    const fetchLocationList = () => {
        setIsLoading(true);
        axios.get('/officeLocation')
        .then(function (response) {
          setLocationList(response.data.locations);
        })
        .catch(function (error) {
          console.log(error);
        })
        .finally(() => {
            setIsLoading(false);
        })
    }

    const handleExcelExport = () => {
      Utils.exportHTMLTableToExcel('officeLocationListTable', 'Office Location List', ["Action"])
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
    const totalItems = locationList.length;
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const currentItems = locationList.slice(startIndex, endIndex);

    return (
      <Layout>
        <div className="list-page-container">
          <div className="list-page-card">
            {/* Header Section */}
            <div className="list-page-header">
              <h1 className="list-page-title">Office Location List</h1>
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
                    ADD LOCATION
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
                <table className="table list-table" id='officeLocationListTable'>
                  <thead>
                    <tr>
                      <th>Action</th>
                      <th>City Name</th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentItems.length === 0 ? (
                      <tr>
                        <td colSpan="2" className="empty-state">
                          <i className="bi bi-geo-alt"></i>
                          <p>No office locations found</p>
                        </td>
                      </tr>
                    ) : (
                      currentItems.map((locationDetails, key) => {
                        return (
                          <tr key={key}>
                            <td>
                              <div className="action-buttons-cell">
                                <Link
                                  className="edit-btn"
                                  to={`/officeLocationEdit/${locationDetails.office_location_id}`}
                                  title="Edit Location"
                                >
                                  <i className="bi bi-pencil"></i>
                                </Link>
                              </div>
                            </td>
                            <td>
                              <Link
                                className="page-link"
                                to={`/officeLocationEdit/${locationDetails.office_location_id}`}
                              >
                                {locationDetails.office_location_city}
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
  
export default OfficeLocationList;