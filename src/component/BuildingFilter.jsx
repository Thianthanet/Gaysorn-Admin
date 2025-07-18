import { useState, useEffect } from "react";
import { ChevronDown } from "lucide-react";

const BuildingFilter = ({ isMobile }) => {
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

    return (
        <div
            id="filter-dropdown"
            className={`${isMobile ? "mr-2": "mr-4"}`}
        >
            <div className="relative">
                <button
                    onClick={() => setOpen(!open)}
                    className="bg-[#837958] text-white px-8 py-1 rounded-full flex items-center space-x-2 shadow-md hover:bg-[#6f684c] transition-all"
                >
                    <span className="truncate max-w-[56px]">
                        {selected === "ทั้งหมด" ? "อาคาร" : selected}
                    </span>
                    <ChevronDown size={12} />
                </button>

                {open && (
                    <div className="absolute w-30 bg-white rounded-lg shadow-xl border border-gray-100">
                        {options.map((item, idx) => (
                            <div
                                key={idx}
                                onClick={() => {
                                    setSelected(item);
                                    setOpen(false);
                                }}
                                className="px-4 py-1 flex border-b-[1px]  justify-center hover:bg-gray-100 cursor-pointer text-[#837958] text-[13px]"
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
