import React,{ useState, useEffect} from 'react';
import { Link, useNavigate } from "react-router-dom";
import axios from 'axios';
import Layout from "../../components/Layout";
import * as AppFunc from "../../lib/AppFunctions";
import APP_CONSTANTS from "../../appConstants";
import * as Utils from "../../lib/Utils";
import Pagination from "../../components/Pagination";
import "../ListPages.css";
import Loader from "../../components/Loader";

function CategoryList() {
    const [isLoading, setIsLoading] = useState(false);
    const  [categoryList, setCategoryList] = useState([])
    const hasReadOnlyAccess = AppFunc.activeUserRole === APP_CONSTANTS.USER_ROLES.PRODUCER;
    
    // Pagination state
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);
    
    const navigate = useNavigate(); 

    const handleAddButtonClick = () => {
      navigate("/categoryCreate");
    }

    useEffect(() => {
        fetchCategoryList()
    }, [])
    
    const fetchCategoryList = () => {
        setIsLoading(true);
        axios.get('/categories')
        .then(function (response) {
          setCategoryList(response.data.categories);
        })
        .catch(function (error) {
          console.log(error);
        })
        .finally(() => {
            setIsLoading(false);
        })
    }

    const handleExcelExport = () => {
      Utils.exportHTMLTableToExcel('categoryListTable', 'Category List', ["Action"])
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
    const totalItems = categoryList.length;
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const currentItems = categoryList.slice(startIndex, endIndex);
    
    return (
      <Layout>
        <div className="list-page-container">
          <div className="list-page-card">
            {/* Header Section */}
            <div className="list-page-header">
              <h1 className="list-page-title">Category List</h1>
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
                    ADD CATEGORY
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
                  <table className="table list-table" id='categoryListTable'>
                    <thead>
                      <tr>
                        <th hidden={hasReadOnlyAccess}>Action</th>
                        <th>Category Name</th>
                        <th>Technologies</th>
                      </tr>
                    </thead>
                    <tbody>
                      {currentItems.length === 0 ? (
                        <tr>
                          <td colSpan="3" className="empty-state">
                            <i className="bi bi-tags"></i>
                            <p>No categories found</p>
                          </td>
                        </tr>
                      ) : (
                        currentItems.map((categoryDetails, key) => {
                          return (
                            <tr key={key}>
                              <td hidden={hasReadOnlyAccess}>
                                <div className="action-buttons-cell">
                                  <Link
                                    className="edit-btn"
                                    to={`/categoryEdit/${categoryDetails.category_id}`}
                                    title="Edit Category"
                                  >
                                    <i className="bi bi-pencil"></i>
                                  </Link>
                                </div>
                              </td>
                              <td>
                                <Link
                                  className="page-link"
                                  to={`/categoryEdit/${categoryDetails.category_id}`}
                                >
                                  {categoryDetails.category_name}
                                </Link>
                              </td>
                              <td>
                                <div style={{ maxWidth: '300px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                  {categoryDetails.technologies}
                                </div>
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
  
export default CategoryList;