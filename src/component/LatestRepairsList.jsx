import React, { useState, useEffect } from "react";
import { useNavigate } from 'react-router-dom'
import moment from 'moment'
import 'moment/locale/th'
moment.locale('th')

const LatestRepairsList = ({
    repairs,
    STATUS_LABELS,
    isMobile,
    startDate,
    endDate,
}) => {
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
    
    const repairsLasterFilter = repairs.map((r) => r.jobNo)

    // console.log("repairs: ", repairs);
    // console.log("repairsFilter: ", repairsFilter);

    return (
        <button
            onClick={() => navigate(`/job?repairsLasterFilter=${repairsLasterFilter}`)}
            className="bg-[#F4F2ED] rounded-2xl border-[1px] border-[#BC9D72]/90 shadow pr-6 pl-6 pt-4">
            <div className="flex flex-col justify-start h-full pb-4">
                <h2 className={`flex items-start font-semibold mb-2 text-[#837958] ${isMobile ? "text-[18px]" : "text-[26px]"}`}>
                    10 งานล่าสุด
                </h2>

                <ul className="space-y-2">
                    {repairs.slice(0, 10).map((item) => {
                        const companyName = item.companyName?.trim() || "-";
                        return (
                            <li key={item.id} className={`grid grid-cols-2 items-start ${isMobile ? "gap-2" : "gap-[52px]"} text-[#837958]`}>
                                <div className="flex flex-col items-start">
                                    <span className={`font-medium text-[#BC9D72] ${isMobile ? "text-[12px]" : "text-[18px]"}`}>
                                        {companyName}
                                    </span>
                                    <div className={`text-gray-600 ${isMobile ? "text-[5px]" : "text-[13px]"}`}>
                                        <span>{formatThaiDate(item.createDate)}</span>
                                    </div>
                                </div>
                                <span className={`font-medium flex items-start text-[#BC9D72] ${isMobile ? "text-[9px]" : "text-[18px]"}`}>
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
