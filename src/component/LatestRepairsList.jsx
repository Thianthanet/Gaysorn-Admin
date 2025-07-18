import React, { useState, useEffect } from "react";
import { useNavigate } from 'react-router-dom'
import moment from 'moment'
import 'moment/locale/th'
moment.locale('th')

const LatestRepairsList = ({ repairs, STATUS_LABELS, isMobile }) => {
    const navigate = useNavigate()

    const formatThaiDate = (date) => {
        const formatter = new Intl.DateTimeFormat('th-TH', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            hour12: false,
        });

        return formatter.format(new Date(date)) + ' น.';
    };

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
            className="bg-[#F4F2ED] rounded-2xl border-[1px] border-[#BC9D72]/90 shadow pl-6 pr-4 pt-6 pb-6">
            <div className="flex flex-col justify-start h-full">
                <h2 className={`flex items-start font-semibold mb-4 text-[#837958] ${isMobile ? "text-[24px]" : "text-[28px]"}`}>
                    10 งานล่าสุด
                </h2>

                <ul className="space-y-3">
                    {repairs.slice(0, 10).map((item) => {
                        const companyName = item.companyName?.trim() || "-";
                        return (
                            <li key={item.id} className={`flex pb-2 ${isMobile ? "gap-x-4" : "gap-x-20"}`}>
                                <div className="flex flex-col items-start">
                                    <span className={`font-medium text-[#BC9D72] ${isMobile ? "text-[16px]" : "text-[24px]"} `}>
                                        {companyName}
                                    </span>
                                    <div className={`text-xs text-gray-600 ${isMobile ? "text-[12px]" : "text-[18px]"}`}>
                                        <span>{formatThaiDate(item.createDate)}</span>
                                    </div>
                                </div>
                                <span className={`font-medium text-[#BC9D72] ${isMobile ? "text-[13px]" : "text-[22px]"}`}>
                                    {STATUS_LABELS[item.status] ?? item.status}
                                </span>
                            </li>
                        );
                    })}
                </ul>
            </div>
        </button>
    );
};

export default LatestRepairsList;
