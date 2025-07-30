import React, { useEffect, useState, useCallback } from 'react';
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
  const [activeTab, setActiveTab] = useState('customers');
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

  // Data for create/edit forms
  const [customerFormData, setCustomerFormData] = useState({
    id: null, // Used for editing existing customer
    name: '',
    phone: '',
    companyName: '',
    unitName: '',
    buildingName: '',
    email: '',
    buildingId: '', // For API payload
    companyId: '', // For API payload
    unitId: '', // For API payload
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
  const showTempPopupMessage = useCallback((message, duration = 3000) => {
    setPopupMessage(message);
    setTimeout(() => {
      setPopupMessage('');
    }, duration);
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
      setPopupCreateUser(false); // Close popup on success
      if (shouldReload) {
        // Instead of full page reload, refetch data
        fetchData(); // Refetch data to update tables
        // Reset to first page after successful operation if data count changes
        setCurrentPage(1);
      }
    }, 1500); // Shorter duration for quick feedback (can adjust)
  }, []); // fetchData and setCurrentPage are dependencies if used here

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

    try {
      let response;
      let rawData = [];
      let filteredData = [];

      switch (activeTab) {
        case 'customers':
          response = await axios.get(`${API_BASE_URL}/api/allCustomer`);
          rawData = response.data.data;
          filteredData = rawData.filter(c => {
            const matchesSearch =
              (c.name?.toLowerCase().includes(term) ||
                c.phone?.toLowerCase().includes(term) ||
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
          rawData = response.data.data;
          // console.log("rawData: ", rawData)
          filteredData = rawData.filter(t => {
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
          rawData = response.data.data;
          filteredData = rawData.filter(w => {
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
          break;

        case 'admin':
          response = await axios.get(`${API_BASE_URL}/api/getAdmin`);
          rawData = response.data.data;
          filteredData = rawData.filter(a => {
            const matchesSearch = a.username?.toLowerCase().includes(term);
            // Admin tab does not seem to use building filter based on your code
            return matchesSearch;
          });
          console.log("AdminData:", rawData)
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
  }, [activeTab, searchTerm, filterBuilding]);

  // --- Handlers for Form Changes ---

  const handleCustomerChange = useCallback(async (e) => {
    const { name, value } = e.target;

    // Phone number input formatting
    if (name === 'phone') {
      const onlyNums = value.replace(/\D/g, '');
      setCustomerFormData(prev => ({ ...prev, phone: onlyNums.slice(0, 15) }));
      return;
    }

    // console.log("CustomerFormData: ", customerFormData)

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

    setCustomerFormData(prev => ({ ...prev, [name]: value }));

    // Auto-fill logic for related fields
    if (name === 'unitName' && value) {
      try {
        const response = await axios.get(`${API_BASE_URL}/api/getRelatedByUnit/${value}`);
        const { company, building, unitId, companyId, buildingId } = response.data;
        setCustomerFormData(prev => ({
          ...prev,
          companyName: company || '',
          buildingName: building || '',
          unitId: unitId || '',
          companyId: companyId || '',
          buildingId: buildingId || '',
        }));
      } catch (error) {
        console.error('Error fetching unit data:', error);
      }
    } else if (name === 'companyName' && value) {
      try {
        const response = await axios.get(`${API_BASE_URL}/api/getRelatedByCompany/${value}`);
        const { building, units: fetchedUnits, companyId, buildingId } = response.data;
        setCustomerFormData(prev => ({
          ...prev,
          buildingName: building || '',
          unitName: fetchedUnits && fetchedUnits.length > 0 ? fetchedUnits[0] : '',
          companyId: companyId || '',
          buildingId: buildingId || '',
        }));
        if (fetchedUnits) {
          setUnits(fetchedUnits.map(name => ({ unitName: name }))); // Assuming units are just names
        }
      } catch (error) {
        console.error('Error fetching company data:', error);
      }
    } else if (name === 'buildingName' && value) {
      try {
        const response = await axios.get(`${API_BASE_URL}/api/getRelatedByBuilding/${value}`);
        const { companies: fetchedCompanies, buildingId } = response.data;
        setCustomerFormData(prev => ({
          ...prev,
          companyName: fetchedCompanies && fetchedCompanies.length > 0 ? fetchedCompanies[0] : '',
          unitName: '', // Clear unit name as it depends on company
          buildingId: buildingId || '',
        }));
        if (fetchedCompanies) {
          setCompanies(fetchedCompanies.map(name => ({ companyName: name })));
          setUnits([]); // Clear units
        }
      } catch (error) {
        console.error('Error fetching building data:', error);
      }
    }

  }, [setErrors, setCustomerFormData, setCompanies, setUnits]);

  const handleTechnicianChange = useCallback((e) => {
    const { name, value } = e.target;
    if (name === 'phone') {
      const onlyNums = value.replace(/\D/g, '');
      setTechnicianFormData(prev => ({ ...prev, phone: onlyNums.slice(0, 15) }));
    } else {
      setTechnicianFormData(prev => ({ ...prev, [name]: value }));
    }
  }, []);

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
      handlePopupStatus('delete', true); // Show delete status, then reload
    } catch (error) {
      console.error(`Error deleting ${type}:`, error);
      handlePopupStatus('error');
      showTempPopupMessage(`ไม่สามารถลบ${type}ได้`);
    }
  }, [handlePopupStatus, showTempPopupMessage]);

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

      payload = customerFormData;
      const randomSuffix = Math.random().toString(36).substring(2, 7);
      if (!payload.phone) {
        payload.phone = `NoPhone_${randomSuffix}`;
      }

      // console.log("payload: ", payload)

      apiCall = payload.id
        ? axios.patch(`${API_BASE_URL}/api/updateCustomer`, payload)
        : axios.post(`${API_BASE_URL}/api/createCustomer`, payload);
      successStatus = payload.id ? 'update' : 'success';
      console.log("apiCall: ", apiCall)
    } else if (activeTab === 'technicians') {
      if (!technicianFormData.name) newErrors.name = 'กรุณากรอกชื่อ-สกุล';

      payload = customerFormData;
      const randomSuffix = Math.random().toString(36).substring(2, 7);
      if (!payload.phone) {
        payload.phone = `NO_PHONE_${randomSuffix}`;
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
      if (activeTab === 'technicians' && technicianFormData.id) {
        await axios.post(
          `${API_BASE_URL}/api/techUpdateBuilding`,
          { techId: technicianFormData.userId, buildingIds: selectedBuildings }
        );
      }

      handlePopupStatus(successStatus, true); // Show success/update status, then reload
      navigate('/user'); // Redirect to user page
    } catch (error) {
      console.error('Submission error:', error);
      handlePopupStatus('error');
      showTempPopupMessage('เกิดข้อผิดพลาดในการบันทึกข้อมูล');
    }
  }, [activeTab, customerFormData, technicianFormData, adminFormData, selectedBuildings, handlePopupStatus, showTempPopupMessage, navigate]);

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
  useEffect(() => {
    fetchData();
  }, [fetchData]);

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
  const filteredCustomers = filterAndSearchData(allCustomersData, true);
  const totalCustomers = filteredCustomers.length;
  const totalCustomerPages = Math.ceil(totalCustomers / itemsPerPage);
  const slicedCustomers = filteredCustomers.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const filteredTechnicians = filterAndSearchData(allTechniciansData, true);
  // console.log("filteredTechnicians: ", filteredTechnicians)
  const totalTechnicians = filteredTechnicians.length;
  const totalTechnicianPages = Math.ceil(totalTechnicians / itemsPerPage);
  const slicedTechnicians = filteredTechnicians.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const filteredAdmin = filterAndSearchData(allAdminData, false); // Admin ไม่มี filter อาคาร
  const totalAdmin = filteredAdmin.length;
  const totalAdminPages = Math.ceil(totalAdmin / itemsPerPage);
  const slicedAdmin = filteredAdmin.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const filteredWaitForApprove = filterAndSearchData(allWaitForApproveData, false); // WaitApprove ไม่มี filter อาคาร
  const totalWaitForApprove = filteredWaitForApprove.length;
  const totalWaitForApprovePages = Math.ceil(totalWaitForApprove / itemsPerPage);
  const slicedWaitForApprove = filteredWaitForApprove.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

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
          activeTab={activeTab}
          setActiveTab={(tab) => {
            setActiveTab(tab);
            setSearchInput(''); // Clear search input on tab change
            setSearchTerm(''); // Clear search term on tab change
            setFilterBuilding('all'); // Reset filter on tab change
            setCurrentPage(1); // Reset page to 1 on tab change
          }}
          setPopupCreateUser={setPopupCreateUser}
          exportToExcel={exportToExcel}
          buildings={buildings}
          filterBuilding={filterBuilding}
          setFilterBuilding={(value) => {
            setFilterBuilding(value);
            setCurrentPage(1); // Reset page to 1 on filter change
          }}
          // setFilterBuilding={setFilterBuilding}
          waitForApprove={allWaitForApproveData} // Pass the full count for the badge, not paged
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
                  handleApprove={async (userId) => {
                    try {
                      const token = localStorage.getItem('token');
                      const headers = { Authorization: `Bearer ${token}` };
                      await axios.post(`${API_BASE_URL}/api/approve/${userId}`, {}, { headers });
                      showTempPopupMessage('อนุมัติผู้ใช้สำเร็จ');
                      fetchData(); // Refresh data after approval
                    } catch (error) {
                      console.error('Error approving user:', error);
                      showTempPopupMessage('เกิดข้อผิดพลาดในการอนุมัติผู้ใช้', 'error');
                    }
                  }}
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
    </AdminLayout>
  );
};

export default User;