import React, { useState, useEffect } from "react";
import { useNavigate } from 'react-router-dom'

const TopCompaniesList = ({ companies, isMobile }) => {
    const navigate = useNavigate()

    return (
        <button
            onClick={() => navigate('/job')}
            className="bg-[#F4F2ED] rounded-2xl border border-[#BC9D72]/90 shadow pt-4 pb-4 pr-4 pl-6 w-full text-left hover:shadow-lg transition"
        >
            <div className="flex flex-col justify-start h-full">
                <h2
                    className={`font-semibold text-[#837958] mb-2 ${isMobile ? 'text-[18px]' : 'text-[28px]'
                        }`}
                >
                    10 อันดับลูกค้าแจ้งซ่อม
                </h2>

                <ul className="space-y-2">
                    {companies.slice(0, 10).map((c, idx) => (
                        <li
                            key={c.id ?? `idx-${idx}`} // ใช้ index ถ้าไม่มี id
                            className={`grid grid-cols-2 items-start ${isMobile ? 'gap-18' : 'gap-32'}  text-[#837958]`}
                        >
                            <span
                                className={`font-medium text-[#BC9D72] truncate ${isMobile ? 'text-[12px]' : 'text-[20px]'
                                    }`}
                            >
                                {c.companyName ?? 'ไม่ระบุ'}
                            </span>
                            <span
                                className={`font-medium text-[#BC9D72] ${isMobile ? 'text-[12px]' : 'text-[20px]'
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
