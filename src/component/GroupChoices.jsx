import axios from 'axios'
import React, { useEffect, useState } from 'react'
import { Edit, ToggleLeft, ToggleRight } from 'lucide-react'

const GroupChoices = () => {
  const [groupChoices, setGroupChoices] = useState([])
  const [editingId, setEditingId] = useState(null)
  const [editingName, setEditingName] = useState('')
  const [newChoiceName, setNewChoiceName] = useState('') // <-- สำหรับสร้างใหม่

  useEffect(() => {
    handleGetGroupChoices()
  }, [])

  const handleGetGroupChoices = async () => {
    try {
      const response = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/api/getChoices`)
      setGroupChoices(response.data.data)
    } catch (error) {
      console.error('Error fetching group choices:', error)
    }
  }

  const handleEdit = (id, currentName) => {
    setEditingId(id)
    setEditingName(currentName)
  }

  const handleUpdateGroupChoice = async () => {
    try {
      await axios.patch(`${import.meta.env.VITE_API_BASE_URL}/api/updateChoice`, {
        id: editingId,
        choiceName: editingName
      })
      setEditingId(null)
      setEditingName('')
      handleGetGroupChoices()
    } catch (error) {
      console.error(error)
    }
  }

  const handleCreateChoice = async () => {
    if (!newChoiceName.trim()) return alert('กรุณากรอกชื่อกลุ่มงาน')
    try {
      await axios.post(`${import.meta.env.VITE_API_BASE_URL}/api/createRepairChoice`, {
        choiceName: newChoiceName
      })
      setNewChoiceName('')
      handleGetGroupChoices()
    } catch (error) {
      console.error(error)
    }
  }

  const handleToggleStatus = async (id, isDelete) => {
    try {
      await axios.patch(`${import.meta.env.VITE_API_BASE_URL}/api/useChoice`, {
        id,
        isDelete: !isDelete
      })
      handleGetGroupChoices()
    } catch (error) {
      console.error('Error toggling status:', error)
    }
  }

  return (
    <div className="bg-white p-4 rounded-lg shadow-md">
      <h2 className="text-2xl font-semibold mb-4">กลุ่มงาน</h2>

      {/* Form สร้างกลุ่มงาน */}
      <div className="flex items-center gap-2 mb-4">
        <input
          type="text"
          value={newChoiceName}
          onChange={(e) => setNewChoiceName(e.target.value)}
          placeholder="ชื่อกลุ่มงานใหม่"
          className="border px-3 py-2 rounded w-72"
        />
        <button
          onClick={handleCreateChoice}
          className="bg-green-500 text-white px-2 py-2 rounded hover:bg-green-600"
        >
          เพิ่มกลุ่มงาน
        </button>
      </div>

      {/* Container scroll เฉพาะเมื่อเกิน 12 */}
      <div className={groupChoices.length > 11 ? 'max-h-[550px] overflow-y-auto' : ''}>
        <table className="min-w-full border border-gray-200">
          <thead className="bg-gray-100 sticky top-0">
            <tr>
              <th className="px-4 py-2 text-left border-b">ลำดับ</th>
              <th className="px-4 py-2 text-left border-b">ชื่อกลุ่มงาน</th>
              <th className="px-4 py-2 text-center border-b">การจัดการ</th>
            </tr>
          </thead>
          <tbody>
            {groupChoices.map((choice, index) => (
              <tr key={choice.id} className="hover:bg-gray-50">
                <td className="px-4 py-2 border-b">{index + 1}</td>
                <td className="px-4 py-2 border-b">
                  {editingId === choice.id ? (
                    <input
                      type="text"
                      value={editingName}
                      onChange={(e) => setEditingName(e.target.value)}
                      className="border px-2 py-1 rounded w-full"
                    />
                  ) : (
                    choice.choiceName
                  )}
                </td>
                <td className="px-4 py-2 border-b text-center">
                  <div className="flex items-center justify-center gap-4">
                    {editingId === choice.id ? (
                      <button
                        onClick={handleUpdateGroupChoice}
                        className="text-green-500 hover:text-green-700 text-sm border px-2 py-1 rounded"
                      >
                        บันทึก
                      </button>
                    ) : (
                      <button
                        onClick={() => handleEdit(choice.id, choice.choiceName)}
                        className="text-blue-500 hover:text-blue-700"
                      >
                        <Edit size={20} />
                      </button>
                    )}

                    <button onClick={() => handleToggleStatus(choice.id, choice.isDelete)}>
                      {!choice.isDelete ? (
                        <ToggleRight size={24} className="text-green-500" />
                      ) : (
                        <ToggleLeft size={24} className="text-red-500" />
                      )}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default GroupChoices
