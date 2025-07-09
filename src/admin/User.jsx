import React, { useEffect, useState } from 'react';
import AdminLayout from './AdminLayout';
import axios from 'axios';
import { FaLine } from 'react-icons/fa';
import { UserPen, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const User = () => {
  const [customers, setCustomers] = useState([]);
  const [technicians, setTechnicians] = useState([]);
  const [activeTab, setActiveTab] = useState('customers');
  const [waitForApprove, setWaitForApprove] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate()

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        if (activeTab === 'customers') {
          const response = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/api/allCustomer`);
          setCustomers(response.data.data);
        } else if (activeTab === 'technicians') {
          const response = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/api/getTech`);
          setTechnicians(response.data.data);
        } else if (activeTab === 'waitForApprove') {
          await handleGetWaitForApprove()
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [activeTab]);

  useEffect(() => {
    handleGetWaitForApprove()
  }, [])

  const handleGetWaitForApprove = async () => {
    try {
      const response = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/api/waitApprove`);
      console.log('Wait for approve data:', response.data.data);
      setWaitForApprove(response.data.data);
    } catch (error) {
      console.error('Error fetching wait for approve data:', error);
    }
  }

  const handleApprove = async (userId) => {
    try {
      const response = await axios.post(`${import.meta.env.VITE_API_BASE_URL}/api/approve/${userId}`);
      console.log('Approve response:', response.data);
      if (response.data) {
        // Refresh the wait for approve list
        await handleGetWaitForApprove();
        alert('User approved successfully');
      } else {
        alert('Failed to approve user');
      }
    } catch (error) {
      console.error('Error approving user:', error);
    }
  }

  const getUniqueBuildings = (techBuilds) => {
    if (!techBuilds || techBuilds.length === 0) return [];

    const uniqueBuildings = [];
    const seen = new Set();

    techBuilds.forEach(build => {
      const buildingName = build.building?.buildingName;
      if (buildingName && !seen.has(buildingName)) {
        seen.add(buildingName);
        uniqueBuildings.push(buildingName);
      }
    });

    return uniqueBuildings.slice(0, 3);
  };

  const handleEditTechnician = (userId) => {
    navigate(`/editTechnician/${userId}`);
  };

  const handleEditCustomer = (userId) => {
    navigate(`/editCustomer/${userId}`);
  }

  const handleDeleteTechnician = async (id) => {
    try {
      const response = await axios.delete(`${import.meta.env.VITE_API_BASE_URL}/api/deleteTechnician/${id}`);
      console.log('Delete response:', response.data);
      window.location.reload(); // Refresh the page to reflect changes
      alert("Delete technician successfully");
    } catch (error) {
      console.error('Error deleting technician:', error);
    }
  }

  const handleDeleteCustomer = async (id) => {
    try {
      const response =await axios.delete(`${import.meta.env.VITE_API_BASE_URL}/api/deleteCustomer/${id}`);
      console.log('Delete response:', response.data);
      alert("Delete customer successfully");
      window.location.reload(); // Refresh the page to reflect changes
    } catch (error) {
      console.error('Error deleting customer:', error);
    }
  };

  return (
    <AdminLayout>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-6">User Management</h1>

        {/* Tab Navigation */}
        <div className="flex mb-6 border-b border-gray-200">
          <button
            className={`py-2 px-4 font-medium ${activeTab === 'customers' ? 'text-[#BC9D72] border-b-2 border-[#BC9D72]' : 'text-gray-500'}`}
            onClick={() => setActiveTab('customers')}
          >
            ลูกค้า
          </button>
          <button
            className={`py-2 px-4 font-medium ${activeTab === 'waitApprove' ? 'text-[#BC9D72] border-b-2 border-[#BC9D72]' : 'text-gray-500'}`}
            onClick={() => setActiveTab('waitApprove')}
          >
            รออนุมัติ ({waitForApprove.length})
          </button>
          <button
            className={`py-2 px-4 font-medium ${activeTab === 'technicians' ? 'text-[#BC9D72] border-b-2 border-[#BC9D72]' : 'text-gray-500'}`}
            onClick={() => setActiveTab('technicians')}
          >
            พนักงาน
          </button>
          <button
            className="ml-auto py-2 px-4 bg-[#BC9D72] text-white font-medium rounded hover:bg-[#a88f5c]"
            onClick={() => window.location.href = '/createCustomer'}
          >
            เพิ่มผู้ใช้งาน
          </button>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#BC9D72]"></div>
          </div>
        ) : (
          <>
            {/* Customers Table */}
            {activeTab === 'customers' && (
              <div className="bg-white shadow-md rounded-lg overflow-hidden">
                <table className="min-w-full leading-normal">
                  <thead>
                    <tr>
                      <th className="px-5 py-3 border-b-2 border-gray-200 bg-[#BC9D72] text-left text-sm font-semibold text-white uppercase tracking-wider">
                        ลำดับ
                      </th>
                      <th className="px-5 py-3 border-b-2 border-gray-200 bg-[#BC9D72] text-left text-sm font-semibold text-white uppercase tracking-wider">
                        อาคาร
                      </th>
                      <th className="px-5 py-3 border-b-2 border-gray-200 bg-[#BC9D72] text-left text-sm font-semibold text-white uppercase tracking-wider">
                        บริษัท
                      </th>
                      <th className="px-5 py-3 border-b-2 border-gray-200 bg-[#BC9D72] text-left text-sm font-semibold text-white uppercase tracking-wider">
                        ยูนิต
                      </th>
                      <th className="px-5 py-3 border-b-2 border-gray-200 bg-[#BC9D72] text-left text-sm font-semibold text-white uppercase tracking-wider">
                        ผู้ใช้
                      </th>
                      <th className="px-5 py-3 border-b-2 border-gray-200 bg-[#BC9D72] text-left text-sm font-semibold text-white uppercase tracking-wider">
                        เบอร์โทรศัพท์
                      </th>
                      <th className="px-5 py-3 border-b-2 border-gray-200 bg-[#BC9D72] text-left text-sm font-semibold text-white uppercase tracking-wider">
                        Email
                      </th>
                      <th className="px-5 py-3 border-b-2 border-gray-200 bg-[#BC9D72] text-left text-sm font-semibold text-white uppercase tracking-wider">
                        Line
                      </th>
                      <th className="px-5 py-3 border-b-2 border-gray-200 bg-[#BC9D72] text-left text-sm font-semibold text-white uppercase tracking-wider">
                        จัดการ
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {customers.length > 0 ? (
                      customers.map((customer, index) => (
                        <tr key={customer.id} className="hover:bg-gray-50">
                          <td className="px-5 py-4 border-b border-gray-200 bg-white text-sm">
                            {index + 1}
                          </td>
                          <td className="px-5 py-4 border-b border-gray-200 bg-white text-sm">
                            {customer.unit?.company?.building?.buildingName || '-'}
                          </td>
                          <td className="px-5 py-4 border-b border-gray-200 bg-white text-sm">
                            {customer.unit?.company?.companyName || '-'}
                          </td>
                          <td className="px-5 py-4 border-b border-gray-200 bg-white text-sm">
                            {customer.unit?.unitName || '-'}
                          </td>
                          <td className="px-5 py-4 border-b border-gray-200 bg-white text-sm">
                            {customer.name || '-'}
                          </td>
                          <td className="px-5 py-4 border-b border-gray-200 bg-white text-sm">
                            {customer.phone || '-'}
                          </td>
                          <td className="px-5 py-4 border-b border-gray-200 bg-white text-sm">
                            {customer.email || '-'}
                          </td>
                          <td className="px-5 py-4 border-b border-gray-200 bg-white text-sm">
                            {customer.userId ? (
                              <FaLine className="text-green-500 text-xl" title="เชื่อมต่อ Line แล้ว" />
                            ) : (
                              <FaLine className="text-red-500 text-xl" title="ยังไม่ได้เชื่อมต่อ Line" />
                            )}
                          </td>
                          <td className="px-5 py-4 border-b border-gray-200 bg-white text-sm">
                            <button
                              className="text-blue-500 hover:text-blue-700 mr-3"
                              title="แก้ไข"
                              onClick={() => handleEditCustomer(customer.id)}
                            >
                              <UserPen className="inline-block" />
                            </button>
                            <button
                              className="text-red-500 hover:text-red-700"
                              title="ลบ"
                              onClick={() => handleDeleteCustomer(customer.id)}
                            >
                              <Trash2 className="inline-block" />
                            </button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="9" className="px-5 py-4 text-center text-gray-500">
                          ไม่พบข้อมูลลูกค้า
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}

            {/* Technicians Table */}
            {activeTab === 'technicians' && (
              <div className="bg-white shadow-md rounded-lg overflow-hidden">
                <table className="min-w-full leading-normal">
                  <thead>
                    <tr>
                      <th className="px-5 py-3 border-b-2 border-gray-200 bg-[#BC9D72] text-left text-sm font-semibold text-white uppercase tracking-wider">
                        ลำดับ
                      </th>
                      <th className="px-5 py-3 border-b-2 border-gray-200 bg-[#BC9D72] text-left text-sm font-semibold text-white uppercase tracking-wider">
                        เจ้าหน้าที่
                      </th>
                      <th className="px-5 py-3 border-b-2 border-gray-200 bg-[#BC9D72] text-left text-sm font-semibold text-white uppercase tracking-wider">
                        เบอร์โทรศัพท์
                      </th>
                      <th className="px-5 py-3 border-b-2 border-gray-200 bg-[#BC9D72] text-left text-sm font-semibold text-white uppercase tracking-wider">
                        Line
                      </th>
                      <th className="px-5 py-3 border-b-2 border-gray-200 bg-[#BC9D72] text-left text-sm font-semibold text-white uppercase tracking-wider">
                        สังกัด (อาคาร)
                      </th>
                      <th className="px-5 py-3 border-b-2 border-gray-200 bg-[#BC9D72] text-left text-sm font-semibold text-white uppercase tracking-wider">
                        จัดการ
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {technicians.length > 0 ? (
                      technicians.map((tech, index) => {
                        const uniqueBuildings = getUniqueBuildings(tech.techBuilds);

                        return (
                          <tr key={tech.id} className="hover:bg-gray-50">
                            <td className="px-5 py-4 border-b border-gray-200 bg-white text-sm">
                              {index + 1}
                            </td>
                            <td className="px-5 py-4 border-b border-gray-200 bg-white text-sm">
                              {tech.name || '-'}
                            </td>
                            <td className="px-5 py-4 border-b border-gray-200 bg-white text-sm">
                              {tech.phone || '-'}
                            </td>
                            <td className="px-5 py-4 border-b border-gray-200 bg-white text-sm">
                              {tech.userId ? (
                                <FaLine className="text-green-500 text-xl" title="เชื่อมต่อ Line แล้ว" />
                              ) : (
                                <FaLine className="text-red-500 text-xl" title="ยังไม่ได้เชื่อมต่อ Line" />
                              )}
                            </td>
                            <td className="px-5 py-4 border-b border-gray-200 bg-white text-sm">
                              {uniqueBuildings.length > 0 ? (
                                <div className="flex flex-col space-y-1">
                                  {uniqueBuildings.map((building, i) => (
                                    <span key={i}>{building}</span>
                                  ))}
                                </div>
                              ) : '-'}
                            </td>
                            <td className="px-5 py-4 border-b border-gray-200 bg-white text-sm">
                              <button
                                className="text-blue-500 hover:text-blue-700 mr-3"
                                title="แก้ไข"
                                onClick={() => handleEditTechnician(tech.userId)}
                              >
                                <UserPen className="inline-block" />
                              </button>
                              <button
                                className="text-red-500 hover:text-red-700"
                                title="ลบ"
                                onClick={() => handleDeleteTechnician(tech.id)}
                              >
                                <Trash2 className="inline-block" />
                              </button>
                            </td>
                          </tr>
                        );
                      })
                    ) : (
                      <tr>
                        <td colSpan="6" className="px-5 py-4 text-center text-gray-500">
                          ไม่พบข้อมูลพนักงาน
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}

            {/* Wait Approve Table */}
            {activeTab === 'waitApprove' && (
              <div className="bg-white shadow-md rounded-lg overflow-hidden">
                <table className="min-w-full leading-normal">
                  <thead>
                    <tr>
                      <th className="px-5 py-3 border-b-2 border-gray-200 bg-[#BC9D72] text-left text-sm font-semibold text-white uppercase tracking-wider">
                        ลำดับ
                      </th>
                      <th className="px-5 py-3 border-b-2 border-gray-200 bg-[#BC9D72] text-left text-sm font-semibold text-white uppercase tracking-wider">
                        อาคาร
                      </th>
                      <th className="px-5 py-3 border-b-2 border-gray-200 bg-[#BC9D72] text-left text-sm font-semibold text-white uppercase tracking-wider">
                        บริษัท
                      </th>
                      <th className="px-5 py-3 border-b-2 border-gray-200 bg-[#BC9D72] text-left text-sm font-semibold text-white uppercase tracking-wider">
                        ยูนิต
                      </th>
                      <th className="px-5 py-3 border-b-2 border-gray-200 bg-[#BC9D72] text-left text-sm font-semibold text-white uppercase tracking-wider">
                        ผู้ใช้
                      </th>
                      <th className="px-5 py-3 border-b-2 border-gray-200 bg-[#BC9D72] text-left text-sm font-semibold text-white uppercase tracking-wider">
                        เบอร์โทรศัพท์
                      </th>
                      <th className="px-5 py-3 border-b-2 border-gray-200 bg-[#BC9D72] text-left text-sm font-semibold text-white uppercase tracking-wider">
                        Email
                      </th>
                      <th className="px-5 py-3 border-b-2 border-gray-200 bg-[#BC9D72] text-left text-sm font-semibold text-white uppercase tracking-wider">
                        Line
                      </th>
                      <th className="px-5 py-3 border-b-2 border-gray-200 bg-[#BC9D72] text-left text-sm font-semibold text-white uppercase tracking-wider">
                        จัดการ
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {waitForApprove.length > 0 ? (
                      waitForApprove.map((user, index) => (
                        <tr key={user.id} className="hover:bg-gray-50">
                          <td className="px-5 py-4 border-b border-gray-200 bg-white text-sm">
                            {index + 1}
                          </td>
                          <td className="px-5 py-4 border-b border-gray-200 bg-white text-sm">
                            {user.unit.company.building.buildingName || '-'}
                          </td>
                          <td className="px-5 py-4 border-b border-gray-200 bg-white text-sm">
                            {user.unit.company.companyName || '-'}
                          </td>
                          <td className="px-5 py-4 border-b border-gray-200 bg-white text-sm">
                            {user.unit.unitName || '-'}
                          </td>
                          <td className="px-5 py-4 border-b border-gray-200 bg-white text-sm">
                            {user.name || '-'}
                          </td>
                          <td className="px-5 py-4 border-b border-gray-200 bg-white text-sm">
                            {user.phone || '-'}
                          </td>
                          <td className="px-5 py-4 border-b border-gray-200 bg-white text-sm">
                            {user.email || '-'}
                          </td>
                          <td className="px-5 py-4 border-b border-gray-200 bg-white text-sm">
                            {user.userId ? (
                                <FaLine className="text-green-500 text-xl" title="เชื่อมต่อ Line แล้ว" />
                              ) : (
                                <FaLine className="text-red-500 text-xl" title="ยังไม่ได้เชื่อมต่อ Line" />
                              )}
                          </td>
                          <td className="px-5 py-4 border-b border-gray-200 bg-white text-sm">
                            <button
                              className="bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600"
                              onClick={() => handleApprove(user.userId)}
                            >
                              อนุมัติ
                            </button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="5" className="px-5 py-4 text-center text-gray-500">
                          ไม่พบข้อมูลรออนุมัติ
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}

          </>
        )}
      </div>
    </AdminLayout>
  );
};

export default User;