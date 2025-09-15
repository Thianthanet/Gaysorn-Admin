import axios from 'axios'
import React, { useEffect, useState } from 'react'
import { Edit, SquarePlus, Trash2 } from 'lucide-react'
import { FaToggleOff, FaToggleOn } from 'react-icons/fa'

const GroupChoices = () => {
  const [groupChoices, setGroupChoices] = useState([])
  const [editingId, setEditingId] = useState(null)
  const [editingName, setEditingName] = useState('')
  const [newChoiceName, setNewChoiceName] = useState('') // สำหรับสร้างใหม่
  // เพิ่ม state สำหรับ editingNumber
  const [editingNumber, setEditingNumber] = useState('')

  useEffect(() => {
    handleGetGroupChoices()
  }, [])

  const handleGetGroupChoices = async () => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_API_BASE_URL}/api/getChoices`
      )
      setGroupChoices(response.data.data)
    } catch (error) {
      console.error('Error fetching group choices:', error)
    }
  }

  const handleEdit = (id, currentName, currentNumber) => {
    setEditingId(id)
    setEditingName(currentName)
    setEditingNumber(currentNumber ?? '')
  }

  const handleUpdateGroupChoice = async () => {
    try {
      await axios.patch(`${import.meta.env.VITE_API_BASE_URL}/api/updateChoice`, {
        id: editingId,
        choiceName: editingName,
        number: editingNumber
      })
      setEditingId(null)
      setEditingName('')
      setEditingNumber('')
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

  // ✅ toggle ที่รับ field เข้ามา เพื่อไม่ให้กระทบ field อื่น
  const handleToggleStatus = async (id, currentValue, field) => {
    try {
      await axios.patch(`${import.meta.env.VITE_API_BASE_URL}/api/useChoice`, {
        id,
        [field]: !currentValue
      })
      handleGetGroupChoices()
    } catch (error) {
      console.error('Error toggling status:', error)
    }
  }

  const handleDeleteChoiceFake = async (id) => {
    try {
      await axios.patch(
        `${import.meta.env.VITE_API_BASE_URL}/api/deleteChoiceFake/${id}`
      )
      handleGetGroupChoices()
    } catch (error) {
      console.error(error)
    }
  }

  return (
    <div>
      <h2 className="text-2xl font-semibold mb-4">กลุ่มงาน</h2>

      {/* Form สร้างกลุ่มงาน */}
      <div className="flex items-center gap-2 mb-4">
        <input
          type="text"
          value={newChoiceName}
          onChange={(e) => setNewChoiceName(e.target.value)}
          placeholder="ชื่อกลุ่มงานใหม่"
          className="border border-[#837958] px-3 py-2 rounded w-72 flex-1"
        />
        <button
          onClick={handleCreateChoice}
          className="bg-[#837958] text-white px-2 py-2 rounded hover:bg-[#BC9D72] flex gap-2"
        >
          <SquarePlus /> เพิ่มกลุ่มงาน
        </button>
      </div>

      {/* Container scroll เฉพาะเมื่อเกิน 12 */}
      <div className={groupChoices.length > 11 ? 'max-h-[550px] overflow-y-auto' : ''}>
        <table className="min-w-full border border-gray-200">
          <thead className="bg-gray-100 sticky top-0">
            <tr>
              <th className="px-4 py-2 text-left border-b bg-[#BC9D72]/50">ลำดับ</th>
              <th className="px-4 py-2 text-left border-b bg-[#BC9D72]/50">ชื่อกลุ่มงาน</th>
              <th className="px-4 py-2 text-center border-b bg-[#BC9D72]/50">ลูกค้า</th>
              <th className="px-4 py-2 text-center border-b bg-[#BC9D72]/50">พนักงาน</th>
              <th className="px-4 py-2 text-center border-b bg-[#BC9D72]/50">การจัดการ</th>
            </tr>
          </thead>
          <tbody>
            {groupChoices
              .filter((choice) => !choice.fakeDelete)
              .sort((a, b) => {
                // แปลง number เป็นตัวเลข
                const numA = a.number !== null && a.number !== '' ? parseFloat(a.number) : null
                const numB = b.number !== null && b.number !== '' ? parseFloat(b.number) : null

                if (numA !== null && numB !== null) return numA - numB // ทั้งคู่มี number
                if (numA !== null) return -1 // a มี number b ไม่มี → a ก่อน
                if (numB !== null) return 1  // b มี number a ไม่มี → b ก่อน
                return a.id - b.id           // ไม่มี number ทั้งคู่ → เรียงตาม id
              })
              .map((choice, index) => (
                <tr key={choice.id} className="bg-white hover:bg-gray-50">
                  {/* <td className="px-4 py-2 border-b">{index + 1}</td> */}
                  <td className="px-4 py-2 border-b">
                    {choice.number}
                  </td>
                  <td className="px-4 py-2 border-b">
                    {editingId === choice.id ? (
                      // <input
                      //   type="text"
                      //   value={editingName}
                      //   onChange={(e) => setEditingName(e.target.value)}
                      //   className="border px-2 py-1 rounded w-full"
                      // />

                      <div className="flex gap-2">
                        <input
                          type="number"
                          value={editingNumber}
                          onChange={(e) => setEditingNumber(e.target.value)}
                          className="border px-2 py-1 rounded w-24"
                          placeholder="ลำดับ"
                        />
                        <input
                          type="text"
                          value={editingName}
                          onChange={(e) => setEditingName(e.target.value)}
                          className="border px-2 py-1 rounded w-full"
                        />
                      </div>
                    ) : (
                      choice.choiceName
                      // <>
                      //   {choice.choiceName} {choice.number ? `(${choice.number})` : ''}
                      // </>
                    )}
                  </td>

                  {/* ลูกค้า */}
                  <td className="px-4 py-2 border-b text-center">
                    <button
                      onClick={() =>
                        handleToggleStatus(choice.id, choice.customer, 'customer')
                      }
                    >
                      {!choice.customer ? ( // false = ทำงาน
                        <FaToggleOn size={24} className="text-green-500" />
                      ) : (
                        <FaToggleOff size={24} className="text-red-500" />
                      )}
                    </button>
                  </td>

                  {/* พนักงาน */}
                  <td className="px-4 py-2 border-b text-center">
                    <button
                      onClick={() =>
                        handleToggleStatus(choice.id, choice.technician, 'technician')
                      }
                    >
                      {!choice.technician ? ( // false = ทำงาน
                        <FaToggleOn size={24} className="text-green-500" />
                      ) : (
                        <FaToggleOff size={24} className="text-red-500" />
                      )}
                    </button>
                  </td>

                  {/* การจัดการ */}
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
                          className="text-[#837958] hover:text-[#BC9D72]"
                        >
                          <Edit size={20} />
                        </button>
                      )}

                      <button
                        onClick={() =>
                          handleToggleStatus(choice.id, choice.isDelete, 'isDelete')
                        }
                      >
                        {!choice.isDelete ? ( // false = ทำงาน
                          <FaToggleOn size={24} className="text-green-500" />
                        ) : (
                          <FaToggleOff size={24} className="text-red-500" />
                        )}
                      </button>

                      <button onClick={() => handleDeleteChoiceFake(choice.id)}>
                        <Trash2 className="text-red-500" />
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
