import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { Edit, Trash2 } from 'lucide-react'; // ใช้ไอคอนจาก lucide-react

const Building = () => {
  const [buildings, setBuildings] = useState([]);
  const [buildingName, setBuildingName] = useState('');
  const [groupId, setGroupId] = useState('');

  // สำหรับแก้ไข
  const [editId, setEditId] = useState('');
  const [editGroupId, setEditGroupId] = useState('');

  useEffect(() => {
    handleGetBuilding();
  }, []);

  const handleCreateBuilding = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        buildingName: buildingName.trim(),
        groupId: groupId.trim() === '' ? null : groupId.trim(),
      };

      await axios.post(
        `${import.meta.env.VITE_API_BASE_URL}/api/createBuilding`,
        payload
      );

      setBuildingName('');
      setGroupId('');
      handleGetBuilding();
    } catch (error) {
      console.error('Error creating building:', error);
    }
  };

  const handleGetBuilding = async () => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_API_BASE_URL}/api/getBuilding`
      );
      const sorted = response.data.data.sort((a, b) => a.id - b.id);
      setBuildings(sorted);
    } catch (error) {
      console.error('Error fetching building data:', error);
    }
  };

  const handleEdit = (building) => {
    setEditId(building.id);
    setEditGroupId(building.groupId || '');
  };

  const handleUpdateBuilding = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        id: editId,
        groupId: editGroupId.trim() === '' ? null : editGroupId.trim(),
      };

      await axios.patch(
        `${import.meta.env.VITE_API_BASE_URL}/api/updateBuilding`,
        payload
      );

      setEditId('');
      setEditGroupId('');
      handleGetBuilding();
    } catch (error) {
      console.error('Error updating building:', error);
    }
  };

  const handleDelete = async (id) => {
    if (confirm('คุณแน่ใจว่าต้องการลบอาคารนี้?')) {
      try {
        await axios.delete(`${import.meta.env.VITE_API_BASE_URL}/api/deleteBuilding/${id}`);
        handleGetBuilding();
      } catch (error) {
        console.error('Error deleting building:', error);
      }
    }
  };

  return (
    <div className="p-8 bg-white shadow-lg rounded-xl max-w-xl mx-auto">
      <h1 className="text-2xl font-bold mb-6 border-b pb-2 text-gray-800">
        อาคาร
      </h1>

      {/* ฟอร์มสร้าง */}
      <form
        onSubmit={handleCreateBuilding}
        className="space-y-4 mb-8"
      >
        <div>
          <label className="block mb-1 text-gray-700 font-medium">
            ชื่ออาคาร:
          </label>
          <input
            type="text"
            value={buildingName}
            onChange={(e) => setBuildingName(e.target.value)}
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring focus:border-blue-400"
            placeholder="ระบุชื่ออาคาร"
            required
          />
        </div>

        <div>
          <label className="block mb-1 text-gray-700 font-medium">
            ID กลุ่มไลน์ของตึก:
          </label>
          <input
            type="text"
            value={groupId}
            onChange={(e) => setGroupId(e.target.value)}
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring focus:border-blue-400"
            placeholder="ใส่หรือเว้นว่างได้"
          />
        </div>

        <button
          type="submit"
          className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-md font-semibold transition"
        >
          สร้างตึก
        </button>
      </form>

      {/* ฟอร์มแก้ไข */}
      {editId && (
        <form
          onSubmit={handleUpdateBuilding}
          className="space-y-4 mb-8 p-4 border border-yellow-300 rounded-md bg-yellow-50"
        >
          <h2 className="text-lg font-semibold text-yellow-800">
            แก้ไขอาคาร ID: {editId}
          </h2>

          <div>
            <label className="block mb-1 text-gray-700 font-medium">
              ID กลุ่มใหม่:
            </label>
            <input
              type="text"
              value={editGroupId}
              onChange={(e) => setEditGroupId(e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring focus:border-yellow-400"
              placeholder="ใส่หรือเว้นว่างได้"
            />
          </div>

          <div className="flex gap-2">
            <button
              type="submit"
              className="bg-yellow-500 hover:bg-yellow-600 text-white py-2 px-4 rounded-md font-semibold transition"
            >
              บันทึกการแก้ไข
            </button>
            <button
              type="button"
              onClick={() => {
                setEditId('');
                setEditGroupId('');
              }}
              className="bg-gray-300 hover:bg-gray-400 text-gray-800 py-2 px-4 rounded-md font-semibold transition"
            >
              ยกเลิก
            </button>
          </div>
        </form>
      )}

      {/* รายการตึก */}
      <div className="space-y-2">
        {buildings.map((building) => (
          <div
            key={building.id}
            className="flex items-center justify-between border border-gray-200 rounded-md p-3 hover:shadow transition"
          >
            <div className="text-gray-700 font-semibold">
              {building.id}
            </div>
            <div className="flex-1 mx-4">
              <div className="text-gray-800 font-medium">
                {building.buildingName}
              </div>
              <div className="text-sm text-gray-500">
                ID กลุ่ม: {building.groupId || '-'}
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => handleEdit(building)}
                className="text-blue-600 hover:text-blue-800"
              >
                <Edit size={18} />
              </button>
              <button
                onClick={() => handleDelete(building.id)}
                className="text-red-600 hover:text-red-800"
              >
                <Trash2 size={18} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Building;
