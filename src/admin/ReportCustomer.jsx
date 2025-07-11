import React, { useEffect } from 'react'
import AdminLayout from './AdminLayout'
import { useParams } from 'react-router-dom'
import axios from 'axios'

const ReportCustomer = () => {
    const { id } = useParams()

    useEffect(() => {
        handleGetCompanyReport()
    }, [])

    const handleGetCompanyReport = async () => {
        try {
            const response = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/api/getCompanyAllRepair/${id}`)
            console.log(response.data.data)
        } catch (error) {
            console.error('Error fetching company report:', error)
        }
    }
  return (
    <AdminLayout>
        <div>ReportCustomer</div>
    </AdminLayout>
  )
}

export default ReportCustomer