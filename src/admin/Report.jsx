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
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import { BiSearchAlt2 } from "react-icons/bi";

dayjs.extend(isBetween);
dayjs.extend(isoWeek);
dayjs.extend(localeData);
dayjs.locale("th");

const Report = () => {
  const [customer, setCustomer] = useState([]);
  const [technician, setTechnician] = useState([]);
  const [allCustomers, setAllCustomers] = useState([]); // เก็บข้อมูลลูกค้าทั้งหมด
  const [allTechnicians, setAllTechnicians] = useState([]); // เก็บข้อมูลพนักงานทั้งหมด
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [selectedChoice, setSelectedChoice] = useState("");
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);

  const [activeTab, setActiveTab] = useState("customer");
  const [timePeriod, setTimePeriod] = useState("weekly");
  const [selectedYear, setSelectedYear] = useState(dayjs().year());
  const [selectedMonth, setSelectedMonth] = useState(dayjs().month() + 1);
  const [selectedDate, setSelectedDate] = useState(dayjs());
  const [loading, setLoading] = useState(false);
  const [jobs, setJobs] = useState([]);

  const navigate = useNavigate();

  const [searchTerm, setSearchTerm] = useState("");
  const [buildings, setBuildings] = useState([]);
  const [selectedBuilding, setSelectedBuilding] = useState(""); // อาคารที่เลือก

  const [selectedCompanyId, setSelectedCompanyId] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [selectedTechnicianId, setSelectedTechnicianId] = useState(null);
  const [isTechnicianModalOpen, setIsTechnicianModalOpen] = useState(false);

  const [sortConfig, setSortConfig] = useState({
    keys: ["createDate"], // Array to support multiple sort keys
    directions: ["desc"], // Corresponding directions for each key
  });

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

  const exportToExcel = () => {
    const isCustomerTab = activeTab === "customer";
    const columns = timeColumns;

    const dataToExport = (
      isCustomerTab ? filteredCustomers : filteredTechnicians
    ).map((item, index) => {
      const base = {
        ลำดับ: index + 1,
      };

      if (isCustomerTab) {
        base["ชื่อบริษัท"] = item.companyName;
        base["อาคาร"] = item.buildingName;

        columns.forEach((col) => {
          base[col.label] = item[col.key] || 0;
        });

        base["รวม"] = item.total || 0;
        base["เสร็จสิ้น"] = item.completed || 0;
        base["เปอร์เซ็นต์สำเร็จ"] = item.completedPercent
          ? `${item.completedPercent}%`
          : "0%";
      } else {
        base["ดาว"] =
          item.averageStar != null ? item.averageStar.toFixed(1) : "-";
        base["ชื่อพนักงาน"] = item.technicianName;
        base["สังกัด"] = Array.isArray(item.buildings)
          ? item.buildings.join(", ")
          : item.buildings;

        columns.forEach((col) => {
          base[col.label] = item[col.key] || 0;
        });

        const completeMe = item.completedJobs - (item.tekenFromOtherCount || 0);
        const completedTotal = completeMe + (item.tekenFromOtherCount || 0);

        base["งานที่รับ"] = item.acceptedJobs || 0;
        base["งานที่ดำเนินการเอง"] = completeMe;
        base["งานที่ดำเนินการแทน"] = item.tekenFromOtherCount || 0;
        base["เสร็จสิ้น"] = completedTotal;
        base["เปอร์เซ็นต์จบงาน"] = item.successRate
          ? `${item.successRate}%`
          : "0%";
      }

      return base;
    });

    const worksheet = XLSX.utils.json_to_sheet(dataToExport);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(
      workbook,
      worksheet,
      isCustomerTab ? "ลูกค้า" : "เจ้าหน้าที่"
    );

    const fileName = `report_${
      isCustomerTab ? "customer" : "technician"
    }_${new Date().toISOString().slice(0, 10)}.xlsx`;

    const excelBuffer = XLSX.write(workbook, {
      bookType: "xlsx",
      type: "array",
    });

    const data = new Blob([excelBuffer], { type: "application/octet-stream" });
    saveAs(data, fileName);
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

  // โหลดข้อมูลทั้งหมดครั้งแรก
  useEffect(() => {
    const fetchAllData = async () => {
      try {
        // โหลดข้อมูลลูกค้าทั้งหมด
        const customerResponse = await axios.get(
          `${import.meta.env.VITE_API_BASE_URL}/api/getCompanyRepairCount`,
          {
            params: {
              startDate: "2000-01-01",
              endDate: dayjs().add(10, "year").format("YYYY-MM-DD"),
            },
          }
        );
        setAllCustomers(customerResponse.data.data);
        setJobs(customerResponse.data.data);

        // โหลดข้อมูลพนักงานทั้งหมด
        const technicianResponse = await axios.get(
          `${import.meta.env.VITE_API_BASE_URL}/api/getTechnicianReport`,
          {
            params: {
              startDate: "2000-01-01",
              endDate: dayjs().add(10, "year").format("YYYY-MM-DD"),
            },
          }
        );
        setAllTechnicians(technicianResponse.data.data);
        setJobs(technicianResponse.data.data);

        // โหลดข้อมูลปัจจุบัน
        fetchReportData();
      } catch (error) {
        console.error("Error fetching all data:", error);
      }
    };

    fetchAllData();
  }, []);

  useEffect(() => {
    handleGetBuilding();
  }, []);

  const handleGetBuilding = async () => {
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_API_BASE_URL}/api/getBuilding`
      );
      console.log(res.data.data);
      setBuildings(res.data.data);
      setJobs(res.data.data);
    } catch (error) {
      console.error("Error fetching buildings:", error);
    }
  };

  // Helper functions for date calculations
  const getWeekRange = (date) => {
    const start = dayjs(date).startOf("isoWeek");
    const end = start.add(6, "day");
    return { start, end };
  };

  const getMonthRange = (year, month) => {
    const start = dayjs()
      .year(year)
      .month(month - 1)
      .startOf("month");
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
      const mergedData = allCustomers.map((customer) => {
        const timeData =
          response.data.data.find(
            (item) => item.companyId === customer.companyId
          ) || {};

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
            Jan: "month_1",
            Feb: "month_2",
            Mar: "month_3",
            Apr: "month_4",
            May: "month_5",
            Jun: "month_6",
            Jul: "month_7",
            Aug: "month_8",
            Sep: "month_9",
            Oct: "month_10",
            Nov: "month_11",
            Dec: "month_12",
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
      const mergedData = allTechnicians.map((tech) => {
        const timeData =
          response.data.data.find(
            (item) => item.techUserId === tech.techUserId
          ) || {};

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
            Jan: "month_1",
            Feb: "month_2",
            Mar: "month_3",
            Apr: "month_4",
            May: "month_5",
            Jun: "month_6",
            Jul: "month_7",
            Aug: "month_8",
            Sep: "month_9",
            Oct: "month_10",
            Nov: "month_11",
            Dec: "month_12",
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
      "ม.ค.",
      "ก.พ.",
      "มี.ค.",
      "เม.ย.",
      "พ.ค.",
      "มิ.ย.",
      "ก.ค.",
      "ส.ค.",
      "ก.ย.",
      "ต.ค.",
      "พ.ย.",
      "ธ.ค.",
    ];

    if (timePeriod === "weekly") {
      const { start } = getWeekRange(selectedDate);
      const columns = [];

      for (let i = 0; i < 7; i++) {
        const currentDay = start.add(i, "day");
        columns.push({
          key: `day_${i + 1}`,
          label: `${thaiDayNames[currentDay.day()]} ${currentDay.date()}`,
          fullLabel: `วันที่ ${currentDay.date()} ${
            thaiMonthNames[currentDay.month()]
          } (${thaiDayNames[currentDay.day()]})`,
          date: currentDay,
        });
      }

      return columns;
    } else if (timePeriod === "monthly") {
      // สำหรับรายเดือน แสดงเป็นสัปดาห์ (5 สัปดาห์)
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
      return thaiMonthNames.map((month, index) => ({
        key: `month_${index + 1}`,
        label: month,
        fullLabel: `เดือน${month}`,
        monthIndex: index + 1,
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
      const newDate = dayjs()
        .year(selectedYear)
        .month(month - 1)
        .isoWeek(weekNum)
        .startOf("isoWeek");
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
  }, [
    activeTab,
    timePeriod,
    selectedYear,
    selectedMonth,
    selectedDate,
    allCustomers,
    allTechnicians,
  ]);

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
      { value: 12, label: "ธันวาคม" },
    ];
  };

  // Get current time columns based on active tab
  const timeColumns =
    activeTab === "customer"
      ? generateCustomerColumns()
      : generateTechnicianColumns();

  const filteredCustomers = customer.filter((item) => {
    const matchesSearch =
      (item.companyName?.toLowerCase() ?? "").includes(
        searchTerm.toLowerCase()
      ) ||
      (item.buildingName?.toLowerCase() ?? "").includes(
        searchTerm.toLowerCase()
      );

    const matchesBuilding =
      selectedBuilding === "" || item.buildingName === selectedBuilding;

    return matchesSearch && matchesBuilding;
  });

  const filteredTechnicians = technician.filter((item) => {
    const buildingList = Array.isArray(item.buildings)
      ? item.buildings
      : [item.buildings ?? ""];

    const matchesSearch =
      (item.technicianName?.toLowerCase() ?? "").includes(
        searchTerm.toLowerCase()
      ) ||
      buildingList.join(", ").toLowerCase().includes(searchTerm.toLowerCase());

    const matchesBuilding =
      selectedBuilding === "" || buildingList.includes(selectedBuilding);

    return matchesSearch && matchesBuilding;
  });

  const handleSearch = () => {
    setSearchTerm(searchInput);
  };

  return (
    <AdminLayout>
      <div className="p-6">
        {/* Tab Selection */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* ช่องค้นหา input พร้อมไอคอน */}
          <div className="flex items-center border-b-[1px] border-[#837958] max-w-[350px] flex-grow">
            <BiSearchAlt2 size={20} className="text-[#837958] ml-2" />
            <input
              type="text"
              placeholder={
                activeTab === "customer"
                  ? "ค้นหา: ชื่อบริษัท / อาคาร"
                  : "ค้นหา: ชื่อพนักงาน / อาคาร"
              }
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
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

          {/* select อาคาร */}
          <select
            className="
      px-3 pr-8 h-[28px] bg-[#837958] text-white text-[14px] rounded-full shadow-[0_2px_4px_rgba(0,0,0,0.1)] cursor-pointer
      appearance-none
      min-w-[90px] max-w-[300px]
      transition-all duration-300 ease-in-out
    "
            style={{
              border: "2px solid #837958",
              width: selectedBuilding ? "auto" : "90px",
            }}
            value={selectedBuilding}
            onChange={(e) => setSelectedBuilding(e.target.value)}
          >
            <option value="">อาคาร</option>
            {buildings.map((building) => (
              <option
                key={building.id}
                value={building.buildingName}
                style={{ backgroundColor: "white", color: "black" }}
              >
                {building.buildingName}
              </option>
            ))}
          </select>

          {/* ปุ่มส่งข้อมูลออก */}
          <button
            className="px-4 h-[32px] bg-[#F4F2ED] text-black text-[14px] rounded-full shadow-[0_2px_4px_rgba(0,0,0,0.1)] hover:bg-gray-300"
            onClick={exportToExcel}
          >
            ส่งข้อมูลออก
          </button>

          {/* ปุ่มเปลี่ยน Tab */}
          <button
            onClick={() => handleTabChange("customer")}
            className={`px-4 h-[32px] rounded-2xl text-sm shadow-md ${
              activeTab === "customer"
                ? "bg-[#BC9D72] text-white"
                : "bg-[#F5F3EE]"
            }`}
          >
            ลูกค้า
          </button>
          <button
            onClick={() => handleTabChange("technician")}
            className={`px-4 h-[32px] rounded-2xl text-sm shadow-md ${
              activeTab === "technician"
                ? "bg-[#BC9D72] text-white"
                : "bg-[#F5F3EE]"
            }`}
          >
            เจ้าหน้าที่
          </button>
        </div>

        {/* </div> */}
        {/* Time Period Controls */}
        <div className="pt-4 pb-4">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex gap-2">
              <button
                onClick={() => handleTimePeriodChange("weekly")}
                className={`px-3 py-1.5 rounded-2xl text-xs border border-[#837958]/50 ${
                  timePeriod === "weekly"
                    ? "bg-[#837958] text-white"
                    : "bg-[#FEFEFE] text-[#837958]/50"
                }`}
              >
                รายสัปดาห์
              </button>
              <button
                onClick={() => handleTimePeriodChange("monthly")}
                className={`px-3 py-1 rounded-2xl text-xs border border-[#837958]/50 ${
                  timePeriod === "monthly"
                    ? "bg-[#837958] text-white"
                    : "bg-[#FEFEFE] text-[#837958]/50"
                }`}
              >
                รายเดือน
              </button>
              <button
                onClick={() => handleTimePeriodChange("yearly")}
                className={`px-3 py-1 rounded-2xl text-xs border border-[#837958]/50 ${
                  timePeriod === "yearly"
                    ? "bg-[#837958] text-white"
                    : "bg-[#FEFEFE] text-[#837958]/50"
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
                className="px-3 h-[32px] border rounded"
              >
                {generateYears().map((year) => (
                  <option key={year} value={year}>
                    {year + 543}
                  </option>
                ))}
              </select>
            </div>

            {(timePeriod === "weekly" || timePeriod === "monthly") && (
              <div className="flex items-center gap-2">
                <label className="text-sm font-medium">เดือน:</label>
                <select
                  value={selectedMonth}
                  onChange={(e) => handleMonthChange(parseInt(e.target.value))}
                  className="px-3 h-[32px] border rounded"
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
                  className="px-3 h-[32px] border rounded"
                />
              </div>
            )}
          </div>
        </div>

        {loading && (
          <div className="flex justify-center items-center py-8">
            <div className="text-lg">กำลังโหลดข้อมูล...</div>
          </div>
        )}

        <div className="overflow-x-auto">
          {/* Customer Table */}
          {activeTab === "customer" && (
            <table className="min-w-full bg-white border border-gray-300 text-sm rounded-lg">
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
                      {item.completedPercent
                        ? `${item.completedPercent}%`
                        : "0%"}
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
            <table className="min-w-full bg-white text-sm border border-gray-300 rounded-lg">
              <thead>
                <tr className="bg-gray-100">
                  <th className="py-2 px-4 bg-[#BC9D72]/50 border-b text-center align-middle sticky left-0 bg-[#BC9D72]/50 z-10">
                    ลำดับ
                  </th>
                  <th className="py-2 px-4 bg-[#BC9D72]/50 border-b text-center align-middle">
                    คะแนนเฉลี่ย
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
                  const completeMe =
                    item.completedJobs - (item.tekenFromOtherCount || 0);
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
