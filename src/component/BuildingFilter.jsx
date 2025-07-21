import { useState, useEffect } from "react";
import { ChevronDown } from "lucide-react";

const BuildingFilter = ({ isMobile, setBuildingName }) => {
    const [selected, setSelected] = useState("ทั้งหมด");
    const [open, setOpen] = useState(false);
    const options = ["ทั้งหมด", "Gaysorn Amarin", "Gaysorn Center", "Gaysorn Tower"];

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
                    className={`bg-[#837958] text-white rounded-full flex items-center justify-center shadow-md hover:bg-[#6f684c] transition-all ${isMobile ? "w-[ุ50px] h-[18px] p-[8px] " : "w-[ุ64px] h-[24px] p-3"} `}
                >
                    <span className={`truncate ${isMobile ? "text-[8px]" : "text-[10px]"} mr-1`}>
                        {setSelected === "ทั้งหมด" ? "อาคาร" : "อาคาร"} {/*selected*/}
                    </span>
                    <ChevronDown size={16} />
                </button>

                {/* Dropdown */}
                {open && (
                        <div className={`absolute ${isMobile ? "min-w-[56px]" : "min-w-[68px]"} bg-[#F4F2ED] rounded-lg shadow-md border border-gray-200 z-10`}>
                        {options.map((item, idx) => (
                            <div
                                key={idx}
                                // onClick={() => {
                                //     setSelected(item);
                                //     setOpen(false);
                                // }}
                                onClick={() => handleSelect(item)}
                                className={`${isMobile? "p-[2px] text-[6px]" : "p-[3px] text-[8px]"}  text-[#837958] text-center border-b-[1px] last:border-b-0 hover:bg-gray-100 cursor-pointer`}
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
