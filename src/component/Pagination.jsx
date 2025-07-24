export const Pagination = ({
  currentPage,
  totalPages,
  onPageChange,
  itemsPerPage,
  onItemsPerPageChange,
  totalItems,
  advancedPagination = false, // default = false
}) => {
  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(startItem + itemsPerPage - 1, totalItems);

  const handlePageInputChange = (e) => {
    const value = Number(e.target.value);
    if (value >= 1 && value <= totalPages) {
      onPageChange(value);
    }
  };

  return (
    <div className="flex flex-col sm:flex-row justify-between items-center mt-4 text-[#837958] text-sm gap-2">
      {/* รายการต่อหน้า */}
      <div className="flex items-center gap-2">
        <span>จำนวนรายการต่อหน้า</span>
        <select
          value={itemsPerPage}
          onChange={(e) => {
            onItemsPerPageChange(Number(e.target.value));
            onPageChange(1); // reset หน้า
          }}
          className="border border-[#BC9D72] rounded px-2 py-1 focus:outline-none"
        >
          {[10, 25, 50, 100].map((num) => (
            <option key={num} value={num}>{num}</option>
          ))}
        </select>
        <span>
          {startItem}-{endItem} จาก {totalItems} รายการ
        </span>
      </div>

      {/* ปุ่มเปลี่ยนหน้าแบบ advanced */}
      {advancedPagination ? (
        <div className="flex items-center gap-2 mt-2 sm:mt-0">
          <button
            onClick={() => onPageChange(1)}
            disabled={currentPage === 1}
            className="px-1 disabled:text-gray-300"
          >
            ⏮
          </button>
          <button
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="px-1 disabled:text-gray-300"
          >
            ◀
          </button>
          <input
            type="number"
            value={currentPage}
            onChange={handlePageInputChange}
            className="w-12 border border-[#BC9D72] rounded text-center text-[#837958]"
          />
          <span>จาก {totalPages}</span>
          <button
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="px-1 disabled:text-gray-300"
          >
            ▶
          </button>
          <button
            onClick={() => onPageChange(totalPages)}
            disabled={currentPage === totalPages}
            className="px-1 disabled:text-gray-300"
          >
            ⏭
          </button>
        </div>
      ) : (
        // ถ้าไม่ใช้ advancedPagination
        <div className="flex items-center gap-2 mt-2 sm:mt-0">
          <button
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="px-2 py-1 disabled:text-gray-400"
          >
            ก่อนหน้า
          </button>
          <span>{currentPage} / {totalPages}</span>
          <button
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="px-2 py-1 disabled:text-gray-400"
          >
            ถัดไป
          </button>
        </div>
      )}
    </div>
  );
};
