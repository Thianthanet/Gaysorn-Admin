import React, { useEffect, useState, useRef } from 'react';
import AdminLayout from './AdminLayout';
import axios from 'axios';
import { FaLine } from 'react-icons/fa';
import { UserPen, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { BiSearchAlt2 } from "react-icons/bi";
import { CircleCheck, CircleX } from "lucide-react";

const User = () => {
  const [customers, setCustomers] = useState([]);
  const [technicians, setTechnicians] = useState([]);
  const [activeTab, setActiveTab] = useState('customers');
  const [waitForApprove, setWaitForApprove] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate()

  const [isMobile, setIsMobile] = useState(false);
  const [searchInput, setSearchInput] = useState("")
  const [searchTerm, setSearchTerm] = useState("")
  const [popupCreateUser, setPopupCreateUser] = useState(false);
  const [buildings, setBuildings] = useState([]);
  const [popupStatus, setPopupStatus] = useState();
  // const, s] = useState(0);
  // const formRef = useRef(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState(null); // สำหรับเก็บ ID ที่จะลบ
  const [showConfirmPopup, setShowConfirmPopup] = useState(false); // คุมการแสดง popup

  // const [selectedBuildings, setSelectedBuildings] = useState([]);

  const [customerData, setCustomerData] = useState({
    name: '',
    phone: '',
    // nickname: '',
    companyName: '',
    unitName: '',
    buildingName: '',
    email: '',
  });

  const [technicianData, setTechnicianData] = useState({
    name: '',
    phone: '',
    buildings: [] // ต้องมี! เพื่อให้ includes() และ map/filter ใช้งานได้
  });

  const [userAdmin, setUserAdmin] = useState({
    username: '',
    password: '',
  });

  const buildings_tech = [
    "Gaysorn Tower",
    "Gaysorn Center",
    "Gaysorn Amarin"
  ];

  // const handleCheckboxChange = (e) => {
  //   const { name, value, checked } = e.target;

  //   setTechnicianData(prev => {
  //     const currentList = Array.isArray(prev[name]) ? prev[name] : [];

  //     return {
  //       ...prev,
  //       [name]: checked
  //         ? [...currentList, value]
  //         : currentList.filter(item => item !== value)
  //     };
  //   });
  // };

  const handleAdminChange = (e) => {
    const { name, value } = e.target;
    setUserAdmin((prev) => ({ ...prev, [name]: value }));
  };

  const validateAdminCredentials = async () => {
    try {
      const response = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/api/getAdmin`);
      const adminList = response.data.data;

      const found = adminList.find(
        (admin) =>
          !admin.isDelete &&
          admin.username === userAdmin.username &&
          admin.password === userAdmin.password
      );

      if (!found) {
        alert("ชื่อผู้ใช้หรือรหัสผ่านแอดมินไม่ถูกต้อง");
        return false;
      }

      return true;
    } catch (error) {
      console.error("เกิดข้อผิดพลาดขณะตรวจสอบแอดมิน", error);
      alert("เกิดข้อผิดพลาดในการเชื่อมต่อกับเซิร์ฟเวอร์");
      return false;
    }
  };

  const handleCustomerChange = async (e) => {
    const { name, value } = e.target;

    setCustomerData(prev => ({
      ...prev,
      [name]: value
    }));

    // Auto-fill logic when unitName changes
    if (name === 'unitName' && value) {
      try {
        const response = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/api/getRelatedByUnit/${value}`);
        const { company, building } = response.data;

        setCustomerData(prev => ({
          ...prev,
          companyName: company || '',
          buildingName: building || ''
        }));
      } catch (error) {
        console.error('Error fetching unit data:', error);
        // Don't clear fields if there's an error
      }
    }

    // Auto-fill logic when companyName changes
    if (name === 'companyName' && value) {
      try {
        const response = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/api/getRelatedByCompany/${value}`);
        const { building, units } = response.data;

        setCustomerData(prev => ({
          ...prev,
          buildingName: building || '',
          unitName: units && units.length > 0 ? units[0] : ''
        }));
      } catch (error) {
        console.error('Error fetching company data:', error);
        // Don't clear fields if there's an error
      }
    }
  };

  const handleTechnicianChange = (e) => {
    const { name, value } = e.target;
    setTechnicianData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  useEffect(() => {
    handleGetBuilding();
  }, []);

  const handleGetBuilding = async () => {
    try {
      const response = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/api/getBuilding`);
      setBuildings(response.data.data);
    } catch (error) {
      console.error('Error fetching building data:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setPopupStatus("loading");

    try {
      if (activeTab === 'customers') {
        await axios.post(`${import.meta.env.VITE_API_BASE_URL}/api/createCustomer`, customerData);

      } else if (activeTab === 'technicians') {
        const isValidAdmin = await validateAdminCredentials();
        if (!isValidAdmin) {
          setTimeout(() => {
            setPopupStatus(null);
            // setPopupCreateUser(false);
            // s(prev => prev + 1); // รีโหลดข้อมูลใหม่
          }, 2000);
          return;
        }
        await axios.post(`${import.meta.env.VITE_API_BASE_URL}/api/createTechnician`, technicianData);
      }

      setTimeout(() => {
        setPopupStatus("success");
        setTimeout(() => {
          setPopupStatus(null);
          setPopupCreateUser(false);
          window.location.reload();
        }, 2000);
      }, 2000);
      navigate('/user');

    } catch (error) {
      console.error(error);
      setTimeout(() => {
        setPopupStatus("error");
        setTimeout(() => {
          setPopupStatus(null);
        }, 2000);
      }, 2000);
      // navigate('/user');
    }
  };

  useEffect(() => {
    const handleResize = () => { //1024
      setIsMobile(window.innerWidth <= 768);
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [isMobile]);

  const handleSearch = () => {
    setSearchTerm(searchInput)
  }

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        if (activeTab === 'customers') {
          const response = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/api/allCustomer`);
          let customerData = response.data.data;

          if (searchTerm.trim() !== "") {
            const term = searchTerm.toLowerCase();
            customerData = customerData.filter(c =>
              c.name?.toLowerCase().includes(term) ||
              c.phone?.toLowerCase().includes(term)
              // c.techBuilds?.buildingName?.toLowerCase().includes(term)
              // console.log("c.techBuilds?.buildingName?.toLowerCase().includes(term): ", c.techBuilds?.buildingName?.toLowerCase().includes(term)),
              // console.log("c.techBuilds?.buildingName?.toLowerCase().includes(term): ", c.techBuilds?.buildingName?.toLowerCase().includes(term))
            );
          }

          setCustomers(customerData);

        } else if (activeTab === 'technicians') {
          const response = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/api/getTech`);
          let techData = response.data.data;

          console.log("technicians: ", response.data)

          if (searchTerm.trim() !== "") {
            const term = searchTerm.toLowerCase();
            techData = techData.filter(t => {
              const nameMatch = t.name?.toLowerCase().includes(term);
              const phoneMatch = t.phone?.toLowerCase().includes(term);
              // ตรวจสอบว่ามี techBuilds ที่ buildingName ตรงกับคำค้นไหม
              const buildingMatch = t.techBuilds?.some(b =>
                b.building?.buildingName?.toLowerCase().includes(term)
              );

              // console.log("ชื่อ:", t.name, "| อาคารที่ดูแล:", t.techBuilds?.map(b => b.building?.buildingName), "| Match:", buildingMatch);

              return nameMatch || phoneMatch || buildingMatch;
            });
          }

          setTechnicians(techData);

        } else if (activeTab === 'waitForApprove') {
          await handleGetWaitForApprove(searchTerm); // ส่ง searchTerm เข้าไปให้ด้วย ถ้าอยากให้ฟิลเตอร์ฝั่งนั้น
        }

      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [activeTab, searchTerm]); // ✅ เมื่อเปลี่ยนแท็บ หรือ คำค้นหา

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
      // setPopupStatus("loading");
      const response = await axios.delete(`${import.meta.env.VITE_API_BASE_URL}/api/deleteTechnician/${id}`);
      console.log('Delete response:', response.data);
      // แสดง popup "delete" 3 วินาที
      setTimeout(() => {
        setPopupStatus("delete");

        setTimeout(() => {
          setPopupStatus(null);
          window.location.reload();
        }, 2000);
      }, 2000);
    } catch (error) {
      console.error('Error deleting technician:', error);
    }
  }

  const handleDeleteCustomer = async (id) => {
    try {
      setPopupStatus("loading");
      const response = await axios.delete(`${import.meta.env.VITE_API_BASE_URL}/api/deleteCustomer/${id}`);
      console.log('Delete response:', response.data);
      setTimeout(() => {
        setPopupStatus("delete");
        setTimeout(() => {
          setPopupStatus(null);
          window.location.reload();
        }, 2000);
      }, 2000);
    } catch (error) {
      console.error('Error deleting customer:', error);
    }
  };

  const confirmDelete = (id) => {
    setConfirmDeleteId(id); // เก็บ ID ที่จะลบไว้ก่อน
    setShowConfirmPopup(true); // แสดง popup
  };

  const cancelDelete = () => {
    setShowConfirmPopup(false); // ปิด popup
    setConfirmDeleteId(null); // ล้าง id ที่เลือก
  };

  const proceedDelete = () => {
    setPopupStatus("loading");
    setShowConfirmPopup(false);
    if (confirmDeleteId !== null) {
      activeTab === 'customers' ? handleDeleteCustomer(confirmDeleteId) : handleDeleteTechnician(confirmDeleteId);
    }
  };

  return (
    <AdminLayout>
      <div className="container mx-auto px-4 py-8">
        {/* <h1 className="text-2xl font-bold mb-6">User Management</h1> */}

        <div className="flex gap-2 mb-4">
          {/* ช่องค้นหาพร้อมไอคอน */}
          <div className="flex items-center flex-1 border-b-[1px] border-[#837958]">
            <BiSearchAlt2 size={20} className="text-[#837958] ml-2" />
            <input
              type="text"
              placeholder="ค้นหา"
              value={searchInput}
              onChange={e => setSearchInput(e.target.value)}
              className="w-full pl-2 pr-3 py-1 outline-none"
            />
          </div>

          {/* ปุ่มค้นหา */}
          <button
            onClick={handleSearch}
            className="px-4 py-1 bg-[#837958] text-white rounded-full"
          >
            ค้นหา
          </button>

          <button
            // onClick={handleSearch}
            className="px-4 py-1 bg-[#837958] text-white rounded-full"
          >
            อาคาร
          </button>
        </div>


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
            เจ้าหน้าที่
          </button>
          <button
            className="ml-auto py-2 px-4 bg-[#BC9D72] text-white font-medium rounded hover:bg-[#a88f5c]"
            // onClick={() => window.location.href = '/createCustomer'}
            onClick={() => setPopupCreateUser(true)}
          >
            เพิ่มผู้ใช้งาน
          </button>
        </div>

        {
          console.log("activeTab: ", activeTab)
        }

        {popupCreateUser && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40 p-4">
            <div className="relative w-[520px] h-[620px] bg-white border border-[#BC9D72] rounded-xl p-4 shadow-lg overflow-y-auto">
              <h2 className="text-[18px] font-black text-[#837958] text-center mb-2 mt-4">
                {activeTab === 'customers' ? "เพิ่มข้อมูลลูกค้า" : "เพิ่มข้อมูลเจ้าหน้าที่"}
              </h2>

              {/* Tabs */}
              <div className="flex mb-2 rounded-lg overflow-hidden border border-[#BC9D72] w-fit mx-auto text-sm">
                <button
                  className={`px-5 py-1.5 font-medium w-[160px] rounded-lg transition-all duration-200 
      ${activeTab === 'customers'
                      ? 'bg-[#837958] text-white outline outline-2'
                      : 'bg-[#F4F2ED] text-[#837958]'
                    }`}
                  onClick={() => setActiveTab('customers')}
                >
                  ลูกค้า
                </button>
                <button
                  className={`px-5 py-1.5 font-medium w-[160px] rounded-lg transition-all duration-200 
      ${activeTab === 'technicians'
                      ? 'bg-[#837958] text-white outline outline-2'
                      : 'bg-[#F4F2ED] text-[#837958]'
                    }`}
                  onClick={() => setActiveTab('technicians')}
                >
                  เจ้าหน้าที่
                </button>
              </div>

              <div className='flex justify-center'>
                <form onSubmit={handleSubmit}>
                  {activeTab === 'customers' && (
                    <>
                      <div className="mb-2">
                        <label className="block text-[#BC9D72] mb-1 text-[12px]">ชื่อ-สกุล<span className="text-red-500">*</span></label>
                        <input name="name" value={customerData.name} onChange={handleCustomerChange}
                          placeholder="ชื่อ-สกุล" required
                          className="w-[320px] placeholder-[#BC9D72]/50 placeholder:text-[12px] border border-[#BC9D72] rounded-lg px-3 py-1.5 text-sm focus:outline-none" />
                      </div>

                      <div className="mb-2">
                        <label className="block text-[#BC9D72] mb-1 text-[12px]">เบอร์โทรศัพท์</label>
                        <input name="phone" value={customerData.phone} onChange={handleCustomerChange}
                          placeholder="เบอร์โทรศัพท์"
                          className="w-[320px] placeholder-[#BC9D72]/50 placeholder:text-[12px] border border-[#BC9D72] rounded-lg px-3 py-1.5 text-sm focus:outline-none" />
                      </div>

                      <div className="mb-2">
                        <label className="block text-[#BC9D72] mb-1 text-[12px]">บริษัท<span className="text-red-500">*</span></label>
                        <input name="companyName" value={customerData.companyName} onChange={handleCustomerChange}
                          placeholder="บริษัท"
                          className="w-[320px] placeholder-[#BC9D72]/50 placeholder:text-[12px] border border-[#BC9D72] rounded-lg px-3 py-1.5 text-sm focus:outline-none" />
                      </div>

                      {/* <div className="mb-3">
                  <label className="block text-[#BC9D72] mb-1 text-sm">ชื่อเล่น</label>
                  <input name="nickname" value={customerData.nickname} onChange={handleCustomerChange}
                    placeholder="ชื่อเล่น"
                    className="w-full border border-[#BC9D72] rounded px-3 py-1.5 text-sm focus:outline-none" />
                  </div> */}

                      <div className="mb-2">
                        <label className="block text-[#BC9D72] mb-1 text-[12px]">ยูนิต</label>
                        <input name="unitName" value={customerData.unitName} onChange={handleCustomerChange}
                          placeholder="ยูนิต"
                          className="w-[320px] placeholder-[#BC9D72]/50 placeholder:text-[12px] border border-[#BC9D72] rounded-lg px-3 py-1.5 text-sm focus:outline-none" />
                      </div>

                      <div className="mb-2">
                        <label className="block text-[#BC9D72] mb-1 text-[12px]">อาคาร<span className="text-red-500">*</span></label>
                        <select name="buildingName" value={customerData.buildingName} onChange={handleCustomerChange}
                          required className="w-[320px] text-[#BC9D72]/50 text-[12px] border border-[#BC9D72] rounded-lg px-3 py-1.5 text-sm focus:outline-none">
                          <option className="" value="">เลือกอาคาร</option>
                          {buildings.map((building) => (
                            <option key={building.id} value={building.buildingName}>
                              {building.buildingName}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="mb-4">
                        <label className="block text-[#BC9D72] mb-1 text-[12px]">อีเมล</label>
                        <input type="email" name="email" value={customerData.email} onChange={handleCustomerChange}
                          placeholder="อีเมล"
                          className="w-[320px] placeholder-[#BC9D72]/50 placeholder:text-[12px] border border-[#BC9D72] rounded-lg px-3 py-1.5 text-sm focus:outline-none" />
                      </div>
                    </>
                  )}

                  {activeTab === 'technicians' && (
                    <>
                      <div className="mb-2">
                        <label className="block text-[#BC9D72] mb-1 text-[12px]">ชื่อ-สกุล<span className="text-red-500">*</span></label>
                        <input name="name" value={technicianData.name} onChange={handleTechnicianChange}
                          placeholder="ชื่อ-สกุล" required
                          className="w-[320px] border border-[#BC9D72] rounded-lg px-3 py-1.5 text-sm placeholder-[#BC9D72]/50 placeholder:text-[12px] focus:outline-none" />
                      </div>

                      <div className="mb-8">
                        <label className="block text-[#BC9D72] mb-1 text-[12px]">เบอร์โทรศัพท์</label>
                        <input name="phone" value={technicianData.phone} onChange={handleTechnicianChange}
                          placeholder="เบอร์โทรศัพท์"
                          className="w-[320px] border border-[#BC9D72] rounded-lg px-3 py-1.5 text-sm placeholder-[#BC9D72]/50 placeholder:text-[12px] focus:outline-none" />
                      </div>

                      <div className="mb-[64px]">
                        {/* <label className="block text-[#BC9D72] mb-1 text-[12px]">
                          อาคาร<span className="text-red-500">*</span>
                        </label> */}

                        {/* <div className="flex flex-col space-y-2 text-[#BC9D72] text-[12px]">
                          {buildings_tech.map((building) => (
                            <label key={building} className="inline-flex items-center">
                              <input
                                type="checkbox"
                                name="buildings"
                                value={building}   // ค่านี้คือชื่อแต่ละอาคาร
                                className="mr-2"
                                onChange={handleCheckboxChange}
                                checked={technicianData.buildings.includes(building)}  // ถ้า array มีค่านี้จะถูกติ๊ก
                              />
                              {building}
                            </label>
                          ))}
                        </div> */}

                        <div className="flex items-center justify-center mb-4">
                          <div className="w-[120px] h-px bg-[#837958]" />
                          <span className="mx-2 text-[#837958] font-semibold text-[18px]">Admin</span>
                          <div className="w-[120px] h-px bg-[#837958]" />
                        </div>

                        <div className="mb-4">
                          <label className="block text-[#BC9D72] mb-1 text-[12px]">Username</label>
                          <input
                            name="username"
                            value={userAdmin.username}
                            onChange={handleAdminChange}
                            placeholder="Username"
                            className="w-[320px] border border-[#BC9D72] rounded-lg px-3 py-1.5 text-sm placeholder-[#BC9D72]/50 placeholder:text-[12px] focus:outline-none"
                          />
                        </div>

                        <div className="mb-[72px]">
                          <label className="block text-[#BC9D72] mb-1 text-[12px]">Password</label>
                          <input
                            name="password"
                            value={userAdmin.password}
                            onChange={handleAdminChange}
                            placeholder="Password"
                            type="password"
                            className="w-[320px] border border-[#BC9D72] rounded-lg px-3 py-1.5 text-sm placeholder-[#BC9D72]/50 placeholder:text-[12px] focus:outline-none"
                          />
                        </div>
                      </div>
                    </>
                  )}
                  <div className={`flex flex-col`}>
                    <button
                      type="submit"
                      className="w-full mt-4 mb-2 bg-[#837958] text-white text-[12px] font-bold py-2 rounded-xl hover:opacity-90 transition"
                    >
                      {activeTab === 'customers' ? 'เพิ่มข้อมูลลูกค้า' : 'เพิ่มข้อมูลเจ้าหน้าที่'}
                    </button>

                    {/* ปุ่มปิด */}
                    <button
                      className="w-full mb-2 bg-white text-[#837958] text-[12px] font-bold border-[1px] border-[#837958] py-2 rounded-xl hover:opacity-90 transition"
                      onClick={() => setPopupCreateUser(false)}
                    >
                      ปิดหน้าต่างนี้
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#BC9D72]"></div>
          </div>
        ) : (
          <>
            {/* Customers Table */}
            {activeTab === 'customers' && (
              <div className="bg-white shadow-md overflow-hidden">
                <table className="min-w-full leading-normal">
                  <thead>
                    <tr>
                      <th className="w-1 px-4 py-3 border-b-2 border-gray-200 bg-[#BC9D72]/50 text-center text-sm font-semibold text-black uppercase tracking-wider">
                        ลำดับ
                      </th>
                      <th className="w-52 px-4 py-3 border-b-2 border-gray-200 bg-[#BC9D72]/50 text-center text-sm font-semibold text-black uppercase tracking-wider">
                        อาคาร
                      </th>
                      <th className="w-32 px-4 py-3 border-b-2 border-gray-200 bg-[#BC9D72]/50 text-left text-sm font-semibold text-black uppercase tracking-wider">
                        บริษัท/ร้านค้า
                      </th>
                      <th className="w-1 px-4 py-3 border-b-2 border-gray-200 bg-[#BC9D72]/50 text-center text-sm font-semibold text-black uppercase tracking-wider">
                        ยูนิต
                      </th>
                      <th className="w-52 px-4 py-3 border-b-2 border-gray-200 bg-[#BC9D72]/50 text-center text-sm font-semibold text-black uppercase tracking-wider">
                        ลูกค้า
                      </th>
                      <th className="w-32 px-4 py-3 border-b-2 border-gray-200 bg-[#BC9D72]/50 text-center text-sm font-semibold text-black uppercase tracking-wider">
                        เบอร์โทรศัพท์
                      </th>
                      {/* <th className="px-5 py-3 border-b-2 border-gray-200 bg-[#BC9D72]/50 text-left text-sm font-semibold text-black uppercase tracking-wider">
                        Email
                      </th> */}
                      <th className="w-32 px-4 py-3 border-b-2 border-gray-200 bg-[#BC9D72]/50 text-center text-sm font-semibold text-black uppercase tracking-wider">
                        สถานะ Line
                      </th>
                      <th className="w-28 px-4 py-3 border-b-2 border-gray-200 bg-[#BC9D72]/50 text-center text-sm font-semibold text-black uppercase tracking-wider">
                        จัดการ
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {customers.length > 0 ? (
                      customers.map((customer, index) => (
                        <tr key={customer.id} className="hover:bg-gray-50">
                          <td className="px-4 py-2 border-b border-gray-200 bg-white text-sm text-center">
                            {index + 1}
                          </td>
                          <td className="px-4 py-2 border-b border-gray-200 bg-white text-sm text-center">
                            {customer.unit?.company?.building?.buildingName || '-'}
                          </td>
                          <td className="px-4 py-2 border-b border-gray-200 bg-white text-sm text-center">
                            {customer.unit?.company?.companyName || '-'}
                          </td>
                          <td className="px-4 py-2 border-b border-gray-200 bg-white text-sm text-center">
                            {customer.unit?.unitName || '-'}
                          </td>
                          <td className="px-4 py-2 border-b border-gray-200 bg-white text-sm text-center">
                            {customer.name || '-'}
                          </td>
                          <td className="px-4 py-2 border-b border-gray-200 bg-white text-sm text-center">
                            {customer.phone || '-'}
                          </td>
                          {/* <td className="px-5 py-4 border-b border-gray-200 bg-white text-sm">
                            {customer.email || '-'}
                          </td> */}
                          <td className="px-4 py-2 border-b border-gray-200 bg-white text-sm">
                            {customer.userId ? (
                              <FaLine className="text-green-500 text-xl ml-8 p-0" title="เชื่อมต่อ Line แล้ว" />
                            ) : (
                              <FaLine className="text-red-500 text-xl ml-8 p-0" title="ยังไม่ได้เชื่อมต่อ Line" />
                            )}
                          </td>
                          <td className="px-4 py-2 border-b border-gray-200 bg-white text-sm text-center">
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
                              onClick={() => confirmDelete(customer.id)} //confirmDeleteId handleDeleteCustomer
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
              <div className="bg-white shadow-md overflow-hidden">
                <table className="min-w-full leading-normal">
                  <thead>
                    <tr>
                      <th className="w-1 px-4 py-3 border-b-2 border-gray-200 bg-[#BC9D72]/50 text-center text-sm font-semibold text-black uppercase tracking-wider">
                        ลำดับ
                      </th>
                      <th className="w-52 px-4 py-3 border-b-2 border-gray-200 bg-[#BC9D72]/50 text-center text-sm font-semibold text-black uppercase tracking-wider">
                        เจ้าหน้าที่
                      </th>
                      <th className="w-32 px-4 py-3 border-b-2 border-gray-200 bg-[#BC9D72]/50 text-center text-sm font-semibold text-black uppercase tracking-wider">
                        เบอร์โทรศัพท์
                      </th>
                      <th className="w-32 px-4 py-3 border-b-2 border-gray-200 bg-[#BC9D72]/50 text-center text-sm font-semibold text-black uppercase tracking-wider">
                        สถานะ Line
                      </th>
                      <th className="px-4 py-4 border-b-2 border-gray-200 bg-[#BC9D72]/50 text-center text-sm font-semibold text-black uppercase tracking-wider">
                        สังกัด
                      </th>
                      <th className="w-28 px-4 py-3 border-b-2 border-gray-200 bg-[#BC9D72]/50 text-center text-sm font-semibold text-black uppercase tracking-wider">
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
                            <td className="px-4 py-2 border-b border-gray-200 bg-white text-sm text-center">
                              {index + 1}
                            </td>
                            <td className="px-4 py-2 border-b border-gray-200 bg-white text-sm text-center">
                              {tech.name || '-'}
                            </td>
                            <td className="px-4 py-2 border-b border-gray-200 bg-white text-sm text-center">
                              {tech.phone || '-'}
                            </td>
                            <td className="px-4 py-2 border-b border-gray-200 bg-white text-sm">
                              {tech.userId ? (
                                <FaLine className="text-green-500 text-xl ml-8 p-0" title="เชื่อมต่อ Line แล้ว" />
                              ) : (
                                <FaLine className="text-red-500 text-xl ml-8 p-0" title="ยังไม่ได้เชื่อมต่อ Line" />
                              )}
                            </td>
                            <td className="px-4 py-2 border-b border-gray-200 bg-white text-[12px] text-center">
                              {uniqueBuildings.length > 0 ? (
                                <div className="flex flex-row space-x-2">
                                  {uniqueBuildings.join(', ')}
                                </div>
                              ) : '-'}
                            </td>
                            <td className="px-4 py-2 border-b border-gray-200 bg-white text-sm text-center">
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
                                onClick={() => confirmDelete(tech.id)}
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

            {/* Popup ยืนยันการลบ */}
            {showConfirmPopup && (
              <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/70">
                <div className="bg-white rounded-2xl shadow-lg p-6 w-[360px] h-[128px] text-center">
                  <p className="text-lg font-semibold text-[#837958]">ยืนยันการลบ{activeTab === 'customers' ? "ลูกค้า" : "เจ้าหน้าที่"}</p>
                  <div className="flex flex-rows items-center justify-center text-[#837958] text-center mt-6 gap-x-4">
                    <button onClick={cancelDelete} className="bg-white text-[12px] text-[#BC9D72] border-[1px] w-64 h-6 border-[#BC9D72] rounded hover:opacity-80">
                      ยกเลิก
                    </button>
                    <button onClick={proceedDelete} className="bg-[#BC9D72] text-[12px] w-64 h-6 text-white rounded hover:opacity-90">
                      ยืนยัน
                    </button>
                  </div>
                </div>
              </div>
            )}

            {popupStatus && (
              <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/70">
                <div className="bg-white rounded-2xl shadow-lg p-6 w-[360px] text-center">
                  {popupStatus === "loading" ? (
                    <div className="flex flex-col items-center justify-center text-[#837958] text-center">
                      {/* ไอคอนหรือวงกลม loading */}
                      <div className="animate-spin rounded-full border-4 border-t-[#837958] border-gray-200 h-12 w-12 mb-4"></div>
                      <h2 className="text-lg font-semibold">Loading...</h2>
                    </div>
                  ) : popupStatus === "empty" ? (
                    <div className="flex flex-col items-center justify-center text-[#837958] text-center">
                      <CircleX size={50} className="mb-2" />
                      <h2 className="text-lg font-semibold">Please enter your</h2>
                      <h2 className="text-lg font-semibold">username and password.</h2>
                    </div>
                  ) : popupStatus === "success" ? (
                    <div className="flex flex-col items-center justify-center text-[#837958] text-center">
                      <CircleCheck size={50} className="mb-2" />
                      <h2 className="text-lg font-semibold">
                        {activeTab === "customers" ? "เพิ่มข้อมูลลูกค้าสำเร็จ" : "เพิ่มข้อมูลเจ้าหน้าที่สำเร็จ"}
                      </h2>
                    </div>
                  ) : popupStatus === "delete" ? (
                    <div className="flex flex-col items-center justify-center text-[#837958] text-center">
                      <CircleCheck size={50} className="mb-2" />
                      <h2 className="text-lg font-semibold">
                        {activeTab === "customers" ? "ลบข้อมูลลูกค้าสำเร็จ" : "ลบข้อมูลเจ้าหน้าที่สำเร็จ"}
                      </h2>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center text-[#837958] text-center">
                      <CircleX size={50} className="mb-2" />
                      <h2 className="text-lg font-semibold">
                        {activeTab === "customers" ? "เพิ่มข้อมูลลูกค้าไม่สำเร็จ" : "เพิ่มข้อมูลเจ้าหน้าที่ไม่สำเร็จ"}
                      </h2>
                    </div>
                  )}
                </div>
              </div>
            )}

          </>
        )}
      </div>
    </AdminLayout>
  );
};

export default User;