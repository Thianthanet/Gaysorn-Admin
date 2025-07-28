import React from "react";
import { CircleCheck, CircleX } from "lucide-react";

const StatusPopup = ({ show, status, activeTab = "customers" }) => {
  if (!show) return null;

  const getTitle = () => {
    const tabLabel = activeTab === "customers"
      ? "ลูกค้า"
      : activeTab === "technicians"
      ? "เจ้าหน้าที่"
      : "แอดมิน";

    if (status === "success") return `เพิ่มข้อมูล${tabLabel}สำเร็จ`;
    if (status === "update") return `แก้ไขข้อมูล${tabLabel}สำเร็จ`;
    if (status === "delete") return `ลบข้อมูล${tabLabel}สำเร็จ`;
    if (status === "error") return `เพิ่มข้อมูล${tabLabel}ไม่สำเร็จ`;
    return `กำลังโหลด...`;
  };

  const renderContent = () => {
    const baseClasses = "flex flex-col items-center justify-center text-[#837958] text-center";

    switch (status) {
      case "loading":
        return (
          <div className={baseClasses}>
            <div className="animate-spin rounded-full border-4 border-t-[#837958] border-gray-200 h-12 w-12 mb-4"></div>
            <h2 className="text-lg font-semibold">{getTitle()}</h2>
          </div>
        );
      case "success":
      case "update":
      case "delete":
        return (
          <div className={baseClasses}>
            <CircleCheck size={50} strokeWidth={1} className="mb-2" />
            <h2 className="text-lg font-semibold">{getTitle()}</h2>
          </div>
        );
      case "error":
      default:
        return (
          <div className={baseClasses}>
            <CircleX size={50} strokeWidth={1} className="mb-2" />
            <h2 className="text-lg font-semibold">{getTitle()}</h2>
          </div>
        );
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/70">
      <div className="bg-white rounded-2xl shadow-lg p-6 w-[360px] text-center">
        {renderContent()}
      </div>
    </div>
  );
};

export default StatusPopup;
