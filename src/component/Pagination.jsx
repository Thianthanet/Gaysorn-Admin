// Pagination.jsx
export const Pagination = ({ currentPage, totalPages, onPageChange }) => (
  <div className="flex justify-center space-x-2 mt-4">
    <button disabled={currentPage === 1} onClick={() => onPageChange(currentPage - 1)}>ก่อนหน้า</button>
    <span>{currentPage} / {totalPages}</span>
    <button disabled={currentPage === totalPages} onClick={() => onPageChange(currentPage + 1)}>ถัดไป</button>
  </div>
);

