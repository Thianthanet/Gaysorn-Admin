import React, { useEffect, useState } from 'react';
import AdminLayout from './AdminLayout';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';

const EditTechnician = () => {
    const { userId } = useParams();
    const [technician, setTechnician] = useState(null);
    const [name, setName] = useState('');
    const [phone, setPhone] = useState('');
    const [buildings, setBuildings] = useState([]);
    const [selectedBuildings, setSelectedBuildings] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const navigate = useNavigate()

    useEffect(() => {
        handleGetTechnician();
        handleGetBuilding();
    }, []);

    useEffect(() => {
        if (technician && buildings.length > 0) {
            setName(technician.name);
            setPhone(technician.phone);

            const matchedBuildingIds = buildings
                .filter(building =>
                    technician.techBuilds.some(techBuild =>
                        techBuild.building.buildingName === building.buildingName
                    )
                )
                .map(building => building.id);

            setSelectedBuildings(matchedBuildingIds);
            setIsLoading(false);
        }
    }, [technician, buildings]);

    const handleGetTechnician = async () => {
        try {
            const response = await axios.get(
                `${import.meta.env.VITE_API_BASE_URL}/api/getUser/${userId}`
            );
            setTechnician(response.data.data);
        } catch (error) {
            console.error('Error fetching technician data:', error);
            setIsLoading(false);
        }
    };

    const handleGetBuilding = async () => {
        try {
            const response = await axios.get(
                `${import.meta.env.VITE_API_BASE_URL}/api/getBuilding`
            );
            setBuildings(response.data.data);
        } catch (error) {
            console.error('Error fetching building data:', error);
            setIsLoading(false);
        }
    };

    const handleBuildingToggle = buildingId => {
        setSelectedBuildings(prev =>
            prev.includes(buildingId)
                ? prev.filter(id => id !== buildingId)
                : [...prev, buildingId]
        );
    };

    const handleSubmit = async e => {
        e.preventDefault();

        try {
            // อัปเดตชื่อและเบอร์
            await axios.patch(`${import.meta.env.VITE_API_BASE_URL}/api/updateTechnician`, {
                id: technician.id,
                name,
                phone
            });

            // อัปเดตอาคาร
            await axios.post(
                `${import.meta.env.VITE_API_BASE_URL}/api/techUpdateBuilding`,
                {
                    techId: technician.userId,
                    buildingIds: selectedBuildings,
                }
            );

            alert('บันทึกข้อมูลเรียบร้อยแล้ว');
            navigate('/user')
        } catch (error) {
            console.error('Error updating data:', error);
            alert('เกิดข้อผิดพลาดในการบันทึก');
        }
    };

    if (isLoading) {
        return (
            <AdminLayout>
                <div className="flex justify-center items-center h-screen text-xl">Loading...</div>
            </AdminLayout>
        );
    }

    if (!technician) {
        return (
            <AdminLayout>
                <div className="flex justify-center items-center h-screen text-xl text-red-600">
                    Error: Technician data not found or failed to load.
                </div>
            </AdminLayout>
        );
    }

    return (
        <AdminLayout>
            <div className="p-6 bg-white">
                <h1 className="text-3xl font-extrabold mb-6 text-[#BC9D72] border-b pb-2 rounded-md">
                    แก้ไขข้อมูลเจ้าหน้าที่
                </h1>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="p-5 border border-[#BC9D72] rounded-lg shadow-sm bg-gray-50 space-y-4">
                        {/* Input ชื่อ */}
                        <div>
                            <label className="block text-gray-700 font-semibold mb-1">ชื่อช่าง</label>
                            <input
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="w-full px-4 py-2 border rounded-md"
                                required
                            />
                        </div>

                        {/* Input เบอร์โทร */}
                        <div>
                            <label className="block text-gray-700 font-semibold mb-1">เบอร์โทรศัพท์</label>
                            <input
                                type="text"
                                value={phone}
                                onChange={(e) => setPhone(e.target.value)}
                                className="w-full px-4 py-2 border rounded-md"
                                required
                            />
                        </div>

                        {/* อาคาร */}
                        <div>
                            <h2 className="text-xl font-semibold text-[#BC9D72] mb-3">อาคาร</h2>
                            <div className="grid grid-cols-1 gap-3">
                                {buildings.map(building => (
                                    <label key={building.id} className="flex items-center space-x-3">
                                        <input
                                            type="checkbox"
                                            checked={selectedBuildings.includes(building.id)}
                                            onChange={() => handleBuildingToggle(building.id)}
                                            className="h-5 w-5 text-[#BC9D72] accent-[#BC9D72]"
                                        />
                                        <span className="text-lg text-gray-800">{building.buildingName}</span>
                                    </label>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div>
                        <button
                            type="submit"
                            className="px-8 py-3 rounded-lg text-white text-lg font-semibold bg-[#BC9D72] hover:bg-[#a88c60] transition-colors duration-300 ease-in-out shadow-md"
                        >
                            บันทึก
                        </button>
                    </div>
                </form>
            </div>
        </AdminLayout>
    );
};

export default EditTechnician;
