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

const Jobs = () => {
  const [jobs, setJobs] = useState([]);
  const [sortConfig, setSortConfig] = useState({
    keys: ["createDate"], // Array to support multiple sort keys
    directions: ["desc"], // Corresponding directions for each key
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(25);
  const [searchInput, setSearchInput] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [building, setBuilding] = useState([]);
  const [selectedBuilding, setSelectedBuilding] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [showFilters, setShowFilters] = useState(false);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [choices, setChoices] = useState([]);
  const [selectedChoices, setSelectedChoices] = useState([]);

  const [selectedJob, setSelectedJob] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

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
    handleGetAllJobs();
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
      ความพึงพอใจ: job.workStar ? "★".repeat(job.workStar) : "-",
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
      เจ้าหน้าที่: job.acceptedBy?.name?.trim() || "-",
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
      { wch: 20 }, // เจ้าหน้าที่
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

    // กรองด้วย searchTerm เดิม
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

    // กรองด้วย selectedBuilding ถ้ามีการเลือก
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

    // กรองด้วย selectedChoices ถ้ามีการเลือก
    if (selectedChoices.length > 0) {
      filteredJobs = filteredJobs.filter((job) =>
        selectedChoices.includes(job.choiceDesc)
      );
    }

    return filteredJobs;
  };

  const handleGetFilteredJobs = async () => {
    try {
      const params = new URLSearchParams();

      if (startDate) params.append("startDate", startDate);
      if (endDate) params.append("endDate", endDate);

      const res = await axios.get(
        `${
          import.meta.env.VITE_API_BASE_URL
        }/api/getAllRepair?${params.toString()}`
      );

      setJobs(res.data.data);
      setCurrentPage(1);
      setShowFilters(false); // ปิดฟิลเตอร์หลังจากค้นหา
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
            className="px-3 h-[28px] bg-[#837958] text-white text-[14px] rounded-full flex items-center shadow-[0_2px_4px_rgba(0,0,0,0.1)]"
          >
            <BiSearchAlt2 size={18} className="text-white mr-1" />
            ค้นหา
          </button>

          {/* ปุ่มอาคาร */}
          <div className="relative inline-block">
            <select
              value={selectedBuilding}
              onChange={(e) => {
                setSelectedBuilding(e.target.value);
                setCurrentPage(1);
              }}
              className="
                px-3 pr-8 h-[28px] bg-[#837958] text-white text-[14px] rounded-full shadow-[0_2px_4px_rgba(0,0,0,0.1)] cursor-pointer
                appearance-none
                w-auto min-w-[80px] max-w-[300px]
                transition-all duration-300 ease-in-out
                "
              style={{ width: selectedBuilding ? "auto" : "90px" }}
            >
              <option value="all">อาคาร</option>
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

          {/* ปุ่มสถานะ */}
          <div className="relative inline-block">
            <select
              value={selectedStatus}
              onChange={(e) => {
                setSelectedStatus(e.target.value);
                setCurrentPage(1);
              }}
              className="px-3 pr-8 h-[28px] bg-[#837958] text-white text-[14px] rounded-full shadow-[0_2px_4px_rgba(0,0,0,0.1)] cursor-pointer
                appearance-none
                w-auto min-w-[80px] max-w-[300px]
                transition-all duration-300 ease-in-out
                "
              style={{ width: selectedBuilding ? "auto" : "90px" }}
            >
              <option value="all">สถานะ</option>
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
            className="px-4 h-[32px] bg-[#F4F2ED] text-black text-[14px] rounded-full shadow-[0_2px_4px_rgba(0,0,0,0.1)] hover:bg-gray-300"
            onClick={exportToExcel}
          >
            ส่งข้อมูลออก
          </button>
        </div>
        {showFilters && (
          <div className="bg-white p-6 rounded-2xl shadow-md border border-gray-200 mb-6">
            <h3 className="text-xl font-semibold text-[#837958] mb-4 flex items-center gap-2">
              🔍 กรองข้อมูลงาน
            </h3>

            {/* วันที่และปุ่มค้นหา */}
            <div className="flex flex-wrap gap-4 items-end mb-6">
              {/* Start Date */}
              <div className="flex flex-col">
                <label className="text-sm font-medium text-gray-600 mb-1">
                  📅 วันที่เริ่มต้น
                </label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-[160px] px-3 py-1.5 border border-gray-300 rounded-lg text-sm shadow-sm focus:ring-[#837958] focus:border-[#837958]"
                />
              </div>

              {/* End Date */}
              <div className="flex flex-col">
                <label className="text-sm font-medium text-gray-600 mb-1">
                  📅 วันที่สิ้นสุด
                </label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-[160px] px-3 py-1.5 border border-gray-300 rounded-lg text-sm shadow-sm focus:ring-[#837958] focus:border-[#837958]"
                />
              </div>

              {/* ปุ่มค้นหา */}
              <div className="flex flex-col">
                <label className="text-sm invisible mb-1">ค้นหา</label>
                <button
                  onClick={handleGetFilteredJobs}
                  className="px-4 py-2 bg-[#837958] text-white text-sm rounded-lg hover:bg-[#6b6149] transition duration-200 shadow-sm"
                >
                  ค้นหา
                </button>
              </div>
            </div>

            {/* กลุ่มงาน */}
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-2">
                🛠️ กลุ่มงาน
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-y-3 gap-x-6">
                {choices.map((choice) => (
                  <div key={choice.id} className="flex items-center">
                    <input
                      type="checkbox"
                      id={`choice-${choice.id}`}
                      checked={selectedChoices.includes(choice.choiceName)}
                      onChange={() => handleChoiceChange(choice.choiceName)}
                      className="h-4 w-4 text-[#837958] focus:ring-[#837958] border-gray-300 rounded"
                    />
                    <label
                      htmlFor={`choice-${choice.id}`}
                      className="ml-2 text-sm text-gray-700"
                    >
                      {choice.choiceName}
                    </label>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
        <table className="min-w-full border border-[#837958]/50">
          <thead className="bg-[#837958]/50 ">
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
                <td className="align-text-top">
                  {(currentPage - 1) * itemsPerPage + index + 1}
                </td>
                <td className=" px-4 py-2 align-text-top">
                  {job?.workStar || "-"}
                </td>
                <td className=" px-4 py-2 align-text-top">
                  {job?.jobNo || "-"}
                </td>
                <td className=" px-4 py-2 min-w-[160px] align-text-top">
                  {job.building?.buildingName || "-"}
                </td>
                <td className=" px-4 py-2 min-w-[160px] align-text-top">
                  {job.company?.companyName || "-"}
                </td>
                <td className=" px-4 py-2 min-w-[160px] align-text-top">
                  {job?.choiceDesc || "-"}
                </td>
                <td className=" px-4 py-2 min-w-[200px] align-text-top">
                  {formatDateTimeThaiShort(job?.createDate) || "-"}
                </td>
                <td className=" px-4 py-2 min-w-[200px] align-text-top">
                  {formatDateTimeThaiShort(job?.acceptDate) || "-"}
                </td>
                <td className=" px-4 py-2 min-w-[200px] align-text-top">
                  {formatDateTimeThaiShort(job?.completeDate) || "-"}
                </td>
                <td className=" px-4 py-2 min-w-[150px] align-text-top">
                  {job?.acceptedBy?.name?.trim() ? job.acceptedBy.name : "-"}
                </td>
                <td
                  className={` px-4 py-2 min-w-[160px] align-text-top ${
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
