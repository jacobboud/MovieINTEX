import React from 'react';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  onPageChange,
}) => {
  const getPageNumbers = () => {
    const pages: (number | string)[] = [];

    if (totalPages <= 5) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      if (currentPage > 2) pages.push(1, '...');
      if (currentPage > 1) pages.push(currentPage - 1);
      pages.push(currentPage);
      if (currentPage < totalPages) pages.push(currentPage + 1);
      if (currentPage < totalPages - 1) pages.push('...', totalPages);
    }

    return pages;
  };

  return (
    <nav className="d-flex justify-content-center mt-4 pagination-container">
      <ul className="pagination">
        <li className={`page-item ${currentPage === 1 && 'disabled'}`}>
          <button
            className="page-link"
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 1}
          >
            Previous
          </button>
        </li>

        {getPageNumbers().map((page, index) => (
          <li
            key={index}
            className={`page-item ${
              page === currentPage
                ? 'active'
                : typeof page === 'number'
                  ? ''
                  : 'disabled'
            }`}
          >
            {typeof page === 'number' ? (
              <button className="page-link" onClick={() => onPageChange(page)}>
                {page}
              </button>
            ) : (
              <span className="page-link">{page}</span>
            )}
          </li>
        ))}

        <li className={`page-item ${currentPage === totalPages && 'disabled'}`}>
          <button
            className="page-link"
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
          >
            Next
          </button>
        </li>
      </ul>
    </nav>
  );
};

export default Pagination;
