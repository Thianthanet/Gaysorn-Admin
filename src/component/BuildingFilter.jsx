import { useState, useEffect } from "react";
import { ChevronDown } from "lucide-react";
import axios from "axios";

const BuildingFilter = ({ isMobile, setBuildingName }) => {
    const [selected, setSelected] = useState("ทั้งหมด");
    const [open, setOpen] = useState(false);
    const [build, setBuild] = useState([]);
    // const options = ["ทั้งหมด", "Gaysorn Amarin", "Gaysorn Center", "Gaysorn Tower"];

    useEffect(() => {
        const handleBuilding = async () => {
            try {
                const res = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/api/getBuilding`);
                // console.log("👉 FULL API RESPONSE:", JSON.stringify(res.data, null, 2));

                // const buildings = res.data?.data || []; // 🔍 ตรวจว่าเป็น array
                const buildingNames = ['ทั้งหมด', ...res.data?.data.map(b => b.buildingName)];
                setBuild(buildingNames);
            } catch (err) {
                console.error(err);
            }
        };

        handleBuilding();
    }, []);


    // console.log("Build: ", build)

    // ปิด dropdown เมื่อคลิกนอก
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (!e.target.closest("#filter-dropdown")) {
                setOpen(false);
            }
        };
        document.addEventListener("click", handleClickOutside);
        return () => document.removeEventListener("click", handleClickOutside);
    }, []);

    const handleSelect = (item) => {
        setSelected(item);
        setOpen(false);
        if (selected) {
            setBuildingName(item); // ✅ ส่งชื่ออาคารกลับ
        }
    };

    return (
        <div id="filter-dropdown" className={`${isMobile ? "mr-4 mt-2" : "mr-6 mt-3"}`}>
            <div className="relative">
                {/* ปุ่มหลัก */}
                <button
                    onClick={() => setOpen(!open)}
                    className={`bg-[#837958] text-white rounded-full flex items-center justify-center shadow-md hover:bg-[#6f684c] transition-all ${isMobile ? "w-[ุ50px] h-[22px] p-[8px] " : "w-[ุ64px] h-[28px] p-3"} `}
                >
                    <span className={`truncate ${isMobile ? "text-[10px]" : "text-[14px]"} mr-1`}>
                        {setSelected === "ทั้งหมด" ? "อาคาร" : "อาคาร"} {/*selected*/}
                    </span>
                    <ChevronDown size={16} />
                </button>

                {/* Dropdown */}
                {open && (
                    <div className={`absolute min-w-[150px] bg-[#F4F2ED] rounded-lg shadow-md border border-gray-300 z-10`}>
                        {build.map((item, idx) => (
                            <div
                                key={idx}
                                // onClick={() => {
                                //     setSelected(item);
                                //     setOpen(false);
                                // }}
                                onClick={() => handleSelect(item)}
                                className={`${isMobile ? "p-[2px] text-[7px]" : "p-[2px] text-[9px]"}  text-[#837958] text-center text-sm border-b-[1px] border-[#837958]/20 last:border-b-0 hover:bg-[#BC9D72] hover:text-white cursor-pointer`}
                            >
                                {item}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default BuildingFilter;
