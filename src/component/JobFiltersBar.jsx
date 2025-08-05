import React from "react";
import { BiSearchAlt2 } from "react-icons/bi";
import { HiChevronDown } from "react-icons/hi";
import { Funnel } from "lucide-react";

const JobFiltersBar = ({
  searchInput,
  setSearchInput,
  handleSearch,
  selectedBuilding,
  setSelectedBuilding,
  building,
  selectedStatus,
  setSelectedStatus,
  showFilters,
  setShowFilters,
  exportToExcel,
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
          className="w-full pl-2 pr-3 py-1 outline-none"
        />
      </div>

      {/* ปุ่มค้นหา */}
      <button
        onClick={handleSearch}
        className="px-3 h-[28px] bg-[#837958] text-white text-[14px] rounded-full flex items-center shadow"
      >
        <BiSearchAlt2 size={18} className="text-white mr-1" />
        ค้นหา
      </button>

      {/* Dropdown อาคาร */}
      <div className="relative inline-block">
        <select
          value={selectedBuilding}
          onChange={(e) => setSelectedBuilding(e.target.value)}
          className="appearance-none px-3 pr-8 h-[28px] bg-[#837958] text-white text-[14px] rounded-full cursor-pointer w-auto min-w-[80px] max-w-[300px]"
        >
          <option
            value="all"
            style={{ backgroundColor: "white", color: "black" }}
          >
            อาคาร
          </option>
          {building.map((b) => (
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

      {/* Dropdown สถานะ */}
      <div className="relative inline-block">
        <select
          value={selectedStatus}
          onChange={(e) => setSelectedStatus(e.target.value)}
          className="appearance-none px-3 pr-8 h-[28px] bg-[#837958] text-white text-[14px] rounded-full cursor-pointer w-auto min-w-[80px] max-w-[300px] "
        >
          <option
            value="all"
            style={{ backgroundColor: "white", color: "black" }}
          >
            สถานะ
          </option>
          <option
            value="pending"
            style={{ backgroundColor: "white", color: "black" }}
          >
            รอดำเนินการ
          </option>
          <option
            value="in_progress"
            style={{ backgroundColor: "white", color: "black" }}
          >
            อยู่ระหว่างดำเนินการ
          </option>
          <option
            value="completed"
            style={{ backgroundColor: "white", color: "black" }}
          >
            เสร็จสิ้น
          </option>
        </select>
        <HiChevronDown
          size={18}
          className="text-white pointer-events-none absolute top-1/2 right-2 -translate-y-1/2"
        />
      </div>

      {/* ปุ่มเงื่อนไขเพิ่มเติม */}
      <button
        className="px-3 h-[28px] bg-[#837958] text-white text-[14px] rounded-full flex items-center gap-[2px] shadow"
        onClick={() => setShowFilters(!showFilters)}
      >
        <Funnel className="w-4" /> เงื่อนไข
        <HiChevronDown size={18} className="text-white" />
      </button>

      {/* ปุ่มส่งออก Excel */}
      <button
        className="px-4 h-[32px] bg-[#F4F2ED] text-black text-[14px] rounded-full shadow hover:bg-gray-300"
        onClick={exportToExcel}
      >
        ส่งข้อมูลออก
      </button>
    </div>
  );
};

export default JobFiltersBar;
