import React, { useEffect, useState } from "react";
import AdminLayout from "./AdminLayout";
import axios from "axios";
import { useNavigate } from "react-router-dom";

//component
import JobFiltersBar from "../component/JobFiltersBar";

const Report = () => {
  const [customer, setCustomer] = useState([]);
  const [technician, setTechnician] = useState([]);
  const [activeTab, setActiveTab] = useState("customer"); // ✅ state สำหรับสลับ tab
  const navigate = useNavigate();

  useEffect(() => {
    handleGetCompanyReport();
    handleGetTechnicianReport();
  }, []);

  const handleGetCompanyReport = async () => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_API_BASE_URL}/api/getCompanyRepairCount`
      );
      console.log(response.data.data);
      setCustomer(response.data.data);
    } catch (error) {
      console.error("Error fetching company report:", error);
    }
  };

  const handleNavigateToCustomerReport = (companyId) => {
    try {
      navigate(`/reportCustomer/${companyId}`);
    } catch (error) {
      console.error("Error navigating to customer report:", error);
    }
  };

  const handleNavigateToTechnicianReport = (techCompleteUserId) => {
    try {
      navigate(`/reportTechnician/${techCompleteUserId}`);
    } catch (error) {
      console.error("Error navigating to technician report:", error);
    }
  };

  const handleGetTechnicianReport = async () => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_API_BASE_URL}/api/getTechnicianReport`
      );
      console.log(response.data.data);
      setTechnician(response.data.data);
    } catch (error) {
      console.error("Error fetching technician report:", error);
    }
  };

  return (
    <AdminLayout>
      <div className="p-6">
        {/* <JobFiltersBar
          searchInput={searchInput}
          setSearchInput={setSearchInput}
          handleSearch={handleSearch}
          selectedBuilding={selectedBuilding}
          setSelectedBuilding={setSelectedBuilding}
          building={building}
          selectedStatus={selectedStatus}
          setSelectedStatus={setSelectedStatus}
          showFilters={showFilters}
          setShowFilters={setShowFilters}
          exportToExcel={exportToExcel}
        /> */}

        {/* ✅ ปุ่มเลือก */}
        <div className="mb-4 flex gap-4">
          <button
            onClick={() => setActiveTab("customer")}
            className={`px-4 py-2 rounded ${
              activeTab === "customer"
                ? "bg-[#BC9D72] text-white"
                : "bg-gray-200"
            }`}
          >
            ลูกค้า
          </button>
          <button
            onClick={() => setActiveTab("technician")}
            className={`px-4 py-2 rounded ${
              activeTab === "technician"
                ? "bg-[#BC9D72] text-white"
                : "bg-gray-200"
            }`}
          >
            พนักงาน
          </button>
        </div>

        <div className="overflow-x-auto">
          {activeTab === "customer" && (
            <table className="min-w-full bg-white border border-gray-300 rounded-lg">
              <thead>
                <tr className="bg-gray-100">
                  <th className="py-2 px-4 bg-[#BC9D72]/50 border-b text-left">
                    ลำดับ
                  </th>
                  <th className="py-2 px-4 bg-[#BC9D72]/50 border-b text-left">
                    ชื่อบริษัท
                  </th>
                  <th className="py-2 px-4 bg-[#BC9D72]/50 border-b text-left">
                    อาคาร
                  </th>
                  <th className="py-2 px-4 bg-[#BC9D72]/50 border-b text-left">
                    จำนวนงานที่แจ้งซ่อม
                  </th>
                  <th className="py-2 px-4 bg-[#BC9D72]/50 border-b text-left">
                    รอดำเนินการ
                  </th>
                  <th className="py-2 px-4 bg-[#BC9D72]/50 border-b text-left">
                    อยู่ระหว่างดำเนินการ
                  </th>
                  <th className="py-2 px-4 bg-[#BC9D72]/50 border-b text-left">
                    เสร็จสิ้น
                  </th>
                  <th className="py-2 px-4 bg-[#BC9D72]/50 border-b text-left">
                    เปอร์เซ็นต์สำเร็จ
                  </th>
                </tr>
              </thead>
              <tbody>
                {customer.map((item, index) => (
                  <tr
                    key={index}
                    className="hover:bg-gray-50"
                    onClick={() =>
                      handleNavigateToCustomerReport(item.companyId)
                    }
                  >
                    <td className="py-2 px-4 border-b">{index + 1}</td>
                    <td className="py-2 px-4 border-b">{item.companyName}</td>
                    <td className="py-2 px-4 border-b">{item.buildingName}</td>
                    <td className="py-2 px-4 border-b">{item.total}</td>
                    <td className="py-2 px-4 border-b">{item.pending}</td>
                    <td className="py-2 px-4 border-b">{item.in_progress}</td>
                    <td className="py-2 px-4 border-b">{item.completed}</td>
                    <td className="py-2 px-4 border-b">{item.completedPercent}</td>
                  </tr>
                ))}
                {customer.length === 0 && (
                  <tr>
                    <td colSpan="4" className="text-center py-4">
                      ไม่มีข้อมูล
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}

          {activeTab === "technician" && (
            <table className="min-w-full bg-white border border-gray-300 rounded-lg">
              <thead>
                <tr className="bg-gray-100">
                  <th className="py-2 px-4 bg-[#BC9D72]/50 border-b text-left">
                    ลำดับ
                  </th>
                  <th className="py-2 px-4 bg-[#BC9D72]/50 border-b text-left">
                    ชื่อพนักงาน
                  </th>
                  <th className="py-2 px-4 bg-[#BC9D72]/50 border-b text-left">
                    สังกัด
                  </th>
                  <th className="py-2 px-4 bg-[#BC9D72]/50 border-b text-left">
                    งานที่รับ
                  </th>
                  <th className="py-2 px-4 bg-[#BC9D72]/50 border-b text-left">
                    เสร็จสิ้น
                  </th>
                  <th className="py-2 px-4 bg-[#BC9D72]/50 border-b text-left">
                    เปอร์เซ็นต์จบงาน
                  </th>
                </tr>
              </thead>
              <tbody>
                {technician.map((item, index) => (
                  <tr
                    key={index}
                    className="hover:bg-gray-50"
                    onClick={() =>
                      handleNavigateToTechnicianReport(item.techUserId)
                    }
                  >
                    <td className="py-2 px-4 border-b">{index + 1}</td>
                    <td className="py-2 px-4 border-b">
                      {item.technicianName}
                    </td>
                    <td className="py-2 px-4 border-b">
                      {Array.isArray(item.buildings)
                        ? item.buildings.join(", ")
                        : item.buildings}
                    </td>
                    <td className="py-2 px-4 border-b">{item.acceptedJobs}</td>
                    <td className="py-2 px-4 border-b">{item.completedJobs}</td>
                    <td className="py-2 px-4 border-b">{item.successRate || "0"}%</td>
                  </tr>
                ))}
                {technician.length === 0 && (
                  <tr>
                    <td colSpan="3" className="text-center py-4">
                      ไม่มีข้อมูล
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </AdminLayout>
  );
};

export default Report;
