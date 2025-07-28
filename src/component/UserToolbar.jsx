import React from "react";
import { BiSearchAlt2 } from "react-icons/bi";
import { HiChevronDown } from "react-icons/hi";

const UserToolbar = ({
  searchInput,
  setSearchInput,
  handleSearch,
  activeTab,
  setActiveTab,
  setPopupCreateUser,
  buildings,
  filterBuilding,
  setFilterBuilding,
  exportToExcel,
  resetFormData, // <--- รับ prop นี้เข้ามา
}) => {
  const handleAddUserClick = () => {
    resetFormData(); // <--- เรียกใช้ฟังก์ชันนี้ก่อนเปิด Pop-up
    setPopupCreateUser(true);
  };

  return (
    <div className="flex items-center gap-2 flex-wrap mb-6">
      {/* ช่องค้นหา */}
      <div className="flex items-center flex-1 min-w-[210px] border-b-[1px] border-[#837958]">
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
        className="px-3 h-[28px] bg-[#837958] text-white text-[14px] rounded-full flex items-center shadow-[0_2px_4px_rgba(0,0,0,0.1)]"
      >
        <BiSearchAlt2 size={18} className="text-white mr-1" />
        ค้นหา
      </button>

      {/* ปุ่มอาคาร */}
      <div className="relative inline-block">
        <select
          value={filterBuilding}
          onChange={(e) => setFilterBuilding(e.target.value)}
          className="
            px-3 pr-8 h-[28px] bg-[#837958] text-white text-[14px] rounded-full shadow-[0_2px_4px_rgba(0,0,0,0.1)] cursor-pointer
            appearance-none
            w-auto min-w-[80px] max-w-[300px]
            transition-all duration-300 ease-in-out
          "
          style={{ width: filterBuilding && filterBuilding !== "" ? "auto" : "90px" }}
        >
          {/* placeholder แสดง "อาคาร" */}
          <option value="" disabled hidden>
            อาคาร
          </option>

          {/* ตัวเลือก "ทั้งหมด" */}
          <option value="all" style={{ backgroundColor: "white", color: "black" }}>
            ทั้งหมด
          </option>

          {buildings.map((b) => (
            <option
              key={b.id}
              value={b.buildingName}
              style={{ backgroundColor: "white", color: "black" }}
            >
              {b.buildingName}
            </option>
          ))}
        </select>

        <HiChevronDown
          size={18}
          className="text-white pointer-events-none absolute top-1/2 right-2 -translate-y-1/2"
        />
      </div>

      {/* ปุ่มส่งข้อมูลออก */}
      <button
        className="px-4 h-[32px] bg-[#F4F2ED] text-black text-[14px] rounded-full shadow-[0_2px_4px_rgba(0,0,0,0.1)] hover:bg-gray-300"
        onClick={exportToExcel}
      >
        ส่งข้อมูลออก
      </button>

      {/* ปุ่ม tab */}
      {[
        { label: "ลูกค้า", value: "customers" },
        { label: "เจ้าหน้าที่", value: "technicians" },
        { label: "แอดมิน", value: "admin" },
        { label: "รออนุมัติ", value: "waitApprove" },
      ].map((tab) => (
        <button
          key={tab.value}
          className={`px-4 h-[32px] text-[14px] rounded-full shadow-[0_2px_4px_rgba(0,0,0,0.1)] hover:bg-gray-300 ${activeTab === tab.value
            ? "bg-[#BC9D72] text-white"
            : "bg-[#F4F2ED] text-black"
            }`}
          onClick={() => setActiveTab(tab.value)}
        >
          {tab.label}
        </button>
      ))}

      {/* ปุ่มเพิ่มผู้ใช้งาน */}
      <button
        className="px-4 h-[36px] bg-[#837958] text-white text-[14px] rounded-full shadow-[0_2px_4px_rgba(0,0,0,0.1)] hover:bg-[#a88f5c]"
        onClick={handleAddUserClick} // <--- เปลี่ยนมาเรียก handleAddUserClick
      >
        เพิ่มผู้ใช้งาน
      </button>
    </div>
  );
};

export default UserToolbar;