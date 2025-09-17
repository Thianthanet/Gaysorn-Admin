import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  PieChart,
  Pie,
  Cell,
  Legend,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import BuildingFilter from "./BuildingFilter";

const PieChartAndSummary = ({
  statusPieData,
  summaryCards,
  iconMap,
  isMobile,
  activeButton,
  setBuildingName,
  startDate,
  endDate,
}) => {
  const [activeIndex, setActiveIndex] = useState(null);
  const navigate = useNavigate();
  const formatThaiDate = (dateStr) => {
    const date = new Date(dateStr);
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear() + 543;
    return `${day}/${month}/${year}`;
  };

  const statusLabelMap = {
    today: "วันนี้",
    yesterday: "เมื่อวาน",
    thisWeek: "สัปดาห์นี้",
    thisMonth: "เดือนนี้",
    thisYear: "ปีนี้",
  };

  // console.log("statusPieData in PieChart: ", statusPieData)

  const hasValidData = statusPieData.some((item) => item.value > 0);

  // console.log("hasValidData in PieChart: ", hasValidData)

  const pieData = hasValidData
    ? statusPieData
    : statusPieData.map((item, index) =>
        index === 3 ? { ...item, value: 1 } : item
      );

  const activeLabel = statusLabelMap[activeButton] || "";

  const CustomTooltipPie = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white/90 backdrop-blur-md border border-[#BC9D72]/80 rounded-xl p-3 shadow-xl text-sm">
          <p className="font-semibold text-[#837958]">{data.name}</p>
          <p className="text-[#555]">
            จำนวน : {data.name === "ไม่มีงาน" ? data.value - 1 : data.value} งาน
          </p>
        </div>
      );
    }
    return null;
  };

  const renderCustomLegend = (props) => {
    const { payload } = props;
    return (
      <ul className={`list-none m-0 ${isMobile ? "pr-12" : "pr-16"}`}>
        {payload.map((entry, index) => (
          <li key={`item-${index}`} className="flex items-center mb-1">
            <span
              className="inline-block w-[20px] h-[20px] rounded-full mr-2"
              style={{ backgroundColor: entry.color }}
            />
            <span
              className={`text-[#837958] font-medium ${
                isMobile ? "text-[14px]" : "text-[18px]"
              }`}
            >
              {entry.value}
            </span>
          </li>
        ))}
      </ul>
    );
  };

  return (
    <div
      className={`mb-4 ${
        isMobile ? "flex flex-col gap-4" : "grid grid-cols-12 gap-2"
      }`}
    >
      {/* ----- PIE CHART ----- สมดุลคือ ไม่กำหนดความสูง h */}
      <div
        className={`${
          isMobile ? "h-[210px]" : "md:col-span-8 h-[310px]"
        } bg-[#F4F2ED] rounded-2xl border border-[#BC9D72]/90 pt-2 pl-2 shadow`}
      >
        <div className="flex justify-between">
          <h2
            className={`font-semibold text-[#837958] pl-4 ${
              isMobile ? "text-[20px]" : "text-[26px]"
            }`}
          >
            สรุปสถานะของงานประจำ {activeLabel}{" "}
            {activeButton === "custom" && startDate && endDate
              ? startDate === endDate
                ? `${formatThaiDate(startDate)}`
                : `${formatThaiDate(startDate)} - ${formatThaiDate(endDate)}`
              : ""}
          </h2>
          <BuildingFilter
            isMobile={isMobile}
            setBuildingName={setBuildingName}
          />
        </div>{" "}
        {/*สมดุลคือ ไม่กำหนดความสูง h */}
        <div
          className={`w-full ${isMobile ? "h-[180px]" : "ml-[10px] h-[280px]"}`}
        >
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={pieData}
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
                activeIndex={hasValidData ? activeIndex : null}
                stroke="none"
                onClick={(_, idx) => {
                  if (hasValidData) {
                    setActiveIndex(idx === activeIndex ? null : idx);
                  }
                }}
              >
                {pieData.map((d, idx) => (
                  <Cell
                    key={`cell-${idx}`}
                    fill={d.color}
                    style={{
                      transition: "filter 0.3s ease",
                      filter: "none",
                      cursor: hasValidData ? "pointer" : "default",
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
                verticalAlign="middle"
                align="right"
                layout="vertical"
                content={renderCustomLegend}
              />

              <Tooltip
                content={<CustomTooltipPie />}
                cursor={{ fill: "#f9f9f9" }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* ----- SUMMARY CARDS ----- */}
      <div
        className={`${isMobile ? "" : "md:col-span-4"} grid grid-cols-2 gap-2`}
      >
        {summaryCards.map((card) => (
          <button
            key={card.key}
            onClick={() =>
              navigate(
                `/job?status=${
                  card.key === "total" ? "all" : card.key
                }&startDate=${startDate}&endDate=${endDate}`
              )
            }
            className="flex flex-col justify-center items-center h-[150px] bg-[#F4F2ED] rounded-2xl border border-[#BC9D72]/90 hover:shadow-xl transition-shadow duration-300"
          >
            <div className="text-[#BC9D72] opacity-60 transform transition-transform duration-300 hover:scale-110">
              {iconMap[card.key]}
            </div>{" "}
            {/* ถ้าสมดุล text-[48px] */}
            <span className="text-[30px] font-bold text-[#837958]">
              {card.value}{" "}
            </span>
            <span className="text-[#837958] text-[14px]">{card.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default PieChartAndSummary;
