import { LogOut, Menu, X } from "lucide-react";
import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import LogoHeader from "../assets/LogoHeader.png";

const AdminLayout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const currentPath = location.pathname;
  const navigate = useNavigate();

  const navItems = [
    { label: "Dashboard", href: "/dashboard" },
    { label: "Job", href: "/job" },
    { label: "Report", href: "/report" },
    { label: "User", href: "/user" },
    { label: "Setting", href: "/setting" },
  ];

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  return (
    <div className="flex flex-col md:flex-row h-screen">
      {/* Mobile Topbar */}
      <div className="md:hidden flex items-center justify-between bg-[#F5F3EE] p-4 border-b border-[#BC9D72]">
        <div className="text-xl font-bold">Admin</div>
        <button onClick={() => setSidebarOpen(!sidebarOpen)}>
          {sidebarOpen ? (
            <X className="w-6 h-6" />
          ) : (
            <Menu className="w-6 h-6" />
          )}
        </button>
      </div>

      {/* Sidebar */}
      <aside
        className={`${sidebarOpen ? "block" : "hidden"} 
                            md:block w-full md:w-64 bg-[#F5F3EE] border-r pt-4 text-[#837958] flex-shrink-0 h-auto md:h-screen`}
      >
        <img src={LogoHeader} alt="Logo" className="w-16 mx-auto mb-2 mt-2" />
        <nav className="flex flex-col pt-4 pb-4">
          {navItems.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className={`p-2 pl-8 rounded transition-colors duration-300 font-bold text-[16px]
                                ${
                                  currentPath === item.href
                                    ? "bg-[#837958] bg-opacity-50 text-white"
                                    : "hover:bg-[#c9bd99] hover:text-white"
                                }
                                `}
            >
              {item.label}
            </a>
          ))}

          {/* ปุ่มออกจากระบบ */}
          <hr />
          <button
            onClick={handleLogout}
            className="mt-2 p-2 pl-8 flex items-center gap-2 text-[#837958] hover:bg-[#c9bd99] hover:text-white  rounded font-bold"
          >
            {/* <LogOut className="w-5 h-5" /> */}
            Logout
          </button>
        </nav>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col bg-white overflow-auto">
        {/* Navbar */}
        {/* <header className="bg-white shadow py-4 px-5 flex justify-between items-center">
                    <h1 className="text-xl font-semibold">Admin Panel</h1>
                </header> */}

        {/* Content */}
        {/* <main className="flex-1 p-4 overflow-y-auto">{children}</main> */}
        <div className="flex-1 overflow-y-auto">
          {/* Sticky header แยกออกมาที่นี่ */}
          {/* หรือถ้าต้องให้ sticky อยู่ใน children ให้ลด padding บน */}
          <main className="p-4">{children}</main>
        </div>

        {/* Footer */}
        <footer className="bg-white shadow p-3 text-center text-sm text-gray-600 border-t-[2px]">
          © 2025 DevX (Thailand) Co., Ltd.
        </footer>
      </div>
    </div>
  );
};

export default AdminLayout;
