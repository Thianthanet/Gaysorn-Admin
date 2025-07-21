import axios from 'axios'
import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import AdminLayout from './AdminLayout'

const EditAdmin = () => {
    const { id } = useParams()
    const [username, setUsername] = useState('')
    const [password, setPassword] = useState('')

    useEffect(() => {
        handleGetAdminById()
    }, [])

    const handleGetAdminById = async () => {
        try {
            const response = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/api/getAdminById/${id}`)
            const data = response.data.data
            setUsername(data.username)
            setPassword(data.password)
        } catch (error) {
            console.error(error)
        }
    }

    const handleUpdateAdmin = async () => {
        try {
            await axios.patch(`${import.meta.env.VITE_API_BASE_URL}/api/updateAdmin`, {
                id,
                username,
                password
            })
            alert('อัปเดตสำเร็จ')
        } catch (error) {
            console.error(error)
            alert('เกิดข้อผิดพลาด')
        }
    }

    return (
        <AdminLayout>
            <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded-lg shadow-md">
                <h2 className="text-xl font-bold mb-4 text-[#BC9D72]">แก้ไขผู้ดูแลระบบ</h2>

                <div className="mb-4">
                    <label className="block text-[#BC9D72] font-semibold mb-1">Username</label>
                    <input
                        type="text"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        className="w-full border border-[#BC9D72] rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#BC9D72]"
                    />
                </div>

                <div className="mb-4">
                    <label className="block text-[#BC9D72] font-semibold mb-1">Password</label>
                    <input
                        type="text"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full border border-[#BC9D72] rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#BC9D72]"
                    />
                </div>

                <button
                    onClick={handleUpdateAdmin}
                    className="w-full bg-[#BC9D72] text-white py-2 px-4 rounded-md hover:bg-opacity-90 transition duration-300"
                >
                    บันทึก
                </button>
            </div>
        </AdminLayout>
    )
}

export default EditAdmin
