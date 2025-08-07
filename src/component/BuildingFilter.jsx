import { useState, useEffect } from "react";
import { ChevronDown } from "lucide-react";
import axios from "axios";

const BuildingFilter = ({
    isMobile,
    buildings, // <--- รับรายการอาคารที่ถูกส่งมาจาก Parent
    // filterBuilding,
    setFilterBuilding, // <--- ฟังก์ชันที่จะเรียกเมื่อมีการเลือกอาคารใหม่ (setFilterBuilding ใน User.jsx)
    selectedBuilding, // <--- รับค่าอาคารที่ถูกเลือกปัจจุบันมาจาก Parent
}) => {
    // const [selected, setSelected] = useState("ทั้งหมด");
    const [open, setOpen] = useState(false);
    const [selected, setSelected] = useState(selectedBuilding);
    useEffect(() => {
        setSelected(selectedBuilding);
    }, [selectedBuilding]);

    // console.log("selected: ", selected)
    // console.log("selectedBuilding: ", selectedBuilding)
    // const [build, setBuild] = useState([]);
    // const options = ["ทั้งหมด", "Gaysorn Amarin", "Gaysorn Center", "Gaysorn Tower"];

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
        setSelected(item); // อัปเดตค่าที่เลือกใน internal state
        setOpen(false); // ปิด dropdown
        setFilterBuilding(item); // เรียกใช้ฟังก์ชันที่ส่งมาจาก Parent เพื่ออัปเดตค่าภายนอก
    };

    // สร้างตัวเลือก "ทั้งหมด" ในรูปแบบ Object เพื่อให้เข้ากับโครงสร้างของ buildings prop
    const allOption = { id: 'all', buildingName: 'all' }; // เพิ่ม id: 'all' เพื่อใช้เป็น key ได้

    // สร้าง array ใหม่ที่มี "ทั้งหมด" อยู่ด้านหน้าสุด
    const displayBuildings = [allOption, ...buildings];

    return (
        <div id="filter-dropdown"> 
            <div className="relative">
                {/* ปุ่มหลัก */}
                <button
                    onClick={() => setOpen(!open)}
                    className={`bg-[#837958] text-white rounded-full flex items-center justify-center shadow-md hover:bg-[#6f684c] transition-all ${isMobile ? "w-[ุ50px] h-[22px] p-[8px] " : selected === "all" ? "w-[100px] h-[28px] p-3" : "w-[160px] h-[28px] p-3"} `}
                >
                    <span className={`truncate ${isMobile ? "text-[10px]" : "text-[14px]"} mr-2`}>
                        {selected === "all" ? "อาคาร" : selected} {/*selected*/}
                    </span>
                    <ChevronDown size={16} />
                </button>

                {/* Dropdown */}
                {open && (
                    <div className={`absolute min-w-full bg-[#F4F2ED] rounded-lg shadow-md border border-gray-300 z-20`}>
                        {displayBuildings.map((item, idx) => ( 
                            <div
                                key={idx}
                                onClick={() => handleSelect(item?.buildingName)}
                                className={`${isMobile ? "p-[2px] text-[7px]" : "p-[2px] text-[12px]"}  text-[#837958] text-center border-b-[1px] border-[#837958]/20 last:border-b-0 hover:bg-[#BC9D72] hover:text-white cursor-pointer`}
                            >
                                {item?.buildingName === "all" ? "ทั้งหมด" : item?.buildingName} {/* <--- ถ้าค่าเป็น 'all' ให้แสดง 'ทั้งหมด' */}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default BuildingFilter;
