import React, { useEffect, useState, useCallback, useContext } from 'react';
import AdminLayout from './AdminLayout';
import { useNavigate } from 'react-router-dom';
import UserToolbar from '../component/UserToolbar';
import UserPopup from '../component/UserPopup';
import CustomerTable from '../component/CustomerTable';
import TechnicianTable from '../component/TechnicianTable';
import AdminTable from '../component/AdminTable';
import ConfirmDeletePopup from '../component/ConfirmDeletePopup';
import StatusPopup from '../component/StatusPopup';
import * as XLSX from 'xlsx';
import axios from 'axios';
import WaitApproveTable from '../component/WaitApproveTable';
import { Pagination } from '../component/Pagination'; // ตรวจสอบ path ให้ถูกต้อง

import { UserTabContext } from "../contexts/UserTabContext";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const User = () => {
  // --- State Management ---
  // Data for tables
  const [customers, setCustomers] = useState([]);
  const [technicians, setTechnicians] = useState([]);
  const [admin, setAdmin] = useState([]);
  const [waitForApprove, setWaitForApprove] = useState([]);

  // NEW: State to hold ALL filtered data (before pagination) for each tab
  const [allCustomersData, setAllCustomersData] = useState([]);
  const [allTechniciansData, setAllTechniciansData] = useState([]);
  const [allAdminData, setAllAdminData] = useState([]);
  const [allWaitForApproveData, setAllWaitForApproveData] = useState([]);

  // UI state
  // const [activeTab, setActiveTab] = useState('');
  const { activeTab, setActiveTab } = useContext(UserTabContext);

  const [loading, setLoading] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const navigate = useNavigate();

  // Search and Filter state
  const [searchInput, setSearchInput] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterBuilding, setFilterBuilding] = useState('all');

  // Popup and Form state
  const [popupCreateUser, setPopupCreateUser] = useState(false);
  const [popupStatus, setPopupStatus] = useState(null); // e.g., "loading", "success", "delete", "error", null
  const [popupMessage, setPopupMessage] = useState('');
  const [errors, setErrors] = useState({});

  // Building/Company/Unit data for dropdowns
  const [buildings, setBuildings] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [units, setUnits] = useState([]);
  const [selectedBuildings, setSelectedBuildings] = useState([]); // For technician building access

  const [companyId, setCompanyId] = useState("");
  const [unitId, setUnitId] = useState("");
  const [buildingId, setBuildingId] = useState("");

  // Data for create/edit forms
  const [customerFormData, setCustomerFormData] = useState({
    id: null, // Used for editing existing customer
    name: '',
    phone: '',
    email: '',

    companyName: '',
    companyId: '', // For API payload

    unitName: '',
    unitId: '', // For API payload

    buildingName: '',
    buildingId: '', // For API payload
  });

  const [technicianFormData, setTechnicianFormData] = useState({
    id: null, // Used for editing existing technician
    userId: null, // Backend user ID
    name: '',
    phone: '',
  });

  const [adminFormData, setAdminFormData] = useState({
    id: null, // Used for editing existing admin
    username: '',
    password: '',
  });

  // Delete Confirmation state
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);
  const [showConfirmPopup, setShowConfirmPopup] = useState(false);

  // === New States for Pagination ===
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(25); // You can make this configurable if needed

  // --- NEW States for Approve Confirmation Popup ---
  const [showConfirmApprovePopup, setShowConfirmApprovePopup] = useState(false);
  const [approveUserId, setApproveUserId] = useState(null); // เก็บ userId ที่จะอนุมัติ

  // --- Helper Functions ---

  /**
   * Transforms technician's associated buildings into a unique list of building names.
   * @param {Array} techBuilds - Array of technician's building associations.
   * @returns {Array} - Array of unique building names (limited to first 3).
   */
  const getUniqueBuildings = (techBuilds) => {
    if (!techBuilds || techBuilds.length === 0) return [];

    const uniqueBuildingNames = [];
    const seen = new Set();

    techBuilds.forEach(build => {
      const buildingName = build.building?.buildingName;
      if (buildingName && !seen.has(buildingName)) {
        seen.add(buildingName);
        uniqueBuildingNames.push(buildingName);
      }
    });
    return uniqueBuildingNames.slice(0, 3);
  };

  /**
   * Displays a temporary popup message.
   * @param {string} message - The message to display.
   * @param {number} duration - How long the message should be visible in ms.
   */
  const showTempPopupMessage = useCallback((message) => {
    setPopupMessage(message);
    setTimeout(() => {
      setPopupMessage('');
    }, 3000);
  }, []);

  /**
   * Handles status popup display and dismissal.
   * @param {string} statusType - "loading", "success", "update", "delete", "error"
   * @param {boolean} shouldReload - Whether to reload the page after status popup.
   */
  const handlePopupStatus = useCallback((statusType, shouldReload = false) => {
    setPopupStatus(statusType);
    setTimeout(() => {
      setPopupStatus(null);
      setPopupCreateUser(false);
      if (shouldReload) {
        // console.log("fetchData")
        setCurrentPage(1);
        // setActiveTab(activeTab)
        fetchData();
        // window.location.reload();
      }
    }, 2500);
  }, [activeTab]);

  const handleSearch = () => {
    setSearchTerm(searchInput); // อัปเดต searchTerm จาก searchInput
    setCurrentPage(1); // รีเซ็ตหน้าเมื่อค้นหา
  };

  const handleActiveTabChange = (tabValue) => {
    setActiveTab(tabValue);
    setCurrentPage(1); // รีเซ็ตหน้าเมื่อเปลี่ยน Tab
    setSearchTerm(''); // รีเซ็ต searchTerm
    setSearchInput(''); // รีเซ็ต input field
    setFilterBuilding('all'); // รีเซ็ต filterBuilding
  };

  const handleFilterBuildingChange = (buildingName) => {
    setFilterBuilding(buildingName);
    setCurrentPage(1); // รีเซ็ตหน้าเมื่อ filter อาคาร
  };

  // const handlePageChange = (pageNumber) => {
  //   setCurrentPage(pageNumber);
  //   // Scroll to top of the page when changing page
  //   // window.scrollTo({ top: 0, behavior: "smooth" }); // ย้ายไปใน Pagination Component แล้ว
  // };

  const handleItemsPerPageChange = (num) => {
    setItemsPerPage(num);
    setCurrentPage(1); // เมื่อเปลี่ยนจำนวนรายการต่อหน้า ให้กลับไปหน้าแรก
  };

  // Filter and Search Logic
  const filterAndSearchData = (data, isBuildingFilterable = true) => {
    let filteredData = data;

    // console.log("filteredData in filterAndSearchData: ", filteredData)

    // Filter by Building (ถ้าเป็น Technician หรือ Customer และ filterBuilding ไม่ใช่ 'all')
    if (activeTab === 'customers' && filterBuilding !== 'all' && filterBuilding !== '') {
      filteredData = filteredData.filter(item => item?.unit?.company?.building?.buildingName === filterBuilding);
    }

    if (activeTab === 'technicians' && filterBuilding !== 'all' && filterBuilding !== '') {
      filteredData = filteredData.filter(item =>
        // ตรวจสอบว่า item.techBuilds เป็น array และมีอย่างน้อย 1 building ที่ตรงกับ filterBuilding
        item.techBuilds && Array.isArray(item.techBuilds) && item.techBuilds.some(t => t?.building?.buildingName === filterBuilding)
      );
    }

    // Search by searchTerm
    if (searchTerm) {
      const lowerCaseSearchTerm = searchTerm.toLowerCase();
      filteredData = filteredData.filter(item =>
        item.username?.toLowerCase().includes(lowerCaseSearchTerm) ||
        item.firstName?.toLowerCase().includes(lowerCaseSearchTerm) ||
        item.lastName?.toLowerCase().includes(lowerCaseSearchTerm) ||
        item.email?.toLowerCase().includes(lowerCaseSearchTerm) ||
        (item.buildingName && item.buildingName.toLowerCase().includes(lowerCaseSearchTerm))
      );
    }
    return filteredData;
  };

  // --- API Fetching Functions ---

  const fetchBuildings = useCallback(async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/api/getBuilding`);
      setBuildings(res.data.data);
    } catch (error) {
      console.error('Error fetching buildings:', error);
    }
  }, []);

  const fetchCompanies = useCallback(async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/api/getCompany`);
      // console.log("fetchCompanies: ", res)
      setCompanies(res.data.data);
    } catch (error) {
      console.error('Error fetching companies:', error);
    }
  }, []);

  const fetchUnits = useCallback(async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/api/getUnits`);
      setUnits(res.data.data);
    } catch (error) {
      console.error('Error fetching units:', error);
    }
  }, []);

  useEffect(() => {
    fetchBuildings();
    fetchCompanies();
    fetchUnits();
  }, []);

  // console.log("buildings: ", buildings)
  // console.log("companies: ", companies)
  // console.log("units: ", units)

  const fetchAdmin = useCallback(async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/getAdmin`);
      setAdmin(response.data.data);
    } catch (error) {
      console.error('Error fetching admin data:', error);
    }
  }, []);

  const fetchWaitForApprove = useCallback(async () => {
    try {
      // const response = await axios.get(`${API_BASE_URL}/api/waitApprove`);
      const response = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/api/waitApprove`);
      // console.log("waitApprove: ", response.data.data)
      setWaitForApprove(response.data.data);
    } catch (error) {
      console.error('Error fetching wait for approve data:', error);
    }
  }, []);

  // console.log("filterBuilding: ", filterBuilding)

  // Centralized data fetching, filtering, and storing in `all...Data` states
  const fetchData = useCallback(async () => {
    setLoading(true);
    setCurrentPage(1); // Reset page to 1 on new data fetch/filter/search
    const term = searchTerm.toLowerCase();

    console.log(`[fetchData] Fetching for activeTab: ${activeTab}, searchTerm: '${term}', filterBuilding: '${filterBuilding}'`);

    try {
      let response;
      let rawData = [];
      let filteredData = [];

      switch (activeTab) {
        case 'customers':
          response = await axios.get(`${API_BASE_URL}/api/allCustomer`);
          // rawData = response.data.data;
          const sortedCustomers = response.data.data.sort((a, b) => {
            return new Date(b.createdAt) - new Date(a.createdAt); // b - a สำหรับใหม่ไปเก่า (Descending)
          });
          filteredData = sortedCustomers.filter(c => {
            const matchesSearch =
              (c.name?.toLowerCase().includes(term) ||
                c.phone?.toLowerCase().includes(term) ||
                // console.log(c.phone?.toLowerCase().includes(term))||
                // console.log(c.phone?.toLowerCase()) ||
                c.unit?.company?.building?.buildingName?.toLowerCase().includes(term) ||
                c.unit?.unitName?.toLowerCase().includes(term) ||
                c.unit?.company?.companyName?.toLowerCase().includes(term));
            const matchesBuilding = filterBuilding === 'all' || !filterBuilding || c.unit?.company?.building?.buildingName === filterBuilding;
            return matchesSearch && matchesBuilding;
          });
          console.log("CustomersData:", filteredData)
          setAllCustomersData(filteredData);
          break;

        case 'technicians':
          response = await axios.get(`${API_BASE_URL}/api/getTech`);
          // rawData = response.data.data;
          // console.log("rawData: ", rawData)
          const sortedTechnicians = response.data.data.sort((a, b) => {
            return new Date(b.createdAt) - new Date(a.createdAt); // b - a สำหรับใหม่ไปเก่า (Descending)
          });
          filteredData = sortedTechnicians.filter(t => {
            const matchesSearch =
              (t.name?.toLowerCase().includes(term) ||
                t.phone?.toLowerCase().includes(term) ||
                t.techBuilds?.some(b => b.building?.buildingName?.toLowerCase().includes(term)));
            const matchesBuilding = filterBuilding === 'all' || !filterBuilding || t.techBuilds?.some(b => b.building?.buildingName === filterBuilding);
            return matchesSearch && matchesBuilding;
          });
          console.log("TechniciansData:", filteredData)
          setAllTechniciansData(filteredData);
          break;

        case 'waitApprove':
          response = await axios.get(`${API_BASE_URL}/api/waitApprove`);
          // rawData = response.data.data;
          const sortedWaitApproves = response.data.data.sort((a, b) => {
            return new Date(b.createdAt) - new Date(a.createdAt); // b - a สำหรับใหม่ไปเก่า (Descending)
          });
          // console.log("sortedWaitApproves: ", sortedWaitApproves)
          filteredData = sortedWaitApproves.filter(w => {
            const matchesSearch =
              (w.name?.toLowerCase().includes(term) ||
                w.phone?.toLowerCase().includes(term) ||
                w.unit?.unitName?.toLowerCase().includes(term) ||
                w.unit?.company?.companyName?.toLowerCase().includes(term) ||
                w.unit?.company?.building?.buildingName?.toLowerCase().includes(term));
            const matchesBuilding = filterBuilding === 'all' || !filterBuilding || w.unit?.company?.building?.buildingName === filterBuilding;
            return matchesSearch && matchesBuilding;
          });
          console.log("WaitForApproveData:", filteredData)
          setAllWaitForApproveData(filteredData);
          // setWaitForApprove(filteredData);
          break;

        case 'admin':
          response = await axios.get(`${API_BASE_URL}/api/getAdmin`);
          // rawData = response.data.data;
          const sortedAdmin = response.data.data.sort((a, b) => {
            return new Date(b.createdAt) - new Date(a.createdAt); // b - a สำหรับใหม่ไปเก่า (Descending)
          });
          filteredData = sortedAdmin.filter(a => {
            const matchesSearch = a.username?.toLowerCase().includes(term);
            // Admin tab does not seem to use building filter based on your code
            return matchesSearch;
          });
          console.log("AdminData:", filteredData)
          setAllAdminData(filteredData);
          break;

        default:
          break;
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      // Clear data states on error
      setAllCustomersData([]);
      setAllTechniciansData([]);
      setAllAdminData([]);
      setAllWaitForApproveData([]);
    } finally {
      setLoading(false);
    }
  }, [activeTab, searchTerm, filterBuilding]); //activeTab

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // const fetchWaitApproveData = async (term, filterBuilding) => {
  //   const response = await axios.get(`${API_BASE_URL}/api/waitApprove`);

  //   const sortedWaitApproves = response.data.data.sort((a, b) => {
  //     return new Date(b.createdAt) - new Date(a.createdAt); // ใหม่ -> เก่า
  //   });

  //   const filteredData = sortedWaitApproves.filter(w => {
  //     const matchesSearch =
  //       (w.name?.toLowerCase().includes(term) ||
  //         w.phone?.toLowerCase().includes(term) ||
  //         w.unit?.unitName?.toLowerCase().includes(term) ||
  //         w.unit?.company?.companyName?.toLowerCase().includes(term) ||
  //         w.unit?.company?.building?.buildingName?.toLowerCase().includes(term));

  //     const matchesBuilding =
  //       filterBuilding === 'all' || !filterBuilding ||
  //       w.unit?.company?.building?.buildingName === filterBuilding;

  //     return matchesSearch && matchesBuilding;
  //   });

  //   console.log("WaitForApproveData:", filteredData);
  //   setAllWaitForApproveData(filteredData);
  // };

  // useEffect(() => {
  //   fetchWaitApproveData();
  // }, []);

  // --- Handlers for Form Changes ---

  const handleCustomerChange = useCallback(async (e) => {
    const { name, value } = e.target;

    // Phone number input formatting
    if (name === 'phone') {
      const onlyNums = value.replace(/\D/g, '');
      setCustomerFormData(prev => ({ ...prev, phone: onlyNums.slice(0, 15) }));
      return;
    }

    // Email validation (basic client-side, server-side validation is still critical)
    if (name === 'email') {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (value && !emailRegex.test(value)) {
        setErrors(prev => ({ ...prev, email: 'รูปแบบอีเมลไม่ถูกต้อง' }));
      } else {
        setErrors(prev => {
          const newErrors = { ...prev };
          delete newErrors.email;
          return newErrors;
        });
      }
    }

    // Set the form data for the current input
    setCustomerFormData(prev => ({ ...prev, [name]: value }));

    // Auto-fill logic for related fields
    if (name === 'companyName') {
      const selectedCompany = companies.find(c => c.companyName === value);

      // เตรียม object สำหรับอัปเดต state ทั้งหมดในครั้งเดียว
      const newState = {
        companyId: selectedCompany?.id || '',
        companyName: value,
        unitId: '',
        unitName: '',
        buildingId: '',
        buildingName: '',
      };

      if (selectedCompany) {
        const selectedUnit = units.find(u => u.companyId === selectedCompany.id);
        const selectedBuilding = buildings.find(b => b.id === selectedCompany.buildingId);

        if (selectedUnit) {
          newState.unitId = selectedUnit.id;
          newState.unitName = selectedUnit.unitName;
        }
        if (selectedBuilding) {
          newState.buildingId = selectedBuilding.id;
          newState.buildingName = selectedBuilding.buildingName;
        }
      }

      // อัปเดต state เพียงครั้งเดียว
      setCustomerFormData(prev => ({ ...prev, ...newState }));
    } else if (name === 'unitName') {
      const selectedUnit = units.find(u => u.unitName === value);

      const newState = {
        unitId: selectedUnit?.id || '',
      };

      if (selectedUnit) {
        const selectedCompany = companies.find(c => c.id === selectedUnit.companyId);

        newState.companyId = selectedUnit.companyId;
        newState.companyName = selectedCompany?.companyName || '';
        newState.buildingId = selectedCompany?.buildingId || '';
        newState.buildingName = buildings.find(b => b.id === selectedCompany?.buildingId)?.buildingName || '';
      } else {
        newState.companyId = '';
        newState.companyName = '';
        newState.buildingId = '';
        newState.buildingName = '';
      }

      setCustomerFormData(prev => ({ ...prev, ...newState }));
    } else {
      console.log("customerFormData: ", customerFormData)
      const selectedCompany = companies.find(c => c.id === customerFormData.companyId);
      const selectedBuilding = buildings.find(b => b.id === customerFormData.buildingId);

      // ตรวจสอบว่า buildingName ไม่ตรงกับค่าใดๆ ใน selectedCompany หรือ selectedUnit
      if (!selectedCompany || !selectedBuilding) {
        setErrors(prev => ({ ...prev, buildingName: 'ข้อมูลตึกไม่ถูกต้องหรือไม่ตรงกับบริษัทที่เลือก' }));
        // อาจจะต้องเคลียร์ค่าที่ผิดออก
        setCustomerFormData(prev => ({
          ...prev,
          companyName: '',
          buildingId: '',
          buildingName: '',
        }));
      } else {
        // ถ้าถูกต้อง ให้เคลียร์ Error ออก
        setErrors(prev => {
          const newErrors = { ...prev };
          delete newErrors.buildingName;
          return newErrors;
        });
        
        setCustomerFormData((prev) => ({
          ...prev,
          companyName: selectedCompany.companyName,
          buildingId: selectedCompany.buildingId,
          buildingName: selectedBuilding.buildingName,
        }));
      }
    }
  }, [setErrors, setCustomerFormData, companies, units, buildings]);

  const handleTechnicianChange = useCallback((e) => {
    const { name, value } = e.target;
    if (name === 'phone') {
      const onlyNums = value.replace(/\D/g, '');
      setTechnicianFormData(prev => ({ ...prev, phone: onlyNums.slice(0, 15) }));
    } else {
      setTechnicianFormData(prev => ({ ...prev, [name]: value }));
    }
  }, []);

  // console.log("TechnicianFormData: ", technicianFormData)

  const handleAdminChange = useCallback((e) => {
    const { name, value } = e.target;
    setAdminFormData(prev => ({ ...prev, [name]: value }));
  }, []);

  const handleBuildingToggle = useCallback((buildingId) => {
    setSelectedBuildings(prev =>
      prev.includes(buildingId)
        ? prev.filter(id => id !== buildingId)
        : [...prev, buildingId]
    );
  }, []);

  // --- Edit Data Loaders ---

  const handleEditCustomer = useCallback(async (userId) => {
    try {
      const res = await axios.get(`${API_BASE_URL}/api/getCustomerById/${userId}`);
      const customer = res.data.data;
      console.log("customer in handleEditCustomer: ", customer)
      setCustomerFormData({
        id: customer.id,
        name: customer.name,
        phone: customer.phone,
        buildingId: customer.unit?.company?.buildingId || '',
        companyId: customer.unit?.companyId || '',
        companyName: customer.unit?.company?.companyName || '',
        unitId: customer.unitId || '',
        unitName: customer.unit?.unitName || '',
        buildingName: customer.unit?.company?.building?.buildingName || '',
        email: customer.email || '',
      });

      await Promise.all([
        fetchBuildings(),
        fetchCompanies(),
        fetchUnits(),
      ]);

      console.log("CustomerFormData in handleEditCustomer: ", customerFormData)
      setActiveTab('customers');
      setPopupCreateUser(true);
    } catch (err) {
      console.error('Failed to load customer data for editing:', err);
      showTempPopupMessage('ไม่สามารถโหลดข้อมูลลูกค้าเพื่อแก้ไขได้');
    }
  }, [fetchBuildings, fetchCompanies, fetchUnits, showTempPopupMessage]);

  const handleEditTechnician = useCallback(async (userId) => {
    try {
      const res = await axios.get(`${API_BASE_URL}/api/getTechnicianById/${userId}`);
      const technician = res.data.data;

      const resBuildings = await axios.get(`${API_BASE_URL}/api/getBuilding`);
      const buildingsData = resBuildings.data.data;

      const matchedBuildingIds = buildingsData
        .filter(building =>
          technician.techBuilds?.some(
            techBuild => techBuild.building.buildingName === building.buildingName
          )
        )
        .map(building => building.id);

      setSelectedBuildings(matchedBuildingIds);

      setTechnicianFormData({
        id: technician.id,
        userId: technician.userId,
        name: technician.name,
        phone: technician.phone,
      });

      setActiveTab('technicians');
      setPopupCreateUser(true);
    } catch (err) {
      console.error('Failed to load technician data for editing:', err);
      showTempPopupMessage('ไม่สามารถโหลดข้อมูลเจ้าหน้าที่เพื่อแก้ไขได้');
    }
  }, [showTempPopupMessage]);

  const handleEditAdmin = useCallback(async (userId) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/getAdminById/${userId}`);
      const adminItem = response.data.data;

      setAdminFormData({
        id: adminItem.id,
        username: adminItem.username,
        password: adminItem.password,
      });

      setActiveTab('admin');
      setPopupCreateUser(true);
    } catch (err) {
      console.error('Failed to load admin data for editing:', err);
      showTempPopupMessage('ไม่สามารถโหลดข้อมูลแอดมินเพื่อแก้ไขได้');
    }
  }, [showTempPopupMessage]);

  // --- Delete Handlers ---

  const handleDelete = useCallback(async (idToDelete, type) => {
    try {
      let endpoint = '';
      switch (type) {
        case 'customers':
          endpoint = `/api/deleteCustomer/${idToDelete}`;
          break;
        case 'technicians':
          endpoint = `/api/deleteTechnician/${idToDelete}`;
          break;
        case 'admin':
          endpoint = `/api/deleteAdmin/${idToDelete}`;
          break;
        default:
          return;
      }
      handlePopupStatus('loading');
      await axios.delete(`${API_BASE_URL}${endpoint}`);
      // fetchData();
      // setCurrentPage(1);
      // setConfirmDeleteId(null);
      handlePopupStatus('delete', true); // Show delete status, then reload
    } catch (error) {
      console.error(`Error deleting ${type}:`, error);
      handlePopupStatus('error');
      showTempPopupMessage(`ไม่สามารถลบ${type}ได้`);
    }
  }, [handlePopupStatus, showTempPopupMessage]);

  // --- handleApproveAuto ที่ถูกเรียกจาก proceedApprove ---
  const handleApproveAuto = useCallback(async (userId) => {
    handlePopupStatus('loading');
    try {
      const response = await axios.post(`${API_BASE_URL}/api/approve/${userId}`);
      console.log("Approve API response:", response.data.data);

      handlePopupStatus('success', true); // แสดง popup สถานะและสั่งให้โหลดข้อมูลใหม่ (ของตารางรออนุมัติ)
      // ไม่ต้อง window.location.reload() แล้ว

    } catch (error) {
      console.error("Error approving user:", error.response?.data || error.message);
      handlePopupStatus('error'); // แสดง popup สถานะ error
    }
  }, []);

  // --- NEW Approve Confirmation Functions ---
  const confirmApprove = useCallback((userId) => {
    setApproveUserId(userId);
    setShowConfirmApprovePopup(true);
  }, []);

  const cancelApprove = useCallback(() => {
    setApproveUserId(null);
    setShowConfirmApprovePopup(false);
  }, []);

  const proceedApprove = useCallback(async () => {
    setShowConfirmApprovePopup(false); // ปิด popup ยืนยันทันที
    if (approveUserId !== null) {
      await handleApproveAuto(approveUserId); // เรียกฟังก์ชันอนุมัติจริง
    }
    setApproveUserId(null); // ล้าง ID หลังดำเนินการ
  }, [approveUserId, activeTab, handleApproveAuto]);


  const handleDeleteApprove = async (id) => {
    try {
      const response = await axios.delete(`${import.meta.env.VITE_API_BASE_URL}/api/deleteCustomer/${id}`)
      console.log(response.data)
    } catch (error) {
      console.error(error)
    }
  }

  const confirmDelete = useCallback((id) => {
    setConfirmDeleteId(id);
    setShowConfirmPopup(true);
  }, []);

  const cancelDelete = useCallback(() => {
    setShowConfirmPopup(false);
    setConfirmDeleteId(null);
  }, []);

  const proceedDelete = useCallback(() => {
    setShowConfirmPopup(false);
    if (confirmDeleteId !== null) {
      handleDelete(confirmDeleteId, activeTab);
    }
  }, [confirmDeleteId, activeTab, handleDelete]);

  // --- Form Submission Handler ---

  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();

    const newErrors = {};
    let payload = {};
    let apiCall = null;
    let successStatus = '';

    if (activeTab === 'customers') {
      if (!customerFormData.name) newErrors.name = 'กรุณากรอกชื่อ-สกุล';
      if (!customerFormData.companyName) newErrors.companyName = 'กรุณากรอกบริษัท';
      if (!customerFormData.buildingName) newErrors.buildingName = 'กรุณากรอกอาคาร';

      // --- เพิ่มการตรวจสอบการมีอยู่ของ Company, Unit, Building ใน DB ---
      try {
        // ตรวจสอบ CompanyName
        if (customerFormData.companyName) {
          const companyRes = await axios.get(`${API_BASE_URL}/api/getRelatedByCompany/${customerFormData.companyName}`);
          // ตรวจสอบจาก companyId ที่ API คืนมา (ถ้า API ส่งกลับมา)
          // console.log("companyRes: ", companyRes)
          // หรือตรวจสอบจาก company ที่ส่งกลับมา หรือ building ที่ส่งกลับมา (ถ้ามีบริษัท ก็ควรจะมี building ด้วย)
          if (!companyRes.data.company) { // ตรวจสอบจาก companyId ที่ควรจะเป็น Unique Identifier
            newErrors.companyName = 'ไม่พบข้อมูลบริษัทนี้ในระบบ';
          }
        }

        // ตรวจสอบ UnitName (unitName ไม่ได้ required, จึงเช็คเฉพาะเมื่อมีค่า)
        if (customerFormData.unitName) {
          const unitRes = await axios.get(`${API_BASE_URL}/api/getRelatedByUnit/${customerFormData.unitName}`);
          // ตรวจสอบจาก unitId ที่ API คืนมา
          // console.log("unitRes: ", unitRes)
          if (!unitRes.data.unit || unitRes.data.unit.length === 0) {
            newErrors.unitName = 'ไม่พบข้อมูลยูนิตนี้ในระบบ';
          }
        }

        // ตรวจสอบ BuildingName
        // console.log("customerFormData: ", customerFormData)
        // if (customerFormData.buildingName) {
        //   // console.log("customerFormData.buildingName: ", customerFormData.unit?.company?.building?.buildingName)
        //   const buildingName = String(customerFormData.buildingName); // ✅
        //   const buildingRes = await axios.get(
        //     `${API_BASE_URL}/api/getRelatedByBuilding/${encodeURIComponent(buildingName)}`
        //   );

        //   console.log("buildingRes: ", buildingRes)

        // ตรวจสอบจาก buildingId ที่ API คืนมา
        // หรือตรวจสอบจาก fetchedCompanies ว่ามีข้อมูลกลับมาหรือไม่

        // if (!buildingRes.data.buildingId) {
        //   newErrors.buildingName = 'ไม่พบข้อมูลอาคารนี้ในระบบ';
        // }
        // }

      } catch (error) {
        console.error('Error during DB existence check (using getRelated APIs):', error);
        // กรณีเกิดข้อผิดพลาดในการเรียก API ตรวจสอบ (เช่น network error, server error)
        // ให้แจ้งผู้ใช้ว่าเกิดข้อผิดพลาดในการตรวจสอบ
        if (error.response && error.response.status === 404) {
          // ถ้า API ตอบกลับ 404 แสดงว่าไม่พบ (อาจจะปรับ backend ให้ 404 เมื่อไม่พบ)
          if (error.config.url.includes('getRelatedByCompany') && customerFormData.companyName && !newErrors.companyName) {
            newErrors.companyName = 'ไม่พบข้อมูลบริษัทนี้ในระบบ';
          }
          if (error.config.url.includes('getRelatedByBuilding') && customerFormData.buildingName && !newErrors.buildingName) {
            newErrors.buildingName = 'ไม่พบข้อมูลอาคารนี้ในระบบ';
          }
          if (error.config.url.includes('getRelatedByUnit') && customerFormData.unitName && !newErrors.unitName) {
            newErrors.unitName = 'ไม่พบข้อมูลยูนิตนี้ในระบบ';
          }
        } else {
          // สำหรับ Error อื่นๆ ที่ไม่ใช่ 404 (เช่น server error)
          if (customerFormData.companyName && !newErrors.companyName) newErrors.companyName = 'เกิดข้อผิดพลาดในการตรวจสอบบริษัท';
          if (customerFormData.buildingName && !newErrors.buildingName) newErrors.buildingName = 'เกิดข้อผิดพลาดในการตรวจสอบอาคาร';
          if (customerFormData.unitName && !newErrors.unitName) newErrors.unitName = 'เกิดข้อผิดพลาดในการตรวจสอบยูนิต';
        }
      }

      if (Object.keys(newErrors).length > 0) {
        setErrors(newErrors);
        const firstErrorKey = Object.keys(newErrors)[0];
        showTempPopupMessage(newErrors[firstErrorKey]);
        return;
      }

      // --- เตรียม Payload และ API Call หากไม่มี Error ---
      payload = customerFormData;
      const randomSuffix = Math.random().toString(36).substring(2, 7);
      if (!payload.phone) {
        payload.phone = `NO_PHONE_${randomSuffix}`;
      }

      apiCall = payload.id
        ? axios.patch(`${API_BASE_URL}/api/updateCustomer`, payload)
        : axios.post(`${API_BASE_URL}/api/createCustomer`, payload);
      successStatus = payload.id ? 'update' : 'success';
      // console.log("apiCall: ", apiCall);

    } else if (activeTab === 'technicians') {
      if (!technicianFormData.name) newErrors.name = 'กรุณากรอกชื่อ-สกุล';

      payload = technicianFormData;
      // console.log("customerFormData in technicians: ", technicianFormData)
      // console.log("payload in technicians: ", payload)
      const randomSuffix = Math.random().toString(36).substring(2, 7);
      if (!payload.phone) {
        payload.phone = `NO_PHONE_${randomSuffix}`;
      }

      if (!payload.userId) {
        payload.techBuilds = ["-"];
      }

      apiCall = payload.id
        ? axios.patch(`${API_BASE_URL}/api/updateTechnician`, payload)
        : axios.post(`${API_BASE_URL}/api/createTechnician`, payload);
      successStatus = payload.id ? 'update' : 'success';

    } else if (activeTab === 'admin') {
      if (!adminFormData.username) newErrors.username = 'กรุณากรอกชื่อผู้ใช้งาน';
      if (!adminFormData.password && !adminFormData.id) newErrors.password = 'กรุณากรอกรหัสผ่าน'; // Password required only for new admin

      payload = adminFormData;
      apiCall = adminFormData.id
        ? axios.patch(`${API_BASE_URL}/api/updateAdmin`, payload)
        : axios.post(`${API_BASE_URL}/api/createAdmin`, payload);
      successStatus = adminFormData.id ? 'update' : 'success';
    }

    setErrors(newErrors);

    if (Object.keys(newErrors).length > 0) {
      const firstErrorKey = Object.keys(newErrors)[0];
      showTempPopupMessage(newErrors[firstErrorKey]);
      return;
    }

    handlePopupStatus('loading');

    try {
      await apiCall;

      // Handle technician's building assignments after technician update/creation
      if (activeTab === 'technicians' && technicianFormData.userId) {
        await axios.post(
          `${API_BASE_URL}/api/techUpdateBuilding`,
          { techId: technicianFormData.userId, buildingIds: selectedBuildings }
        );
      }
      console.log("payload: ", payload)
      payload.companyId = companyId
      payload.buildingId = buildingId
      payload.unitId = unitId
      console.log("payload after: ", payload)

      handlePopupStatus(successStatus, true); // Show success/update status, then reload
      navigate('/user');
    } catch (error) {
      console.error('Submission error:', error);
      handlePopupStatus('error');
      showTempPopupMessage('เกิดข้อผิดพลาดในการบันทึกข้อมูล');
    }
  }, [activeTab, customerFormData, technicianFormData, adminFormData, selectedBuildings, handlePopupStatus, showTempPopupMessage, navigate]);

  // console.log("errors: ", errors)
  // console.log("customerFormData: ", customerFormData)

  // --- Export Function ---
  const exportToExcel = useCallback(() => {
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
          { wch: 6 }, { wch: 25 }, { wch: 25 }, { wch: 12 }, { wch: 20 }, { wch: 15 }, { wch: 18 }
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
          { wch: 6 }, { wch: 20 }, { wch: 15 }, { wch: 18 }, { wch: 30 }
        ];
        break;
      case 'admin':
        dataToExport = admin.map((adminItem, index) => ({
          'ลำดับ': index + 1,
          'ชื่อผู้ใช้งาน': adminItem.username || '-',
        }));
        fileName = 'แอดมิน';
        columnWidths = [
          { wch: 6 }, { wch: 20 }
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
          { wch: 6 }, { wch: 15 }, { wch: 25 }, { wch: 12 }, { wch: 20 }, { wch: 15 }, { wch: 25 }, { wch: 18 }
        ];
        break;
      default:
        return;
    }

    const ws = XLSX.utils.json_to_sheet(dataToExport);
    ws['!cols'] = columnWidths;
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Sheet1");
    XLSX.writeFile(wb, `${fileName}_${new Date().toISOString().split('T')[0]}.xlsx`);
  }, [activeTab, customers, technicians, admin, waitForApprove, getUniqueBuildings]);


  // --- Effects ---

  // Initial fetch for buildings for the filter dropdown
  useEffect(() => {
    fetchBuildings();
  }, [fetchBuildings]);

  // Fetch data whenever activeTab, searchTerm, or filterBuilding changes
  // useEffect(() => {
  //   fetchData();
  // }, [fetchData]);

  useEffect(() => {
    fetchWaitForApprove(); // เรียกใช้ฟังก์ชันที่ถูก memoize ไว้
  }, [fetchWaitForApprove]); // เพิ่ม fetchWaitForApprove ใน dependencies ของ useEffect เพื่อให้เรียกใหม่เมื่อฟังก์ชันเปลี่ยน (ในกรณีที่มี dependencies ใน useCallback)

  // Handle pagination slicing for `customers` tab
  useEffect(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    setCustomers(allCustomersData.slice(startIndex, endIndex));
  }, [allCustomersData, currentPage, itemsPerPage]);

  // Handle pagination slicing for `technicians` tab
  useEffect(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    setTechnicians(allTechniciansData.slice(startIndex, endIndex));
  }, [allTechniciansData, currentPage, itemsPerPage]);

  // Handle pagination slicing for `admin` tab
  useEffect(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    setAdmin(allAdminData.slice(startIndex, endIndex));
  }, [allAdminData, currentPage, itemsPerPage]);

  // Handle pagination slicing for `waitApprove` tab
  useEffect(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    setWaitForApprove(allWaitForApproveData.slice(startIndex, endIndex));
  }, [allWaitForApproveData, currentPage, itemsPerPage]);

  // Function to handle page change from pagination controls
  const handlePageChange = useCallback((pageNumber) => {
    setCurrentPage(pageNumber);
  }, []);

  // Adjust isMobile state on window resize
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    handleResize(); // Set initial value
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // เตรียมข้อมูลสำหรับแต่ละ Tab (Filtered and Sliced)
  // const filteredCustomers = filterAndSearchData(allCustomersData, true);
  const totalCustomers = allCustomersData.length;
  const totalCustomerPages = Math.ceil(totalCustomers / itemsPerPage);
  const slicedCustomers = allCustomersData.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // const filteredTechnicians = filterAndSearchData(allTechniciansData, true);
  // console.log("filteredTechnicians: ", filteredTechnicians)
  const totalTechnicians = allTechniciansData.length;
  const totalTechnicianPages = Math.ceil(totalTechnicians / itemsPerPage);
  const slicedTechnicians = allTechniciansData.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );
  // console.log("allTechniciansData: ", allTechniciansData)

  // const filteredAdmin = filterAndSearchData(allAdminData, false); // Admin ไม่มี filter อาคาร
  const totalAdmin = allAdminData.length;
  const totalAdminPages = Math.ceil(totalAdmin / itemsPerPage);
  const slicedAdmin = allAdminData.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // const filteredWaitForApprove = filterAndSearchData(allWaitForApproveData, false); // WaitApprove ไม่มี filter อาคาร
  const totalWaitForApprove = allWaitForApproveData.length;
  const totalWaitForApprovePages = Math.ceil(totalWaitForApprove / itemsPerPage);
  const slicedWaitForApprove = allWaitForApproveData.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // console.log("allWaitForApproveData: ", allWaitForApproveData)
  // console.log("WaitForApprove: ", waitForApprove)

  // console.log("AllCustomersData: ", allCustomersData)
  // console.log("AllTechniciansData: ", allTechniciansData)
  // console.log("AllAdminData: ", allAdminData)
  // console.log("customers: ", customers)

  // --- Render Logic ---

  return (
    <AdminLayout>
      <div className="container mx-auto px-4 py-2">
        {/* {console.log("buildings: ", buildings)} */}
        {/* {console.log("filterBuilding: ", filterBuilding)} */}
        <UserToolbar
          searchInput={searchInput}
          setSearchInput={setSearchInput}
          handleSearch={() => {
            setSearchTerm(searchInput); // Update searchTerm to trigger fetchData
            setCurrentPage(1); // Reset page to 1 on search
          }}
          // activeTab={activeTab}
          // setActiveTab={(tab) => {
          //   setActiveTab(tab);
          //   setSearchInput(''); // Clear search input on tab change
          //   setSearchTerm(''); // Clear search term on tab change
          //   setFilterBuilding('all'); // Reset filter on tab change
          //   setCurrentPage(1); // Reset page to 1 on tab change
          // }}
          setPopupCreateUser={setPopupCreateUser}
          exportToExcel={exportToExcel}
          buildings={buildings}
          filterBuilding={filterBuilding}
          setFilterBuilding={(value) => {
            setFilterBuilding(value);
            setCurrentPage(1); // Reset page to 1 on filter change
          }}
          // setFilterBuilding={setFilterBuilding}
          waitForApprove={waitForApprove} // Pass the full count for the badge, not paged
          resetFormData={() => { // Reset form data when opening new create popup
            setCustomerFormData({
              id: null, name: '', phone: '', companyName: '', unitName: '', buildingName: '', email: '',
              buildingId: '', companyId: '', unitId: ''
            });
            setTechnicianFormData({ id: null, userId: null, name: '', phone: '' });
            setAdminFormData({ id: null, username: '', password: '' });
            setSelectedBuildings([]); // Clear selected buildings for technician
            setErrors({}); // Clear validation errors
          }}
        />

        <UserPopup
          show={popupCreateUser}
          onClose={() => setPopupCreateUser(false)}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          handleSubmit={handleSubmit}
          customerData={customerFormData}
          technicianData={technicianFormData}
          adminData={adminFormData}
          handleCustomerChange={handleCustomerChange}
          handleTechnicianChange={handleTechnicianChange}
          handleAdminChange={handleAdminChange} // Pass admin change handler
          buildings={buildings}
          companies={companies} // Pass companies for customer form
          units={units} // Pass units for customer form
          selectedBuildings={selectedBuildings}
          handleBuildingToggle={handleBuildingToggle}
          errors={errors}
          setCompanyId={setCompanyId}
          setUnitId={setUnitId}
          setBuildingId={setBuildingId}
        //         fetchCompanies={fetchCompanies}
        //         fetchBuildings,
        // fetchUnits,
        />

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#BC9D72]"></div>
          </div>
        ) : (
          <>
            {activeTab === 'customers' && (
              <>
                <CustomerTable
                  customers={slicedCustomers} // ส่งข้อมูลที่ถูก slice แล้ว
                  handleEditCustomer={handleEditCustomer}
                  confirmDelete={confirmDelete}
                />
                <Pagination
                  currentPage={currentPage}
                  itemsPerPage={itemsPerPage}
                  totalItems={totalCustomers} // จำนวนรายการทั้งหมดหลังจาก filter แล้ว
                  totalPages={totalCustomerPages}
                  onPageChange={handlePageChange}
                  onItemsPerPageChange={handleItemsPerPageChange}
                  advancedPagination={true} // เลือกใช้ advancedPagination
                />
              </>
            )}

            {activeTab === 'technicians' && (
              <>
                <TechnicianTable
                  technicians={slicedTechnicians} // ส่งข้อมูลที่ถูก slice แล้ว
                  getUniqueBuildings={getUniqueBuildings}
                  handleEditTechnician={handleEditTechnician}
                  confirmDelete={confirmDelete}
                />
                <Pagination
                  currentPage={currentPage}
                  itemsPerPage={itemsPerPage}
                  totalItems={totalTechnicians}
                  totalPages={totalTechnicianPages}
                  onPageChange={handlePageChange}
                  onItemsPerPageChange={handleItemsPerPageChange}
                  advancedPagination={true}
                />
              </>
            )}

            {activeTab === 'waitApprove' && (
              <>
                <WaitApproveTable
                  activeTab={activeTab}
                  waitForApprove={slicedWaitForApprove} // ส่งข้อมูลที่ถูก slice แล้ว
                  // handleApprove={handleApproveAuto}
                  confirmApprove={confirmApprove}
                />
                <Pagination
                  currentPage={currentPage}
                  itemsPerPage={itemsPerPage}
                  totalItems={totalWaitForApprove}
                  totalPages={totalWaitForApprovePages}
                  onPageChange={handlePageChange}
                  onItemsPerPageChange={handleItemsPerPageChange}
                  advancedPagination={true}
                />
              </>
            )}

            {activeTab === 'admin' && (
              <>
                <AdminTable
                  admin={slicedAdmin} // ส่งข้อมูลที่ถูก slice แล้ว
                  handleEditAdmin={handleEditAdmin}
                  confirmDelete={confirmDelete}
                />
                <Pagination
                  currentPage={currentPage}
                  itemsPerPage={itemsPerPage}
                  totalItems={totalAdmin}
                  totalPages={totalAdminPages}
                  onPageChange={handlePageChange}
                  onItemsPerPageChange={handleItemsPerPageChange}
                  advancedPagination={true}
                />
              </>
            )}

            <ConfirmDeletePopup
              show={showConfirmPopup}
              onCancel={cancelDelete}
              onConfirm={proceedDelete}
              activeTab={activeTab}
            />

            {/* NEW: Confirmation Popup for Approve */}
            {showConfirmApprovePopup && (
              <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/70">
                <div className="bg-white rounded-2xl shadow-lg p-6 w-[360px] h-[120px] text-center">
                  {/* <h3 className="text-[20px] font-semibold mb-[2px] text-[#837958]">ยืนยันการอนุมัติ ?</h3> */}
                  <p className="text-[16px] font-semibold text-[#837958]">ต้องการอนุมัติคำร้องของงานนี้?</p>
                  <div className="flex flex-rows items-center justify-center text-[#837958] text-center mt-6 gap-x-4">
                    <button
                      onClick={cancelApprove}
                      className="bg-white text-[12px] text-[#BC9D72] border-[1px] w-64 h-6 border-[#BC9D72] rounded hover:opacity-80"
                    >
                      ยกเลิก
                    </button>
                    <button
                      onClick={proceedApprove}
                      // className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
                      className="bg-[#BC9D72] text-[12px] w-64 h-6 text-white rounded hover:opacity-90"
                    >
                      อนุมัติ
                    </button>
                  </div>
                </div>
              </div>
            )}

            <StatusPopup
              show={!!popupStatus}
              status={popupStatus}
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