import React, { useEffect, useState } from "react";
import AdminLayout from "./AdminLayout";
import axios from "axios";
import { useNavigate } from "react-router-dom";

//component
import JobFiltersBar from "../component/JobFiltersBar";

const Report = () => {
  const [customer, setCustomer] = useState([]);
  const [technician, setTechnician] = useState([]);
  const [activeTab, setActiveTab] = useState("customer");
  const [timePeriod, setTimePeriod] = useState("daily"); // daily, weekly, yearly
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchReportData();
  }, [timePeriod, selectedYear, selectedMonth, activeTab]);

  const fetchReportData = () => {
    if (activeTab === "customer") {
      handleGetCompanyReport();
    } else {
      handleGetTechnicianReport();
    }
  };

  const handleGetCompanyReport = async () => {
    setLoading(true);
    try {
      const params = {
        period: timePeriod,
        year: selectedYear,
        ...(timePeriod === "daily" && { month: selectedMonth }),
      };

      const response = await axios.get(
        `${import.meta.env.VITE_API_BASE_URL}/api/getCompanyRepairCount`,
        { params }
      );
      console.log("Customer", response.data.data);
      setCustomer(response.data.data);
    } catch (error) {
      console.error("Error fetching company report:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleGetTechnicianReport = async () => {
    setLoading(true);
    try {
      const params = {
        period: timePeriod,
        year: selectedYear,
        ...(timePeriod === "daily" && { month: selectedMonth }),
      };

      const response = await axios.get(
        `${import.meta.env.VITE_API_BASE_URL}/api/getTechnicianReport`,
        { params }
      );
      console.log(response.data.data);

      const transformTechnicianData = (data, period) => {
        return data.map((item) => {
          let timeData = {};
          if (period === "daily") {
            Object.entries(item.daily || {}).forEach(([key, value]) => {
              const dayNum = key.replace("day", "");
              timeData[`day_${dayNum}`] = value;
            });
          } else if (period === "weekly") {
            Object.entries(item.weekly || {}).forEach(([day, value], index) => {
              timeData[`week_${index + 1}`] = value;
            });
          } else if (period === "yearly") {
            const monthMap = {
              Jan: 1,
              Feb: 2,
              Mar: 3,
              Apr: 4,
              May: 5,
              Jun: 6,
              Jul: 7,
              Aug: 8,
              Sep: 9,
              Oct: 10,
              Nov: 11,
              Dec: 12,
            };
            Object.entries(item.monthly || {}).forEach(([month, value]) => {
              const monthIndex = monthMap[month];
              if (monthIndex) timeData[`month_${monthIndex}`] = value;
            });
          }

          return {
            ...item,
            ...timeData,
          };
        });
      };
      setTechnician(transformTechnicianData(response.data.data, timePeriod));
      console.log(
        "แปลงแล้ว technician:",
        transformTechnicianData(response.data.data, timePeriod)
      );
    } catch (error) {
      console.error("Error fetching technician report:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleNavigateToCustomerReport = (companyId) => {
    try {
      navigate(`/reportCustomer/${companyId}`);
    } catch (error) {
      console.error("Error navigating to customer report:", error);
    }
  };

  const handleNavigateToTechnicianReport = (techCompleteUserId) => {
    try {
      navigate(`/reportTechnician/${techCompleteUserId}`);
    } catch (error) {
      console.error("Error navigating to technician report:", error);
    }
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    // ไม่ต้องเรียก fetch อีก เพราะ useEffect จะทำงานเองเมื่อ activeTab เปลี่ยน
  };

  const handleTimePeriodChange = (period) => {
    setTimePeriod(period);
  };

  const getWeeklyRanges = (year, month) => {
    const weeks = [];
    const firstDayOfMonth = new Date(year, month - 1, 1);
    const lastDayOfMonth = new Date(year, month, 0);
    let start = new Date(firstDayOfMonth);

    // หาเริ่มต้นวันจันทร์ก่อนหน้า (หรือเท่ากับวันแรกของเดือน)
    start.setDate(start.getDate() - ((start.getDay() + 6) % 7));

    let weekIndex = 1;

    while (start <= lastDayOfMonth) {
      const end = new Date(start);
      end.setDate(start.getDate() + 6);
      weeks.push({
        key: `week_${weekIndex}`,
        label: `สัปดาห์ ${weekIndex}`,
        fullLabel: `สัปดาห์ที่ ${weekIndex} (${start.getDate()}-${end.getDate()} ${
          months[month - 1].label
        })`,
      });

      start.setDate(start.getDate() + 7);
      weekIndex++;
    }

    return weeks;
  };

  const generateYears = () => {
    const currentYear = new Date().getFullYear();
    const years = [];
    for (let i = currentYear - 5; i <= currentYear + 1; i++) {
      years.push(i);
    }
    return years;
  };

  const dayNamesThai = ["อา", "จ", "อ", "พ", "พฤ", "ศ", "ส"];

  const months = [
    { value: 1, label: "ม.ค." },
    { value: 2, label: "ก.พ." },
    { value: 3, label: "มี.ค." },
    { value: 4, label: "เม.ย." },
    { value: 5, label: "พ.ค." },
    { value: 6, label: "มิ.ย." },
    { value: 7, label: "ก.ค." },
    { value: 8, label: "ส.ค." },
    { value: 9, label: "ก.ย." },
    { value: 10, label: "ต.ค." },
    { value: 11, label: "พ.ย." },
    { value: 12, label: "ธ.ค" },
  ];

  // Generate columns for customer tab
  const generateTimeColumnsForCustomer = () => {
    if (timePeriod === "daily") {
      const columns = [];

      const year = selectedYear;
      const month = selectedMonth;
      const firstDate = new Date(year, month - 1, 1);
      const firstDayOfMonth = firstDate.getDay();

      // หา "วันจันทร์" ของสัปดาห์แรก
      const monday = new Date(firstDate);
      const offset = (firstDayOfMonth + 6) % 7; // ปรับให้ จันทร์ = 0
      monday.setDate(firstDate.getDate() - offset);

      for (let i = 0; i < 7; i++) {
        const currentDate = new Date(monday);
        currentDate.setDate(monday.getDate() + i);

        const day = currentDate.getDate();
        const dayOfWeek = currentDate.getDay();
        const currentMonth = currentDate.getMonth() + 1;

        columns.push({
          key: `day${day}`, // ใช้ key ของวันที่
          label: `${dayNamesThai[dayOfWeek]} ${day}`,
          fullLabel: `วันที่ ${day} (${dayNamesThai[dayOfWeek]})`,
        });
      }

      return columns;
    } else if (timePeriod === "weekly") {
      return getWeeklyRanges(selectedYear, selectedMonth);
    } else if (timePeriod === "yearly") {
      return months.map((month) => ({
        key: `month_${month.value}`,
        label: month.label.substring(0, 3),
        fullLabel: month.label,
      }));
    }
    return [];
  };

  // Generate columns for technician tab
  const generateTimeColumnsForTechnician = () => {
    if (timePeriod === "daily") {
      const columns = [];
      const today = new Date();
      const day = today.getDay(); // 0-6
      const monday = new Date(today);
      monday.setDate(today.getDate() - ((day + 6) % 7));

      for (let i = 0; i < 7; i++) {
        const currentDate = new Date(monday);
        currentDate.setDate(monday.getDate() + i);
        const dayOfWeek = currentDate.getDay();

        columns.push({
          key: `day_${i}`, // day_0, day_1, ...
          label: dayNamesThai[dayOfWeek],
          fullLabel: `วันที่ ${currentDate.getDate()} (${
            dayNamesThai[dayOfWeek]
          })`,
        });
      }
      return columns;
    } else if (timePeriod === "weekly") {
      return [
        { key: "week_1", label: "สัปดาห์ 1", fullLabel: "สัปดาห์ที่ 1 (1-7)" },
        { key: "week_2", label: "สัปดาห์ 2", fullLabel: "สัปดาห์ที่ 2 (8-14)" },
        {
          key: "week_3",
          label: "สัปดาห์ 3",
          fullLabel: "สัปดาห์ที่ 3 (15-21)",
        },
        {
          key: "week_4",
          label: "สัปดาห์ 4",
          fullLabel: "สัปดาห์ที่ 4 (22-28)",
        },
        {
          key: "week_5",
          label: "สัปดาห์ 5",
          fullLabel: "สัปดาห์ที่ 5 (29-31)",
        },
      ];
    } else if (timePeriod === "yearly") {
      return months.map((month) => ({
        key: `month_${month.value}`,
        label: month.label.substring(0, 3),
        fullLabel: month.label,
      }));
    }
    return [];
  };

  // เลือก columns ให้เหมาะกับ tab
  const timeColumns =
    activeTab === "customer"
      ? generateTimeColumnsForCustomer()
      : generateTimeColumnsForTechnician();
  return (
    <AdminLayout>
      <div className="p-6">
        {/* Time Period Controls */}
        <div className="mb-6 bg-white p-4 rounded-lg border">
          <div className="flex flex-wrap items-center gap-4">
            {/* Period Selection */}
            <div className="flex gap-2">
              <button
                onClick={() => handleTimePeriodChange("daily")}
                className={`px-4 py-2 rounded ${
                  timePeriod === "daily"
                    ? "bg-blue-500 text-white"
                    : "bg-gray-200"
                }`}
              >
                รายสัปดาห์
              </button>
              <button
                onClick={() => handleTimePeriodChange("weekly")}
                className={`px-4 py-2 rounded ${
                  timePeriod === "weekly"
                    ? "bg-blue-500 text-white"
                    : "bg-gray-200"
                }`}
              >
                รายเดือน
              </button>
              <button
                onClick={() => handleTimePeriodChange("yearly")}
                className={`px-4 py-2 rounded ${
                  timePeriod === "yearly"
                    ? "bg-blue-500 text-white"
                    : "bg-gray-200"
                }`}
              >
                รายปี
              </button>
            </div>

            {/* Year Selection */}
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium">ปี:</label>
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                className="px-3 py-2 border rounded"
              >
                {generateYears().map((year) => (
                  <option key={year} value={year}>
                    {year + 543}
                  </option>
                ))}
              </select>
            </div>

            {/* Month Selection (only for daily view) */}
            {timePeriod === "daily" && (
              <div className="flex items-center gap-2">
                <label className="text-sm font-medium">เดือน:</label>
                <select
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
                  className="px-3 py-2 border rounded"
                >
                  {months.map((month) => (
                    <option key={month.value} value={month.value}>
                      {month.label}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>
        </div>

        {/* Tab Selection */}
        <div className="mb-4 flex gap-4">
          <button
            onClick={() => handleTabChange("customer")}
            className={`px-4 py-2 rounded ${
              activeTab === "customer"
                ? "bg-[#BC9D72] text-white"
                : "bg-gray-200"
            }`}
          >
            ลูกค้า
          </button>
          <button
            onClick={() => handleTabChange("technician")}
            className={`px-4 py-2 rounded ${
              activeTab === "technician"
                ? "bg-[#BC9D72] text-white"
                : "bg-gray-200"
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

        <div className="overflow-x-auto">
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
                {customer.map((item, index) => (
                  <tr
                    key={index}
                    className="hover:bg-gray-50 cursor-pointer"
                    onClick={() =>
                      handleNavigateToCustomerReport(item.companyId)
                    }
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
                        {item[col.key] || "-"}
                      </td>
                    ))}
                    <td className="py-2 px-4 border-b text-center align-middle">
                      {item.total || 0}
                    </td>
                    <td className="py-2 px-4 border-b text-center align-middle">
                      {item.completed || 0}
                    </td>
                    <td className="py-2 px-4 border-b text-center align-middle">
                      {/* เติม % ด้วย */}
                      {item.completedPercent
                        ? `${item.completedPercent}%`
                        : "0%"}
                    </td>
                  </tr>
                ))}
                {customer.length === 0 && !loading && (
                  <tr>
                    <td
                      colSpan={timeColumns.length + 6}
                      className="text-center py-4 align-middle"
                    >
                      ไม่มีข้อมูล
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}

          {activeTab === "technician" && (
            <table className="min-w-full bg-white border border-gray-300 rounded-lg">
              <thead>
                <tr className="bg-gray-100">
                  <th className="py-2 px-4 bg-[#BC9D72]/50 border-b text-center align-middle sticky left-0 bg-[#BC9D72]/50 z-10">
                    ลำดับ
                  </th>
                  <th className="py-2 px-4 bg-[#BC9D72]/50 border-b text-center align-middle sticky left-0 bg-[#BC9D72]/50 z-10">
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
                    จำนวนจบงาน (ด้วยตนเอง)
                  </th>
                  <th className="py-2 px-4 bg-[#BC9D72]/50 border-b text-center align-middle">
                    จำนวนจบงาน (ด้วยผู้อื่น)
                  </th>
                  <th className="py-2 px-4 bg-[#BC9D72]/50 border-b text-center align-middle">
                    เปอร์เซ็นต์จบงาน
                  </th>
                </tr>
              </thead>

              <tbody>
                {technician.map((item, index) => (
                  <tr
                    key={index}
                    className="hover:bg-gray-50 cursor-pointer"
                    onClick={() =>
                      handleNavigateToTechnicianReport(item.techUserId)
                    }
                  >
                    <td className="py-2 px-4 border-b text-center align-middle sticky left-0 bg-white z-10">
                      {index + 1}
                    </td>
                    <td className="py-2 px-4 border-b text-center align-middle sticky left-0 bg-white z-10">
                      {item?.averageStar != null
                        ? item.averageStar.toFixed(1)
                        : "-"}
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
                        {item[col.key] || "-"}
                      </td>
                    ))}
                    <td className="py-2 px-4 border-b text-center align-middle">
                      {item.acceptedJobs || 0}
                    </td>
                    <td className="py-2 px-4 border-b text-center align-middle">
                      {item.acceptedJobs || 0}
                    </td>
                    <td className="py-2 px-4 border-b text-center align-middle">
                      {item.completedJobs || 0}
                    </td>
                    <td className="py-2 px-4 border-b text-center align-middle">
                      {item.successRate || "0"}%
                    </td>
                  </tr>
                ))}
                {technician.length === 0 && !loading && (
                  <tr>
                    <td
                      colSpan={timeColumns.length + 6}
                      className="text-center py-4 align-middle"
                    >
                      ไม่มีข้อมูล
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </AdminLayout>
  );
};

export default Report;
