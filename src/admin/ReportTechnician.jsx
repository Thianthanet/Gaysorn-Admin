import React, { useEffect, useState } from 'react'
import AdminLayout from './AdminLayout'
import { useParams } from 'react-router-dom'
import axios from 'axios'

const ReportTechnician = () => {
    const { userId } = useParams()
    const [technicianReport, setTechnicianReport] = useState([])

    useEffect(() => {
        handleGetTechnicianReport()
    }, [])

    const handleGetTechnicianReport = async () => {
        try {
            const response = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/api/getTechReportById/${userId}`)
            console.log(response.data.data)
            setTechnicianReport(response.data.data)
        } catch (error) {
            console.error('Error fetching technician report:', error)
        }
    }
  return (
    <AdminLayout>
        <div>ReportTechnician</div>
    </AdminLayout>
  )
}

export default ReportTechnician