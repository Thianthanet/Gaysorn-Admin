import React, { useState, useEffect } from "react";
import { useNavigate } from 'react-router-dom'

const TopCompaniesList = ({ companies, isMobile }) => {
    const navigate = useNavigate()
    // const [isMobile, setIsMobile] = useState(false);

    // useEffect(() => {
    //     const handleResize = () => { //1024
    //         setIsMobile(window.innerWidth < 1030);
    //     };

    //     handleResize();
    //     window.addEventListener("resize", handleResize);
    //     return () => window.removeEventListener("resize", handleResize);
    // }, [isMobile]);

    return (
        <button
            onClick={() => navigate('/job')}
            className="bg-[#F4F2ED] rounded-2xl border border-[#BC9D72]/90 shadow pt-6 pb-6 pr-8 pl-8 w-full text-left hover:shadow-lg transition"
        >
            <div className="flex flex-col justify-start h-full">
                <h2
                    className={`font-semibold text-[#837958] mb-4 ${isMobile ? 'text-[24px]' : 'text-[28px]'
                        }`}
                >
                    10 อันดับลูกค้าแจ้งซ่อม
                </h2>

                <ul className="space-y-3">
                    {companies.slice(0, 10).map((c, idx) => (
                        <li
                            key={idx}
                            className="flex justify-between pb-2 pr-6" //border-b border-[#E2DFD5]
                        >
                            <span
                                className={`font-medium text-[#BC9D72] truncate ${isMobile ? 'text-[20px]' : 'text-[24px]'
                                    }`}
                            >
                                {c.companyName ?? 'ไม่ระบุ'}
                            </span>
                            <span
                                className={`font-medium text-[#BC9D72] ${isMobile ? 'text-[20px]' : 'text-[24px]'
                                    }`}
                            >
                                {c._count.id} งาน
                            </span>
                        </li>
                    ))}
                </ul>
            </div>
        </button>
    );
};

export default TopCompaniesList;
