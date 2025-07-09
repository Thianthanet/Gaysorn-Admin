import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import AdminLayout from './AdminLayout';

const EditCustomer = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [customer, setCustomer] = useState(null);
  const [buildings, setBuildings] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [units, setUnits] = useState([]);

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    buildingId: '',
    companyId: '',
    companyName: '',
    unitId: '',
    unitName: '',
  });

  useEffect(() => {
    handleGetCustomer();
    handleGetBuilding();
    handleGetCompany();
    handleGetUnits();
  }, []);

  useEffect(() => {
    if (customer) {
      setFormData({
        name: customer.name || '',
        phone: customer.phone || '',
        buildingId: customer.unit?.company?.buildingId || '',
        companyId: customer.unit?.companyId || '',
        companyName: customer.unit?.company?.companyName || '',
        unitId: customer.unitId || '',
        unitName: customer.unit?.unitName || '',
      });
    }
  }, [customer]);

  const handleGetCustomer = async () => {
    const res = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/api/getCustomerById/${id}`);
    setCustomer(res.data.data);
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

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === 'companyName') {
      const selectedCompany = companies.find(c => c.companyName === value);
      setFormData((prev) => ({
        ...prev,
        companyName: value,
        companyId: selectedCompany ? selectedCompany.id : '',
      }));
    } else if (name === 'unitName') {
      const selectedUnit = units.find(u => u.unitName === value);
      setFormData((prev) => ({
        ...prev,
        unitName: value,
        unitId: selectedUnit ? selectedUnit.id : '',
        companyId: selectedUnit ? selectedUnit.companyId : prev.companyId,
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        id,
        name: formData.name,
        phone: formData.phone,
        buildingId: formData.buildingId,
        companyId: formData.companyId,
        companyName: formData.companyName,
        unitId: formData.unitId,
        unitName: formData.unitName,
      };

      const res = await axios.patch(`${import.meta.env.VITE_API_BASE_URL}/api/updateCustomer`, payload);
      console.log('Update response:', res.data);
      alert('แก้ไขข้อมูลผู้ใช้สำเร็จ');
      navigate('/user'); // Redirect to user list after successful update
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <AdminLayout>
      <div className="max-w-xl mx-auto p-6">
        <h2 className="text-xl font-bold mb-4 text-center text-[#726140]">แก้ไขข้อมูลผู้ใช้</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block mb-1 font-medium">ชื่อ-สกุล<span className="text-red-500">*</span></label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
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
              onChange={handleChange}
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
              onChange={handleChange}
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
              onChange={handleChange}
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
              onChange={handleChange}
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
    </AdminLayout>
  );
};

export default EditCustomer;
