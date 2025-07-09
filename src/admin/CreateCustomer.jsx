import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminLayout from './AdminLayout';

const CreateCustomer = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('customer'); // customer | technician
  const [buildings, setBuildings] = useState([]);

  const [customerData, setCustomerData] = useState({
    name: '',
    phone: '',
    nickname: '',
    email: '',
    unitName: '',
    buildingName: '',
    companyName: ''
  });

  const [technicianData, setTechnicianData] = useState({
    name: '',
    phone: ''
  });

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
    try {
      if (activeTab === 'customer') {
        await axios.post(`${import.meta.env.VITE_API_BASE_URL}/api/createCustomer`, customerData);
        alert('สร้างลูกค้าสำเร็จ');
        navigate('/user');
      } else if (activeTab === 'technician') {
        await axios.post(`${import.meta.env.VITE_API_BASE_URL}/api/createTechnician`, technicianData);
        alert('สร้างช่างสำเร็จ');
        navigate('/user');
      }
    } catch (error) {
      console.error(error);
      alert('เกิดข้อผิดพลาด');
    }
  };

  return (
    <AdminLayout>
      <div className="flex justify-center items-center">
        <div className="border border-[#BC9D72] rounded-xl p-8 w-full max-w-lg">
          <h2 className="text-2xl font-bold text-[#837958] text-center mb-6">เพิ่มผู้ใช้ใหม่</h2>

          {/* Tabs */}
          <div className="flex mb-6 rounded-full overflow-hidden border border-[#BC9D72] w-fit mx-auto">
            <button
              className={`px-6 py-2 font-semibold ${
                activeTab === 'customer'
                  ? 'bg-[#BC9D72] text-white'
                  : 'bg-[#f5f5f5] text-[#837958]'
              }`}
              onClick={() => setActiveTab('customer')}
            >
              ผู้ใช้
            </button>
            <button
              className={`px-6 py-2 font-semibold ${
                activeTab === 'technician'
                  ? 'bg-[#BC9D72] text-white'
                  : 'bg-[#f5f5f5] text-[#837958]'
              }`}
              onClick={() => setActiveTab('technician')}
            >
              เจ้าหน้าที่
            </button>
          </div>

          <form onSubmit={handleSubmit}>
            {activeTab === 'customer' && (
              <>
                <div className="mb-4">
                  <label className="block text-[#837958] mb-1">
                    ชื่อ-สกุล<span className="text-red-500">*</span>
                  </label>
                  <input
                    name="name"
                    value={customerData.name}
                    onChange={handleCustomerChange}
                    placeholder="ชื่อ-สกุล"
                    required
                    className="w-full border border-[#BC9D72] rounded-lg px-4 py-2 focus:outline-none"
                  />
                </div>

                <div className="mb-4">
                  <label className="block text-[#837958] mb-1">
                    เบอร์โทรศัพท์<span className="text-red-500">*</span>
                  </label>
                  <input
                    name="phone"
                    value={customerData.phone}
                    onChange={handleCustomerChange}
                    placeholder="เบอร์โทรศัพท์"
                    required
                    className="w-full border border-[#BC9D72] rounded-lg px-4 py-2 focus:outline-none"
                  />
                </div>

                <div className="mb-4">
                  <label className="block text-[#837958] mb-1">ชื่อเล่น</label>
                  <input
                    name="nickname"
                    value={customerData.nickname}
                    onChange={handleCustomerChange}
                    placeholder="ชื่อเล่น"
                    className="w-full border border-[#BC9D72] rounded-lg px-4 py-2 focus:outline-none"
                  />
                </div>

                <div className="mb-4">
                  <label className="block text-[#837958] mb-1">อีเมล</label>
                  <input
                    type="email"
                    name="email"
                    value={customerData.email}
                    onChange={handleCustomerChange}
                    placeholder="อีเมล"
                    className="w-full border border-[#BC9D72] rounded-lg px-4 py-2 focus:outline-none"
                  />
                </div>

                <div className="mb-4">
                  <label className="block text-[#837958] mb-1">
                    ยูนิต<span className="text-red-500">*</span>
                  </label>
                  <input
                    name="unitName"
                    value={customerData.unitName}
                    onChange={handleCustomerChange}
                    placeholder="ยูนิต"
                    required
                    className="w-full border border-[#BC9D72] rounded-lg px-4 py-2 focus:outline-none"
                  />
                </div>

                <div className="mb-4">
                  <label className="block text-[#837958] mb-1">
                    อาคาร<span className="text-red-500">*</span>
                  </label>
                  <select
                    name="buildingName"
                    value={customerData.buildingName}
                    onChange={handleCustomerChange}
                    required
                    className="w-full border border-[#BC9D72] rounded-lg px-4 py-2 focus:outline-none"
                  >
                    <option value="">เลือกอาคาร</option>
                    {buildings.map((building) => (
                      <option key={building.id} value={building.buildingName}>
                        {building.buildingName}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="mb-6">
                  <label className="block text-[#837958] mb-1">บริษัท</label>
                  <input
                    name="companyName"
                    value={customerData.companyName}
                    onChange={handleCustomerChange}
                    placeholder="บริษัท"
                    className="w-full border border-[#BC9D72] rounded-lg px-4 py-2 focus:outline-none"
                  />
                </div>
              </>
            )}

            {activeTab === 'technician' && (
              <>
                <div className="mb-4">
                  <label className="block text-[#837958] mb-1">
                    ชื่อ-สกุล<span className="text-red-500">*</span>
                  </label>
                  <input
                    name="name"
                    value={technicianData.name}
                    onChange={handleTechnicianChange}
                    placeholder="ชื่อ-สกุล"
                    required
                    className="w-full border border-[#BC9D72] rounded-lg px-4 py-2 focus:outline-none"
                  />
                </div>

                <div className="mb-6">
                  <label className="block text-[#837958] mb-1">
                    เบอร์โทรศัพท์<span className="text-red-500">*</span>
                  </label>
                  <input
                    name="phone"
                    value={technicianData.phone}
                    onChange={handleTechnicianChange}
                    placeholder="เบอร์โทรศัพท์"
                    required
                    className="w-full border border-[#BC9D72] rounded-lg px-4 py-2 focus:outline-none"
                  />
                </div>
              </>
            )}

            <button
              type="submit"
              className="w-full bg-[#837958] text-white py-3 rounded-full hover:opacity-90 transition"
            >
              {activeTab === 'customer' ? 'เพิ่มผู้ใช้' : 'เพิ่มเจ้าหน้าที่'}
            </button>
          </form>
        </div>
      </div>
    </AdminLayout>
  );
};

export default CreateCustomer;