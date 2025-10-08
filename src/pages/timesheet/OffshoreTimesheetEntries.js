import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Layout from '../../components/Layout';
import Loader from '../../components/Loader';
import * as Utils from '../../lib/Utils';
import './OffshoreTimesheetEntries.css';

function OffshoreTimesheetEntries() {
  const [isLoading, setIsLoading] = useState(false);
  const [timesheetEntries, setTimesheetEntries] = useState([]);
  const [filteredEntries, setFilteredEntries] = useState([]);
  const [hasSearched, setHasSearched] = useState(false);
  
  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  
  // Filter states
  const [employeeFilter, setEmployeeFilter] = useState('');
  const [projectFilter, setProjectFilter] = useState('');
  const [dateFilter, setDateFilter] = useState('lastMonth');
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');
  
  // Get date ranges
  const getDateRange = () => {
    const now = new Date();
    const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);
    
    switch (dateFilter) {
      case 'lastMonth':
        return {
          startDate: Utils.formatDateYYYYMMDD(lastMonth),
          endDate: Utils.formatDateYYYYMMDD(lastMonthEnd)
        };
      case 'thisMonth':
        const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const thisMonthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0);
        return {
          startDate: Utils.formatDateYYYYMMDD(thisMonth),
          endDate: Utils.formatDateYYYYMMDD(thisMonthEnd)
        };
      case 'custom':
        return {
          startDate: customStartDate,
          endDate: customEndDate
        };
      default:
        return {
          startDate: Utils.formatDateYYYYMMDD(lastMonth),
          endDate: Utils.formatDateYYYYMMDD(lastMonthEnd)
        };
    }
  };

  const fetchTimesheetEntries = async () => {
    setIsLoading(true);
    setHasSearched(true);
    setCurrentPage(1); // Reset to first page when searching
    
    try {
      const { startDate, endDate } = getDateRange();
      
      const response = await axios.post('/timesheets/imported_entries', {
        employee: employeeFilter,
        project: projectFilter,
        startDate: startDate,
        endDate: endDate
      });
      
      setTimesheetEntries(response.data.timesheetEntries || []);
      setFilteredEntries(response.data.timesheetEntries || []);
    } catch (error) {
      console.error('Error fetching timesheet entries:', error);
      setTimesheetEntries([]);
      setFilteredEntries([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFilter = () => {
    fetchTimesheetEntries();
  };

  const handleClearFilters = () => {
    setEmployeeFilter('');
    setProjectFilter('');
    setDateFilter('lastMonth');
    setCustomStartDate('');
    setCustomEndDate('');
    setTimesheetEntries([]);
    setFilteredEntries([]);
    setHasSearched(false);
    setCurrentPage(1);
  };

  // Pagination logic
  const totalItems = filteredEntries.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentItems = filteredEntries.slice(startIndex, endIndex);

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handleItemsPerPageChange = (newItemsPerPage) => {
    setItemsPerPage(newItemsPerPage);
    setCurrentPage(1);
  };

  const handleExcelExport = () => {
    if (filteredEntries.length === 0) {
      alert('No data to export');
      return;
    }
    
    Utils.exportHTMLTableToExcel('offshoreTimesheetTable', 'Offshore Timesheet Entries', []);
  };

  // No automatic data loading - data is fetched only when Filter button is clicked

  return (
    <Layout>
      <div className="offshore-timesheet-container">
        <div className="offshore-timesheet-card">
          {/* Header Section */}
          <div className="offshore-timesheet-header">
            <h1 className="offshore-timesheet-title">Imported Timesheet Entries</h1>
          </div>

          {/* Filter Controls */}
          <div className="filter-controls">
            <div className="filter-row">
              <div className="filter-group">
                <label htmlFor="employeeFilter">Employee Name:</label>
                <input
                  type="text"
                  id="employeeFilter"
                  value={employeeFilter}
                  onChange={(e) => setEmployeeFilter(e.target.value)}
                  placeholder="Enter employee name"
                  className="filter-input"
                />
              </div>

              <div className="filter-group">
                <label htmlFor="projectFilter">Project:</label>
                <input
                  type="text"
                  id="projectFilter"
                  value={projectFilter}
                  onChange={(e) => setProjectFilter(e.target.value)}
                  placeholder="Enter project name"
                  className="filter-input"
                />
              </div>

              <div className="filter-group">
                <label htmlFor="dateFilter">Date Range:</label>
                <select
                  id="dateFilter"
                  value={dateFilter}
                  onChange={(e) => setDateFilter(e.target.value)}
                  className="filter-select"
                >
                  <option value="lastMonth">Last Month</option>
                  <option value="thisMonth">This Month</option>
                  <option value="custom">Custom Range</option>
                </select>
              </div>

              {dateFilter === 'custom' && (
                <>
                  <div className="filter-group">
                    <label htmlFor="customStartDate">Start Date:</label>
                    <input
                      type="date"
                      id="customStartDate"
                      value={customStartDate}
                      onChange={(e) => setCustomStartDate(e.target.value)}
                      className="filter-input"
                    />
                  </div>
                  <div className="filter-group">
                    <label htmlFor="customEndDate">End Date:</label>
                    <input
                      type="date"
                      id="customEndDate"
                      value={customEndDate}
                      onChange={(e) => setCustomEndDate(e.target.value)}
                      className="filter-input"
                    />
                  </div>
                </>
              )}

              <div className="filter-buttons">
                <button
                  type="button"
                  onClick={handleFilter}
                  className="filter-btn primary"
                >
                  <i className="bi bi-search"></i>
                  Filter
                </button>
                <button
                  type="button"
                  onClick={handleClearFilters}
                  className="filter-btn secondary"
                >
                  <i className="bi bi-arrow-counterclockwise"></i>
                  Clear Filters
                </button>
                <button
                  type="button"
                  onClick={handleExcelExport}
                  className="filter-btn excel"
                >
                  <i className="bi bi-filetype-xls"></i>
                  Export Excel
                </button>
              </div>
            </div>
          </div>

          {/* Results Section */}
          <div className="results-section">
            {isLoading ? (
              <Loader 
                size="large" 
                variant="spinner" 
                containerHeight="200px"
              />
            ) : !hasSearched ? (
              <div className="empty-state">
                <i className="bi bi-search"></i>
                <p>Please select filters and click "Filter" to view timesheet entries</p>
              </div>
            ) : (
              <>
                <div className="results-info">
                  <p>Showing {currentItems.length} of {totalItems} timesheet entries</p>
                </div>
                
                {filteredEntries.length > 0 ? (
                  <>
                    <div className="table-container">
                      <table className="offshore-timesheet-table" id="offshoreTimesheetTable">
                        <thead>
                          <tr>
                            <th>Date</th>
                            <th>Employee</th>
                            <th>Project</th>
                            <th>Duration (Hours)</th>
                            <th>Tasks/Events</th>
                            <th>Notes</th>
                            <th>Approval Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          {currentItems.map((entry, index) => (
                            <tr key={index}>
                              <td>{Utils.formatDateYYYYMMDD(entry.Date)}</td>
                              <td>{entry.Employee}</td>
                              <td>{entry.Project}</td>
                              <td className="duration-cell">{entry.Duration || 0}</td>
                              <td className="tasks-cell">{entry.Tasks_Events || '-'}</td>
                              <td className="note-cell">{entry.Notes || '-'}</td>
                              <td>
                                <span className={`status-badge ${entry.Approval_Status?.toLowerCase() || 'pending'}`}>
                                  {entry.Approval_Status || 'Pending'}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    {/* Pagination */}
                    {totalPages > 1 && (
                      <div className="pagination-container">
                        <div className="pagination-info">
                          <span>Items per page:</span>
                          <select
                            value={itemsPerPage}
                            onChange={(e) => handleItemsPerPageChange(Number(e.target.value))}
                            className="pagination-select"
                          >
                            <option value={10}>10</option>
                            <option value={25}>25</option>
                            <option value={50}>50</option>
                            <option value={100}>100</option>
                          </select>
                          <span>
                            Showing {startIndex + 1} to {Math.min(endIndex, totalItems)} of {totalItems} entries
                          </span>
                        </div>
                        
                        <div className="pagination-controls">
                          <button
                            onClick={() => handlePageChange(1)}
                            disabled={currentPage === 1}
                            className="pagination-btn first"
                          >
                            First
                          </button>
                          <button
                            onClick={() => handlePageChange(currentPage - 1)}
                            disabled={currentPage === 1}
                            className="pagination-btn prev"
                          >
                            Previous
                          </button>
                          
                          {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                            const pageNum = Math.max(1, Math.min(totalPages - 4, currentPage - 2)) + i;
                            if (pageNum > totalPages) return null;
                            
                            return (
                              <button
                                key={pageNum}
                                onClick={() => handlePageChange(pageNum)}
                                className={`pagination-btn ${currentPage === pageNum ? 'active' : ''}`}
                              >
                                {pageNum}
                              </button>
                            );
                          })}
                          
                          <button
                            onClick={() => handlePageChange(currentPage + 1)}
                            disabled={currentPage === totalPages}
                            className="pagination-btn next"
                          >
                            Next
                          </button>
                          <button
                            onClick={() => handlePageChange(totalPages)}
                            disabled={currentPage === totalPages}
                            className="pagination-btn last"
                          >
                            Last
                          </button>
                        </div>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="empty-state">
                    <i className="bi bi-calendar-x"></i>
                    <p>No timesheet entries found for the selected filters</p>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}

export default OffshoreTimesheetEntries;
