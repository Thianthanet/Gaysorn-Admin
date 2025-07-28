import React, { useEffect, useState, useRef } from 'react';
import AdminLayout from './AdminLayout';
import { useNavigate } from 'react-router-dom';
// import { BiSearchAlt2 } from "react-icons/bi";
// import { CircleCheck, CircleX } from "lucide-react";
// import { HiChevronDown } from "react-icons/hi";
// import { FaLine, FaEye, FaEyeSlash } from 'react-icons/fa';
// import { UserPen, Trash2 } from 'lucide-react';
import UserToolbar from '../component/UserToolbar';
import UserPopup from '../component/UserPopup';
import CustomerTable from '../component/CustomerTable';
import TechnicianTable from '../component/TechnicianTable';
import AdminTable from '../component/AdminTable';
import ConfirmDeletePopup from '../component/ConfirmDeletePopup';
import StatusPopup from '../component/StatusPopup';
import * as XLSX from 'xlsx'
// import { exportToExcel } from '../utils/exportUtils';
import axios from 'axios';

const User = () => {
  const [customers, setCustomers] = useState([]);
  const [technicians, setTechnicians] = useState([]);
  const [isEditModeTechnicians, setIsEditModeTechnicians] = useState(false);
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
  const [selectedBuildings, setSelectedBuildings] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [units, setUnits] = useState([]);
  const [confirmDeleteId, setConfirmDeleteId] = useState(null); // สำหรับเก็บ ID ที่จะลบ
  const [showConfirmPopup, setShowConfirmPopup] = useState(false); // คุมการแสดง popup

  // const [tabPopup, setTabPopup] = useState('customers');
  const [errors, setErrors] = useState({});
  const [popupMessage, setPopupMessage] = useState('');

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
      return;
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

        }
        // else if (activeTab === 'waitForApprove') {
        //   await handleGetWaitForApprove(searchTerm); // ส่ง searchTerm เข้าไปให้ด้วย ถ้าอยากให้ฟิลเตอร์ฝั่งนั้น
        // }
        else if (activeTab === 'admin') {
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

  // useEffect(() => {
  //   handleGetWaitForApprove()
  // }, [])

  // const handleGetWaitForApprove = async () => {
  //   try {
  //     const response = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/api/waitApprove`);
  //     console.log('Wait for approve data:', response.data.data);
  //     setWaitForApprove(response.data.data);
  //   } catch (error) {
  //     console.error('Error fetching wait for approve data:', error);
  //   }
  // }

  // const handleApprove = async (userId) => {
  //   try {
  //     const response = await axios.post(`${import.meta.env.VITE_API_BASE_URL}/api/approve/${userId}`);
  //     console.log('Approve response:', response.data);
  //     if (response.data) {
  //       // Refresh the wait for approve list
  //       await handleGetWaitForApprove();
  //       alert('User approved successfully');
  //     } else {
  //       alert('Failed to approve user');
  //     }
  //   } catch (error) {
  //     console.error('Error approving user:', error);
  //   }
  // }

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

  const handleEditCustomer = async (userId) => {
    try {
      const res = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/api/getCustomerById/${userId}`);
      const customer = res.data.data;
      // console.log("customer: ", customer)

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

      setActiveTab('customers');
      setPopupCreateUser(true);

    } catch (err) {
      console.error('ไม่สามารถโหลดข้อมูลลูกค้า:', err);
    }
  };

  useEffect(() => {
    // handleGetTechnician();
    handleGetBuilding();
  }, []);

  // const handleGetTechnician = async (userId) => {
  //   try {
  //     const response = await axios.get(
  //       `${import.meta.env.VITE_API_BASE_URL}/api/getUser/${userId}`
  //     );
  //     setTechnicianData(response.data.data);
  //   } catch (error) {
  //     console.error('Error fetching technician data:', error);
  //     // setIsLoading(false);
  //   }
  // };

  const handleBuildingToggle = buildingId => {
    setSelectedBuildings(prev =>
      prev.includes(buildingId)
        ? prev.filter(id => id !== buildingId)
        : [...prev, buildingId]
    );
  };

  const handleEditTechnician = async (userId) => {
    try {
      const res = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/api/getTechnicianById/${userId}`);
      const technician = res.data.data;
      console.log("technician: ", technician)
      // console.log("technician userId: ", userId)

      // ดึงข้อมูล buildings
      const resBuildings = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/api/getBuilding`);
      const buildingsData = resBuildings.data.data;

      // Map อาคารที่ technician มีสิทธิ์อยู่
      const matchedBuildingIds = buildingsData
        .filter(building =>
          technician.techBuilds?.some(
            techBuild => techBuild.building.buildingName === building.buildingName
          )
        )
        .map(building => building.id);

      console.log("Matched Buildings:", matchedBuildingIds);

      // Set อาคารที่เลือก
      setSelectedBuildings(matchedBuildingIds);

      setTechnicianData({
        id: technician.id,
        userId: technician.userId,
        name: technician.name,
        phone: technician.phone,
      });

      setIsEditModeTechnicians(true)
      setActiveTab('technicians');
      setPopupCreateUser(true);

    } catch (err) {
      console.error('ไม่สามารถโหลดข้อมูลลูกค้า:', err);
    }
  };

  const handleEditAdmin = async (userId) => {
    try {
      const response = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/api/getAdminById/${userId}`)
      const admin = response.data.data
      console.log("admin: ", admin)

      setAdminData({
        id: admin.id,
        username: admin.username,
        password: admin.password,
      });

      // setIsEditModeTechnicians(true)
      setActiveTab('admin');
      setPopupCreateUser(true);

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
  //   // navigate(`/editCustomer/${userId}`);
  //   setEditingCustomerId(id);
  // }

  // const handleEditTechnician = (userId) => {
  //   navigate(`/editTechnician/${userId}`);
  // };

  // const handleEditAdmin = (id) => {
  //   navigate(`/editAdmin/${id}`)
  // }

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

  const handleSubmit = async (e) => {
    e.preventDefault();

    const newErrors = {};

    if (activeTab === 'customers') {
      if (!customerData.name) newErrors.name = 'กรุณากรอกชื่อ-สกุล';
      if (!customerData.companyName) newErrors.companyName = 'กรุณากรอกบริษัท';
      if (!customerData.buildingName) newErrors.buildingName = 'กรุณากรอกอาคาร';
    } else if (activeTab === 'technicians') {
      if (!technicianData.name) newErrors.name = 'กรุณากรอกชื่อ-สกุล';
    } else if (activeTab === 'admin') {
      // if (!adminData.name) newErrors.name = 'กรุณาใส่ username';
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

    // const hasTechnicianData = technicianData.name.trim() !== '' || technicianData.phone.trim() !== '';
    // const hasAdminData = adminData.username.trim() !== '' && adminData.password.trim() !== '';

    // console.log("customerDataUpdate", customerDataUpdate)

    try {
      if (activeTab === 'customers') {
        if (customerData.id) {
          // กำลัง "แก้ไข"
          console.log("customerData.email: ", customerData.email)
          await axios.patch(`${import.meta.env.VITE_API_BASE_URL}/api/updateCustomer`, {
            id: customerData.id,
            name: customerData.name,
            phone: customerData.phone,
            buildingId: customerData.buildingId,
            companyId: customerData.companyId,
            companyName: customerData.companyName,
            unitId: customerData.unitId,
            unitName: customerData.unitName,
            email: customerData.email,
          });
          setTimeout(() => setPopupStatus("update"));
        } else {
          // ➕ เพิ่มลูกค้าใหม่
          await axios.post(`${import.meta.env.VITE_API_BASE_URL}/api/createCustomer`, customerData);
          setTimeout(() => setPopupStatus("success"));
        }
      }

      if (activeTab === 'technicians') {
        console.log("technicianData: ", technicianData)
        if (technicianData.id) {
          await axios.patch(`${import.meta.env.VITE_API_BASE_URL}/api/updateTechnician`, {
            id: technicianData.id,
            name: technicianData.name,
            phone: technicianData.phone,
          });

          // อัปเดตอาคาร
          await axios.post(
            `${import.meta.env.VITE_API_BASE_URL}/api/techUpdateBuilding`,
            {
              techId: technicianData.userId,
              buildingIds: selectedBuildings,
            }
          );

          setTimeout(() => setPopupStatus("update"));
          setIsEditModeTechnicians(false)
        } else {
          await axios.post(`${import.meta.env.VITE_API_BASE_URL}/api/createTechnician`, technicianData);
          setTimeout(() => setPopupStatus("success"));
        }
      }

      if (activeTab === 'admin') {
        if (adminData.id) {
          await axios.patch(`${import.meta.env.VITE_API_BASE_URL}/api/updateAdmin`, {
                id: adminData.id,
                username: adminData.username,
                password: adminData.password,
            })
            setTimeout(() => setPopupStatus("update"));
        } else {
          await axios.post(`${import.meta.env.VITE_API_BASE_URL}/api/createAdmin`, adminData);
          setTimeout(() => setPopupStatus("success"));
        }
      }

      setTimeout(() => {
        setPopupStatus(null);
        setPopupCreateUser(false);
        window.location.reload(); // หรือ fetch ข้อมูลใหม่แทนการ reload
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

  // console.log("customerData: ", customerData)

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
        // onSearch={(value) => setSearchInput(value)} // optional
        />

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
          isEditModeTechnicians={isEditModeTechnicians}
          selectedBuildings={selectedBuildings}
          handleBuildingToggle={handleBuildingToggle}
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