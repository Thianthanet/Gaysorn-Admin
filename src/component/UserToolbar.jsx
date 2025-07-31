import React from "react";
import { BiSearchAlt2 } from "react-icons/bi";
import { HiChevronDown } from "react-icons/hi"; // ยังคง import ไว้เผื่อใช้งาน
import BuildingFilter from "./BuildingFilter"; // ตรวจสอบ Path ให้ถูกต้อง

const UserToolbar = ({
  searchInput,
  setSearchInput,
  handleSearch,
  activeTab,
  setActiveTab, // นี่คือ handleActiveTabChange จาก User.jsx
  setPopupCreateUser,
  buildings, // <--- ต้องรับ prop นี้กลับเข้ามา
  filterBuilding, // <--- ต้องรับ prop นี้กลับเข้ามา
  setFilterBuilding, // นี่คือ handleFilterBuildingChange จาก User.jsx
  exportToExcel,
  waitForApprove,
  resetFormData,
}) => {
  const handleAddCustomer = (e) => {
    resetFormData(); // <--- เรียกใช้ฟังก์ชันนี้ก่อนเปิด Pop-up
    setPopupCreateUser(true);
  };

  const handleWaitForApprove = (e) => {
    resetFormData(); // <--- เรียกใช้ฟังก์ชันนี้ก่อนเปิด Pop-up
    setActiveTab('customers'); // <--- คอมเมนต์หรือลบออก ถ้าไม่ต้องการให้เปลี่ยนแท็บอัตโนมัติเมื่อกดเพิ่มผู้ใช้งาน
    setPopupCreateUser(true);
  };

  // console.log("activeTab: ", activeTab)

  return (
    <div className="flex items-center gap-2 flex-wrap mb-6">
      {/* ช่องค้นหา */}
      <div className="flex items-center flex-1 min-w-auto border-b-[1px] border-[#837958]"> {/* เปลี่ยน min-w-auto เป็นค่าที่ชัดเจน */}
        <BiSearchAlt2 size={20} className="text-[#837958] ml-2" />
        <input
          type="text"
          placeholder="ค้นหา"
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
          className="w-full pl-2 pr-3 py-1 outline-none"
        />
      </div>

      {/* ปุ่มค้นหา */}
      <button
        onClick={handleSearch}
        className="px-3 h-[28px] bg-[#837958] text-white text-[14px] rounded-full flex items-center shadow-[0_2px_4px_rgba(0,0,0,0.1)] hover:bg-[#6f684c]"
      >
        <BiSearchAlt2 size={18} className="text-white mr-1" />
        ค้นหา
      </button>

      {/* Building Filter Component */}
      <div className="mb-3">
        <BuildingFilter
          isMobile={false}
          buildings={buildings} // <--- ส่ง buildings เข้าไป
          // filterBuilding={filterBuilding}
          setFilterBuilding={setFilterBuilding} // ซึ่งคือ handleFilterBuildingChange จาก User.jsx
          selectedBuilding={filterBuilding} // <--- ส่ง filterBuilding เข้าไป เพื่อให้ BuildingFilter แสดงค่าที่เลือกปัจจุบัน
        />
      </div>

      {/* ปุ่มส่งข้อมูลออก */}
      <button
        className="px-4 h-[32px] bg-[#F4F2ED] text-black text-[14px] rounded-full shadow-[0_2px_4px_rgba(0,0,0,0.1)] hover:bg-[#837958]/80 hover:text-white"
        onClick={exportToExcel}
      >
        ส่งข้อมูลออก
      </button>

      {/* ปุ่ม tab */}
      <div className="flex gap-2 flex-wrap">
        {[
          { label: "ลูกค้า", value: "customers" },
          { label: "เจ้าหน้าที่", value: "technicians" },
          { label: "แอดมิน", value: "admin" },
        ].map((tab) => (
          <button
            key={tab.value}
            className={`px-4 h-[32px] text-[14px] rounded-full shadow-[0_2px_4px_rgba(0,0,0,0.1)] hover:bg-[#837958]/80 hover:text-white ${activeTab === tab.value
                ? "bg-[#BC9D72] text-white"
                : "bg-[#F4F2ED] text-black"
              }`}
            onClick={() => setActiveTab(tab.value)} // นี่คือ handleActiveTabChange
          >
            {tab.label}
          </button>
        ))}

        {/* ปุ่มพิเศษ: รออนุมัติ */}
        <button
          className={`px-4 h-[32px] text-[14px] rounded-full shadow-[0_2px_4px_rgba(0,0,0,0.1)] hover:bg-[#837958]/80 hover:text-white
            ${activeTab === "waitApprove"
              ? "bg-[#BC9D72] text-white"
              : "bg-white text-[#837958] border-[1px] border-[#837958]"
            }`}
          onClick={() => setActiveTab("waitApprove")}
        >
          รออนุมัติ
          <span className={`ml-[1px] text-[14px] font-medium"}`}>
            ({waitForApprove?.length ?? 0})
          </span>
        </button>
      </div>

      {/* ปุ่มเพิ่มผู้ใช้งาน */}
      <button
        className="px-4 h-[36px] bg-[#837958] text-white text-[14px] rounded-full shadow-[0_2px_4px_rgba(0,0,0,0.1)] hover:bg-[#a88f5c]"
        onClick={activeTab === 'waitApprove' ? handleWaitForApprove : handleAddCustomer}
      >
        เพิ่มผู้ใช้งาน
      </button>
    </div>
  );
};

export default UserToolbar;