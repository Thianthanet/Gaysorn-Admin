import React, { useEffect, useState } from 'react';
import AdminLayout from './AdminLayout'; // Make sure this path is correct
import { useParams } from 'react-router-dom';
import axios from 'axios';

const EditTechnician = () => {
    const { userId } = useParams();
    const [technician, setTechnician] = useState(null);
    const [buildings, setBuildings] = useState([]);
    const [selectedBuildings, setSelectedBuildings] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    // Fetch technician data and building data on component mount
    useEffect(() => {
        handleGetTechnician();
        handleGetBuilding();
    }, []);

    // Effect to pre-select checkboxes once both technician and building data are loaded
    useEffect(() => {
        if (technician && buildings.length > 0) {
            // Determine which buildings the technician is associated with
            const matchedBuildingIds = buildings
                .filter(building =>
                    technician.techBuilds.some(techBuild =>
                        techBuild.building.buildingName === building.buildingName
                    )
                )
                .map(building => building.id);

            setSelectedBuildings(matchedBuildingIds);
            setIsLoading(false); // Set loading to false after initial selection
        }
    }, [technician, buildings]); // Rerun when technician or buildings data changes

    const handleGetTechnician = async () => {
        try {
            const response = await axios.get(
                `${import.meta.env.VITE_API_BASE_URL}/api/getUser/${userId}`
            );
            console.log('Technician data:', response.data.data);
            setTechnician(response.data.data);
        } catch (error) {
            console.error('Error fetching technician data:', error);
            // Handle error display to user if needed
            setIsLoading(false); // Ensure loading is stopped even on error
        }
    };

    const handleGetBuilding = async () => {
        try {
            const response = await axios.get(
                `${import.meta.env.VITE_API_BASE_URL}/api/getBuilding`
            );
            console.log('Building data:', response.data.data);
            setBuildings(response.data.data);
        } catch (error) {
            console.error('Error fetching building data:', error);
            // Handle error display to user if needed
            setIsLoading(false); // Ensure loading is stopped even on error
        }
    };

    const handleBuildingToggle = buildingId => {
        setSelectedBuildings(prev => {
            if (prev.includes(buildingId)) {
                // If already selected, remove it
                return prev.filter(id => id !== buildingId);
            } else {
                // If not selected, add it
                return [...prev, buildingId];
            }
        });
    };

    const handleSubmit = async e => {
        e.preventDefault();
        try {
            const response = await axios.post(
                `${import.meta.env.VITE_API_BASE_URL}/api/techUpdateBuilding`,
                {
                    techId: technician.userId, // Assuming technician.userId is the correct ID to send
                    buildingIds: selectedBuildings,
                }
            );
            console.log('Update successful:', response.data);
            alert('Technician buildings updated successfully!');
            // Optionally, redirect or refresh data after successful update
        } catch (error) {
            console.error('Error updating technician buildings:', error);
            alert('Failed to update technician buildings. Please try again.');
        }
    };

    if (isLoading) {
        return (
            <AdminLayout>
                <div className="flex justify-center items-center h-screen text-xl">Loading...</div>
            </AdminLayout>
        );
    }

    // Ensure technician data is available before rendering details
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
                    <div className="p-5 border border-[#BC9D72] rounded-lg shadow-sm bg-gray-50">
                        {/* ข้อมูลช่าง */}
                        <p className="text-gray-700 mb-1">
                            <span className="font-semibold text-gray-800">ชื่อ:</span> {technician.name}
                        </p>
                        <p className="text-gray-700 mb-4">
                            <span className="font-semibold text-gray-800">เบอร์โทรศัพท์:</span> {technician.phone}
                        </p>

                        {/* อาคาร */}
                        <h2 className="text-xl font-semibold text-[#BC9D72] mb-3">อาคาร</h2>
                        <div className="grid grid-cols-1 sm:grid-cols-1 lg:grid-cols-1 xl:grid-cols-1 gap-5">
                            {buildings.map(building => (
                                <label
                                    key={building.id}
                                    className=""
                                >
                                    <input
                                        type="checkbox"
                                        checked={selectedBuildings.includes(building.id)}
                                        onChange={() => handleBuildingToggle(building.id)}
                                        className="h-5 w-5 text-[#BC9D72] accent-[#BC9D72] focus:ring-[#BC9D72] rounded"
                                    />
                                    <span className="ml-3 text-lg font-medium text-gray-800">
                                        {building.buildingName}
                                    </span>
                                </label>
                            ))}
                        </div>
                    </div>

                    {/* ปุ่ม Submit */}
                    <div>
                        <button
                            type="submit"
                            className="px-8 py-3 rounded-lg text-white text-lg font-semibold bg-[#BC9D72] hover:bg-[#a88c60] transition-colors duration-300 ease-in-out shadow-md focus:outline-none focus:ring-2 focus:ring-[#BC9D72] focus:ring-opacity-50"
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