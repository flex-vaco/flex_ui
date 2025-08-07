import React from 'react';

const Pagination = ({ 
  currentPage, 
  totalPages, 
  totalItems, 
  itemsPerPage, 
  onPageChange, 
  onItemsPerPageChange 
}) => {
  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  const getPageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 5;
    
    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (currentPage <= 3) {
        for (let i = 1; i <= 4; i++) {
          pages.push(i);
        }
        pages.push('...');
        pages.push(totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(1);
        pages.push('...');
        for (let i = totalPages - 3; i <= totalPages; i++) {
          pages.push(i);
        }
      } else {
        pages.push(1);
        pages.push('...');
        for (let i = currentPage - 1; i <= currentPage + 1; i++) {
          pages.push(i);
        }
        pages.push('...');
        pages.push(totalPages);
      }
    }
    
    return pages;
  };

  const handlePageClick = (page) => {
    if (page !== '...' && page !== currentPage) {
      onPageChange(page);
    }
  };

  return (
    <div className="pagination-container">
      <div className="pagination-info">
        <span>
          Showing {startItem} to {endItem} of {totalItems} entries
        </span>
        <span>|</span>
        <span>
          Show{' '}
          <select
            className="pagination-select"
            value={itemsPerPage}
            onChange={(e) => onItemsPerPageChange(parseInt(e.target.value))}
          >
            <option value={10}>10</option>
            <option value={25}>25</option>
            <option value={50}>50</option>
            <option value={100}>100</option>
          </select>
          {' '}entries per page
        </span>
      </div>

      <div className="pagination-controls">
        <div className="pagination-buttons">
          {/* First Page */}
          <button
            className="pagination-btn first"
            onClick={() => handlePageClick(1)}
            disabled={currentPage === 1}
            title="First Page"
          >
            <i className="bi bi-chevron-double-left"></i>
          </button>

          {/* Previous Page */}
          <button
            className="pagination-btn prev"
            onClick={() => handlePageClick(currentPage - 1)}
            disabled={currentPage === 1}
            title="Previous Page"
          >
            <i className="bi bi-chevron-left"></i>
          </button>

          {/* Page Numbers */}
          {getPageNumbers().map((page, index) => (
            <button
              key={index}
              className={`pagination-btn ${page === currentPage ? 'active' : ''} ${page === '...' ? 'disabled' : ''}`}
              onClick={() => handlePageClick(page)}
              disabled={page === '...'}
              title={page === '...' ? '' : `Page ${page}`}
            >
              {page}
            </button>
          ))}

          {/* Next Page */}
          <button
            className="pagination-btn next"
            onClick={() => handlePageClick(currentPage + 1)}
            disabled={currentPage === totalPages}
            title="Next Page"
          >
            <i className="bi bi-chevron-right"></i>
          </button>

          {/* Last Page */}
          <button
            className="pagination-btn last"
            onClick={() => handlePageClick(totalPages)}
            disabled={currentPage === totalPages}
            title="Last Page"
          >
            <i className="bi bi-chevron-double-right"></i>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Pagination; 