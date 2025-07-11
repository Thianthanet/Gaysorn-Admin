// ✅ Dashboard.jsx ที่ปรับดีไซน์ให้สวยขึ้น
import React, { useEffect, useState, useMemo } from 'react'
import AdminLayout from './AdminLayout'
import axios from 'axios'
import moment from 'moment'
import 'moment/locale/th'
import {
  PieChart, Pie, Cell, Legend, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, Tooltip
} from 'recharts'
import { FiClock, FiTool, FiCheckSquare, FiClipboard } from 'react-icons/fi'

moment.locale('th')

const STATUS_LABELS = {
  pending: 'รอดำเนินการ',
  in_progress: 'อยู่ระหว่างดำเนินการ',
  completed: 'เสร็จสิ้น',
}
const STATUS_COLORS = {
  pending: '#F8B7C4',
  in_progress: '#F9E9B7',
  completed: '#B6E5C8',
  no_job: '#D8D8D8',
}

const iconMap = {
  pending: <FiClock size={28} />,
  in_progress: <FiTool size={28} />,
  completed: <FiCheckSquare size={28} />,
  total: <FiClipboard size={28} />,
}

export default function Dashboard() {
  const [dashboard, setDashboard] = useState(null)

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

  const statusPieData = useMemo(() => {
    if (!dashboard) return []
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
    return dashboard.choicesDetails.map(ch => ({
      name: ch.choiceName,
      pending: ch.count,
      in_progress: ch.count,
      completed: ch.count,
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

  return (
    <AdminLayout>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">📊 แดชบอร์ดสรุปงานซ่อม</h1>
        <span className="text-sm text-gray-400">
          {moment().format('ddddที่ DD MMMM YYYY เวลา HH:mm:ss น.')}
        </span>
      </div>

      {/* แถวที่ 1: Pie + Summary Cards */}
      <div className="grid md:grid-cols-12 gap-4 mb-10">
        <div className="md:col-span-8 bg-white rounded-2xl shadow p-6">
          <h2 className="font-semibold text-xl mb-4 text-gray-700">
            🗂️ สรุปสถานะของงาน
          </h2>
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie
                data={statusPieData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                innerRadius={70}
                outerRadius={100}
              >
                {statusPieData.map((d, idx) => (
                  <Cell key={`cell-${idx}`} fill={d.color} />
                ))}
              </Pie>
              <Legend verticalAlign="middle" align="right" layout="vertical" />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="md:col-span-4 grid grid-cols-2 gap-4">
          {summaryCards.map(card => (
            <div
              key={card.key}
              className="flex flex-col justify-center items-center gap-1 p-5 bg-white rounded-2xl shadow hover:shadow-lg transition duration-300"
            >
              <div className="text-primary-500">{iconMap[card.key]}</div>
              <span className="text-4xl font-bold text-gray-800">{card.value}</span>
              <span className="text-gray-500 text-sm">{card.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* แถวที่ 2: Bar Chart */}
      <div className="bg-white rounded-2xl shadow p-6 mb-10">
        <h2 className="font-semibold text-xl mb-4 text-gray-700">
          📈 จำนวนงานตามกลุ่มงานและสถานะ
        </h2>
        <ResponsiveContainer width="100%" height={320}>
          <BarChart data={barData} margin={{ top: 10, right: 30, bottom: 30 }}>
            <XAxis dataKey="name" interval={0} angle={-20} textAnchor="end" />
            <YAxis allowDecimals={false} />
            <Tooltip />
            <Legend />
            <Bar dataKey="pending" name={STATUS_LABELS.pending} fill={STATUS_COLORS.pending} />
            <Bar dataKey="in_progress" name={STATUS_LABELS.in_progress} fill={STATUS_COLORS.in_progress} />
            <Bar dataKey="completed" name={STATUS_LABELS.completed} fill={STATUS_COLORS.completed} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* แถวที่ 3: ล่าสุด + Top Companies */}
      <div className="grid md:grid-cols-2 gap-4 mb-16">
        <div className="bg-white rounded-2xl shadow p-6">
          <h2 className="font-semibold text-xl mb-4">🕒 10 งานล่าสุด</h2>
          <ul className="space-y-3">
            {dashboard.latestRepairs.slice(0, 10).map(item => {
              const companyName = item.companyName?.trim() || '-'
              return (
                <li key={item.id} className="flex justify-between border-b pb-2">
                  <div>
                    <span className="font-medium text-gray-700">{companyName}</span>
                    <div className="text-xs text-gray-400">
                      {moment(item.createDate).format('DD MMMM YYYY เวลา HH:mm น.')}
                    </div>
                  </div>
                  <span className="text-sm font-medium text-primary-600">
                    {STATUS_LABELS[item.status] ?? item.status}
                  </span>
                </li>
              )
            })}

          </ul>
        </div>

        <div className="bg-white rounded-2xl shadow p-6">
          <h2 className="font-semibold text-xl mb-4">🏆 Top 10 ลูกค้า</h2>
          <ul className="space-y-3">
            {dashboard.topCompanies.slice(0, 10).map((c, idx) => (
              <li key={idx} className="flex justify-between border-b pb-2">
                <span className="text-gray-700">{c.companyName ?? 'ไม่ระบุ'}</span>
                <span className="text-primary-600 font-medium">{c._count.id} งาน</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </AdminLayout>
  )
}
