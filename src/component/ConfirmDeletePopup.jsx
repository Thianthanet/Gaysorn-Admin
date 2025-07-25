import React from "react";

const ConfirmDeletePopup = ({
  show,
  onCancel,
  onConfirm,
  activeTab = "customers"
}) => {
  const getTitle = () => {
    if (activeTab === "customers") return "ลูกค้า";
    if (activeTab === "technicians") return "เจ้าหน้าที่";
    return "แอดมิน";
  };

  if (!show) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/70">
      <div className="bg-white rounded-2xl shadow-lg p-6 w-[360px] h-[120px] text-center">
        <p className="text-lg font-semibold text-[#837958]">
          ยืนยันการลบ{getTitle()}
        </p>
        <div className="flex flex-rows items-center justify-center text-[#837958] text-center mt-6 gap-x-4">
          <button
            onClick={onCancel}
            className="bg-white text-[12px] text-[#BC9D72] border-[1px] w-64 h-6 border-[#BC9D72] rounded hover:opacity-80"
          >
            ยกเลิก
          </button>
          <button
            onClick={onConfirm}
            className="bg-[#BC9D72] text-[12px] w-64 h-6 text-white rounded hover:opacity-90"
          >
            ยืนยัน
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmDeletePopup;
