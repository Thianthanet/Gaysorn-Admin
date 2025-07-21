import React, { useEffect, useState, useMemo } from 'react'
import AdminLayout from './AdminLayout'
import axios from 'axios'
import moment from 'moment'
import 'moment/locale/th'
// import {
//   PieChart, Pie, Cell, Legend, ResponsiveContainer,
//   BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid
// } from 'recharts'
import { FiClock, FiTool, FiClipboard } from 'react-icons/fi'
import { BsCheckSquare } from "react-icons/bs";
import { LuClipboardList } from "react-icons/lu";
import TimeDisplay from '../component/TimeDIsPlay'
import PieChartAndSummary from '../component/PieChartAndSummary'
import JobBarChart from '../component/JobBarChart'
import LatestRepairsList from '../component/LatestRepairsList'
import TopCompaniesList from '../component/TopCompaniesList'

moment.locale('th')

const STATUS_LABELS = {
  pending: 'รอดำเนินการ',
  in_progress: 'อยู่ระหว่างดำเนินการ',
  completed: 'เสร็จสิ้น',
  no_job: 'ไม่มีงาน',
}
const STATUS_COLORS = {
  pending: 'rgba(253, 59, 120, 0.75)',       // #FD3B78
  in_progress: 'rgba(240, 177, 0, 0.75)',    // #F0B100
  completed: 'rgba(0, 201, 80, 0.75)',       // #00C950
  no_job: '#D8D8D8',
}

const iconMap = { //ถ้าสมดุล size={72}
  pending: <FiClock size={60} />,
  in_progress: <FiTool size={60} />,
  completed: <BsCheckSquare size={52} />,
  total: <LuClipboardList size={60} />,
}

export default function Dashboard() {
  const [dashboard, setDashboard] = useState(null)
  // const [activeIndex, setActiveIndex] = useState(null);
  const [isMobile, setIsMobile] = useState(false);
  const [dashboardData, setDashboardData] = useState(null)
  const [activeButton, setActiveButton] = useState('today')
  const [startDate, setStartDate] = useState("2025-07-21");
  const [endDate, setEndDate] = useState("2025-07-21");
  const [buildingName, setBuildingName] = useState("ทั้งหมด");
  const [choices, setChoices] = useState([]);

  useEffect(() => {
    if (dashboardData) {
      setDashboard(dashboardData);
    }
  }, [dashboardData]);

  useEffect(() => {
    const handleResize = () => { //1024
      setIsMobile(window.innerWidth <= 768);
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [isMobile]);

  // 👉 โหลดข้อมูลครั้งแรก
  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const res = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/api/dashboard`, {
          params: {
            startDate,
            endDate,
            buildingName: buildingName === "ทั้งหมด" ? undefined : buildingName,
          },
        });
        console.log('buildingName:', buildingName)
        console.log('startDate:', startDate)
        console.log('endDate:', endDate)
        console.log('Dashboard data:', res.data)
        console.table(res.data.latestRepairs)
        setDashboard(res.data)
      } catch (err) {
        console.error('Error fetching dashboard:', err);
      }
    };

    fetchDashboard();
  }, [startDate, endDate, buildingName]);

  // console.log('buildingName:', buildingName)

  useEffect(() => {
    const fetchChoices = async () => {
      try {
        const res = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/api/getChoices`);
        console.log("GET /getChoices result:", res.data); // ดูโครงสร้างจริงๆ

        // สมมุติ backend ส่งแบบ { choices: [...] }
        const choicesArray = res.data.choices ?? res.data; // รองรับทั้งแบบมี .choices หรือไม่มีก็ได้

        const choices = Array.isArray(choicesArray)
          ? choicesArray.map(choice => choice.name?.trim() || choice.choiceName?.trim())
          : [];

        setChoices(choices);
      } catch (error) {
        console.error("Error fetching choices:", error);
      }
    };

    fetchChoices();
  }, []);

  const statusPieData = useMemo(() => {
    if (!dashboard) return [];
    // console.log("dashboard.statusCounts: ", dashboard.statusCounts)
    const counts = dashboard.statusCounts.reduce((acc, cur) => {
      acc[cur.status] = cur._count.status
      return acc
    }, { pending: 0, in_progress: 0, completed: 0, no_job: 0 })
    return Object.entries(counts).map(([key, value]) => ({
      name: STATUS_LABELS[key] || key,
      value,
      color: STATUS_COLORS[key],
    }))
  }, [dashboard])

  const summaryCards = useMemo(() => {
    if (!dashboard) return []
    const counts = dashboard.statusCounts.reduce((acc, cur) => {
      acc[cur.status] = cur._count.status
      return acc
    }, { pending: 0, in_progress: 0, completed: 0 })

    return [
      { key: 'pending', label: STATUS_LABELS.pending, value: counts.pending },
      { key: 'in_progress', label: STATUS_LABELS.in_progress, value: counts.in_progress },
      { key: 'completed', label: STATUS_LABELS.completed, value: counts.completed },
      { key: 'total', label: 'รายการงานทั้งหมด', value: dashboard.totalJobs },
    ]
  }, [dashboard])

  const barData = useMemo(() => {
    if (!dashboard) return []
    // console.log("dashboard.choicesDetails: ", dashboard.choicesDetails)
    return dashboard.choicesDetails.map(ch => ({
      name: ch.choiceName,
      pending: ch.pending,
      in_progress: ch.in_progress,
      completed: ch.completed,
    }))
  }, [dashboard])

  if (!dashboard) {
    return (
      <AdminLayout>
        <div className="flex justify-center items-center h-96">
          <span className="animate-pulse text-lg text-gray-500">กำลังโหลดข้อมูล...</span>
        </div>
      </AdminLayout>
    )
  }

  // 🔹 ลำดับตามที่ต้องการ
  const preferredOrder = [
    "ระบบแอร์ไม่เย็น / มีน้ำหยด",
    "ไฟฟ้าดับ / ไฟกระพริบ",
    "หลอดไฟ / โคมไฟเสีย",
    "น้ำรั่ว / ท่อตัน / น้ำไม่ไหล",
    "สุขภัณฑ์ชำรุด",
    "ปัญหาสัตว์รบกวน",
    "ปัญหาระบบสื่อสาร / อินเทอร์เน็ต",
    "อื่น ๆ", // รวมแล้วเป็นชื่อเดียว
  ];

  // console.log("barData: ", barData)

  // 🔹 Normalize 'อื่น ๆ' ให้กลายเป็น 'อื่นๆ'
  const normalizedBarData = barData.map(item => ({
    ...item,
    name: item.name.replace(/\s/g, '') === "อื่น ๆ" ? "อื่น ๆ" : item.name,
  }));

  // 🔹 สร้าง finalBarData ให้มีครบทุกหัวข้อจาก preferredOrder
  const finalBarData = preferredOrder.map(name => {
    // หา item ที่ตรงกับชื่อ (หลังลบช่องว่าง)
    const matched = normalizedBarData.find(
      item => item.name.replace(/\s/g, '') === name.replace(/\s/g, '')
    );

    // ถ้าเจอให้ใช้ข้อมูลเดิม, ถ้าไม่เจอให้เติมด้วยค่า 0
    return matched || {
      name,
      pending: 0,
      in_progress: 0,
      completed: 0,
    };
  });

  return (
    <AdminLayout>
      <TimeDisplay
        isMobile={isMobile}
        onDataChange={({ startDate, endDate }) => {
          setStartDate(startDate)
          setEndDate(endDate)
        }}
        activeButton={activeButton}
        setActiveButton={setActiveButton}
      />

      {/* {console.log("DashboardData: ", dashboardData)} */}

      <PieChartAndSummary
        statusPieData={statusPieData}
        summaryCards={summaryCards}
        iconMap={iconMap}
        isMobile={isMobile}
        activeButton={activeButton}
        setBuildingName={setBuildingName} // ส่งฟังก์ชันไป
      />

      <JobBarChart
        data={finalBarData}
        STATUS_LABELS={STATUS_LABELS}
        STATUS_COLORS={STATUS_COLORS}
        isMobile={isMobile}
      />

      <div className="grid md:grid-cols-2 gap-2 mb-4">
        <LatestRepairsList
          repairs={dashboard.latestRepairs}
          STATUS_LABELS={STATUS_LABELS}
          isMobile={isMobile}
        />

        <TopCompaniesList
          companies={dashboard.topCompanies}
          isMobile={isMobile}
        />
      </div>
    </AdminLayout >
  )
}
