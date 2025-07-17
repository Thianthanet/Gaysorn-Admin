import React, { useState, useEffect, use } from "react";
import {
    PieChart,
    Pie,
    Cell,
    Legend,
    Tooltip,
    ResponsiveContainer,
} from "recharts";

const PieChartAndSummary = ({ statusPieData, summaryCards, iconMap, isMobile }) => {
    const [activeIndex, setActiveIndex] = useState(null);
    // const [isMobile, setIsMobile] = useState(false);

    // useEffect(() => {
    //     const handleResize = () => { //1024
    //         setIsMobile(window.innerWidth < 1030);
    //     };

    //     handleResize();
    //     window.addEventListener("resize", handleResize);
    //     return () => window.removeEventListener("resize", handleResize);
    // }, [isMobile]);

    const CustomTooltipPie = ({ active, payload }) => {
        if (active && payload && payload.length) {
            const data = payload[0].payload;
            return (
                <div className="bg-white/90 backdrop-blur-md border border-[#BC9D72]/80 rounded-xl p-3 shadow-xl text-sm">
                    <p className="font-semibold text-[#837958]">{data.name}</p>
                    <p className="text-[#555]">จำนวน: {data.value} งาน</p>
                </div>
            );
        }
        return null;
    };

    return (
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 mb-4">
            {/* ----- PIE CHART ----- */}
            <div className="col-span-1 md:col-span-8 bg-[#F4F2ED] rounded-2xl border border-[#BC9D72]/90 pt-4 shadow">
                <h2 className={`font-semibold text-[#837958] mb-2 pl-4 ${isMobile ? "text-[24px]": "text-[28px]"}`}>
                    สรุปสถานะของงานประจำ...
                </h2>
                <div className={`w-full ${isMobile ? "h-[200px]" : "h-[300px]"}`}>
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <defs>
                                {statusPieData.map((d, idx) => (
                                    <linearGradient id={`activeGradient-${idx}`} key={idx} x1="0" y1="0" x2="1" y2="1">
                                        <stop offset="0%" stopColor={d.color} stopOpacity={0.8} />
                                        <stop offset="100%" stopColor="#F4F2ED" stopOpacity={0.9} />
                                    </linearGradient>
                                ))}
                            </defs>

                            <Pie
                                data={statusPieData}
                                dataKey="value"
                                nameKey="name"
                                cx="45%"
                                cy="45%"
                                startAngle={90}
                                endAngle={-270}
                                outerRadius="90%"
                                label={false}
                                isAnimationActive={true}
                                animationDuration={500}
                                activeIndex={activeIndex}
                                onClick={(_, idx) => setActiveIndex(idx === activeIndex ? null : idx)}
                            >
                                {statusPieData.map((d, idx) => (
                                    <Cell
                                        key={`cell-${idx}`}
                                        fill={idx === activeIndex ? `url(#activeGradient-${idx})` : d.color}
                                        stroke={idx === activeIndex ? "#837958" : "#fff"}
                                        strokeWidth={idx === activeIndex ? 1 : 0}
                                        style={{
                                            transition: "transform .3s ease, box-shadow .3s ease",
                                            transform: idx === activeIndex ? "scale(1.08)" : "scale(1)",
                                            boxShadow: idx === activeIndex ? "0 0 10px rgba(131,121,88,0.5)" : "none",
                                            cursor: "pointer",
                                        }}
                                        onMouseOver={(e) => {
                                            e.target.style.transform = "scale(1.08)";
                                            e.target.style.boxShadow = "0 0 10px rgba(131,121,88,0.5)";
                                        }}
                                        onMouseOut={(e) => {
                                            e.target.style.transform = "scale(1)";
                                            e.target.style.boxShadow = "none";
                                        }}
                                    />
                                ))}
                            </Pie>
                            {/* Legend สำหรับมือถือ */}
                            {/* <Legend
                                verticalAlign="bottom"
                                align="center"
                                layout="horizontal"
                                iconType="circle"
                                wrapperStyle={{ fontSize: "16px", color: "#837958" }}
                                className="block md:hidden"
                            /> */}

                            {/* Legend สำหรับ PC */}
                            <Legend
                                verticalAlign={isMobile ? "bottom" : "middle"}
                                align={isMobile ? "center" : "right"}
                                layout={isMobile ? "horizontal" : "vertical"}
                                iconType="circle"
                                wrapperStyle={{ fontSize: "20px", color: "#837958", right: isMobile ? "2px" : "72px"}}
                            />

                            <Tooltip content={<CustomTooltipPie />} cursor={{ fill: "#f9f9f9" }} />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* ----- SUMMARY CARDS ----- */}
            <div className="col-span-1 md:col-span-4 grid grid-cols-2 sm:grid-cols-2 gap-4">
                {summaryCards.map((card) => (
                    <div
                        key={card.key}
                        className="flex flex-col justify-center items-center p-2 bg-[#F4F2ED] rounded-2xl border border-[#BC9D72]/90 hover:shadow-xl transition-shadow duration-300"
                    >
                        <div className="text-[#BC9D72]/90 transform transition-transform duration-300 hover:scale-110">
                            {iconMap[card.key]}
                        </div>
                        <span className={`text-[48px] font-bold text-[#837958]`}>
                            {card.value}
                        </span>
                        <span className="text-[#837958] sm:text-[12px] md:text-[12px]">
                            {card.label}
                        </span>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default PieChartAndSummary;
