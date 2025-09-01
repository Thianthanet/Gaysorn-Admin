import React, { useEffect, useState } from "react";
import AdminLayout from "./AdminLayout";
import axios from "axios";
import { formatDateTimeThaiShort } from "../component/Date";
import { TiStarFullOutline } from "react-icons/ti";
import { Pagination } from "../component/Pagination";
import JobCard from "../component/JobCard";
import { BiSearchAlt2 } from "react-icons/bi";
import { HiChevronDown } from "react-icons/hi";
import { Funnel } from "lucide-react";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import JobModal from "../component/JobModal";

import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { registerLocale } from "react-datepicker";
import th from "date-fns/locale/th";

import { useLocation } from "react-router-dom";

registerLocale("th", th);

const Jobs = () => {
  const [jobs, setJobs] = useState([]);
  const [sortConfig, setSortConfig] = useState({
    keys: ["createDate"], // Array to support multiple sort keys
    directions: ["desc"], // Corresponding directions for each key
  });
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);

  const initialStatus = queryParams.get("status") || "all";
  const initialStartDate = queryParams.get("startDate")
    ? new Date(queryParams.get("startDate"))
    : "";
  const initialEndDate = queryParams.get("endDate")
    ? new Date(queryParams.get("endDate"))
    : "";

  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(25);
  const [searchInput, setSearchInput] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [building, setBuilding] = useState([]);
  const [selectedBuilding, setSelectedBuilding] = useState("");
  const [selectedStatus, setSelectedStatus] = useState(initialStatus);
  const [showFilters, setShowFilters] = useState(false);
  const [startDate, setStartDate] = useState(initialStartDate);
  const [endDate, setEndDate] = useState(initialEndDate);
  const [choices, setChoices] = useState([]);
  //const [selectedChoices, setSelectedChoices] = useState([]);
  const [selectedChoice, setSelectedChoice] = useState("");

  const [selectedJob, setSelectedJob] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [selected, setSelected] = useState("อาคาร");
  const [open, setOpen] = useState(false);

  const [statusOpen, setStatusOpen] = useState(false);

  const statusLabel = (status) => {
    switch (status) {
      case "pending":
        return "รอดำเนินการ";
      case "in_progress":
        return "อยู่ระหว่างดำเนินการ";
      case "completed":
        return "เสร็จสิ้น";
      default:
        return "สถานะ";
    }
  };

  console.log("selectedJob", selectedJob);

  const openJobModal = (job) => {
    console.log("Opening modal for job ID:", job?.id); // Debug
    if (!job?.id) {
      console.error("No job ID found:", job);
      return;
    }
    setSelectedJob(job);
    setIsModalOpen(true);
  };

  // ฟังก์ชันปิด modal
  const closeJobModal = () => {
    setIsModalOpen(false);
    setSelectedJob(null);
  };

  useEffect(() => {
    if (initialStartDate || initialEndDate || initialStatus !== "all") {
      // มี query มาจาก Dashboard → ดึงงานตาม filter
      handleGetFilteredJobs();
    } else {
      // ถ้าไม่มี query → โหลดทั้งหมด
      handleGetAllJobs();
    }
    handleGetBuilding();
    handleGetChoices();
  }, []);

  const handleGetAllJobs = async () => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_API_BASE_URL}/api/getAllRepair`
      );
      setJobs(response.data.data);
      console.log(response.data.data);
    } catch (error) {
      console.error("Error fetching jobs:", error);
    }
  };

  const handleGetChoices = async () => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_API_BASE_URL}/api/getChoices`
      );
      console.log(response.data.data);
      setChoices(response.data.data);
    } catch (error) {
      console.error(error);
    }
  };

  const handleGetBuilding = async () => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_API_BASE_URL}/api/getBuilding`
      );
      console.log(response.data.data);
      setBuilding(response.data.data);
    } catch (error) {
      console.error(error);
    }
  };

  const handleSearch = () => {
    setSearchTerm(searchInput);
  };

  const exportToExcel = () => {
    const filteredSortedJobs = filterJobsBySearch(getSortedJobs());

    const dataToExport = filteredSortedJobs.map((job, index) => ({
      ลำดับ: index + 1,
      ความพึงพอใจ: job.workStar || "-",
      หมายเลขงาน: job.jobNo || "-",
      อาคาร: job.building?.buildingName || "-",
      บริษัท: job.company?.companyName || "-",
      กลุ่มงาน: job.choiceDesc || "-",
      วันที่แจ้ง: job.createDate
        ? formatDateTimeThaiShort(job.createDate)
        : "-",
      วันที่รับงาน: job.acceptDate
        ? formatDateTimeThaiShort(job.acceptDate)
        : "-",
      วันที่เสร็จสิ้น: job.completeDate
        ? formatDateTimeThaiShort(job.completeDate)
        : "-",
      // เจ้าหน้าที่: job.acceptedBy?.name?.trim() || "-",
      เจ้าหน้าที่:
        [
          job.acceptedBy?.name?.trim()
            ? `${job.acceptedBy.name} (รับงาน)`
            : null,
          job.completedBy?.name?.trim()
            ? `${job.completedBy.name} (ดำเนินการ)`
            : null,
        ]
          .filter(Boolean)
          .join("\n") || "-",
      สถานะ:
        job.status === "pending"
          ? "รอดำเนินการ"
          : job.status === "in_progress"
          ? "อยู่ระหว่างดำเนินการ"
          : job.status === "completed"
          ? "เสร็จสิ้น"
          : job.status || "-",
    }));
    const worksheet = XLSX.utils.json_to_sheet(dataToExport);

    worksheet["!cols"] = [
      { wch: 6 }, // ลำดับ
      { wch: 20 },
      { wch: 15 }, // เลขงาน
      { wch: 20 }, // อาคาร
      { wch: 25 }, // บริษัท
      { wch: 40 }, // กลุ่มงาน
      { wch: 20 }, // วันที่แจ้ง
      { wch: 20 }, // วันที่รับงาน
      { wch: 20 }, // วันที่เสร็จสิ้น
      { wch: 30 }, // เจ้าหน้าที่
      { wch: 20 }, // สถานะ
    ];

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Jobs");

    const fileName = `jobs_Export_${new Date()
      .toISOString()
      .slice(0, 10)}.xlsx`;

    const excelBuffer = XLSX.write(workbook, {
      bookType: "xlsx",
      type: "array",
    });

    const data = new Blob([excelBuffer], { type: "application/octet-stream" });
    saveAs(data, fileName);
  };

  const statusMap = {
    รอดำเนินการ: "pending",
    อยู่ระหว่างดำเนินการ: "in_progress",
    เสร็จสิ้น: "completed",
  };

  const filterJobsBySearch = (jobs) => {
    let filteredJobs = jobs;

    if (searchTerm.trim()) {
      const lowerSearch = searchTerm.toLowerCase();
      const translatedStatus = statusMap[searchTerm.trim()] || lowerSearch;

      filteredJobs = filteredJobs.filter((job) => {
        const jobNo = job?.jobNo?.toLowerCase() || "";
        const building = job?.building?.buildingName?.toLowerCase() || "";
        const company = job?.company?.companyName?.toLowerCase() || "";
        const group = job?.choiceDesc?.toLowerCase() || "";
        const status = job?.status?.toLowerCase() || "";
        const name = job?.acceptedBy?.name?.toLowerCase() || "";

        return (
          jobNo.includes(lowerSearch) ||
          building.includes(lowerSearch) ||
          company.includes(lowerSearch) ||
          group.includes(lowerSearch) ||
          status.includes(translatedStatus) ||
          name.includes(lowerSearch)
        );
      });
    }

    if (selectedBuilding && selectedBuilding !== "all") {
      filteredJobs = filteredJobs.filter(
        (job) => job.building?.buildingName === selectedBuilding
      );
    }

    if (selectedStatus && selectedStatus !== "all") {
      filteredJobs = filteredJobs.filter(
        (job) => job.status === selectedStatus
      );
    }

    if (selectedChoice) {
      filteredJobs = filteredJobs.filter(
        (job) => job.choiceDesc === selectedChoice
      );
    }

    const adjustedStartDate = startDate
      ? new Date(
          startDate.getFullYear(),
          startDate.getMonth(),
          startDate.getDate(),
          0,
          0,
          0,
          0
        )
      : null;

    const adjustedEndDate = endDate
      ? new Date(
          endDate.getFullYear(),
          endDate.getMonth(),
          endDate.getDate(),
          23,
          59,
          59,
          999
        )
      : null;

    // ✅ FIXED: ใช้ filteredJobs ต่อจากที่กรองไว้แล้ว ไม่ใช่ jobs ดิบ
    filteredJobs = filteredJobs.filter((job) => {
      const jobDate = new Date(job.createDate);

      if (adjustedStartDate && adjustedEndDate) {
        return jobDate >= adjustedStartDate && jobDate <= adjustedEndDate;
      } else if (adjustedStartDate && !adjustedEndDate) {
        // ✅ ถ้าเลือก startDate อย่างเดียว: แสดงเฉพาะวันนั้น
        const endOfStartDate = new Date(adjustedStartDate);
        endOfStartDate.setHours(23, 59, 59, 999);
        return jobDate >= adjustedStartDate && jobDate <= endOfStartDate;
      } else if (!adjustedStartDate && adjustedEndDate) {
        // ✅ ถ้าเลือก endDate อย่างเดียว: แสดงตั้งแต่วันนั้นขึ้นไป
        return jobDate >= adjustedEndDate;
      }

      return true; // ถ้าไม่เลือกวันใดเลย
    });

    return filteredJobs;
  };

  const handleGetFilteredJobs = async () => {
    try {
      const params = new URLSearchParams();

      if (startDate) params.append("startDate", startDate.toISOString());
      if (endDate) params.append("endDate", endDate.toISOString());
      if (selectedStatus !== "all") {
        params.append("status", selectedStatus);
      }

      const res = await axios.get(
        `${
          import.meta.env.VITE_API_BASE_URL
        }/api/getAllRepair?${params.toString()}`
      );

      setJobs(res.data.data);
      setCurrentPage(1);
    } catch (err) {
      console.error("Error fetching filtered jobs:", err);
    }
  };

  const handleChoiceChange = (choiceDesc) => {
    setSelectedChoices((prev) => {
      if (prev.includes(choiceDesc)) {
        return prev.filter((item) => item !== choiceDesc);
      } else {
        return [...prev, choiceDesc];
      }
    });
  };

  const requestSort = (key) => {
    let newKeys = [...sortConfig.keys];
    let newDirections = [...sortConfig.directions];

    const existingIndex = newKeys.indexOf(key);

    if (existingIndex >= 0) {
      // Key exists - toggle its direction
      newDirections[existingIndex] =
        newDirections[existingIndex] === "asc" ? "desc" : "asc";

      // If it's the primary sort and we have multiple sorts, we might want to keep it primary
      if (existingIndex === 0 && newKeys.length > 1) {
        // Keep as primary but toggle direction
      } else if (existingIndex !== 0) {
        // Move to primary position
        newKeys = [key, ...newKeys.filter((k) => k !== key)];
        newDirections = [
          newDirections[existingIndex],
          ...newDirections.filter((_, i) => i !== existingIndex),
        ];
      }
    } else {
      // New key - add as primary sort
      newKeys = [key, ...newKeys];
      newDirections = ["asc", ...newDirections];

      // Limit the number of sort columns if needed
      if (newKeys.length > 3) {
        newKeys = newKeys.slice(0, 3);
        newDirections = newDirections.slice(0, 3);
      }
    }

    setSortConfig({
      keys: newKeys,
      directions: newDirections,
    });
  };

  const getSortedJobs = () => {
    if (!sortConfig.keys.length) return jobs;

    return [...jobs].sort((a, b) => {
      for (let i = 0; i < sortConfig.keys.length; i++) {
        const key = sortConfig.keys[i];
        const direction = sortConfig.directions[i];

        const aValue = a[key];
        const bValue = b[key];

        // Handle date comparisons
        if (key.includes("Date")) {
          const aDate = new Date(aValue);
          const bDate = new Date(bValue);

          if (aDate < bDate) return direction === "asc" ? -1 : 1;
          if (aDate > bDate) return direction === "asc" ? 1 : -1;
        } else {
          // Handle string/number comparisons
          if (aValue < bValue) return direction === "asc" ? -1 : 1;
          if (aValue > bValue) return direction === "asc" ? 1 : -1;
        }
      }
      return 0;
    });
  };

  const getSortIndicator = (key) => {
    const index = sortConfig.keys.indexOf(key);
    if (index === -1) return "↕"; // Neutral indicator when not sorted
    const direction = sortConfig.directions[index];
    return direction === "asc" ? "↑" : "↓";
  };

  const getSortPriority = (key) => {
    const index = sortConfig.keys.indexOf(key);
    if (index === -1) return null;
    return index + 1; // Returns 1 for primary, 2 for secondary, etc.
  };

  const getPaginatedJobs = () => {
    const filteredJobs = filterJobsBySearch(getSortedJobs());
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return filteredJobs.slice(startIndex, endIndex);
  };

  const totalPages = Math.ceil(
    filterJobsBySearch(getSortedJobs()).length / itemsPerPage
  );

  return (
    <AdminLayout>
      <div>
        <div className="flex items-center gap-2 flex-wrap mb-6">
          {/* ช่องค้นหา */}
          <div className="flex items-center max-w-[350px] w-full border-b-[1px] border-[#837958]">
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
            className="px-3 h-[28px] bg-[#837958] text-white text-[14px] rounded-full flex items-center shadow-[0_2px_4px_rgba(0,0,0,0.1)]"
          >
            <BiSearchAlt2 size={18} className="text-white mr-1" />
            ค้นหา
          </button>

          {/* ปุ่มอาคาร */}
          <div className="relative inline-block">
            <button
              onClick={() => setOpen(!open)}
              className="px-3 h-[28px] w-[90px] bg-[#837958] text-white text-left rounded-full shadow text-ellipsis overflow-hidden whitespace-nowrap font-normal "
            >
              อาคาร
            </button>

            {open && (
              <ul className="absolute mt-1 bg-[#F4F2ED] text-center rounded-xl shadow-lg overflow-hidden w-[150px] text-[14px] z-10 border border-gray-300">
                <li
                  onClick={() => {
                    setSelected("อาคาร");
                    setSelectedBuilding("all");
                    setOpen(false);
                  }}
                  className="px-3 h-[28px] text-[#837958] font-normal border-b border-gray-300 hover:bg-[#BC9D72] hover:text-white cursor-pointer"
                >
                  อาคาร
                </li>
                {building.map((b, index) => (
                  <li
                    key={b.id}
                    onClick={() => {
                      setSelected(b.buildingName);
                      setSelectedBuilding(b.buildingName);
                      setOpen(false);
                    }}
                    className={`px-3 h-[28px] text-[#837958] font-normal hover:bg-[#BC9D72] hover:text-white cursor-pointer ${
                      index !== building.length - 1
                        ? "border-b border-[#837958]/20"
                        : ""
                    }`}
                  >
                    {b.buildingName}
                  </li>
                ))}
              </ul>
            )}

            <HiChevronDown
              size={18}
              className="text-white pointer-events-none absolute top-1/2 right-2 -translate-y-1/2"
            />
          </div>

          {/* ปุ่มสถานะ */}
          <div className="relative inline-block">
            <button
              onClick={() => setStatusOpen(!statusOpen)}
              className="px-3 h-[28px] w-[90px] bg-[#837958] text-white text-left rounded-full shadow"
            >
              {selectedStatus === "all"
                ? "ทั้งหมด"
                : statusLabel(selectedStatus)}
            </button>

            {statusOpen && (
              <ul className="absolute mt-1 bg-[#F4F2ED] text-center rounded-xl shadow-lg overflow-hidden w-[150px] text-[14px] z-10 border border-gray-300">
                <li
                  onClick={() => {
                    setSelectedStatus("all");
                    setCurrentPage(1);
                    setStatusOpen(false);
                  }}
                  className="px-3 h-[28px] text-[#837958] font-normal border-b border-gray-300 hover:bg-[#BC9D72] hover:text-white cursor-pointer"
                >
                  สถานะ
                </li>
                <li
                  onClick={() => {
                    setSelectedStatus("pending");
                    setCurrentPage(1);
                    setStatusOpen(false);
                  }}
                  className="px-3 h-[28px] text-[#837958] font-normal border-b border-gray-300 hover:bg-[#BC9D72] hover:text-white cursor-pointer"
                >
                  รอดำเนินการ
                </li>
                <li
                  onClick={() => {
                    setSelectedStatus("in_progress");
                    setCurrentPage(1);
                    setStatusOpen(false);
                  }}
                  className="px-3 h-[28px] text-[#837958] font-normal border-b border-gray-300 hover:bg-[#BC9D72] hover:text-white cursor-pointer"
                >
                  อยู่ระหว่างดำเนินการ
                </li>
                <li
                  onClick={() => {
                    setSelectedStatus("completed");
                    setCurrentPage(1);
                    setStatusOpen(false);
                  }}
                  className="px-3 h-[28px] text-[#837958] font-normal hover:bg-[#BC9D72] hover:text-white cursor-pointer"
                >
                  เสร็จสิ้น
                </li>
              </ul>
            )}

            <HiChevronDown
              size={18}
              className="text-white pointer-events-none absolute top-1/2 right-2 -translate-y-1/2"
            />
          </div>

          {/* ปุ่มเงื่อนไข */}
          <button
            className="px-3 h-[28px] bg-[#837958] text-white text-[14px] rounded-full flex items-center gap-[2px] shadow-[0_2px_4px_rgba(0,0,0,0.1)]"
            onClick={() => setShowFilters(!showFilters)}
          >
            <Funnel className="w-4" /> เงื่อนไข
            <HiChevronDown size={18} className="text-white" />
          </button>

          {/* ปุ่มส่งข้อมูลออก */}
          <button
            className="ml-[100px] px-4 h-[32px] bg-[#F4F2ED] text-black text-[14px] rounded-full shadow-[0_2px_4px_rgba(0,0,0,0.1)] hover:bg-gray-300"
            onClick={exportToExcel}
          >
            ส่งข้อมูลออก
          </button>
        </div>
        {showFilters && (
          <div className="bg-white mb-6">
            <div className="flex flex-wrap gap-2 items-end mb-4">
              {/* Start Date */}
              <div className="relative w-[80px]">
                <DatePicker
                  selected={startDate}
                  onChange={(date) => {
                    setStartDate(date);
                    handleGetFilteredJobs();
                  }}
                  dateFormat="dd/MM/yyyy"
                  locale="th"
                  placeholderText="วันที่เริ่ม"
                  popperPlacement="bottom-end"
                  className="w-full px-3 py-[6px] rounded-full border text-xs text-[#837958] border-[#e7e3d7] bg-[#FEFEFE] shadow-sm focus:outline-none focus:ring-1 focus:ring-[#837958] placeholder-[#ccc5b8]"
                  calendarClassName="rounded-lg"
                />
                <HiChevronDown
                  size={14}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-[#ccc5b8] pointer-events-none"
                />
              </div>

              {/* End Date */}
              <div className="relative w-[90px]">
                <DatePicker
                  selected={endDate}
                  onChange={(date) => {
                    setEndDate(date);
                    handleGetFilteredJobs();
                  }}
                  dateFormat="dd/MM/yyyy"
                  locale="th"
                  placeholderText="วันที่สิ้นสุด"
                  className="w-full px-3 py-[6px] rounded-full border text-xs text-[#837958] border-[#e7e3d7] bg-[#FEFEFE] shadow-sm focus:outline-none focus:ring-1 focus:ring-[#837958] placeholder-[#ccc5b8]"
                  calendarClassName="rounded-lg"
                />
                <HiChevronDown
                  size={14}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-[#ccc5b8] pointer-events-none"
                />
              </div>

              {/* กลุ่มงาน */}
              <div className="relative w-[80px]">
                <select
                  value={selectedChoice}
                  onChange={(e) => {
                    setSelectedChoice(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="appearance-none w-full px-3 py-[6px] rounded-full border text-xs text-[#837958] border-[#e7e3d7] bg-[#FEFEFE] shadow-sm focus:outline-none focus:ring-1 focus:ring-[#837958]"
                >
                  <option value="">กลุ่มงาน</option>
                  {[...choices]
                    .sort((a, b) => {
                      if (a.choiceName === "อื่น ๆ") return 1;
                      if (b.choiceName === "อื่น ๆ") return -1;
                      return a.choiceName.localeCompare(b.choiceName, "th");
                    })
                    .map((choice) => (
                      <option key={choice.id} value={choice.choiceName}>
                        {choice.choiceName}
                      </option>
                    ))}
                </select>
                <HiChevronDown
                  size={14}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-[#ccc5b8] pointer-events-none"
                />
              </div>
            </div>
          </div>
        )}
        <div className="overflow-x-auto w-full">
          <table className="min-w-full border border-[#837958]/50">
            <thead className="">
              <tr className="bg-[#BC9D72]/50 h-[50px] text-[14px]">
                <th className="min-w-[10px]"></th>
                <th>ลำดับ</th>
                <th className="text-center">
                  <TiStarFullOutline className="text-2xl mx-auto" />
                </th>
                <th>เลขงาน</th>
                <th>อาคาร</th>
                <th>บริษัท</th>
                <th>กลุ่มงาน</th>
                <th
                  onClick={() => requestSort("createDate")}
                  className="cursor-pointer hover:underline"
                >
                  วันที่แจ้ง {getSortIndicator("createDate")}
                  {getSortPriority("createDate") && (
                    <sup>{getSortPriority("createDate")}</sup>
                  )}
                </th>
                <th
                  onClick={() => requestSort("acceptDate")}
                  className="cursor-pointer hover:underline"
                >
                  วันที่รับงาน {getSortIndicator("acceptDate")}
                  {getSortPriority("acceptDate") && (
                    <sup>{getSortPriority("acceptDate")}</sup>
                  )}
                </th>
                <th
                  onClick={() => requestSort("completeDate")}
                  className="cursor-pointer hover:underline"
                >
                  วันที่เสร็จสิ้น {getSortIndicator("completeDate")}
                  {getSortPriority("completeDate") && (
                    <sup>{getSortPriority("completeDate")}</sup>
                  )}
                </th>
                <th>เจ้าหน้าที่</th>
                <th>สถานะ</th>
              </tr>
            </thead>
            <tbody>
              {getPaginatedJobs().map((job, index) => (
                <tr
                  key={job.id}
                  className="text-center border-b text-[12px]"
                  onClick={() => openJobModal(job)}
                >
                  <td className=" px-4 py-2 text-center align-text-top">
                    <span
                      className={`inline-block w-4 h-4 rounded-full mx-auto ${
                        job.status === "pending"
                          ? "bg-red-500"
                          : job.status === "in_progress"
                          ? "bg-yellow-500"
                          : job.status === "completed"
                          ? "bg-green-500"
                          : "bg-gray-400"
                      }`}
                    ></span>
                  </td>
                  <td className="align-text-top text-sm">
                    {(currentPage - 1) * itemsPerPage + index + 1}
                  </td>
                  <td className=" px-4 py-2 align-text-top text-sm">
                    {job?.workStar || "-"}
                  </td>
                  <td className=" px-4 py-2 align-text-top text-sm">
                    {job?.jobNo || "-"}
                  </td>
                  <td className=" px-4 py-2 min-w-[160px] align-text-top text-sm">
                    {job.building?.buildingName || "-"}
                  </td>
                  <td className=" px-4 py-2 min-w-[160px] align-text-top text-sm">
                    {job.company?.companyName || "-"}
                  </td>
                  <td className=" px-4 py-2 min-w-[160px] align-text-top text-sm">
                    {job?.choiceDesc || "-"}
                  </td>
                  <td className=" px-4 py-2 min-w-[200px] align-text-top text-sm">
                    {formatDateTimeThaiShort(job?.createDate) || "-"}
                  </td>
                  <td className=" px-4 py-2 min-w-[200px] align-text-top text-sm">
                    {formatDateTimeThaiShort(job?.acceptDate) || "-"}
                  </td>
                  <td className=" px-4 py-2 min-w-[200px] align-text-top text-sm">
                    {formatDateTimeThaiShort(job?.completeDate) || "-"}
                  </td>
                  <td className=" px-4 py-2 min-w-[150px] align-text-top text-sm">
                    {job?.acceptedBy?.name?.trim() ? job.acceptedBy.name : "-"}{" "}
                    <br />
                    {job?.completedBy?.name?.trim()
                      ? job.completedBy.name
                      : "-"}
                  </td>
                  <td
                    className={` px-4 py-2 min-w-[160px] align-text-top text-sm ${
                      job.status === "pending"
                        ? "text-red-500"
                        : job.status === "in_progress"
                        ? "text-yellow-500"
                        : job.status === "completed"
                        ? "text-green-500"
                        : ""
                    }`}
                  >
                    {job.status === "pending"
                      ? "รอดำเนินการ"
                      : job.status === "in_progress"
                      ? "อยู่ระหว่างดำเนินการ"
                      : job.status === "completed"
                      ? "เสร็จสิ้น"
                      : job.status}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
          itemsPerPage={itemsPerPage}
          onItemsPerPageChange={(num) => {
            setItemsPerPage(num);
            setCurrentPage(1);
          }}
          totalItems={jobs.length}
          advancedPagination={true}
        />
        {/* {isModalOpen && <JobModal job={selectedJob} onClose={closeJobModal} />} */}
        {isModalOpen && selectedJob && (
          <JobModal jobId={selectedJob.id} onClose={closeJobModal} />
        )}
      </div>
    </AdminLayout>
  );
};

export default Jobs;
