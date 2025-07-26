import React, { useEffect, useState, useRef } from 'react';
import AdminLayout from './AdminLayout';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { BiSearchAlt2 } from "react-icons/bi";
import { CircleCheck, CircleX } from "lucide-react";
import { HiChevronDown } from "react-icons/hi";
import { FaLine, FaEye, FaEyeSlash } from 'react-icons/fa';
import { UserPen, Trash2 } from 'lucide-react';
import * as XLSX from 'xlsx'

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

  // const [popupUserVisible, setPopupUserVisible] = useState(false);   // เปิด/ปิด popup
  // const [isEditMode, setIsEditMode] = useState(false);               // true = กำลังแก้ไข
  // const [editingId, setEditingId] = useState(null);


  const [customerData, setCustomerData] = useState({
    name: '',
    phone: '',
    // nickname: '',
    companyName: '',
    unitName: '',
    buildingName: '',
    email: '',
  });

  // const [formData, setFormData] = useState({
  //   name: '',
  //   phone: '',
  //   buildingId: '',
  //   companyId: '',
  //   companyName: '',
  //   unitId: '',
  //   unitName: '',
  // });

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

  const exportToExcel = () => {
    let dataToExport = [];
    let fileName = '';
    let columnWidths = [];

    switch (activeTab) {
      case 'customers':
        dataToExport = customers.map((customer, index) => ({
          'ลำดับ': index + 1,
          'อาคาร': customer.unit?.company?.building?.buildingName || '-',
          'บริษัท': customer.unit?.company?.companyName || '-',
          'ยูนิต': customer.unit?.unitName || '-',
          'ลูกค้า': customer.name || '-',
          'เบอร์โทรศัพท์': customer.phone || '-',
          'สถานะ Line': customer.userId ? 'ลงทะเบียนแล้ว' : 'ยังไม่ได้ลงทะเบียน'
        }));
        fileName = 'ลูกค้า';
        columnWidths = [
          { wch: 6 },   // ลำดับ
          { wch: 25 },  // อาคาร
          { wch: 25 },  // บริษัท
          { wch: 12 },  // ยูนิต
          { wch: 20 },  // ลูกค้า
          { wch: 15 },  // เบอร์โทรศัพท์
          { wch: 18 }   // สถานะ Line
        ];
        break;

      case 'technicians':
        dataToExport = technicians.map((tech, index) => ({
          'ลำดับ': index + 1,
          'เจ้าหน้าที่': tech.name || '-',
          'เบอร์โทรศัพท์': tech.phone || '-',
          'สถานะ Line': tech.userId ? 'ลงทะเบียนแล้ว' : 'ยังไม่ได้ลงทะเบียน',
          'สังกัด': getUniqueBuildings(tech.techBuilds).join(', ') || '-'
        }));
        fileName = 'เจ้าหน้าที่';
        columnWidths = [
          { wch: 6 },   // ลำดับ
          { wch: 20 },  // เจ้าหน้าที่
          { wch: 15 },  // เบอร์โทรศัพท์
          { wch: 18 },  // สถานะ Line
          { wch: 30 }   // สังกัด
        ];
        break;

      case 'admin':
        dataToExport = admin.map((adminItem, index) => ({
          'ลำดับ': index + 1,
          'ชื่อผู้ใช้งาน': adminItem.username || '-',
          // 'รหัสผ่าน': adminItem.password || '-'
        }));
        fileName = 'แอดมิน';
        columnWidths = [
          { wch: 6 },   // ลำดับ
          { wch: 20 },  // ชื่อผู้ใช้งาน
          // { wch: 15 }   // รหัสผ่าน
        ];
        break;

      case 'waitApprove':
        dataToExport = waitForApprove.map((user, index) => ({
          'ลำดับ': index + 1,
          'อาคาร': user.unit?.company?.building?.buildingName || '-',
          'บริษัท': user.unit?.company?.companyName || '-',
          'ยูนิต': user.unit?.unitName || '-',
          'ผู้ใช้': user.name || '-',
          'เบอร์โทรศัพท์': user.phone || '-',
          'Email': user.email || '-',
          'สถานะ Line': user.userId ? 'ลงทะเบียนแล้ว' : 'ยังไม่ได้ลงทะเบียน'
        }));
        fileName = 'รออนุมัติ';
        columnWidths = [
          { wch: 6 },   // ลำดับ
          { wch: 15 },  // อาคาร
          { wch: 25 },  // บริษัท
          { wch: 12 },  // ยูนิต
          { wch: 20 },  // ผู้ใช้
          { wch: 15 },  // เบอร์โทรศัพท์
          { wch: 25 },  // Email
          { wch: 18 }   // สถานะ Line
        ];
        break;

      default:
        return;
    }

    // Create worksheet and workbook
    const ws = XLSX.utils.json_to_sheet(dataToExport);

    // Apply column widths
    ws['!cols'] = columnWidths;

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Sheet1");

    // Export Excel file
    XLSX.writeFile(wb, `${fileName}_${new Date().toISOString().split('T')[0]}.xlsx`);
  };


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
      // แสดงข้อความ popup แรกที่เจอ
      const firstErrorKey = Object.keys(newErrors)[0];
      setPopupMessage(newErrors[firstErrorKey]);

      // ซ่อน popup หลัง 3 วินาที
      setTimeout(() => {
        setPopupMessage('');
      }, 3000);

      return;
    }

    setPopupStatus("loading");
    const hasTechnicianData = technicianData.name.trim() !== '' || technicianData.phone.trim() !== '';
    const hasAdminData = adminData.username.trim() !== '' && adminData.password.trim() !== '';

    console.log("technicianData: ", technicianData)
    console.log("adminData: ", adminData)

    try {
      if (activeTab === 'customers') {
        await axios.post(`${import.meta.env.VITE_API_BASE_URL}/api/createCustomer`, customerData);
      }
      if (activeTab === 'technicians') {
        // console.log("is comming technicians")
        // console.log("hasTechnicianData is: ", hasTechnicianData)
        if (hasTechnicianData) {
          await axios.post(`${import.meta.env.VITE_API_BASE_URL}/api/createTechnician`, technicianData);
          // console.log("res technician: ", res.data)
          // alert('สร้างเจ้าหน้าที่สำเร็จ');
          // navigate('/user');
          // return;
        }
        if (hasAdminData) {
          await axios.post(`${import.meta.env.VITE_API_BASE_URL}/api/createAdmin`, adminData);
          // console.log("res admin: ", res.data)
          // if (res.data.data) {
          //   alert('สร้างแอดมินสำเร็จ');
          //   navigate('/user')
          // } else {
          //   alert('Username หรือ Password ของแอดมินไม่ถูกต้อง');
          // }
          // return;
        }
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

  const handleEditCustomer = (userId) => {
    navigate(`/editCustomer/${userId}`);
  }

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
        <div className="flex items-center gap-2 flex-wrap mb-6">
          {/* ช่องค้นหา */}
          <div className="flex items-center flex-1 min-w-[250px] border-b-[1px] border-[#837958]">
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
            className="px-3 h-[28px] bg-[#837958] text-white text-[14px] rounded-full flex items-center shadow-[0_2px_4px_rgba(0,0,0,0.1)]"
          >
            <BiSearchAlt2 size={18} className="text-white mr-1" />
            ค้นหา
          </button>

          {/* ปุ่มอาคาร */}
          <button
            className="px-3 h-[28px] bg-[#837958] text-white text-[14px] rounded-full flex items-center gap-[2px] shadow-[0_2px_4px_rgba(0,0,0,0.1)]"
          >
            อาคาร
            <HiChevronDown size={18} className="text-white" />
          </button>

          {/* ปุ่มต่าง ๆ */}
          <button
            className="px-4 h-[32px] bg-[#F4F2ED] text-black text-[14px] rounded-full shadow-[0_2px_4px_rgba(0,0,0,0.1)] hover:bg-gray-300"
            onClick={exportToExcel}
          >
            ส่งข้อมูลออก
          </button>

          <button
            className={`px-4 h-[32px] text-[14px] rounded-full shadow-[0_2px_4px_rgba(0,0,0,0.1)] hover:bg-gray-300
              ${activeTab === 'customers'
                ? 'bg-[#BC9D72] text-white'
                : 'bg-[#F4F2ED] text-black'
              }`}
            onClick={() => setActiveTab('customers')}
          >
            ลูกค้า
          </button>

          <button
            className={`px-4 h-[32px] text-[14px] rounded-full shadow-[0_2px_4px_rgba(0,0,0,0.1)] hover:bg-gray-300
              ${activeTab === 'technicians'
                ? 'bg-[#BC9D72] text-white'
                : 'bg-[#F4F2ED] text-black'
              }`}
            onClick={() => setActiveTab('technicians')}
          >
            เจ้าหน้าที่
          </button>

          <button
            className={`px-4 h-[32px] text-[14px] rounded-full shadow-[0_2px_4px_rgba(0,0,0,0.1)] hover:bg-gray-300
              ${activeTab === 'admin'
                ? 'bg-[#BC9D72] text-white'
                : 'bg-[#F4F2ED] text-black'
              }`}
            onClick={() => setActiveTab('admin')}
          >
            แอดมิน
          </button>

          <button
            className="px-4 h-[36px] bg-[#837958] text-white text-[14px] rounded-full shadow-[0_2px_4px_rgba(0,0,0,0.1)] hover:bg-[#a88f5c]"
            onClick={() => setPopupCreateUser(true)}
          >
            เพิ่มผู้ใช้งาน
          </button>

          <button
            className={`px-4 h-[32px] text-[14px] rounded-full shadow-[0_2px_4px_rgba(0,0,0,0.1)] hover:bg-gray-300
              ${activeTab === 'waitApprove'
                ? 'bg-[#BC9D72] text-white'
                : 'bg-[#F4F2ED] text-black'
              }`}
            onClick={() => setActiveTab('waitApprove')}
          >
            รออนุมัติ {waitForApprove.length > 0 && (
              <span className='ml-1 text-sm text-red-600 font-bold'>
                ( {waitForApprove.length} )
              </span>
            )}
          </button>
        </div>

        {
          console.log("activeTab: ", activeTab)
        }

        {popupCreateUser && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40 p-4">
            <div className="relative w-[520px] h-[620px] bg-white border border-[#BC9D72] rounded-xl p-2 shadow-lg overflow-y-auto">
              <h2 className="text-[18px] font-black text-[#837958] text-center mb-4 mt-4">
                {activeTab === 'customers' ? "เพิ่มข้อมูลลูกค้า" : activeTab === 'technicians' ? "เพิ่มข้อมูลเจ้าหน้าที่" : "เพิ่มข้อมูลแอดมิน"}
              </h2>

              {/* Tabs */}
              <div className="flex w-fit mx-auto mb-2 rounded-xl border border-[#837958] overflow-hidden text-sm bg-[#F4F2ED]">
                <button
                  className={`px-6 py-2 font-medium w-[160px] transition-all duration-300 ease-in-out
                  ${activeTab === 'customers'
                      ? 'bg-[#837958] text-white rounded-r-xl'
                      : 'text-[#837958] rounded-none'
                    }`}
                  onClick={(e) => {
                    e.preventDefault();
                    // setTabPopup('customers');
                    setActiveTab('customers')
                  }}
                >
                  ลูกค้า
                </button>
                <button
                  className={`px-6 py-2 font-medium w-[160px] transition-all duration-300 ease-in-out
                  ${activeTab === 'technicians'
                      ? 'bg-[#837958] text-white rounded-l-xl'
                      : 'text-[#837958] rounded-none'
                    }`}
                  onClick={(e) => {
                    e.preventDefault();
                    // setTabPopup('technicians');
                    setActiveTab('technicians')
                  }}
                >
                  เจ้าหน้าที่
                </button>
              </div>

              <div className='flex justify-center'>
                <div className="relative min-h-[400px]">  {/* ปรับตามความสูงฟอร์มที่ใหญ่สุด */}
                  <div
                    className={`transition-all duration-300 ease-in-out
                    ${['customers', 'technicians'].includes(activeTab)
                        ? 'opacity-100 translate-y-0'
                        : ''}
                    `}
                  >
                    <form onSubmit={handleSubmit}>

                      {(activeTab === 'customers') && (
                        <>
                          <div className="mb-2">
                            <label className="block text-[#BC9D72] mb-1 text-[12px]">ชื่อ-สกุล<span className="text-red-500">*</span></label>
                            <input name="name" value={customerData.name} onChange={handleCustomerChange}
                              placeholder="ชื่อ-สกุล"
                              className={`w-[320px] placeholder-[#BC9D72]/50 placeholder:text-[12px] border rounded-lg px-3 py-1.5 text-sm focus:outline-none
                              ${errors.name ? 'border-red-500' : 'border-[#837958]'}
                              `}
                            />
                          </div>

                          <div className="mb-2">
                            <label className="block text-[#BC9D72] mb-1 text-[12px]">เบอร์โทรศัพท์</label>
                            <input name="phone" value={customerData.phone} onChange={handleCustomerChange}
                              placeholder="เบอร์โทรศัพท์"
                              maxLength={15}
                              inputMode="numeric"
                              pattern="\d*"
                              className="w-[320px] placeholder-[#BC9D72]/50 placeholder:text-[12px] border border-[#837958] rounded-lg px-3 py-1.5 text-sm focus:outline-none" />
                          </div>

                          <div className="mb-2">
                            <label className="block text-[#BC9D72] mb-1 text-[12px]">บริษัท<span className="text-red-500">*</span></label>
                            <input name="companyName" value={customerData.companyName} onChange={handleCustomerChange}
                              placeholder="บริษัท"
                              className={`w-[320px] placeholder-[#BC9D72]/50 placeholder:text-[12px] border border-[#837958] rounded-lg px-3 py-1.5 text-sm focus:outline-none
                              ${errors.companyName ? 'border-red-500' : 'border-[#837958]'}`} />
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
                              className="w-[320px] placeholder-[#BC9D72]/50 placeholder:text-[12px] border border-[#837958] rounded-lg px-3 py-1.5 text-sm focus:outline-none" />
                          </div>

                          <div className="mb-2">
                            <label className="block text-[#BC9D72] mb-1 text-[12px]">อาคาร<span className="text-red-500">*</span></label>
                            <select
                              name="buildingName"
                              value={customerData.buildingName}
                              onChange={handleCustomerChange}
                              className={`w-[320px] text-[12px] text-[#BC9D72]/50 border 
                            ${errors.buildingName ? 'border-red-500' : 'border-[#837958]'} 
                            rounded-lg px-2 py-1.5 focus:outline-none`}
                            >
                              <option value="">เลือกอาคาร</option>
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
                              className="w-[320px] placeholder-[#BC9D72]/50 placeholder:text-[12px] border border-[#837958] rounded-lg px-3 py-1.5 text-sm focus:outline-none" />
                          </div>
                        </>
                      )}

                      {(activeTab === 'technicians') && (
                        <>
                          <div className="mb-2">
                            <label className="block text-[#BC9D72] mb-1 text-[12px]">ชื่อ-สกุล<span className="text-red-500">*</span></label>
                            <input name="name" value={technicianData.name} onChange={handleTechnicianChange}
                              placeholder="ชื่อ-สกุล"
                              className={`w-[320px] border border-[#837958] rounded-lg px-3 py-1.5 text-sm placeholder-[#BC9D72]/50 placeholder:text-[12px] focus:outline-none
                                ${errors.name ? 'border-red-500' : 'border-[#837958]'}`}
                            />
                          </div>

                          <div className="mb-12">
                            <label className="block text-[#BC9D72] mb-1 text-[12px]">เบอร์โทรศัพท์</label>
                            <input name="phone" value={technicianData.phone} onChange={handleTechnicianChange}
                              placeholder="เบอร์โทรศัพท์"

                              className="w-[320px] border border-[#837958] rounded-lg px-3 py-1.5 text-sm placeholder-[#BC9D72]/50 placeholder:text-[12px] focus:outline-none" />
                          </div>

                          <div className="mb-[64px]">
                            <div className="flex items-center justify-center mb-4">
                              <div className="w-full h-px bg-[#837958] opacity-60" />
                              <span className="mx-2 text-[#837958] font-semibold text-[18px]">Admin</span>
                              <div className="w-full h-px bg-[#837958] opacity-60" />
                            </div>

                            <div className="mb-2">
                              <label className="block text-[#BC9D72] mb-1 text-[12px]">Username</label>
                              <input
                                type="text"
                                name="username"
                                value={adminData.username}
                                onChange={(e) => setAdminData({ ...adminData, username: e.target.value })}
                                placeholder="Username"
                                className="w-[320px] border border-[#837958] rounded-lg px-3 py-1.5 text-sm placeholder-[#BC9D72]/50 placeholder:text-[12px] focus:outline-none"
                              />
                            </div>

                            <div className="mb-2">
                              <label className="block text-[#BC9D72] mb-1 text-[12px]">Password</label>
                              <input
                                type="password"
                                name="password"
                                value={adminData.password}
                                onChange={(e) => setAdminData({ ...adminData, password: e.target.value })}
                                placeholder="Password"
                                className="w-[320px] border border-[#837958] rounded-lg px-3 py-1.5 text-sm placeholder-[#BC9D72]/50 placeholder:text-[12px] focus:outline-none" />
                            </div>
                          </div>
                        </>
                      )}

                      {(activeTab === 'admin') && (
                        <>
                          <div className="mb-[64px]">
                            {/* <div className="flex items-center justify-center mb-4">
                              <div className="w-[120px] h-px bg-[#837958]" />
                              <span className="mx-2 text-[#837958] font-semibold text-[18px]">Admin</span>
                              <div className="w-[120px] h-px bg-[#837958]" />
                            </div> */}

                            <div className="mb-2">
                              <label className="block text-[#BC9D72] mb-1 text-[12px]">Username</label>
                              <input
                                type="text"
                                name="username"
                                value={adminData.username}
                                onChange={(e) => setAdminData({ ...adminData, username: e.target.value })}
                                placeholder="Username"
                                className="w-[320px] border border-[#BC9D72] rounded-lg px-3 py-1.5 text-sm placeholder-[#BC9D72]/50 placeholder:text-[12px] focus:outline-none"
                              />
                            </div>

                            <div className="mb-2">
                              <label className="block text-[#BC9D72] mb-1 text-[12px]">Password</label>
                              <input
                                type="password"
                                name="password"
                                value={adminData.password}
                                onChange={(e) => setAdminData({ ...adminData, password: e.target.value })}
                                placeholder="Password"
                                className="w-[320px] border border-[#BC9D72] rounded-lg px-3 py-1.5 text-sm placeholder-[#BC9D72]/50 placeholder:text-[12px] focus:outline-none" />
                            </div>
                          </div>
                        </>
                      )}

                      <div className={`flex flex-col`}>
                        <button
                          type="submit"
                          className="w-full mt-2 mb-2 bg-[#837958] text-white text-[12px] font-bold py-2 rounded-xl hover:opacity-90 transition"
                        >
                          {activeTab === 'customers' ? 'เพิ่มข้อมูลลูกค้า' : activeTab === 'technicians' ? 'เพิ่มข้อมูลเจ้าหน้าที่' : "เพิ่มข้อมูลแอดมิน"}
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
                      <th className="w-1 px-4 py-3 border-l-[1px] border-t-[1px] border-[#837958] bg-[#BC9D72]/50 text-center text-sm font-semibold text-black uppercase tracking-wider">
                        ลำดับ
                      </th>
                      <th className="w-52 px-4 py-3 border-t-[1px] border-[#837958] bg-[#BC9D72]/50 text-center text-sm font-semibold text-black uppercase tracking-wider">
                        อาคาร
                      </th>
                      <th className="w-48 px-4 py-3 border-t-[1px] border-[#837958] bg-[#BC9D72]/50 text-center text-sm font-semibold text-black uppercase tracking-wider">
                        บริษัท/ร้านค้า
                      </th>
                      <th className="w-1 px-4 py-3 border-t-[1px] border-[#837958] bg-[#BC9D72]/50 text-center text-sm font-semibold text-black uppercase tracking-wider">
                        ยูนิต
                      </th>
                      <th className="w-52 px-4 py-3 border-t-[1px] border-[#837958] bg-[#BC9D72]/50 text-center text-sm font-semibold text-black uppercase tracking-wider">
                        ลูกค้า
                      </th>
                      <th className="w-32 px-4 py-3 border-t-[1px] border-[#837958] bg-[#BC9D72]/50 text-center text-sm font-semibold text-black uppercase tracking-wider">
                        เบอร์โทรศัพท์
                      </th>
                      {/* <th className="px-5 py-3 border-[1px] border-[#837958] bg-[#BC9D72]/50 text-center text-sm font-semibold text-black uppercase tracking-wider">
                        Email
                      </th> */}
                      <th className="w-32 px-4 py-3 border-t-[1px] border-[#837958] bg-[#BC9D72]/50 text-center text-sm font-semibold text-black uppercase tracking-wider">
                        สถานะ Line
                      </th>
                      <th className="w-28 px-4 py-3 border-t-[1px] border-r-[1px] border-[#837958] bg-[#BC9D72]/50 text-center text-sm font-semibold text-black uppercase tracking-wider">
                        จัดการ
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {customers.length > 0 ? (
                      customers.map((customer, index) => (
                        <tr key={customer.id} className="hover:bg-gray-50">
                          <td className="px-4 py-2 border-l-[1px] border-b-[1px] border-[#837958] bg-white text-sm text-center">
                            {index + 1}
                          </td>
                          <td className="px-4 py-2 border-b-[1px] border-[#837958] bg-white text-sm text-center">
                            {customer.unit?.company?.building?.buildingName || '-'}
                          </td>
                          <td className="px-4 py-2 border-b-[1px] border-[#837958] bg-white text-sm text-center">
                            {customer.unit?.company?.companyName || '-'}
                          </td>
                          <td className="px-4 py-2 border-b-[1px] border-[#837958] bg-white text-sm text-center">
                            {customer.unit?.unitName || '-'}
                          </td>
                          <td className="px-4 py-2 border-b-[1px] border-[#837958] bg-white text-sm text-center">
                            {customer.name || '-'}
                          </td>
                          <td className="px-4 py-2 border-b-[1px] border-[#837958] bg-white text-sm text-center">
                            {customer.phone || '-'}
                          </td>
                          {/* <td className="px-5 py-4 border-b border-gray-200 bg-white text-sm">
                            {customer.email || '-'}
                          </td> */}
                          <td className="px-4 py-2 border-b-[1px] border-[#837958] bg-white text-sm">
                            {customer.userId ? (
                              <FaLine className="text-green-500 text-xl ml-8 p-0" title="เชื่อมต่อ Line แล้ว" />
                            ) : (
                              <FaLine className="text-red-500 text-xl ml-8 p-0" title="ยังไม่ได้เชื่อมต่อ Line" />
                            )}
                          </td>
                          <td className="px-4 py-2 border-r-[1px] border-b-[1px] border-[#837958] bg-white text-sm text-center">
                            <button
                              className="text-blue-500 hover:text-blue-700 mr-3"
                              title="แก้ไข"
                              onClick={() => {
                                // setPopupEditUser(true)
                                handleEditCustomer(customer.id)
                              }}
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
                      <th className="w-1 px-4 py-3 border-l-[1px] border-t-[1px] border-[#837958] bg-[#BC9D72]/50 text-center text-sm font-semibold text-black uppercase tracking-wider">
                        ลำดับ
                      </th>
                      <th className="px-4 py-3 border-t-[1px] border-[#837958] bg-[#BC9D72]/50 text-center text-sm font-semibold text-black uppercase tracking-wider">
                        เจ้าหน้าที่
                      </th>
                      <th className="px-4 py-3 border-t-[1px] border-[#837958] bg-[#BC9D72]/50 text-center text-sm font-semibold text-black uppercase tracking-wider">
                        เบอร์โทรศัพท์
                      </th>
                      <th className="px-4 py-3 border-t-[1px] border-[#837958] bg-[#BC9D72]/50 text-center text-sm font-semibold text-black uppercase tracking-wider">
                        สถานะ Line
                      </th>
                      <th className="px-4 py-3 border-t-[1px] border-[#837958] bg-[#BC9D72]/50 text-center text-sm font-semibold text-black uppercase tracking-wider">
                        สังกัด
                      </th>  
                      <th className="px-4 py-3 border-t-[1px] border-r-[1px] border-[#837958] bg-[#BC9D72]/50 text-center text-sm font-semibold text-black uppercase tracking-wider">
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
                            <td className="px-4 py-2 border-l-[1px] border-b-[1px] border-[#837958] bg-white text-sm text-center">
                              {index + 1}
                            </td>
                            <td className="px-4 py-2 border-b-[1px] border-[#837958] bg-white text-sm text-center">
                              {tech.name || '-'}
                            </td>
                            <td className="px-4 py-2 border-b-[1px] border-[#837958] bg-white text-sm text-center">
                              {tech.phone || '-'}
                            </td>
                            <td className="px-4 py-2 border-b-[1px] border-[#837958] bg-white text-sm text-center">
                              {tech.userId ? (
                                <>
                                  <FaLine className="text-green-500 text-xl ml-8 p-0" title="เชื่อมต่อ Line แล้ว" />
                                </>
                              ) : (
                                <>
                                  <FaLine className="text-red-500 text-xl ml-8 p-0" title="ยังไม่ได้เชื่อมต่อ Line" />
                                </>
                              )}
                            </td>
                            <td className="px-4 py-2 border-b-[1px] border-[#837958] bg-white text-sm text-center">
                              {uniqueBuildings.length > 0 ? (
                                <div className="flex flex-row space-x-2">
                                  {uniqueBuildings.join(', ')}
                                </div>
                              ) : '-'}
                            </td>
                            <td className="px-4 py-2 border-r-[1px] border-b-[1px] border-[#837958] bg-white text-sm text-center">
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

            {/* Admin */}
            {
              activeTab === "admin" && (
                <div className="bg-white shadow-md overflow-hidden">
                  <table className="min-w-full leading-normal">
                    <thead>
                      <tr>
                        <th className="w-1 px-4 py-2 border-l-[1px] border-t-[1px] border-[#837958] bg-[#BC9D72]/50 text-center text-sm font-semibold text-black uppercase tracking-wider">
                          ลำดับ
                        </th>
                        <th className="px-4 py-2 border-t-[1px] border-[#837958] bg-[#BC9D72]/50 text-center text-sm font-semibold text-black uppercase tracking-wider">
                          ชื่อผู้ใช้งาน
                        </th>
                        {/* <th className="px-4 py-3 border-t-[1px] border-[#837958] bg-[#BC9D72]/50 text-center text-sm font-semibold text-black uppercase tracking-wider">
                          รหัสผ่าน
                        </th> */}
                        <th className="w-24 px-4 py-3 border-r-[1px] border-t-[1px] border-[#837958] bg-[#BC9D72]/50 text-center text-sm font-semibold text-black uppercase tracking-wider">
                          จัดการ
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {
                        admin.length > 0 ? (
                          admin.map((admin, index) => (
                            <tr key={admin.id} className="hover:bg-gray-50">
                              <td className="px-4 border-l-[1px] border-b-[1px] border-[#837958] bg-white text-sm text-center">
                                {index + 1}
                              </td>
                              <td className="px-4 border-b-[1px] border-[#837958] bg-white text-sm text-center">
                                {admin.username}
                              </td>
                              {/* <td className="px-4 border-b-[1px] border-[#837958] bg-white text-sm text-center">
                                <span className='mx-2'>
                                  {showPasswords[admin.id] ? admin.password : "********"}
                                </span>
                                <button onClick={() => toggleShowPassword(admin.id)} className="focus:outline-none">
                                  {showPasswords[admin.id] ? <FaEyeSlash /> : <FaEye />}
                                </button>
                              </td> */}
                              <td className="h-[16px] px-4 py-2 border-r-[1px] border-b-[1px] border-[#837958] text-sm">
                                <button
                                  className="text-blue-500 hover:text-blue-700 mr-3"
                                  title="แก้ไข"
                                  onClick={() => handleEditAdmin(admin.id)}
                                >
                                  <UserPen className="inline-block" />
                                </button>
                                <button
                                  className="text-red-500 hover:text-red-700"
                                  title="ลบ"
                                  onClick={() => confirmDelete(admin.id)}
                                >
                                  <Trash2 className="inline-block" />
                                </button>
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan="4" className="text-center py-4 text-gray-500">
                              ไม่มีข้อมูลผู้ใช้งาน
                            </td>
                          </tr>
                        )
                      }
                    </tbody>
                  </table>
                </div>
              )
            }

            {popupEditUser && (
              <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
                <div className="bg-white max-w-xl w-full mx-4 rounded-lg shadow-lg p-6 relative">

                  {/* ปุ่มปิด */}
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

            {/* Popup ยืนยันการลบ */}
            {showConfirmPopup && (
              <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/70">
                <div className="bg-white rounded-2xl shadow-lg p-6 w-[360px] h-[120px] text-center">
                  <p className="text-lg font-semibold text-[#837958]">ยืนยันการลบ{activeTab === 'customers' ? "ลูกค้า" : activeTab === 'technicians' ? "เจ้าหน้าที่" : "แอดมิน"}</p>
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
                      <h2 className="text-lg font-semibold">กำลังโหลด...</h2>
                    </div>
                  ) : popupStatus === "success" ? (
                    <div className="flex flex-col items-center justify-center text-[#837958] text-center">
                      <CircleCheck size={50} strokeWidth={1} className="mb-2" />
                      <h2 className="text-lg font-semibold">
                        {activeTab === "customers" ? "เพิ่มข้อมูลลูกค้าสำเร็จ" : activeTab === "technicians" ? "เพิ่มข้อมูลเจ้าหน้าที่สำเร็จ" : "เพิ่มข้อมูลแอดมินสำเร็จ"}
                      </h2>
                    </div>
                  ) : popupStatus === "delete" ? (
                    <div className="flex flex-col items-center justify-center text-[#837958] text-center">
                      <CircleCheck size={50} strokeWidth={1} className="mb-2" />
                      <h2 className="text-lg font-semibold">
                        {activeTab === "customers" ? "ลบข้อมูลลูกค้าสำเร็จ" : activeTab === "technicians" ? "ลบข้อมูลเจ้าหน้าที่สำเร็จ" : "ลบข้อมูลแอดมินสำเร็จ"}
                      </h2>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center text-[#837958] text-center">
                      <CircleX size={50} strokeWidth={1} className="mb-2" />
                      <h2 className="text-lg font-semibold">
                        {activeTab === "customers" ? "เพิ่มข้อมูลลูกค้าไม่สำเร็จ" : activeTab === "technicians" ? "เพิ่มข้อมูลเจ้าหน้าที่ไม่สำเร็จ" : "เพิ่มข้อมูลแอดมินไม่สำเร็จ"}
                      </h2>
                    </div>
                  )}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </AdminLayout >
  );
};

export default User;