import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminLayout from './AdminLayout';

const CreateCustomer = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('customer');
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

  const [adminData, setAdminData] = useState({
    username: '',
    password: ''
  });

  const handleCustomerChange = async (e) => {
    const { name, value } = e.target;
    setCustomerData(prev => ({ ...prev, [name]: value }));

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
      }
    }

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
      }
    }
  };

  const handleTechnicianChange = (e) => {
    const { name, value } = e.target;
    setTechnicianData(prev => ({ ...prev, [name]: value }));
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
    const hasTechnicianData = technicianData.name.trim() !== '' && technicianData.phone.trim() !== '';
    const hasAdminData = adminData.username.trim() !== '' && adminData.password.trim() !== '';

    try {
      if (activeTab === 'customer') {
        await axios.post(`${import.meta.env.VITE_API_BASE_URL}/api/createCustomer`, customerData);
        alert('สร้างลูกค้าสำเร็จ');
        navigate('/user');
        return;
      }

      if (activeTab === 'technician') {
        if (hasTechnicianData) {
          await axios.post(`${import.meta.env.VITE_API_BASE_URL}/api/createTechnician`, technicianData);
          alert('สร้างเจ้าหน้าที่สำเร็จ');
          navigate('/user');
          return;
        }

        if (hasAdminData) {
          const res = await axios.post(`${import.meta.env.VITE_API_BASE_URL}/api/createAdmin`, adminData);
          if (res.data.data) {
            alert('สร้างแอดมินสำเร็จ');
            navigate('/user')
          } else {
            alert('Username หรือ Password ของแอดมินไม่ถูกต้อง');
          }
          return;
        }

        alert('กรุณากรอกชื่อและเบอร์ หรือ username/password ของแอดมิน');
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
                activeTab === 'customer' ? 'bg-[#BC9D72] text-white' : 'bg-[#f5f5f5] text-[#837958]'
              }`}
              onClick={() => setActiveTab('customer')}
            >
              ผู้ใช้
            </button>
            <button
              className={`px-6 py-2 font-semibold ${
                activeTab === 'technician' ? 'bg-[#BC9D72] text-white' : 'bg-[#f5f5f5] text-[#837958]'
              }`}
              onClick={() => setActiveTab('technician')}
            >
              เจ้าหน้าที่
            </button>
          </div>

          <form onSubmit={handleSubmit}>
            {/* Customer Tab */}
            {activeTab === 'customer' && (
              <>
                <div className="mb-4">
                  <label className="block text-[#837958] mb-1">ชื่อ-สกุล<span className="text-red-500">*</span></label>
                  <input
                    name="name"
                    value={customerData.name}
                    onChange={handleCustomerChange}
                    placeholder="ชื่อ-สกุล"
                    required
                    className="w-full border border-[#BC9D72] rounded-lg px-4 py-2"
                  />
                </div>

                <div className="mb-4">
                  <label className="block text-[#837958] mb-1">เบอร์โทรศัพท์<span className="text-red-500">*</span></label>
                  <input
                    name="phone"
                    value={customerData.phone}
                    onChange={handleCustomerChange}
                    placeholder="เบอร์โทรศัพท์"
                    required
                    className="w-full border border-[#BC9D72] rounded-lg px-4 py-2"
                  />
                </div>

                <div className="mb-4">
                  <label className="block text-[#837958] mb-1">ชื่อเล่น</label>
                  <input
                    name="nickname"
                    value={customerData.nickname}
                    onChange={handleCustomerChange}
                    placeholder="ชื่อเล่น"
                    className="w-full border border-[#BC9D72] rounded-lg px-4 py-2"
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
                    className="w-full border border-[#BC9D72] rounded-lg px-4 py-2"
                  />
                </div>

                <div className="mb-4">
                  <label className="block text-[#837958] mb-1">ยูนิต<span className="text-red-500">*</span></label>
                  <input
                    name="unitName"
                    value={customerData.unitName}
                    onChange={handleCustomerChange}
                    placeholder="ยูนิต"
                    required
                    className="w-full border border-[#BC9D72] rounded-lg px-4 py-2"
                  />
                </div>

                <div className="mb-4">
                  <label className="block text-[#837958] mb-1">อาคาร<span className="text-red-500">*</span></label>
                  <select
                    name="buildingName"
                    value={customerData.buildingName}
                    onChange={handleCustomerChange}
                    required
                    className="w-full border border-[#BC9D72] rounded-lg px-4 py-2"
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
                    className="w-full border border-[#BC9D72] rounded-lg px-4 py-2"
                  />
                </div>
              </>
            )}

            {/* Technician Tab */}
            {activeTab === 'technician' && (
              <>
                <div className="mb-4">
                  <label className="block text-[#837958] mb-1">ชื่อ-สกุล</label>
                  <input
                    name="name"
                    value={technicianData.name}
                    onChange={handleTechnicianChange}
                    placeholder="ชื่อ-สกุล"
                    className="w-full border border-[#BC9D72] rounded-lg px-4 py-2"
                  />
                </div>

                <div className="mb-4">
                  <label className="block text-[#837958] mb-1">เบอร์โทรศัพท์</label>
                  <input
                    name="phone"
                    value={technicianData.phone}
                    onChange={handleTechnicianChange}
                    placeholder="เบอร์โทรศัพท์"
                    className="w-full border border-[#BC9D72] rounded-lg px-4 py-2"
                  />
                </div>

                <hr className="my-4 border-[#BC9D72]" />
                <h3 className="text-center text-[#837958] font-bold mb-4">------------------- Admin -------------------</h3>

                <div className="mb-4">
                  <label className="block text-[#837958] mb-1">Username</label>
                  <input
                    type="text"
                    name="username"
                    value={adminData.username}
                    onChange={(e) => setAdminData({ ...adminData, username: e.target.value })}
                    placeholder="Username"
                    className="w-full border border-[#BC9D72] rounded-lg px-4 py-2"
                  />
                </div>

                <div className="mb-6">
                  <label className="block text-[#837958] mb-1">Password</label>
                  <input
                    type="password"
                    name="password"
                    value={adminData.password}
                    onChange={(e) => setAdminData({ ...adminData, password: e.target.value })}
                    placeholder="Password"
                    className="w-full border border-[#BC9D72] rounded-lg px-4 py-2"
                  />
                </div>
              </>
            )}

            <button
              type="submit"
              className="w-full bg-[#837958] text-white py-3 rounded-full hover:opacity-90 transition"
            >
              บันทึก
            </button>
          </form>
        </div>
      </div>
    </AdminLayout>
  );
};

export default CreateCustomer;
