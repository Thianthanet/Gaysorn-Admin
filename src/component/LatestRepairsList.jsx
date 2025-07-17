import React, { useState, useEffect } from "react";
import moment from 'moment'
import 'moment/locale/th'
moment.locale('th')

const LatestRepairsList = ({ repairs, STATUS_LABELS, isMobile }) => {

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
        <div className="bg-[#F4F2ED] rounded-2xl border-[1px] border-[#BC9D72]/90 shadow p-4">
            <h2 className={`font-semibold mb-4 text-[#837958] ${isMobile ? "text-[24px]" : "text-[28px]"}`}>
                10 งานล่าสุด
            </h2>

            <ul className="space-y-3">
                {repairs.slice(0, 10).map((item) => {
                    const companyName = item.companyName?.trim() || "-";
                    return (
                        <li key={item.id} className="flex justify-between pb-2">
                            <div>
                                <span className="font-medium text-[#BC9D72] text-[24px]">
                                    {companyName}
                                </span>
                                <div className="text-xs text-gray-600">
                                    <span>{formatThaiDate(item.createDate)}</span>
                                </div>
                            </div>
                            <span className={`font-medium text-[#BC9D72] ${isMobile ? "text-[16px]": "text-[24px]"}`}>
                                {STATUS_LABELS[item.status] ?? item.status}
                            </span>
                        </li>
                    );
                })}
            </ul>
        </div>
    );
};

export default LatestRepairsList;
