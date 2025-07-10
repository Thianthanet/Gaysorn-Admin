import axios from 'axios'
import React, { useEffect, useState } from 'react'

const Company = () => {
  const [company, setCompany] = useState([])
  const [building, setBuilding] = useState([])

  // ฟอร์ม state
  const [name, setName] = useState('')
  const [buildingId, setBuildingId] = useState('')

  useEffect(() => {
    handleGetCompany()
    handleGetBuilding()
  }, [])

  const handleGetCompany = async () => {
    try {
      const response = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/api/getCompany`)
      setCompany(response.data.data)
    } catch (error) {
      console.error('Error fetching company data:', error)
    }
  }

  const handleGetBuilding = async () => {
    try {
      const response = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/api/getBuilding`)
      const sorted = response.data.data.sort((a, b) => a.id - b.id)
      setBuilding(sorted)
    } catch (error) {
      console.error('Error fetching building data:', error)
    }
  }

  const getBuildingName = (buildingId) => {
    const found = building.find(b => b.id === buildingId)
    return found ? found.buildingName : 'ไม่พบอาคาร'
  }

  const handleCreateCompany = async () => {
    if (!name || !buildingId) {
      alert('กรุณากรอกชื่อบริษัทและเลือกอาคาร')
      return
    }

    try {
      await axios.post(`${import.meta.env.VITE_API_BASE_URL}/api/createCompany`, {
        companyName: name, // ชื่อต้องตรงกับ backend
        buildingId: Number(buildingId)
      })
      alert('สร้างบริษัทสำเร็จ')
      setName('')
      setBuildingId('')
      handleGetCompany() // รีเฟรชตาราง
    } catch (error) {
      console.error('Error creating company:', error)
    }
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">บริษัทและอาคาร</h1>

      {/* ✅ ฟอร์มสร้างบริษัท */}
      <div className="mb-6 p-4 border rounded-lg bg-white shadow-md">
        <h2 className="text-lg font-semibold mb-2">เพิ่มบริษัท</h2>
        <div className="flex flex-col gap-4">
          <input
            type="text"
            placeholder="ชื่อบริษัท"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="border p-2 rounded w-full"
          />
          <select
            value={buildingId}
            onChange={(e) => setBuildingId(e.target.value)}
            className="border p-2 rounded w-full"
          >
            <option value="">-- เลือกอาคาร --</option>
            {building.map(b => (
              <option key={b.id} value={b.id}>{b.buildingName}</option>
            ))}
          </select>
          <button
            onClick={handleCreateCompany}
            className="bg-blue-600 text-white px-2 py-2 rounded hover:bg-blue-700"
          >
            สร้างบริษัท
          </button>
        </div>
      </div>

      {/* ✅ ตารางแสดงบริษัท */}
      <div className="overflow-x-auto rounded shadow-md">
        <table className="min-w-full border border-gray-200 divide-y divide-gray-200">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">ID</th>
              <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">ชื่อบริษัท</th>
              <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">ชื่ออาคาร</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {company.map((item) => (
              <tr key={item.id} className="hover:bg-gray-50">
                <td className="px-4 py-2 text-sm text-gray-700">{item.id}</td>
                <td className="px-4 py-2 text-sm text-gray-700">{item.companyName}</td>
                <td className="px-4 py-2 text-sm text-gray-700">{getBuildingName(item.buildingId)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default Company
