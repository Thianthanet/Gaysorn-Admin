import React, { useState, useEffect } from "react";

const TopCompaniesList = ({ companies }) => {

    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        const handleResize = () => { //1024
            setIsMobile(window.innerWidth < 1030);
        };

        handleResize();
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, [isMobile]);

    return (
        <div className="bg-[#F4F2ED] rounded-2xl border-[1px] border-[#BC9D72]/90 shadow p-6">
            <h2 className={`font-semibold mb-4 text-[#837958] ${isMobile ? "text-[24px]" : "text-[28px]"}`}>
                10 อันดับลูกค้าแจ้งซ่อม
            </h2>

            <ul className="space-y-3">
                {companies.slice(0, 10).map((c, idx) => (
                    <li key={idx} className="flex justify-between pb-2">
                        <span className="font-medium text-[#BC9D72] text-[24px]">
                            {c.companyName ?? "ไม่ระบุ"}
                        </span>
                        <span className={`font-medium text-[#BC9D72] flex items-center ${isMobile ? "text-[20px]" : "text-[24px]"}`}>
                            {c._count.id} งาน
                        </span>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default TopCompaniesList;
