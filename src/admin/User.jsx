import React, { useEffect, useState, useRef } from 'react';
import AdminLayout from './AdminLayout';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { BiSearchAlt2 } from "react-icons/bi";
import { CircleCheck, CircleX } from "lucide-react";
import { HiChevronDown } from "react-icons/hi";
import { FaLine, FaEye, FaEyeSlash } from 'react-icons/fa';
import { UserPen, Trash2 } from 'lucide-react';
import UserToolbar from '../component/UserToolbar';
import UserPopup from '../component/UserPopup';
import CustomerTable from '../component/CustomerTable';
import TechnicianTable from '../component/TechnicianTable';
import AdminTable from '../component/AdminTable';
import ConfirmDeletePopup from '../component/ConfirmDeletePopup';
import StatusPopup from '../component/StatusPopup';

const User = () => {
  const [customers, setCustomers] = useState([]);
  const [technicians, setTechnicians] = useState([]);
  const [activeTab, setActiveTab] = useState('customers');
  const [waitForApprove, setWaitForApprove] = useState([]);
  const [loading, setLoading] = useState(false);
  const [admin, setAdmin] = useState([])
  const [showPasswords, setShowPasswords] = useState({})
  const navigate = useNavigate()

  const [isMobile, setIsMobile] = useState(false);
  const [searchInput, setSearchInput] = useState("")
  const [searchTerm, setSearchTerm] = useState("")
  const [popupCreateUser, setPopupCreateUser] = useState(false);
  const [popupStatus, setPopupStatus] = useState();
  const [buildings, setBuildings] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [units, setUnits] = useState([]);
  const [confirmDeleteId, setConfirmDeleteId] = useState(null); // สำหรับเก็บ ID ที่จะลบ
  const [showConfirmPopup, setShowConfirmPopup] = useState(false); // คุมการแสดง popup
  const [popupEditUser, setPopupEditUser] = useState(false); // คุมการแสดง popup
  // const [tabPopup, setTabPopup] = useState('customers');
  const [errors, setErrors] = useState({});
  const [popupMessage, setPopupMessage] = useState('');
  const [editMode, setEditMode] = useState(false);
  const [editingCustomerId, setEditingCustomerId] = useState(null);

  // const [popupUserVisible, setPopupUserVisible] = useState(false);   // เปิด/ปิด popup
  // const [isEditMode, setIsEditMode] = useState(false);               // true = กำลังแก้ไข
  // const [editingId, setEditingId] = useState(null);

  const [customerData, setCustomerData] = useState({
    // id: '',
    name: '',
    phone: '',
    // nickname: '',
    // buildingId: '',
    // companyId: '',
    companyName: '',
    // unitId: '',
    unitName: '',
    buildingName: '',
    email: '',
  });

  const [customerDataUpdate, setCustomerDataUpdate] = useState({
    id: '',
    name: '',
    phone: '',
    email: '',
    buildingId: '',
    buildingName: '',
    companyId: '',
    companyName: '',
    unitId: '',
    unitName: '',
  });

  const [technicianData, setTechnicianData] = useState({
    name: '',
    phone: '',
  });

  const [adminData, setAdminData] = useState({
    username: '',
    password: '',
  });

  // const handleAdminChange = (e) => {
  //   const { name, value } = e.target;
  //   setAdmin((prev) => ({ ...prev, [name]: value }));
  // };

  // const validateAdminCredentials = async () => {
  //   try {
  //     const response = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/api/getAdmin`);
  //     const adminList = response.data.data;

  //     const found = adminList.find(
  //       (admin) =>
  //         !admin.isDelete &&
  //         admin.username === userAdmin.username &&
  //         admin.password === userAdmin.password
  //     );

  //     if (!found) {
  //       alert("ชื่อผู้ใช้หรือรหัสผ่านแอดมินไม่ถูกต้อง");
  //       return false;
  //     }

  //     return true;
  //   } catch (error) {
  //     console.error("เกิดข้อผิดพลาดขณะตรวจสอบแอดมิน", error);
  //     alert("เกิดข้อผิดพลาดในการเชื่อมต่อกับเซิร์ฟเวอร์");
  //     return false;
  //   }
  // };

  const handleCustomerChange = async (e) => {
    const { name, value } = e.target;

    // ✅ ถ้าเป็นเบอร์โทรศัพท์: รับเฉพาะตัวเลข และจำกัด 15 ตัว
    if (name === 'phone') {
      const onlyNums = value.replace(/\D/g, ''); // ลบทุกตัวที่ไม่ใช่เลข
      setCustomerData(prev => ({
        ...prev,
        phone: onlyNums.slice(0, 15)
      }));
      return; // จบตรงนี้ไม่ต้องเช็ก unitName/companyName
    }

    // ✅ ถ้าเป็นอีเมล: ตรวจสอบรูปแบบก่อนอัปเดต
    if (name === 'email') {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(value)) {
        // ถ้าไม่ตรงรูปแบบ อาจไม่เซตค่า หรือจะแสดง error ก็ได้
        console.warn('อีเมลไม่ถูกต้อง');
      }

      // ยังอัปเดตค่าให้ user พิมพ์ต่อได้ (แต่คุณอาจเลือกไม่อัปเดตก็ได้)
      setCustomerData(prev => ({
        ...prev,
        [name]: value
      }));
      return;
    }

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

    // ✅ ถ้าเป็นเบอร์โทรศัพท์: รับเฉพาะตัวเลข และจำกัด 15 ตัว
    if (name === 'phone') {
      const onlyNums = value.replace(/\D/g, ''); // ลบทุกตัวที่ไม่ใช่เลข
      setTechnicianData(prev => ({
        ...prev,
        phone: onlyNums.slice(0, 15)
      }));
      return; // จบตรงนี้ไม่ต้องเช็ก unitName/companyName
    }

    setTechnicianData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleGetAdmin = async () => {
    try {
      const response = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/api/getAdmin`)
      console.log("Get admin", response.data.data)
      setAdmin(response.data.data)
    } catch (error) {
      console.log(error)
    }
  }

  // const toggleShowPassword = (id) => {
  //   setShowPasswords(prev => ({
  //     ...prev,
  //     [id]: !prev[id]
  //   }))
  // }

  useEffect(() => {
    handleGetBuilding();
  }, []);

  // const handleGetBuilding = async () => {
  //   try {
  //     const response = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/api/getBuilding`);
  //     setBuildings(response.data.data);
  //   } catch (error) {
  //     console.error('Error fetching building data:', error);
  //   }
  // };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const newErrors = {};

    if (activeTab === 'customers') {
      if (!customerData.name) newErrors.name = 'กรุณากรอกชื่อ-สกุล';
      if (!customerData.companyName) newErrors.companyName = 'กรุณากรอกบริษัท';
      if (!customerData.buildingName) newErrors.buildingName = 'กรุณากรอกอาคาร';
    } else if (activeTab === 'technicians') {
      if (!technicianData.name) newErrors.name = 'กรุณากรอกชื่อ-สกุล';
    }

    setErrors(newErrors);

    if (Object.keys(newErrors).length > 0) {
      const firstErrorKey = Object.keys(newErrors)[0];
      setPopupMessage(newErrors[firstErrorKey]);

      setTimeout(() => {
        setPopupMessage('');
      }, 3000);

      return;
    }

    setPopupStatus("loading");

    const hasTechnicianData = technicianData.name.trim() !== '' || technicianData.phone.trim() !== '';
    const hasAdminData = adminData.username.trim() !== '' && adminData.password.trim() !== '';

    // console.log("customerDataUpdate", customerDataUpdate)

    try {
      if (activeTab === 'customers') {
        if (customerDataUpdate.id) {
          // กำลัง "แก้ไข"
          await axios.patch(`${import.meta.env.VITE_API_BASE_URL}/api/updateCustomer`, {
            id: customerDataUpdate.id,
            name: customerDataUpdate.name,
            phone: customerDataUpdate.phone,
            buildingId: customerDataUpdate.buildingId,
            companyId: customerDataUpdate.companyId,
            companyName: customerDataUpdate.companyName,
            unitId: customerDataUpdate.unitId,
            unitName: customerDataUpdate.unitName,
            // email: customerData.email
          });
        } else {
          // ➕ เพิ่มลูกค้าใหม่
          await axios.post(`${import.meta.env.VITE_API_BASE_URL}/api/createCustomer`, customerData);
        }
      }

      if (activeTab === 'technicians') {
        if (hasTechnicianData) {
          await axios.post(`${import.meta.env.VITE_API_BASE_URL}/api/createTechnician`, technicianData);
        }
        if (hasAdminData) {
          await axios.post(`${import.meta.env.VITE_API_BASE_URL}/api/createAdmin`, adminData);
        }
      }

      setTimeout(() => {
        setPopupStatus("success");
        setTimeout(() => {
          setPopupStatus(null);
          setPopupCreateUser(false);
          window.location.reload(); // หรือ fetch ข้อมูลใหม่แทนการ reload
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
          console.log("customerData: ", customerData)

          if (searchTerm.trim() !== "") {
            const term = searchTerm.toLowerCase();
            customerData = customerData.filter(c => {
              const nameMatch = c.name?.toLowerCase().includes(term);
              const phoneMatch = c.phone?.toLowerCase().includes(term);
              const buildingNameMatch = c.unit?.company?.building?.buildingName?.toLowerCase().includes(term)
              const unitMatch = c.unit?.unitName?.toLowerCase().includes(term)
              const companyNameMatch = c.unit?.company?.companyName?.toLowerCase().includes(term)

              // console.log("ชื่อ:", t.name, "| อาคารที่ดูแล:", t.techBuilds?.map(b => b.building?.buildingName), "| Match:", buildingMatch);

              return nameMatch || phoneMatch || buildingNameMatch || unitMatch || companyNameMatch;
            });
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
        } else if (activeTab === 'admin') {
          handleGetAdmin()
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

  // const handleEditCustomer = (userId) => {
  //   // navigate(`/editCustomer/${userId}`);
  //   setEditingCustomerId(id);
  // }

  const handleEditCustomer = async (userId) => {
    try {
      const res = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/api/getCustomerById/${userId}`);
      const customer = res.data.data;
      // setEditingCustomerId(id);
      // console.log("customer: ", customer)
      // console.log("customer.id: ", customer.id)
      // console.log("customer.name: ", customer.name)

      setCustomerData({
        id: customer.id,
        name: customer.name,
        phone: customer.phone,
        buildingId: customer.unit?.company?.buildingId,
        companyId: customer.unit?.companyId,
        companyName: customer.unit?.company?.companyName,
        unitId: customer.unitId,
        unitName: customer.unit?.unitName,
        buildingName: customer.unit?.company?.building?.buildingName,
        email: customer.email,
      });

      // โหลดข้อมูล dropdown ต่าง ๆ
      await Promise.all([
        handleGetBuilding(),
        handleGetCompany(),
        handleGetUnits(),
      ]);

      console.log("customerData: ", customerData)
      console.log("customerDataUpdate: ", customerDataUpdate)

      setActiveTab('customers'); // เปลี่ยน tab เป็น customers ถ้ายังไม่อยู่
      setPopupCreateUser(true);  // เปิด popup

    } catch (err) {
      console.error('ไม่สามารถโหลดข้อมูลลูกค้า:', err);
    }
  };

  const handleGetBuilding = async () => {
    const res = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/api/getBuilding`);
    setBuildings(res.data.data);
  };

  const handleGetCompany = async () => {
    const res = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/api/getCompany`);
    setCompanies(res.data.data);
  };

  const handleGetUnits = async () => {
    const res = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/api/getUnits`);
    setUnits(res.data.data);
  };


  // const handleEditCustomer = (userId) => {
  //   const customer = customers.find((c) => c.id === userId);
  //   if (customer) {
  //     setFormData({
  //       name: customer.name || '',
  //       phone: customer.phone || '',
  //       buildingId: customer.buildingId || '',
  //       companyId: customer.unit?.companyId || '',
  //       companyName: customer.companyName || '',
  //       unitId: customer.unitId || '',
  //       unitName: customer.unit?.unitName || '',
  //     });
  //     setPopupEditUser(true);
  //   }
  // };

  const handleEditTechnician = (userId) => {
    navigate(`/editTechnician/${userId}`);
  };

  const handleEditAdmin = (id) => {
    navigate(`/editAdmin/${id}`)
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

  const handleDeleteTechnician = async (id) => {
    try {
      // setPopupStatus("loading");
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

  const handleDeleteAdmin = async (id) => {
    try {
      const response = await axios.delete(`${import.meta.env.VITE_API_BASE_URL}/api/deleteAdmin/${id}`)
      console.log("Delete admin success", response.data)
      // alert("Delete admin successfully")
      setTimeout(() => {
        setPopupStatus("delete");
        setTimeout(() => {
          setPopupStatus(null);
          window.location.reload();
        }, 2000);
      }, 2000);
    } catch (error) {
      console.error('Error deleting admin:', error);
    }
  }

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
      activeTab === 'customers' ? handleDeleteCustomer(confirmDeleteId) : activeTab === 'technicians' ? handleDeleteTechnician(confirmDeleteId) : handleDeleteAdmin(confirmDeleteId);
    }
  };

  return (
    <AdminLayout>
      <div className="container mx-auto px-4 py-2">
        <UserToolbar
          searchInput={searchInput}
          setSearchInput={setSearchInput}
          handleSearch={handleSearch}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          setPopupCreateUser={setPopupCreateUser}
        />
        {/* {
          console.log("activeTab: ", activeTab)
        } */}
        <UserPopup
          show={popupCreateUser}
          onClose={() => setPopupCreateUser(false)}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          handleSubmit={handleSubmit}
          customerData={customerData}
          technicianData={technicianData}
          adminData={adminData}
          handleCustomerChange={handleCustomerChange}
          handleTechnicianChange={handleTechnicianChange}
          buildings={buildings}
          errors={errors}
          setAdminData={setAdminData}
        />

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#BC9D72]"></div>
          </div>
        ) : (
          <>
            {/* Customers Table */}
            {activeTab === 'customers' && (
              <CustomerTable
                customers={customers}
                handleEditCustomer={handleEditCustomer}
                confirmDelete={confirmDelete}
                setEditMode={setEditMode}
              />
            )}

            {/* Technicians Table */}
            {activeTab === 'technicians' && (
              <TechnicianTable
                technicians={technicians}
                getUniqueBuildings={getUniqueBuildings}
                handleEditTechnician={handleEditTechnician}
                confirmDelete={confirmDelete}
              />
            )}

            {/* Wait Approve Table */}
            {/* {activeTab === 'waitApprove' && (
              <WaitApproveTable
                activeTab={activeTab}
                waitForApprove={waitForApprove}
                handleApprove={handleApprove}
              />
            )} */}

            {/* Admin */}
            {activeTab === "admin" && (
              <AdminTable
                admin={admin}
                handleEditAdmin={handleEditAdmin}
                confirmDelete={confirmDelete}
              // showPasswords={showPasswords}
              // toggleShowPassword={toggleShowPassword}
              />
            )}

            {/*
             {popupEditUser && (
              <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
                <div className="bg-white max-w-xl w-full mx-4 rounded-lg shadow-lg p-6 relative">

                  <button
                    className="absolute top-2 right-2 text-gray-500 hover:text-red-500 text-xl"
                    onClick={() => setPopupEditUser(false)}
                  >
                    &times;
                  </button>
                  <h2 className="text-xl font-bold mb-4 text-center text-[#726140]">แก้ไขข้อมูลผู้ใช้</h2>
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                      <label className="block mb-1 font-medium">ชื่อ-สกุล<span className="text-red-500">*</span></label>
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleCustomerChange}
                        className="border p-2 w-full rounded-md"
                        placeholder="ชื่อ-สกุล"
                        required
                      />
                    </div>

                    <div>
                      <label className="block mb-1 font-medium">เบอร์โทรศัพท์<span className="text-red-500">*</span></label>
                      <input
                        type="text"
                        name="phone"
                        value={formData.phone}
                        onChange={handleCustomerChange}
                        className="border p-2 w-full rounded-md"
                        placeholder="เบอร์โทรศัพท์"
                        required
                      />
                    </div>

                    <div>
                      <label className="block mb-1 font-medium">อาคาร</label>
                      <select
                        name="buildingId"
                        value={formData.buildingId}
                        onChange={handleCustomerChange}
                        className="border p-2 w-full rounded-md"
                      >
                        <option value="">เลือกอาคาร</option>
                        {buildings.map((b) => (
                          <option key={b.id} value={b.id}>
                            {b.buildingName}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block mb-1 font-medium">บริษัท<span className="text-red-500">*</span></label>
                      <input
                        type="text"
                        list="companyList"
                        name="companyName"
                        value={formData.companyName}
                        onChange={handleCustomerChange}
                        className="border p-2 w-full rounded-md"
                        placeholder="พิมพ์หรือเลือกบริษัท"
                        required
                      />
                      <datalist id="companyList">
                        {companies.map((c) => (
                          <option key={c.id} value={c.companyName} />
                        ))}
                      </datalist>
                    </div>

                    <div>
                      <label className="block mb-1 font-medium">ยูนิต<span className="text-red-500">*</span></label>
                      <input
                        type="text"
                        list="unitList"
                        name="unitName"
                        value={formData.unitName}
                        onChange={handleCustomerChange}
                        className="border p-2 w-full rounded-md"
                        placeholder="พิมพ์หรือเลือกยูนิต"
                        required
                      />
                      <datalist id="unitList">
                        {units.map((u) => (
                          <option key={u.id} value={u.unitName} />
                        ))}
                      </datalist>
                    </div>

                    <div className="pt-4">
                      <button
                        type="submit"
                        className="w-full bg-[#a08b5f] hover:bg-[#8a784e] text-white font-medium py-2 rounded-md transition duration-200"
                      >
                        บันทึกการเปลี่ยนแปลง
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )} 
            */}

            {/* Popup ยืนยันการลบ */}
            <ConfirmDeletePopup
              show={showConfirmPopup}
              onCancel={cancelDelete}
              onConfirm={proceedDelete}
              activeTab={activeTab}
            />

            <StatusPopup
              show={!!popupStatus}
              status={popupStatus} // "loading", "success", "delete", or "error"
              activeTab={activeTab}
            />

            {popupMessage && (
              <div className="fixed top-4 left-1/2 -translate-x-1/2 bg-red-500 text-white text-sm px-4 py-2 rounded-xl shadow-md z-50 transition">
                {popupMessage}
              </div>
            )}

          </>
        )}
      </div>
    </AdminLayout >
  );
};

export default User;