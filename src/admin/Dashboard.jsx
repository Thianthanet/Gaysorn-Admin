// src/pages/Dashboard.jsx
import React from 'react'
import AdminLayout from './AdminLayout'

const Dashboard = () => {
  return (
    <AdminLayout>
      <div className="space-y-4">
        <h2 className="text-2xl font-bold">Dashboard</h2>
        <p>Welcome to the Admin Dashboard.</p>
      </div>
    </AdminLayout>
  )
}

export default Dashboard
