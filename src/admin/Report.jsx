import React, { useEffect, useState } from "react";
import AdminLayout from "./AdminLayout";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import dayjs from "dayjs";
import isBetween from "dayjs/plugin/isBetween";
import isoWeek from "dayjs/plugin/isoWeek";
import localeData from "dayjs/plugin/localeData";
import "dayjs/locale/th";
import ReportCustomer from "./ReportCustomer";
import ReportTechnician from "./ReportTechnician";

dayjs.extend(isBetween);
dayjs.extend(isoWeek);
dayjs.extend(localeData);
dayjs.locale("th");

const Report = () => {
  const [customer, setCustomer] = useState([]);
  const [technician, setTechnician] = useState([]);
  const [allCustomers, setAllCustomers] = useState([]); // เก็บข้อมูลลูกค้าทั้งหมด
  const [allTechnicians, setAllTechnicians] = useState([]); // เก็บข้อมูลพนักงานทั้งหมด
  const [activeTab, setActiveTab] = useState("customer");
  const [timePeriod, setTimePeriod] = useState("weekly");
  const [selectedYear, setSelectedYear] = useState(dayjs().year());
  const [selectedMonth, setSelectedMonth] = useState(dayjs().month() + 1);
  const [selectedDate, setSelectedDate] = useState(dayjs());
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const [searchTerm, setSearchTerm] = useState("");
  const [buildings, setBuildings] = useState([]);
  const [selectedBuilding, setSelectedBuilding] = useState(""); // อาคารที่เลือก

  const [selectedCompanyId, setSelectedCompanyId] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [selectedTechnicianId, setSelectedTechnicianId] = useState(null);
  const [isTechnicianModalOpen, setIsTechnicianModalOpen] = useState(false);

  const handleOpenModalCustomer = (companyId) => {
    setSelectedCompanyId(companyId);
    setIsModalOpen(true);
  };

  const handleCloseModalCustomer = () => {
    setIsModalOpen(false);
    setSelectedCompanyId(null);
  };

  const handleOpenModalTechnician = (technicianId) => {
    setSelectedTechnicianId(technicianId);
    setIsTechnicianModalOpen(true);
  };

  const handleCloseModalTechnician = () => {
    setIsTechnicianModalOpen(false);
    setSelectedTechnicianId(null);
  };

  // โหลดข้อมูลทั้งหมดครั้งแรก
  useEffect(() => {
    const fetchAllData = async () => {
      try {
        // โหลดข้อมูลลูกค้าทั้งหมด
        const customerResponse = await axios.get(
          `${import.meta.env.VITE_API_BASE_URL}/api/getCompanyRepairCount`,
          { params: { startDate: "2000-01-01", endDate: dayjs().add(10, 'year').format("YYYY-MM-DD") } }
        );
        setAllCustomers(customerResponse.data.data);

        // โหลดข้อมูลพนักงานทั้งหมด
        const technicianResponse = await axios.get(
          `${import.meta.env.VITE_API_BASE_URL}/api/getTechnicianReport`,
          { params: { startDate: "2000-01-01", endDate: dayjs().add(10, 'year').format("YYYY-MM-DD") } }
        );
        setAllTechnicians(technicianResponse.data.data);

        // โหลดข้อมูลปัจจุบัน
        fetchReportData();
      } catch (error) {
        console.error("Error fetching all data:", error);
      }
    };

    fetchAllData();
  }, []);

  useEffect(() => {
    handleGetBuilding()
  }, [])

  const handleGetBuilding = async () => {
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_API_BASE_URL}/api/getBuilding`,)
      console.log(res.data.data);
      setBuildings(res.data.data);
    } catch (error) {
      console.error("Error fetching buildings:", error);
    }
  }

  // Helper functions for date calculations
  const getWeekRange = (date) => {
    const start = dayjs(date).startOf("isoWeek");
    const end = start.add(6, "day");
    return { start, end };
  };

  const getMonthRange = (year, month) => {
    const start = dayjs().year(year).month(month - 1).startOf("month");
    const end = start.endOf("month");
    return { start, end };
  };

  const getYearRange = (year) => {
    const start = dayjs().year(year).startOf("year");
    const end = start.endOf("year");
    return { start, end };
  };

  const getStartAndEndDate = () => {
    let start, end;

    if (timePeriod === "weekly") {
      const weekRange = getWeekRange(selectedDate);
      start = weekRange.start;
      end = weekRange.end;
    } else if (timePeriod === "monthly") {
      const monthRange = getMonthRange(selectedYear, selectedMonth);
      start = monthRange.start;
      end = monthRange.end;
    } else if (timePeriod === "yearly") {
      const yearRange = getYearRange(selectedYear);
      start = yearRange.start;
      end = yearRange.end;
    }

    return {
      startDate: start.format("YYYY-MM-DD"),
      endDate: end.format("YYYY-MM-DD"),
    };
  };

  // API calls
  const handleGetCompanyReport = async () => {
    setLoading(true);
    try {
      const { startDate, endDate } = getStartAndEndDate();
      const response = await axios.get(
        `${import.meta.env.VITE_API_BASE_URL}/api/getCompanyRepairCount`,
        { params: { startDate, endDate } }
      );

      // ผสานข้อมูลส่วนตัวจาก allCustomers กับข้อมูลช่วงเวลาจาก API
      const mergedData = allCustomers.map(customer => {
        const timeData = response.data.data.find(item => item.companyId === customer.companyId) || {};

        let processedData = { ...customer };

        if (timePeriod === "weekly") {
          const { start } = getWeekRange(selectedDate);
          for (let i = 0; i < 7; i++) {
            const currentDay = start.add(i, "day");
            const dayKey = `day${currentDay.date()}`;
            processedData[`day_${i + 1}`] = timeData[dayKey] || 0;
          }
        } else if (timePeriod === "monthly") {
          // สำหรับรายเดือน แบ่งเป็นสัปดาห์ (5 สัปดาห์)
          processedData.week_1 = 0;
          processedData.week_2 = 0;
          processedData.week_3 = 0;
          processedData.week_4 = 0;
          processedData.week_5 = 0;

          for (let day = 1; day <= 31; day++) {
            const dayKey = `day${day}`;
            const value = timeData[dayKey] || 0;

            if (day >= 1 && day <= 7) processedData.week_1 += value;
            else if (day >= 8 && day <= 14) processedData.week_2 += value;
            else if (day >= 15 && day <= 21) processedData.week_3 += value;
            else if (day >= 22 && day <= 28) processedData.week_4 += value;
            else if (day >= 29) processedData.week_5 += value;
          }
        } else if (timePeriod === "yearly") {
          const monthMap = {
            Jan: "month_1", Feb: "month_2", Mar: "month_3", Apr: "month_4",
            May: "month_5", Jun: "month_6", Jul: "month_7", Aug: "month_8",
            Sep: "month_9", Oct: "month_10", Nov: "month_11", Dec: "month_12"
          };

          Object.entries(monthMap).forEach(([monthKey, monthField]) => {
            processedData[monthField] = timeData[monthKey] || 0;
          });
        }

        // คำนวณค่าสรุป
        processedData.total = timeData.total || 0;
        processedData.completed = timeData.completed || 0;
        processedData.completedPercent = timeData.completedPercent || "0.00";

        return processedData;
      });

      setCustomer(mergedData);
    } catch (error) {
      console.error("Error fetching company report:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleGetTechnicianReport = async () => {
    setLoading(true);
    try {
      const { startDate, endDate } = getStartAndEndDate();
      const response = await axios.get(
        `${import.meta.env.VITE_API_BASE_URL}/api/getTechnicianReport`,
        { params: { startDate, endDate } }
      );

      console.log(response.data.data);

      // ผสานข้อมูลส่วนตัวจาก allTechnicians กับข้อมูลช่วงเวลาจาก API
      const mergedData = allTechnicians.map(tech => {
        const timeData = response.data.data.find(item => item.techUserId === tech.techUserId) || {};

        let processedData = { ...tech };

        if (timePeriod === "weekly") {
          const { start } = getWeekRange(selectedDate);
          for (let i = 0; i < 7; i++) {
            const currentDay = start.add(i, "day");
            const dayKey = `day${currentDay.date()}`;
            processedData[`day_${i + 1}`] = timeData.daily?.[dayKey] || 0;
          }
        } else if (timePeriod === "monthly") {
          // สำหรับรายเดือน แบ่งเป็นสัปดาห์ (5 สัปดาห์) เหมือนกับลูกค้า
          processedData.week_1 = 0;
          processedData.week_2 = 0;
          processedData.week_3 = 0;
          processedData.week_4 = 0;
          processedData.week_5 = 0;

          for (let day = 1; day <= 31; day++) {
            const dayKey = `day${day}`;
            const value = timeData.daily?.[dayKey] || 0;

            if (day >= 1 && day <= 7) processedData.week_1 += value;
            else if (day >= 8 && day <= 14) processedData.week_2 += value;
            else if (day >= 15 && day <= 21) processedData.week_3 += value;
            else if (day >= 22 && day <= 28) processedData.week_4 += value;
            else if (day >= 29) processedData.week_5 += value;
          }
        } else if (timePeriod === "yearly") {
          const monthMap = {
            Jan: "month_1", Feb: "month_2", Mar: "month_3", Apr: "month_4",
            May: "month_5", Jun: "month_6", Jul: "month_7", Aug: "month_8",
            Sep: "month_9", Oct: "month_10", Nov: "month_11", Dec: "month_12"
          };

          Object.entries(monthMap).forEach(([monthKey, monthField]) => {
            processedData[monthField] = timeData.monthly?.[monthKey] || 0;
          });
        }

        // คำนวณค่าสรุป
        processedData.acceptedJobs = timeData.acceptedJobs || 0;
        processedData.completedJobs = timeData.completedJobs || 0;
        processedData.tekenFromOtherCount = timeData.tekenFromOtherCount || 0;
        processedData.takenByOtherCount = timeData.takenByOtherCount || 0;
        processedData.successRate = timeData.successRate || 0;
        processedData.averageStar = timeData.averageStar || 0;

        return processedData;
      });

      setTechnician(mergedData);
    } catch (error) {
      console.error("Error fetching technician report:", error);
    } finally {
      setLoading(false);
    }
  };

  // Column generators
  const generateCustomerColumns = () => {
    const thaiDayNames = ["อา", "จ", "อ", "พ", "พฤ", "ศ", "ส"];
    const thaiMonthNames = [
      "ม.ค.", "ก.พ.", "มี.ค.", "เม.ย.", "พ.ค.", "มิ.ย.",
      "ก.ค.", "ส.ค.", "ก.ย.", "ต.ค.", "พ.ย.", "ธ.ค."
    ];

    if (timePeriod === "weekly") {
      const { start } = getWeekRange(selectedDate);
      const columns = [];

      for (let i = 0; i < 7; i++) {
        const currentDay = start.add(i, "day");
        columns.push({
          key: `day_${i + 1}`,
          label: `${thaiDayNames[currentDay.day()]} ${currentDay.date()}`,
          fullLabel: `วันที่ ${currentDay.date()} ${thaiMonthNames[currentDay.month()]} (${thaiDayNames[currentDay.day()]})`,
          date: currentDay
        });
      }

      return columns;
    } else if (timePeriod === "monthly") {
      // สำหรับรายเดือน แสดงเป็นสัปดาห์ (5 สัปดาห์)
      return [
        { key: "week_1", label: "สัปดาห์ 1", fullLabel: "สัปดาห์ที่ 1 (1-7)" },
        { key: "week_2", label: "สัปดาห์ 2", fullLabel: "สัปดาห์ที่ 2 (8-14)" },
        { key: "week_3", label: "สัปดาห์ 3", fullLabel: "สัปดาห์ที่ 3 (15-21)" },
        { key: "week_4", label: "สัปดาห์ 4", fullLabel: "สัปดาห์ที่ 4 (22-28)" },
        { key: "week_5", label: "สัปดาห์ 5", fullLabel: "สัปดาห์ที่ 5 (29-31)" },
      ];
    } else if (timePeriod === "yearly") {
      return thaiMonthNames.map((month, index) => ({
        key: `month_${index + 1}`,
        label: month,
        fullLabel: `เดือน${month}`,
        monthIndex: index + 1
      }));
    }

    return [];
  };

  const generateTechnicianColumns = () => {
    // ใช้ฟังก์ชันเดียวกันกับลูกค้าเพื่อให้แสดงเหมือนกัน
    return generateCustomerColumns();
  };

  // Event handlers
  const handleTabChange = (tab) => {
    setActiveTab(tab);
  };

  const handleTimePeriodChange = (period) => {
    setTimePeriod(period);
  };

  const handleDateChange = (date) => {
    setSelectedDate(dayjs(date));
    if (timePeriod === "monthly" || timePeriod === "yearly") {
      setSelectedYear(dayjs(date).year());
      setSelectedMonth(dayjs(date).month() + 1);
    }
  };

  const handleYearChange = (year) => {
    setSelectedYear(year);
    if (timePeriod === "weekly") {
      // Keep the same week number in the new year
      const weekNum = dayjs(selectedDate).isoWeek();
      const newDate = dayjs().year(year).isoWeek(weekNum).startOf("isoWeek");
      setSelectedDate(newDate);
    }
  };

  const handleMonthChange = (month) => {
    setSelectedMonth(month);
    if (timePeriod === "weekly") {
      // Keep the same week number in the new month
      const weekNum = dayjs(selectedDate).isoWeek();
      const newDate = dayjs().year(selectedYear).month(month - 1).isoWeek(weekNum).startOf("isoWeek");
      setSelectedDate(newDate);
    }
  };

  // Fetch data when parameters change
  const fetchReportData = () => {
    if (activeTab === "customer") {
      handleGetCompanyReport();
    } else {
      handleGetTechnicianReport();
    }
  };

  useEffect(() => {
    if (allCustomers.length > 0 || allTechnicians.length > 0) {
      fetchReportData();
    }
  }, [activeTab, timePeriod, selectedYear, selectedMonth, selectedDate, allCustomers, allTechnicians]);

  // Navigation handlers
  const handleNavigateToCustomerReport = (companyId) => {
    navigate(`/reportCustomer/${companyId}`);
  };

  const handleNavigateToTechnicianReport = (techUserId) => {
    navigate(`/reportTechnician/${techUserId}`);
  };

  // Generate year options
  const generateYears = () => {
    const currentYear = dayjs().year();
    return Array.from({ length: 5 }, (_, i) => currentYear - 2 + i);
  };

  // Generate month options
  const generateMonths = () => {
    return [
      { value: 1, label: "มกราคม" },
      { value: 2, label: "กุมภาพันธ์" },
      { value: 3, label: "มีนาคม" },
      { value: 4, label: "เมษายน" },
      { value: 5, label: "พฤษภาคม" },
      { value: 6, label: "มิถุนายน" },
      { value: 7, label: "กรกฎาคม" },
      { value: 8, label: "สิงหาคม" },
      { value: 9, label: "กันยายน" },
      { value: 10, label: "ตุลาคม" },
      { value: 11, label: "พฤศจิกายน" },
      { value: 12, label: "ธันวาคม" }
    ];
  };

  // Get current time columns based on active tab
  const timeColumns = activeTab === "customer"
    ? generateCustomerColumns()
    : generateTechnicianColumns();


  const filteredCustomers = customer.filter((item) => {
    const matchesSearch =
      (item.companyName?.toLowerCase() ?? "").includes(searchTerm.toLowerCase()) ||
      (item.buildingName?.toLowerCase() ?? "").includes(searchTerm.toLowerCase());

    const matchesBuilding =
      selectedBuilding === "" || item.buildingName === selectedBuilding;

    return matchesSearch && matchesBuilding;
  });

  const filteredTechnicians = technician.filter((item) => {
    const buildingList = Array.isArray(item.buildings)
      ? item.buildings
      : [item.buildings ?? ""];

    const matchesSearch =
      (item.technicianName?.toLowerCase() ?? "").includes(searchTerm.toLowerCase()) ||
      buildingList.join(", ").toLowerCase().includes(searchTerm.toLowerCase());

    const matchesBuilding =
      selectedBuilding === "" || buildingList.includes(selectedBuilding);

    return matchesSearch && matchesBuilding;
  });



  return (
    <AdminLayout>
      <div className="p-6">
        {/* Time Period Controls */}
        <div className="mb-6 bg-white p-4 rounded-lg border">
          <div className="flex flex-wrap items-center gap-4">

            <div className="flex gap-2">
              <button
                onClick={() => handleTimePeriodChange("weekly")}
                className={`px-4 py-2 rounded ${timePeriod === "weekly" ? "bg-blue-500 text-white" : "bg-gray-200"
                  }`}
              >
                รายสัปดาห์
              </button>
              <button
                onClick={() => handleTimePeriodChange("monthly")}
                className={`px-4 py-2 rounded ${timePeriod === "monthly" ? "bg-blue-500 text-white" : "bg-gray-200"
                  }`}
              >
                รายเดือน
              </button>
              <button
                onClick={() => handleTimePeriodChange("yearly")}
                className={`px-4 py-2 rounded ${timePeriod === "yearly" ? "bg-blue-500 text-white" : "bg-gray-200"
                  }`}
              >
                รายปี
              </button>
            </div>

            <div className="flex items-center gap-2">
              <label className="text-sm font-medium">ปี:</label>
              <select
                value={selectedYear}
                onChange={(e) => handleYearChange(parseInt(e.target.value))}
                className="px-3 py-2 border rounded"
              >
                {generateYears().map((year) => (
                  <option key={year} value={year}>{year + 543}</option>
                ))}
              </select>
            </div>

            {(timePeriod === "weekly" || timePeriod === "monthly") && (
              <div className="flex items-center gap-2">
                <label className="text-sm font-medium">เดือน:</label>
                <select
                  value={selectedMonth}
                  onChange={(e) => handleMonthChange(parseInt(e.target.value))}
                  className="px-3 py-2 border rounded"
                >
                  {generateMonths().map((month) => (
                    <option key={month.value} value={month.value}>
                      {month.label}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {timePeriod === "weekly" && (
              <div className="flex items-center gap-2">
                <label className="text-sm font-medium">สัปดาห์:</label>
                <input
                  type="date"
                  value={selectedDate.format("YYYY-MM-DD")}
                  onChange={(e) => handleDateChange(e.target.value)}
                  className="px-3 py-2 border rounded"
                />
              </div>
            )}
          </div>
        </div>



        {/* Tab Selection */}
        <div className="mb-4 flex gap-4">
          <button
            onClick={() => handleTabChange("customer")}
            className={`px-4 py-2 rounded ${activeTab === "customer" ? "bg-[#BC9D72] text-white" : "bg-gray-200"
              }`}
          >
            ลูกค้า
          </button>
          <button
            onClick={() => handleTabChange("technician")}
            className={`px-4 py-2 rounded ${activeTab === "technician" ? "bg-[#BC9D72] text-white" : "bg-gray-200"
              }`}
          >
            พนักงาน
          </button>
        </div>

        {loading && (
          <div className="flex justify-center items-center py-8">
            <div className="text-lg">กำลังโหลดข้อมูล...</div>
          </div>
        )}

        <div className="flex gap-5">
          <div className="mb-4 flex items-center justify-between">
            <div className="w-full">
              <input
                type="text"
                placeholder={
                  activeTab === "customer"
                    ? "ค้นหา: ชื่อบริษัท / อาคาร"
                    : "ค้นหา: ชื่อพนักงาน / อาคาร"
                }
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-2 border rounded"
              />
            </div>
          </div>

          <div className="mb-4 flex items-center gap-2">
            <select
              className="px-3 py-2 border rounded"
              value={selectedBuilding}
              onChange={(e) => setSelectedBuilding(e.target.value)}
            >
              <option value="">อาคาร</option>
              {buildings.map((building) => (
                <option key={building.id} value={building.buildingName}>
                  {building.buildingName}
                </option>
              ))}
            </select>
          </div>
        </div>



        <div className="overflow-x-auto">
          {/* Customer Table */}
          {activeTab === "customer" && (
            <table className="min-w-full bg-white border border-gray-300 rounded-lg">
              <thead>
                <tr className="bg-gray-100">
                  <th className="py-2 px-4 bg-[#BC9D72]/50 border-b text-center sticky left-0 bg-[#BC9D72]/50 z-10">
                    ลำดับ
                  </th>
                  <th className="py-2 px-4 bg-[#BC9D72]/50 border-b text-center sticky left-12 bg-[#BC9D72]/50 z-10">
                    ชื่อบริษัท
                  </th>
                  <th className="py-2 px-4 bg-[#BC9D72]/50 border-b text-center">
                    อาคาร
                  </th>
                  {timeColumns.map((col) => (
                    <th
                      key={col.key}
                      className="py-2 px-2 bg-[#BC9D72]/50 border-b text-center min-w-16"
                      title={col.fullLabel}
                    >
                      {col.label}
                    </th>
                  ))}
                  <th className="py-2 px-4 bg-[#BC9D72]/50 border-b text-center">
                    รวม
                  </th>
                  <th className="py-2 px-4 bg-[#BC9D72]/50 border-b text-center">
                    เสร็จสิ้น
                  </th>
                  <th className="py-2 px-4 bg-[#BC9D72]/50 border-b text-center">
                    เปอร์เซ็นต์สำเร็จ
                  </th>
                </tr>
              </thead>

              <tbody>
                {filteredCustomers.map((item, index) => (
                  <tr
                    key={index}
                    className="hover:bg-gray-50 cursor-pointer"
                    // onClick={() => handleNavigateToCustomerReport(item.companyId)}
                    onClick={() => handleOpenModalCustomer(item.companyId)}
                  >
                    <td className="py-2 px-4 border-b sticky left-0 bg-white z-10 text-center align-middle">
                      {index + 1}
                    </td>
                    <td className="py-2 px-4 border-b sticky left-12 bg-white z-10 text-center align-middle">
                      {item.companyName}
                    </td>
                    <td className="py-2 px-4 border-b text-center align-middle">
                      {item.buildingName}
                    </td>
                    {timeColumns.map((col) => (
                      <td
                        key={col.key}
                        className="py-2 px-2 border-b text-center align-middle"
                      >
                        {item[col.key] || 0}
                      </td>
                    ))}
                    <td className="py-2 px-4 border-b text-center align-middle">
                      {item.total || 0}
                    </td>
                    <td className="py-2 px-4 border-b text-center align-middle">
                      {item.completed || 0}
                    </td>
                    <td className="py-2 px-4 border-b text-center align-middle">
                      {item.completedPercent ? `${item.completedPercent}%` : "0%"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {isModalOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
              <div className="bg-white max-h-[90vh] overflow-y-auto w-[90vw] max-w-5xl rounded-lg shadow-lg relative">
                <button
                  onClick={handleCloseModalCustomer}
                  className="absolute top-2 right-2 text-white bg-red-500 hover:bg-red-600 rounded-full w-8 h-8 flex items-center justify-center text-lg shadow"
                >
                  ✕
                </button>
                <ReportCustomer id={selectedCompanyId} />
              </div>
            </div>
          )}


          {/* Technician Table */}
          {activeTab === "technician" && (
            <table className="min-w-full bg-white border border-gray-300 rounded-lg">
              <thead>
                <tr className="bg-gray-100">
                  <th className="py-2 px-4 bg-[#BC9D72]/50 border-b text-center align-middle sticky left-0 bg-[#BC9D72]/50 z-10">
                    ลำดับ
                  </th>
                  <th className="py-2 px-4 bg-[#BC9D72]/50 border-b text-center align-middle">
                    ดาว
                  </th>
                  <th className="py-2 px-4 bg-[#BC9D72]/50 border-b text-center align-middle sticky left-12 bg-[#BC9D72]/50 z-10">
                    ชื่อพนักงาน
                  </th>
                  <th className="py-2 px-4 bg-[#BC9D72]/50 border-b text-center align-middle">
                    สังกัด
                  </th>
                  {timeColumns.map((col) => (
                    <th
                      key={col.key}
                      className="py-2 px-2 bg-[#BC9D72]/50 border-b text-center align-middle min-w-16"
                      title={col.fullLabel}
                    >
                      {col.label}
                    </th>
                  ))}
                  <th className="py-2 px-4 bg-[#BC9D72]/50 border-b text-center align-middle">
                    งานที่รับ
                  </th>
                  <th className="py-2 px-4 bg-[#BC9D72]/50 border-b text-center align-middle">
                    งานที่ดำเนินการเอง
                  </th>
                  <th className="py-2 px-4 bg-[#BC9D72]/50 border-b text-center align-middle">
                    งานที่ดำเนินการแทน
                  </th>
                  <th className="py-2 px-4 bg-[#BC9D72]/50 border-b text-center align-middle">
                    เสร็จสิ้น
                  </th>
                  <th className="py-2 px-4 bg-[#BC9D72]/50 border-b text-center align-middle">
                    เปอร์เซ็นต์จบงาน
                  </th>
                </tr>
              </thead>

              <tbody>
                {filteredTechnicians.map((item, index) => {
                  const completeMe = item.completedJobs - (item.tekenFromOtherCount || 0);
                  const percen =
                    ((completeMe + (item.tekenFromOtherCount || 0)) /
                      (item.acceptedJobs +
                        (item.tekenFromOtherCount || 0) -
                        (item.takenByOtherCount || 0))) *
                    100 || 0;
                  return (
                    <tr
                      key={index}
                      className="hover:bg-gray-50 cursor-pointer"
                      // onClick={() => handleNavigateToTechnicianReport(item.techUserId)}
                      onClick={() => handleOpenModalTechnician(item.techUserId)}
                    >
                      <td className="py-2 px-4 border-b text-center align-middle sticky left-0 bg-white z-10">
                        {index + 1}
                      </td>
                      <td className="py-2 px-4 border-b text-center align-middle">
                        {item?.averageStar != null ? item.averageStar.toFixed(1) : "-"}
                      </td>
                      <td className="py-2 px-4 border-b text-center align-middle sticky left-12 bg-white z-10">
                        {item.technicianName}
                      </td>
                      <td className="py-2 px-4 border-b text-center align-middle">
                        {Array.isArray(item.buildings)
                          ? item.buildings.join(", ")
                          : item.buildings}
                      </td>
                      {timeColumns.map((col) => (
                        <td
                          key={col.key}
                          className="py-2 px-2 border-b text-center align-middle"
                        >
                          {item[col.key] || 0}
                        </td>
                      ))}
                      <td className="py-2 px-4 border-b text-center align-middle">
                        {item.acceptedJobs || 0}
                      </td>
                      <td className="py-2 px-4 border-b text-center align-middle">
                        {completeMe}
                      </td>
                      <td className="py-2 px-4 border-b text-center align-middle">
                        {item.tekenFromOtherCount || 0}
                      </td>
                      <td className="py-2 px-4 border-b text-center align-middle">
                        {completeMe + (item.tekenFromOtherCount || 0) || 0}
                      </td>
                      <td className="py-2 px-4 border-b text-center align-middle">
                        {item.successRate || "0"}%
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}

          {isTechnicianModalOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
              <div className="bg-white max-h-[90vh] overflow-y-auto w-[90vw] max-w-5xl rounded-lg shadow-lg relative">
                <button
                  onClick={handleCloseModalTechnician}
                  className="absolute top-2 right-2 text-white bg-red-500 hover:bg-red-600 rounded-full w-8 h-8 flex items-center justify-center text-lg shadow"
                >
                  ✕ 
                </button>
                <ReportTechnician userId={selectedTechnicianId} />
                
              </div>
              
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
};

export default Report;