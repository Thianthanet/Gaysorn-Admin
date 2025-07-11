import React, { useEffect, useState } from 'react'
import AdminLayout from './AdminLayout'
import axios from 'axios'

const Jobs = () => {
  const [jobs, setJobs] = useState([])

  useEffect(() => {
    handleGetAllJobs()
  }, [])

  const handleGetAllJobs = async () => {
    try {
      const response = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/api/getAllRepair`)
      console.log('Jobs data:', response.data.data)
      setJobs(response.data.data)
    } catch (error) {
      console.error('Error fetching jobs:', error)
    }
  }

  return (
    <AdminLayout>
      <div className="p-4">
        <h2 className="text-xl font-bold mb-4">งานแจ้งซ่อมทั้งหมด</h2>
        <table className="min-w-full border border-gray-300">
          <thead className="bg-gray-100">
            <tr>
              <th className="bg-[#BC9D72] px-4 py-2">ลำดับ</th>
              <th className="bg-[#BC9D72] px-4 py-2">สถานที่ตั้ง</th>
              <th className="bg-[#BC9D72] px-4 py-2">ผู้ใช้</th>
              <th className="bg-[#BC9D72] px-4 py-2">วันที่แจ้ง</th>
              <th className="bg-[#BC9D72] px-4 py-2">ผู้ดำเนินการ</th>
              <th className="bg-[#BC9D72] px-4 py-2">วันที่เริ่มงาน</th>
              <th className="bg-[#BC9D72] px-4 py-2">สถานะ</th>
              <th className="bg-[#BC9D72] px-4 py-2">วันที่งานแล้วเสร็จ</th>
            </tr>
          </thead>
          <tbody>
            {jobs.map((job, index) => (
              <tr key={job.id} className="text-center">
                <td className="border px-4 py-2">{index + 1}</td>
                <td className="border px-4 py-2">
                  {job.building?.buildingName || '-'}, {job.company?.companyName || '-'}, {job.unit?.unitName || '-'}
                </td>
                <td className="border px-4 py-2">{job.customer?.name || '-'}</td>
                <td className="border px-4 py-2">
                  {new Date(job.createDate).toLocaleDateString('th-TH')}
                </td>
                <td className="border px-4 py-2">{job.acceptedBy?.name || '-'} <br /> {job.completedBy?.name || '-'}</td>
                <td className="border px-4 py-2">
                  {/* {job.workStar ? new Date(job.workStar).toLocaleDateString('th-TH') : '-'} */}
                  {job.createDate ? new Date(job.createDate).toLocaleDateString('th-TH') : '-'}
                </td>
                <td
                  className={`border px-4 py-2 ${job.status === 'pending'
                      ? 'text-red-500'
                      : job.status === 'in_progress'
                        ? 'text-yellow-500'
                        : job.status === 'completed'
                          ? 'text-green-500'
                          : ''
                    }`}
                >
                  {job.status === 'pending'
                    ? 'รอดำเนินการ'
                    : job.status === 'in_progress'
                      ? 'ระหว่างดำเนินการ'
                      : job.status === 'completed'
                        ? 'เสร็จสิ้น'
                        : job.status}
                </td>
                <td className="border px-4 py-2">
                  {job.completeDate ? new Date(job.completeDate).toLocaleDateString('th-TH') : '-'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </AdminLayout>
  )
}

export default Jobs
