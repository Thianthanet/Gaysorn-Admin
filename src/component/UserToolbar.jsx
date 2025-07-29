import React from "react";
import { BiSearchAlt2 } from "react-icons/bi";
import { HiChevronDown } from "react-icons/hi";
// import BuildingFilter from "../component/BuildingFilter"

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
  waitForApprove,
  resetFormData, // <--- รับ prop นี้เข้ามา
}) => {
  const handleAddUserClick = () => {
    resetFormData(); // <--- เรียกใช้ฟังก์ชันนี้ก่อนเปิด Pop-up
    setPopupCreateUser(true);
  };

  return (
    <div className="flex items-center gap-2 flex-wrap mb-6">
      {/* ช่องค้นหา */}
      <div className="flex items-center flex-1 min-w-[148px] border-b-[1px] border-[#837958]">
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

      <div className="relative inline-block">
        <select
          value={filterBuilding}
          onChange={(e) => setFilterBuilding(e.target.value)}
          className={`
            peer
            h-[28px] bg-[#837958] text-white rounded-full pl-2 pr-8
            text-center focus:outline-none
            appearance-none
            min-w-[90px] max-w-[300px]
            transition-all duration-300 ease-in-out
            ${filterBuilding ? "text-[13px]" : "text-sm"}
          `}
          style={{ width: filterBuilding && filterBuilding !== "" ? "140px" : "90px" }}
        >
          <option value="" disabled hidden>
            อาคาร
          </option>
          <option value="all" className="bg-[#F4F2ED] text-black text-xs">
            ทั้งหมด
          </option>
          {buildings.map((b) => (
            <option
              key={b.id}
              value={b.buildingName}
              className="bg-[#F4F2ED] text-black text-xs"
            >
              {b.buildingName}
            </option>
          ))}
        </select>

        {/* dropdown arrow */}
        <HiChevronDown
          size={18}
          className="text-white pointer-events-none absolute top-1/2 right-2 -translate-y-1/2"
        />
      </div>

      {/* <BuildingFilter /> */}

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
            onClick={() => setActiveTab(tab.value)}
          >
            {tab.label}
          </button>
        ))}

        {/* ปุ่มพิเศษ: รออนุมัติ */}
        <button
          className={`px-4 h-[32px] text-[14px] rounded-full shadow-[0_2px_4px_rgba(0,0,0,0.1)] hover:bg-[#837958]/80 hover:text-white ${activeTab === "waitApprove"
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

      {/* {console.log("activeTab: ", activeTab)} */}

      {/* ปุ่มเพิ่มผู้ใช้งาน */}
      {activeTab !== "waitApprove" && (
        <button
          className="px-4 h-[36px] bg-[#837958] text-white text-[14px] rounded-full shadow-[0_2px_4px_rgba(0,0,0,0.1)] hover:bg-[#a88f5c]"
          onClick={handleAddUserClick}
        >
          เพิ่มผู้ใช้งาน
        </button>
      )}
    </div>
  );
};

export default UserToolbar;