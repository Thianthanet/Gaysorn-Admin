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
}) => {
  return (
    <div className="flex items-center gap-2 flex-wrap mb-6">
      {/* ช่องค้นหา */}
      <div className="flex items-center flex-1 min-w-[250px] border-b-[1px] border-[#837958]">
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
      <button className="px-3 h-[28px] bg-[#837958] text-white text-[14px] rounded-full flex items-center gap-[2px] shadow-[0_2px_4px_rgba(0,0,0,0.1)]">
        อาคาร
        <HiChevronDown size={18} className="text-white" />
      </button>

      {/* ปุ่มส่งข้อมูลออก */}
      <button
        className="px-4 h-[32px] bg-[#F4F2ED] text-black text-[14px] rounded-full shadow-[0_2px_4px_rgba(0,0,0,0.1)] hover:bg-gray-300"
        onClick={() => console.log("ส่งข้อมูลออก")}
      >
        ส่งข้อมูลออก
      </button>

      {/* ปุ่ม tab */}
      {[
        { label: "ลูกค้า", value: "customers" },
        { label: "เจ้าหน้าที่", value: "technicians" },
        { label: "แอดมิน", value: "admin" },
      ].map((tab) => (
        <button
          key={tab.value}
          className={`px-4 h-[32px] text-[14px] rounded-full shadow-[0_2px_4px_rgba(0,0,0,0.1)] hover:bg-gray-300 ${
            activeTab === tab.value
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
        onClick={() => setPopupCreateUser(true)}
      >
        เพิ่มผู้ใช้งาน
      </button>
    </div>
    
  );
};

export default UserToolbar;
