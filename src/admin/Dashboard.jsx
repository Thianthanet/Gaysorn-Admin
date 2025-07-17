import React, { useEffect, useState, useMemo } from 'react'
import AdminLayout from './AdminLayout'
import axios from 'axios'
import moment from 'moment'
import 'moment/locale/th'
// import {
//   PieChart, Pie, Cell, Legend, ResponsiveContainer,
//   BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid
// } from 'recharts'
import { FiClock, FiTool, FiCheckSquare, FiClipboard } from 'react-icons/fi'
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
}
const STATUS_COLORS = {
  pending: '#FD3B78',
  in_progress: '#F0B100',
  completed: '#00C950',
  no_job: '#D8D8D8',
}

const iconMap = {
  pending: <FiClock size={80} />,
  in_progress: <FiTool size={80} />,
  completed: <FiCheckSquare size={80} />,
  total: <FiClipboard size={80} />,
}

export default function Dashboard() {
  const [dashboard, setDashboard] = useState(null)
  // const [activeIndex, setActiveIndex] = useState(null);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => { //1024
      setIsMobile(window.innerWidth < 1030);
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [isMobile]);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const res = await axios.get(
          `${import.meta.env.VITE_API_BASE_URL}/api/dashboard`
        )
        console.log('Dashboard data:', res.data)
        console.table(res.data.latestRepairs)
        setDashboard(res.data)
      } catch (err) {
        console.error('Error fetching dashboard:', err)
      }
    }
    fetchDashboard()
  }, [])

  // useEffect(() => {
  //   const fetchDashboard = async () => {
  //     try {
  //       const res = await axios.get(
  //         `${import.meta.env.VITE_API_BASE_URL}/api/getAllRepair`
  //       )
  //       console.log('Dashboard data:', res.data)
  //       console.table(res.data.latestRepairs)
  //       setDashboard(res.data)
  //     } catch (err) {
  //       console.error('Error fetching dashboard:', err)
  //     }
  //   }
  //   fetchDashboard()
  // }, [])

  const statusPieData = useMemo(() => {
    if (!dashboard) return []
    console.log("dashboard.statusCounts: ", dashboard.statusCounts)
    const counts = dashboard.statusCounts.reduce((acc, cur) => {
      acc[cur.status] = cur._count.status
      return acc
    }, { pending: 0, in_progress: 0, completed: 0 })
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
    console.log("dashboard.choicesDetails: ", dashboard.choicesDetails)
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

  // 🔸 เรียงลำดับตามจำนวนมาก ไป น้อย
  const topN = barData.lenght;
  const sortedData = [...barData]
    .sort((a, b) => (b.pending + b.in_progress + b.completed) - (a.pending + a.in_progress + a.completed))
    .slice(0, topN);

  return (
    <AdminLayout>
      <TimeDisplay
        isMobile={isMobile}
      />
      <PieChartAndSummary
        statusPieData={statusPieData}
        summaryCards={summaryCards}
        iconMap={iconMap}
        isMobile={isMobile}
      />
      <JobBarChart
        data={sortedData}
        STATUS_LABELS={STATUS_LABELS}
        STATUS_COLORS={STATUS_COLORS}
        isMobile={isMobile}
      />

      <div className="grid md:grid-cols-2 gap-4 mb-4">
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
