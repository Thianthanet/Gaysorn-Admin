import { Menu, X } from 'lucide-react'
import React, { useState } from 'react'

const AdminLayout = ({ children }) => {
    const [sidebarOpen, setSidebarOpen] = useState(false)
    return (
        <div className='flex flex-col md:flex-row h-screen'>
            {/* Mobile Topbar */}
            <div className='md:hidden flex items-center justify-between bg-[#F5F3EE] p-4 border-b border-[#BC9D72]'>
                <div className='text-xl font-bold'>Admin</div>
                <button onClick={() => setSidebarOpen(!sidebarOpen)}>
                    {sidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                </button>
            </div>
            {/* Sidebar */}
            <aside
                className={`${sidebarOpen ? 'block' : 'hidden'} 
        md:block w-full md:w-64 bg-[#F5F3EE] border-r border-[#BC9D72] p-4 text-[#837958] flex-shrink-0 h-auto md:h-screen`}>
                <div className="p-4 text-2xl font-bold border-b border-gray-700 hidden md:block">
                    Admin
                </div>
                <nav className='flex flex-col p-4 space-y-2'>
                    <a href="/dashboard" className='hover:bg-[#BC9D72] p-2 rounded'>Dashboard</a>
                    <a href="/job" className='hover:bg-[#BC9D72] p-2 rounded'>Job</a>
                    <a href="/report" className='hover:bg-[#BC9D72] p-2 rounded'>Report</a>
                    <a href="/user" className='hover:bg-[#BC9D72] p-2 rounded'>User</a>
                    <a href="/setting" className='hover:bg-[#BC9D72] p-2 rounded'>Setting</a>
                </nav>
            </aside>

            {/* Main */}
            <div className="flex-1 flex flex-col bg-gray-100 overflow-auto">
                {/* Navbar */}
                <header className="bg-white shadow py-4 px-5 flex justify-between items-center">
                    <h1 className="text-xl font-semibold">Admin Panel</h1>
                </header>

                {/* Content */}
                <main className="flex-1 p-6 overflow-y-auto">{children}</main>

                {/* Footer */}
                <footer className="bg-white shadow p-4 text-center text-sm text-gray-600">
                    © 2025 DevX (Thailand) Co., Ltd.
                </footer>
            </div>
        </div>
    )
}

export default AdminLayout