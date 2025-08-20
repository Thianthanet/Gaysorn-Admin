import React, { useEffect, useState, useCallback } from "react";
import AdminLayout from "./AdminLayout";
import { useNavigate } from "react-router-dom";
import UserToolbar from "../component/UserToolbar";
import UserPopup from "../component/UserPopup";
import CustomerTable from "../component/CustomerTable";
import TechnicianTable from "../component/TechnicianTable";
import AdminTable from "../component/AdminTable";
import ConfirmDeletePopup from "../component/ConfirmDeletePopup";
import StatusPopup from "../component/StatusPopup";
import * as XLSX from "xlsx";
import axios from "axios";
import WaitApproveTable from "../component/WaitApproveTable";
import { FaLine } from "react-icons/fa";
import { CircleCheck, CircleX, Trash2, UserPen } from "lucide-react";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const User = () => {
  // --- State Management ---
  // Data for tables
  const [customers, setCustomers] = useState([]);
  const [technicians, setTechnicians] = useState([]);
  const [admin, setAdmin] = useState([]);
  const [waitForApprove, setWaitForApprove] = useState([]);

  // UI state
  const [activeTab, setActiveTab] = useState("customers");
  const [loading, setLoading] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const navigate = useNavigate();

  // Search and Filter state
  const [searchInput, setSearchInput] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [filterBuilding, setFilterBuilding] = useState("");

  // Popup and Form state
  const [popupCreateUser, setPopupCreateUser] = useState(false);
  const [popupStatus, setPopupStatus] = useState(null); // e.g., "loading", "success", "delete", "error", null
  const [popupMessage, setPopupMessage] = useState("");
  const [errors, setErrors] = useState({});

  // Building/Company/Unit data for dropdowns
  const [buildings, setBuildings] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [units, setUnits] = useState([]);
  const [selectedBuildings, setSelectedBuildings] = useState([]); // For technician building access

  // Data for create/edit forms
  const [customerFormData, setCustomerFormData] = useState({
    id: null, // Used for editing existing customer
    name: "",
    phone: "",
    companyName: "",
    unitName: "",
    buildingName: "",
    email: "",
    buildingId: "", // For API payload
    companyId: "", // For API payload
    unitId: "", // For API payload
  });

  const [technicianFormData, setTechnicianFormData] = useState({
    id: null, // Used for editing existing technician
    userId: null, // Backend user ID
    name: "",
    phone: "",
  });

  const [adminFormData, setAdminFormData] = useState({
    id: null, // Used for editing existing admin
    username: "",
    password: "",
  });

  // Delete Confirmation state
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);
  const [showConfirmPopup, setShowConfirmPopup] = useState(false);

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

    techBuilds.forEach((build) => {
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
      setPopupMessage("");
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
        window.location.reload();
      }
      // fetchData();
    }, 3000); // Popup visible for 2 seconds
  }, []);

  // --- API Fetching Functions ---

  const fetchBuildings = useCallback(async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/api/getBuilding`);
      setBuildings(res.data.data);
    } catch (error) {
      console.error("Error fetching buildings:", error);
    }
  }, []);

  const fetchCompanies = useCallback(async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/api/getCompany`);
      setCompanies(res.data.data);
    } catch (error) {
      console.error("Error fetching companies:", error);
    }
  }, []);

  const fetchUnits = useCallback(async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/api/getUnits`);
      setUnits(res.data.data);
    } catch (error) {
      console.error("Error fetching units:", error);
    }
  }, []);

  const fetchAdmin = useCallback(async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/getAdmin`);
      setAdmin(response.data.data);
    } catch (error) {
      console.error("Error fetching admin data:", error);
    }
  }, []);

  const fetchWaitForApprove = useCallback(async () => {
    try {
      // const response = await axios.get(`${API_BASE_URL}/api/waitApprove`);
      const response = await axios.get(
        `${import.meta.env.VITE_API_BASE_URL}/api/waitApprove`
      );
      // console.log("waitApprove: ", response.data.data)
      setWaitForApprove(response.data.data);
    } catch (error) {
      console.error("Error fetching wait for approve data:", error);
    }
  }, []);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      let data = [];
      const term = searchTerm.toLowerCase();
      // console.log("filterBuilding: ", filterBuilding)

      if (activeTab === "customers") {
        const response = await axios.get(`${API_BASE_URL}/api/allCustomer`);
        data = response.data.data.filter((c) => {
          const matchesSearch =
            c.name?.toLowerCase().includes(term) ||
            c.phone?.toLowerCase().includes(term) ||
            c.unit?.company?.building?.buildingName
              ?.toLowerCase()
              .includes(term) ||
            c.unit?.unitName?.toLowerCase().includes(term) ||
            c.unit?.company?.companyName?.toLowerCase().includes(term);
          const matchesBuilding =
            filterBuilding === "ทั้งหมด" ||
            !filterBuilding ||
            c.unit?.company?.building?.buildingName === filterBuilding;
          return matchesSearch && matchesBuilding;
        });
        console.log("customerData: ", data);
        setCustomers(data);
      } else if (activeTab === "technicians") {
        const response = await axios.get(`${API_BASE_URL}/api/getTech`);
        data = response.data.data.filter((t) => {
          const matchesSearch =
            t.name?.toLowerCase().includes(term) ||
            t.phone?.toLowerCase().includes(term) ||
            t.techBuilds?.some((b) =>
              b.building?.buildingName?.toLowerCase().includes(term)
            );
          const matchesBuilding =
            filterBuilding === "ทั้งหมด" ||
            !filterBuilding ||
            t.techBuilds?.some(
              (b) => b.building?.buildingName === filterBuilding
            );
          return matchesSearch && matchesBuilding;
        });
        console.log("techniciansData: ", data);
        setTechnicians(data);
      } else if (activeTab === "waitApprove") {
        // const response = await fetchWaitForApprove(); // This fetches and sets state directly
        const response = await axios.get(`${API_BASE_URL}/api/waitApprove`);
        data = response.data.data.filter((w) => {
          const matchesSearch =
            w.name?.toLowerCase().includes(term) ||
            w.phone?.toLowerCase().includes(term) ||
            w.unit?.unitName?.toLowerCase().includes(term) ||
            w.unit?.company?.companyName?.toLowerCase().includes(term) ||
            w.unit?.company?.building?.buildingName
              ?.toLowerCase()
              .includes(term); //c.unit?.company?.building?.buildingName === filterBuilding
          const matchesBuilding =
            filterBuilding === "ทั้งหมด" ||
            !filterBuilding ||
            w.unit?.company?.building?.buildingName === filterBuilding;
          return matchesSearch && matchesBuilding;
        });
        console.log("waitApprove: ", data);
        setWaitForApprove(data);
      } else if (activeTab === "admin") {
        // await fetchAdmin(); // This fetches and sets state directly
        const response = await axios.get(`${API_BASE_URL}/api/getAdmin`);
        data = response.data.data.filter((a) => {
          const matchesSearch = a.username?.toLowerCase().includes(term);
          // a.phone?.toLowerCase().includes(term) ||
          // a.techBuilds?.some(b => b.building?.buildingName?.toLowerCase().includes(term));
          return matchesSearch;
        });
        console.log("adminData: ", data);
        setAdmin(data);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  }, [activeTab, searchTerm, filterBuilding]); // Dependencies for useCallback

  // --- Handlers for Form Changes ---

  const handleCustomerChange = useCallback(
    async (e) => {
      const { name, value, options, selectedIndex } = e.target;

      // Phone number input formatting
      if (name === "phone") {
        const onlyNums = value.replace(/\D/g, "");
        setCustomerFormData((prev) => ({
          ...prev,
          phone: onlyNums.slice(0, 15),
        }));
        return;
      }

      // Email validation (basic client-side, server-side validation is still critical)
      if (name === "email") {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (value && !emailRegex.test(value)) {
          setErrors((prev) => ({ ...prev, email: "รูปแบบอีเมลไม่ถูกต้อง" }));
        } else {
          setErrors((prev) => {
            const newErrors = { ...prev };
            delete newErrors.email;
            return newErrors;
          });
        }
      }

      // สำหรับ dropdown building
      // if (name === 'buildingName') {
      //   // const selectedBuilding = buildings.find(b => b.id === value);
      //   const selectedBuilding = buildings.find(b => b.id.toString() === value.toString());
      //   setCustomerFormData(prev => ({
      //     ...prev,
      //     // buildingName: value,
      //     // buildingId: selectedBuilding ? selectedBuilding.id : '',
      //     buildingId: value,
      //     buildingName: selectedBuilding ? selectedBuilding.buildingName : '',
      //     // companyName: '', // รีเซ็ต company เมื่อเปลี่ยน building
      //     companyId: '',
      //     // unitName: '', // รีเซ็ต unit เมื่อเปลี่ยน building
      //     unitId: '',
      //   }));
      //   return;
      // }
      // if (name === "buildingName") {
      //   const selectedBuilding = buildings.find(
      //     (b) => b.buildingName === value
      //   );
      //   setCustomerFormData((prev) => ({
      //     ...prev,
      //     buildingName: value,
      //     buildingId: selectedBuilding ? selectedBuilding.id : "", // ยังเก็บ ID ไว้ใช้หากจำเป็น
      //     companyId: "",
      //     // companyName: "",
      //     unitId: "",
      //     // unitName: "",
      //   }));
      //   return;

      // }
      if (name === "buildingName") {
      // รับ ID จาก attribute data-id
      const selectedId = selectedIndex > 0 ? options[selectedIndex].getAttribute('data-id') : "";
      const selectedBuilding = buildings.find(
        (b) => b.buildingName === value
      );
      
      setCustomerFormData((prev) => ({
        ...prev,
        buildingName: value,
        buildingId: selectedId || (selectedBuilding ? selectedBuilding.id : ""),
        companyId: "",
        // companyName: "",
        unitId: "",
        // unitName: "",
      }));
      return;
    }

      // สำหรับ dropdown company
      if (name === "companyName") {
        const selectedCompany = companies.find((c) => c.companyName === value);
        setCustomerFormData((prev) => ({
          ...prev,
          companyName: value,
          companyId: selectedCompany ? selectedCompany.id : "",
          // unitName: '', // รีเซ็ต unit เมื่อเปลี่ยน company
          unitId: "",
        }));
        return;
      }

      // สำหรับ dropdown unit
      if (name === "unitName") {
        const selectedUnit = units.find((u) => u.unitName === value);
        setCustomerFormData((prev) => ({
          ...prev,
          unitName: value,
          unitId: selectedUnit ? selectedUnit.id : "",
          companyId: selectedUnit ? selectedUnit.companyId : prev.companyId,
          // อัปเดต companyName จาก unit ที่เลือก
          companyName: selectedUnit
            ? companies.find((c) => c.id === selectedUnit.companyId)
                ?.companyName || ""
            : prev.companyName,
          // อัปเดต buildingName และ buildingId จาก company ที่เกี่ยวข้อง
          buildingName: selectedUnit
            ? buildings.find(
                (b) =>
                  b.id ===
                  (companies.find((c) => c.id === selectedUnit.companyId)
                    ?.buildingId || "")
              )?.buildingName || ""
            : prev.buildingName,
          buildingId: selectedUnit
            ? companies.find((c) => c.id === selectedUnit.companyId)
                ?.buildingId || ""
            : prev.buildingId,
        }));
        return;
      }

      setCustomerFormData((prev) => ({ ...prev, [name]: value }));

      // Auto-fill logic for related fields
      if (name === "unitName" && value) {
        try {
          const response = await axios.get(
            `${API_BASE_URL}/api/getRelatedByUnit/${value}`
          );
          const { company, building, unitId, companyId, buildingId } =
            response.data;
          setCustomerFormData((prev) => ({
            ...prev,
            companyName: company || "",
            buildingName: building || "",
            unitId: unitId || "",
            companyId: companyId || "",
            buildingId: buildingId || "",
          }));
        } catch (error) {
          console.error("Error fetching unit data:", error);
        }
      } else if (name === "companyName" && value) {
        try {
          const response = await axios.get(
            `${API_BASE_URL}/api/getRelatedByCompany/${value}`
          );
          const {
            building,
            units: fetchedUnits,
            companyId,
            buildingId,
          } = response.data;
          setCustomerFormData((prev) => ({
            ...prev,
            buildingName: building || "",
            unitName:
              fetchedUnits && fetchedUnits.length > 0 ? fetchedUnits[0] : "",
            companyId: companyId || "",
            buildingId: buildingId || "",
          }));
          if (fetchedUnits) {
            setUnits(fetchedUnits.map((name) => ({ unitName: name }))); // Assuming units are just names
          }
        } catch (error) {
          console.error("Error fetching company data:", error);
        }
      } else if (name === "buildingName" && value) {
        try {
          const response = await axios.get(
            `${API_BASE_URL}/api/getRelatedByBuilding/${value}`
          );
          const { companies: fetchedCompanies, buildingId } = response.data;
          setCustomerFormData((prev) => ({
            ...prev,
            companyName:
              fetchedCompanies && fetchedCompanies.length > 0
                ? fetchedCompanies[0]
                : "",
            unitName: "", // Clear unit name as it depends on company
            buildingId: buildingId || "",
          }));
          if (fetchedCompanies) {
            setCompanies(
              fetchedCompanies.map((name) => ({ companyName: name }))
            );
            setUnits([]); // Clear units
          }
        } catch (error) {
          console.error("Error fetching building data:", error);
        }
      }
    },
    [setErrors, setCustomerFormData, setCompanies, setUnits, buildings]
  );

  const handleTechnicianChange = useCallback((e) => {
    const { name, value } = e.target;
    if (name === "phone") {
      const onlyNums = value.replace(/\D/g, "");
      setTechnicianFormData((prev) => ({
        ...prev,
        phone: onlyNums.slice(0, 15),
      }));
    } else {
      setTechnicianFormData((prev) => ({ ...prev, [name]: value }));
    }
  }, []);

  const handleAdminChange = useCallback((e) => {
    const { name, value } = e.target;
    setAdminFormData((prev) => ({ ...prev, [name]: value }));
  }, []);

  const handleBuildingToggle = useCallback((buildingId) => {
    setSelectedBuildings((prev) =>
      prev.includes(buildingId)
        ? prev.filter((id) => id !== buildingId)
        : [...prev, buildingId]
    );
  }, []);

  // --- Edit Data Loaders ---

  const handleEditCustomer = useCallback(
    async (userId) => {
      try {
        const res = await axios.get(
          `${API_BASE_URL}/api/getCustomerById/${userId}`
        );
        const customer = res.data.data;
        console.log(customerFormData);

        setCustomerFormData({
          id: customer.id,
          name: customer.name,
          phone: customer.phone,
          buildingId: customer.unit?.company?.building.id || "",
          companyId: customer.unit?.companyId || "",
          companyName: customer.unit?.company?.companyName || "",
          unitId: customer.unitId || "",
          unitName: customer.unit?.unitName || "",
          buildingName: customer.unit?.company?.building?.buildingName || "",
          email: customer.email || "",
        });

        await Promise.all([fetchBuildings(), fetchCompanies(), fetchUnits()]);

        setActiveTab("customers");
        setPopupCreateUser(true);
      } catch (err) {
        console.error("Failed to load customer data for editing:", err);
        showTempPopupMessage("ไม่สามารถโหลดข้อมูลลูกค้าเพื่อแก้ไขได้");
      }
    },
    [fetchBuildings, fetchCompanies, fetchUnits, showTempPopupMessage]
  );

  const handleEditTechnician = useCallback(
    async (userId) => {
      try {
        const res = await axios.get(
          `${API_BASE_URL}/api/getTechnicianById/${userId}`
        );
        const technician = res.data.data;

        const resBuildings = await axios.get(`${API_BASE_URL}/api/getBuilding`);
        const buildingsData = resBuildings.data.data;

        const matchedBuildingIds = buildingsData
          .filter((building) =>
            technician.techBuilds?.some(
              (techBuild) =>
                techBuild.building.buildingName === building.buildingName
            )
          )
          .map((building) => building.id);

        setSelectedBuildings(matchedBuildingIds);

        setTechnicianFormData({
          id: technician.id,
          userId: technician.userId,
          name: technician.name,
          phone: technician.phone,
        });

        setActiveTab("technicians");
        setPopupCreateUser(true);
      } catch (err) {
        console.error("Failed to load technician data for editing:", err);
        showTempPopupMessage("ไม่สามารถโหลดข้อมูลเจ้าหน้าที่เพื่อแก้ไขได้");
      }
    },
    [showTempPopupMessage]
  );

  const handleEditAdmin = useCallback(
    async (userId) => {
      try {
        const response = await axios.get(
          `${API_BASE_URL}/api/getAdminById/${userId}`
        );
        const adminItem = response.data.data;

        setAdminFormData({
          id: adminItem.id,
          username: adminItem.username,
          password: adminItem.password,
        });

        setActiveTab("admin");
        setPopupCreateUser(true);
      } catch (err) {
        console.error("Failed to load admin data for editing:", err);
        showTempPopupMessage("ไม่สามารถโหลดข้อมูลแอดมินเพื่อแก้ไขได้");
      }
    },
    [showTempPopupMessage]
  );

  // --- Delete Handlers ---

  const handleDelete = useCallback(
    async (idToDelete, type) => {
      try {
        let endpoint = "";
        switch (type) {
          case "customers":
            endpoint = `/api/deleteCustomer/${idToDelete}`;
            break;
          case "technicians":
            endpoint = `/api/deleteTechnician/${idToDelete}`;
            break;
          case "admin":
            endpoint = `/api/deleteAdmin/${idToDelete}`;
            break;
          default:
            return;
        }
        handlePopupStatus("loading");
        await axios.delete(`${API_BASE_URL}${endpoint}`);
        handlePopupStatus("delete", true); // Show delete status, then reload
      } catch (error) {
        console.error(`Error deleting ${type}:`, error);
        handlePopupStatus("error");
        showTempPopupMessage(`ไม่สามารถลบ${type}ได้`);
      }
    },
    [handlePopupStatus, showTempPopupMessage]
  );

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

  const handleSubmit = useCallback(
    async (e) => {
      e.preventDefault();

      const newErrors = {};
      let payload = {};
      let apiCall = null;
      let successStatus = "";

      if (activeTab === "customers") {
        if (!customerFormData.name) newErrors.name = "กรุณากรอกชื่อ-สกุล";
        if (!customerFormData.companyName)
          newErrors.companyName = "กรุณากรอกบริษัท";
        if (!customerFormData.buildingName)
          newErrors.buildingName = "กรุณากรอกอาคาร";
        payload = customerFormData;
        apiCall = customerFormData.id
          ? axios.patch(`${API_BASE_URL}/api/updateCustomer`, payload)
          : axios.post(`${API_BASE_URL}/api/createCustomer`, payload);
        successStatus = customerFormData.id ? "update" : "success";
      } else if (activeTab === "technicians") {
        if (!technicianFormData.name) newErrors.name = "กรุณากรอกชื่อ-สกุล";
        payload = technicianFormData;
        apiCall = technicianFormData.id
          ? axios.patch(`${API_BASE_URL}/api/updateTechnician`, payload)
          : axios.post(`${API_BASE_URL}/api/createTechnician`, payload);
        successStatus = technicianFormData.id ? "update" : "success";
      } else if (activeTab === "admin") {
        if (!adminFormData.username)
          newErrors.username = "กรุณากรอกชื่อผู้ใช้งาน";
        if (!adminFormData.password && !adminFormData.id)
          newErrors.password = "กรุณากรอกรหัสผ่าน"; // Password required only for new admin
        payload = adminFormData;
        apiCall = adminFormData.id
          ? axios.patch(`${API_BASE_URL}/api/updateAdmin`, payload)
          : axios.post(`${API_BASE_URL}/api/createAdmin`, payload);
        successStatus = adminFormData.id ? "update" : "success";
      }

      setErrors(newErrors);

      if (Object.keys(newErrors).length > 0) {
        const firstErrorKey = Object.keys(newErrors)[0];
        showTempPopupMessage(newErrors[firstErrorKey]);
        return;
      }

      handlePopupStatus("loading");

      try {
        await apiCall;

        // Handle technician's building assignments after technician update/creation
        if (activeTab === "technicians" && technicianFormData.id) {
          await axios.post(`${API_BASE_URL}/api/techUpdateBuilding`, {
            techId: technicianFormData.userId,
            buildingIds: selectedBuildings,
          });
        }

        handlePopupStatus(successStatus, true); // Show success/update status, then reload
        navigate("/user"); // Redirect to user page
      } catch (error) {
        console.error("Submission error:", error);
        handlePopupStatus("error");
        showTempPopupMessage("เกิดข้อผิดพลาดในการบันทึกข้อมูล");
      }
    },
    [
      activeTab,
      customerFormData,
      technicianFormData,
      adminFormData,
      selectedBuildings,
      handlePopupStatus,
      showTempPopupMessage,
      navigate,
    ]
  );

  // --- Export Function ---
  const exportToExcel = useCallback(() => {
    let dataToExport = [];
    let fileName = "";
    let columnWidths = [];

    switch (activeTab) {
      case "customers":
        dataToExport = customers.map((customer, index) => ({
          ลำดับ: index + 1,
          อาคาร: customer.unit?.company?.building?.buildingName || "-",
          บริษัท: customer.unit?.company?.companyName || "-",
          ยูนิต: customer.unit?.unitName || "-",
          ลูกค้า: customer.name || "-",
          เบอร์โทรศัพท์: customer.phone || "-",
          "สถานะ Line": customer.userId
            ? "ลงทะเบียนแล้ว"
            : "ยังไม่ได้ลงทะเบียน",
        }));
        fileName = "ลูกค้า";
        columnWidths = [
          { wch: 6 },
          { wch: 25 },
          { wch: 25 },
          { wch: 12 },
          { wch: 20 },
          { wch: 15 },
          { wch: 18 },
        ];
        break;
      case "technicians":
        dataToExport = technicians.map((tech, index) => ({
          ลำดับ: index + 1,
          เจ้าหน้าที่: tech.name || "-",
          เบอร์โทรศัพท์: tech.phone || "-",
          "สถานะ Line": tech.userId ? "ลงทะเบียนแล้ว" : "ยังไม่ได้ลงทะเบียน",
          สังกัด: getUniqueBuildings(tech.techBuilds).join(", ") || "-",
        }));
        fileName = "เจ้าหน้าที่";
        columnWidths = [
          { wch: 6 },
          { wch: 20 },
          { wch: 15 },
          { wch: 18 },
          { wch: 30 },
        ];
        break;
      case "admin":
        dataToExport = admin.map((adminItem, index) => ({
          ลำดับ: index + 1,
          ชื่อผู้ใช้งาน: adminItem.username || "-",
        }));
        fileName = "แอดมิน";
        columnWidths = [{ wch: 6 }, { wch: 20 }];
        break;
      case "waitApprove":
        dataToExport = waitForApprove.map((user, index) => ({
          ลำดับ: index + 1,
          อาคาร: user.unit?.company?.building?.buildingName || "-",
          บริษัท: user.unit?.company?.companyName || "-",
          ยูนิต: user.unit?.unitName || "-",
          ผู้ใช้: user.name || "-",
          เบอร์โทรศัพท์: user.phone || "-",
          Email: user.email || "-",
          "สถานะ Line": user.userId ? "ลงทะเบียนแล้ว" : "ยังไม่ได้ลงทะเบียน",
        }));
        fileName = "รออนุมัติ";
        columnWidths = [
          { wch: 6 },
          { wch: 15 },
          { wch: 25 },
          { wch: 12 },
          { wch: 20 },
          { wch: 15 },
          { wch: 25 },
          { wch: 18 },
        ];
        break;
      default:
        return;
    }

    const ws = XLSX.utils.json_to_sheet(dataToExport);
    ws["!cols"] = columnWidths;
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Sheet1");
    XLSX.writeFile(
      wb,
      `${fileName}_${new Date().toISOString().split("T")[0]}.xlsx`
    );
  }, [
    activeTab,
    customers,
    technicians,
    admin,
    waitForApprove,
    getUniqueBuildings,
  ]);

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

  // Adjust isMobile state on window resize
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    handleResize(); // Set initial value
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // --- Render Logic ---

  const handleApproveAuto = async (userId) => {
    try {
      const response = await axios.post(
        `${import.meta.env.VITE_API_BASE_URL}/api/approve/${userId}`
      );
      console.log(response.data.data);
      window.location.reload();
    } catch (error) {
      console.error(error);
    }
  };

  const handleDeleteApprove = async (id) => {
    try {
      const response = await axios.delete(
        `${import.meta.env.VITE_API_BASE_URL}/api/deleteCustomer/${id}`
      );
      console.log(response.data);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <AdminLayout>
      <div className="container mx-auto px-4 py-2">
        <UserToolbar
          searchInput={searchInput}
          setSearchInput={setSearchInput}
          handleSearch={() => setSearchTerm(searchInput)} // Trigger search when button is clicked
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          setPopupCreateUser={setPopupCreateUser}
          exportToExcel={exportToExcel}
          buildings={buildings}
          filterBuilding={filterBuilding}
          setFilterBuilding={setFilterBuilding}
          waitForApprove={waitForApprove}
          resetFormData={() => {
            // Reset form data when opening new create popup
            setCustomerFormData({
              id: null,
              name: "",
              phone: "",
              companyName: "",
              unitName: "",
              buildingName: "",
              email: "",
              buildingId: "",
              companyId: "",
              unitId: "",
            });
            setTechnicianFormData({
              id: null,
              userId: null,
              name: "",
              phone: "",
            });
            setAdminFormData({ id: null, username: "", password: "" });
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
            {activeTab === "customers" && (
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
                            {customer.unit?.company?.building?.buildingName ||
                              "-"}
                          </td>
                          <td className="px-4 py-2 border-b-[1px] border-[#837958] bg-white text-sm text-center">
                            {customer.unit?.company?.companyName || "-"}
                          </td>
                          <td className="px-4 py-2 border-b-[1px] border-[#837958] bg-white text-sm text-center">
                            {customer.unit?.unitName || "-"}
                          </td>
                          <td className="px-4 py-2 border-b-[1px] border-[#837958] bg-white text-sm text-center">
                            {customer.name || "-"}
                          </td>
                          <td className="px-4 py-2 border-b-[1px] border-[#837958] bg-white text-sm text-center">
                            {customer.phone || "-"}
                          </td>
                          {/* <td className="px-5 py-4 border-b border-gray-200 bg-white text-sm">
                            {customer.email || '-'}
                          </td> */}
                          <td className="px-4 py-2 border-b-[1px] border-[#837958] bg-white text-sm">
                            {customer.userId ? (
                              <FaLine
                                className="text-green-500 text-xl ml-8 p-0"
                                title="เชื่อมต่อ Line แล้ว"
                              />
                            ) : (
                              <FaLine
                                className="text-red-500 text-xl ml-8 p-0"
                                title="ยังไม่ได้เชื่อมต่อ Line"
                              />
                            )}
                          </td>
                          <td className="px-4 py-2 border-r-[1px] border-b-[1px] border-[#837958] bg-white text-sm text-center">
                            <button
                              className="text-blue-500 hover:text-blue-700 mr-3"
                              title="แก้ไข"
                              onClick={() => {
                                // setPopupEditUser(true)
                                handleEditCustomer(customer.id);
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
                        <td
                          colSpan="9"
                          className="px-5 py-4 text-center text-gray-500"
                        >
                          ไม่พบข้อมูลลูกค้า
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}

            {activeTab === "technicians" && (
              <TechnicianTable
                technicians={technicians}
                getUniqueBuildings={getUniqueBuildings}
                handleEditTechnician={handleEditTechnician}
                confirmDelete={confirmDelete}
              />
            )}

            {activeTab === "waitApprove" && (
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
                            {user.unit.company.building.buildingName || "-"}
                          </td>
                          <td className="px-5 py-4 border-b border-gray-200 bg-white text-sm">
                            {user.unit.company.companyName || "-"}
                          </td>
                          <td className="px-5 py-4 border-b border-gray-200 bg-white text-sm">
                            {user.unit.unitName || "-"}
                          </td>
                          <td className="px-5 py-4 border-b border-gray-200 bg-white text-sm">
                            {user.name || "-"}
                          </td>
                          <td className="px-5 py-4 border-b border-gray-200 bg-white text-sm">
                            {user.phone || "-"}
                          </td>
                          <td className="px-5 py-4 border-b border-gray-200 bg-white text-sm">
                            {user.email || "-"}
                          </td>
                          <td className="px-5 py-4 border-b border-gray-200 bg-white text-sm">
                            {user.userId ? (
                              <FaLine
                                className="text-green-500 text-xl"
                                title="เชื่อมต่อ Line แล้ว"
                              />
                            ) : (
                              <FaLine
                                className="text-red-500 text-xl"
                                title="ยังไม่ได้เชื่อมต่อ Line"
                              />
                            )}
                          </td>
                          <td className="flex gap-2 px-5 py-4 border-b border-gray-200 bg-white text-sm">
                            <button
                              className="bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600"
                              onClick={() => handleApproveAuto(user.userId)}
                            >
                              อนุมัติ
                            </button>
                            <button
                              onClick={() => handleDeleteApprove(user.id)}
                            >
                              <Trash2 className="text-red-500" />
                            </button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td
                          colSpan="5"
                          className="px-5 py-4 text-center text-gray-500"
                        >
                          ไม่พบข้อมูลรออนุมัติ
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}

            {/* Admin */}
            {activeTab === "admin" && (
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
                    {admin.length > 0 ? (
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
                        <td
                          colSpan="4"
                          className="text-center py-4 text-gray-500"
                        >
                          ไม่มีข้อมูลผู้ใช้งาน
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}

            {/* {popupEditUser && (
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
            )} */}

            {/* Popup ยืนยันการลบ */}
            {showConfirmPopup && (
              <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/70">
                <div className="bg-white rounded-2xl shadow-lg p-6 w-[360px] h-[120px] text-center">
                  <p className="text-lg font-semibold text-[#837958]">
                    ยืนยันการลบ
                    {activeTab === "customers"
                      ? "ลูกค้า"
                      : activeTab === "technicians"
                      ? "เจ้าหน้าที่"
                      : "แอดมิน"}
                  </p>
                  <div className="flex flex-rows items-center justify-center text-[#837958] text-center mt-6 gap-x-4">
                    <button
                      onClick={cancelDelete}
                      className="bg-white text-[12px] text-[#BC9D72] border-[1px] w-64 h-6 border-[#BC9D72] rounded hover:opacity-80"
                    >
                      ยกเลิก
                    </button>
                    <button
                      onClick={proceedDelete}
                      className="bg-[#BC9D72] text-[12px] w-64 h-6 text-white rounded hover:opacity-90"
                    >
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
                        {activeTab === "customers"
                          ? "เพิ่มข้อมูลลูกค้าสำเร็จ"
                          : activeTab === "technicians"
                          ? "เพิ่มข้อมูลเจ้าหน้าที่สำเร็จ"
                          : "เพิ่มข้อมูลแอดมินสำเร็จ"}
                      </h2>
                    </div>
                  ) : popupStatus === "delete" ? (
                    <div className="flex flex-col items-center justify-center text-[#837958] text-center">
                      <CircleCheck size={50} strokeWidth={1} className="mb-2" />
                      <h2 className="text-lg font-semibold">
                        {activeTab === "customers"
                          ? "ลบข้อมูลลูกค้าสำเร็จ"
                          : activeTab === "technicians"
                          ? "ลบข้อมูลเจ้าหน้าที่สำเร็จ"
                          : "ลบข้อมูลแอดมินสำเร็จ"}
                      </h2>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center text-[#837958] text-center">
                      <CircleCheck size={50} strokeWidth={1} className="mb-2" />
                      <h2 className="text-lg font-semibold">
                        {activeTab === "customers"
                          ? "แก้ไขข้อมูลลูกค้าสำเร็จ"
                          : activeTab === "technicians"
                          ? "แก้ไขข้อมูลเจ้าหน้าที่สำเร็จ"
                          : "แก้ไขข้อมูลแอดมินไม่สำเร็จ"}
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
