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

function CapabilityAreaList() {
    const [isLoading, setIsLoading] = useState(false);
    const [capabilityAreaList, setCapabilityAreaList] = useState([]);
    const hasReadOnlyAccess = !(AppFunc.activeUserRole === APP_CONSTANTS.USER_ROLES.ADMINISTRATOR || AppFunc.activeUserRole === APP_CONSTANTS.USER_ROLES.LOB_ADMIN);

    const navigate = useNavigate();

    const handleAddButtonClick = () => {
      navigate("/capabilityAreaCreate");
    }

    useEffect(() => {
        fetchCapabilityAreaList()
    }, [])
  
    const fetchCapabilityAreaList = () => {
        setIsLoading(true);
        axios.get('/capabilityArea')
        .then(function (response) {
          setCapabilityAreaList(response.data.capabilityAreas);
          setFilteredList(response.data.capabilityAreas);
          setSearchKeys(Object.keys(response?.data?.capabilityAreas[0] || {}))
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
                axios.get(`/capabilityArea/delete/${id}`)
                .then(function (response) {
                    Swal.fire({
                        icon: 'success',
                        title: 'Capability Area deleted successfully!',
                        showConfirmButton: false,
                        timer: 1500
                    })
                    fetchCapabilityAreaList()
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

  const [filteredList, setFilteredList] = useState(capabilityAreaList);
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
    const fList = capabilityAreaList.filter((item) => {
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
    Utils.exportHTMLTableToExcel('capabilityAreaListTable', 'Capability Area List', ["Action"])
  };

  const searchKeysToIgnore = ["id", "service_line_id", "created_at"];

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
              <h1 className="list-page-title">Capability Area List</h1>
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
                    ADD CAPABILITY AREA
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
                <table className="table list-table" id='capabilityAreaListTable'>
                  <thead>
                    <tr>
                      <th hidden={hasReadOnlyAccess}>Action</th>
                      <th>Name</th>
                      <th>Description</th>
                      <th>Service Line</th>
                      <th>Line of Business</th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentItems.length === 0 ? (
                      <tr>
                        <td colSpan={hasReadOnlyAccess ? "5" : "6"} className="empty-state">
                          <i className="bi bi-gear"></i>
                          <p>No capability areas found</p>
                        </td>
                      </tr>
                    ) : (
                      currentItems.map((capabilityArea, key) => {
                        return (
                          <tr key={key}>
                            <td hidden={hasReadOnlyAccess}>
                              <div className="action-buttons-cell">
                                <button
                                  onClick={() => handleDelete(capabilityArea.id)}
                                  className="delete-btn"
                                  title="Delete Capability Area"
                                >
                                  <i className="bi bi-trash"></i>
                                </button>
                                <Link
                                  className="edit-btn"
                                  to={`/capabilityAreaEdit/${capabilityArea.id}`}
                                  title="Edit Capability Area"
                                >
                                  <i className="bi bi-pencil"></i>
                                </Link>
                              </div>
                            </td>
                            <td>
                              <Link
                                className="project-link"
                                to={`/capabilityAreaShow/${capabilityArea.id}`}
                              >
                                {capabilityArea.name}
                              </Link>
                            </td>
                            <td>{capabilityArea.description || '-'}</td>
                            <td>{capabilityArea.service_line_name || '-'}</td>
                            <td>{capabilityArea.line_of_business_name || '-'}</td>
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
  
export default CapabilityAreaList; 