import axios from 'axios'
import React, { useEffect, useState } from 'react'

const Unit = () => {
  const [units, setUnits] = useState([])
  const [companies, setCompanies] = useState([])

  // 🟢 เพิ่ม state สำหรับฟอร์ม
  const [unitName, setUnitName] = useState('')
  const [companyId, setCompanyId] = useState('')

  useEffect(() => {
    handleGetUnits()
    handleGetCompanies()
  }, [])

  const handleGetUnits = async () => {
    try {
      const response = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/api/getUnits`)
      setUnits(response.data.data)
    } catch (error) {
      console.error('Error fetching unit data:', error)
    }
  }

  const handleGetCompanies = async () => {
    try {
      const response = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/api/getCompany`)
      setCompanies(response.data.data)
    } catch (error) {
      console.error('Error fetching company data:', error)
    }
  }

  const handleCreateUnit = async (e) => {
    e.preventDefault()
    try {
      await axios.post(`${import.meta.env.VITE_API_BASE_URL}/api/createUnit`, {
        unitName,
        companyId: Number(companyId), // 🟢 แปลงเป็นตัวเลขด้วย
      })
      // รีเซ็ตฟอร์มและโหลดข้อมูลใหม่
      setUnitName('')
      setCompanyId('')
      handleGetUnits()
    } catch (error) {
      console.error('Error creating unit:', error)
    }
  }

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">ยูนิต</h2>

      {/* ✅ ฟอร์มสร้างยูนิต */}
      <form onSubmit={handleCreateUnit} className="bg-white shadow-md rounded-lg p-4 mb-6">
        <div className="mb-4">
          <label className="block text-gray-700 mb-1">เพิ่มยูนิต</label>
          <input
            type="text"
            value={unitName}
            onChange={(e) => setUnitName(e.target.value)}
            required
            className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring focus:border-blue-300"
            placeholder="ชื่อยูนิต"
          />
        </div>
        <div className="mb-4">
          <label className="block text-gray-700 mb-1">เลือกบริษัท</label>
          <select
            value={companyId}
            onChange={(e) => setCompanyId(e.target.value)}
            required
            className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring focus:border-blue-300"
          >
            <option value="">-- เลือกบริษัท --</option>
            {companies.map((company) => (
              <option key={company.id} value={company.id}>
                {company.companyName}
              </option>
            ))}
          </select>
        </div>
        <button
          type="submit"
          className="bg-blue-600 hover:bg-blue-700 text-white px-2 py-2 w-full rounded"
        >
          สร้างยูนิต
        </button>
      </form>

      {/* ✅ ตารางยูนิต */}
      <div className="bg-white shadow-lg rounded-xl overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">ลำดับ</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">ยูนิต</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">บริษัท</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-100">
            {units.map((unit, index) => (
              <tr key={unit.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 text-sm text-gray-900">{index + 1}</td>
                <td className="px-6 py-4 text-sm text-gray-900">{unit.unitName}</td>
                <td className="px-6 py-4 text-sm text-gray-900">
                  {companies.find((c) => c.id === unit.companyId)?.companyName || 'ไม่พบบริษัท'}
                </td>
              </tr>
            ))}
            {units.length === 0 && (
              <tr>
                <td colSpan="3" className="px-6 py-4 text-center text-gray-500">
                  ไม่พบข้อมูลยูนิต
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default Unit
