import React, { useState, useEffect, useMemo } from "react";
import {
  ResponsiveContainer,
  BarChart,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  Bar,
} from "recharts";

const CustomTooltipBar = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white border border-[#BC9D72] rounded-xl p-3 shadow text-sm">
        <p className="font-semibold text-[#837958]">{label}</p>
        {payload.map((entry, idx) => (
          <p key={idx} className="text-[#555]">
            {entry.name}: {entry.value} งาน
          </p>
        ))}
      </div>
    );
  }
  return null;
};

const CustomXAxisTick = ({ x, y, payload }) => {
  const lines = payload.value.split("/"); // ตัดคำตาม "/"
  return (
    <g transform={`translate(${x},${y + 10})`}> {/* +10 เพื่อเว้นจากแกน X */}
      {lines.map((line, index) => (
        <text
          key={index}
          x={0}
          y={index * 14}
          textAnchor="middle"
          fill="#837958"
          fontSize={10}
        >
          {line}
        </text>
      ))}
    </g>
  );
};

const JobBarChart = ({ data, STATUS_LABELS, STATUS_COLORS, isMobile }) => {
  // const [isMobile, setIsMobile] = useState(false);

  // useEffect(() => {
  //   const handleResize = () => { //1024
  //     setIsMobile(window.innerWidth < 1030);
  //   };

  //   handleResize();
  //   window.addEventListener("resize", handleResize);
  //   return () => window.removeEventListener("resize", handleResize);
  // }, [isMobile]);

  // const filteredData = useMemo(() => {
  //   return isMobile ? data.slice(0, 3) : data;
  // }, [data, isMobile]);

  return (
    <div className="bg-[#F4F2ED] border-[1px] border-[#BC9D72] rounded-2xl pl-4 pr-4 pt-4 pb-4 mb-10" >
      <h2 className={`font-semibold mb-4 text-[#837958] ${isMobile ? "text-[18px]" : "text-[28px]"}`}>
        จำนวนงานตามกลุ่มงาน และสถานะ
      </h2>
      <div className="overflow-x-auto">
        <div style={{ width: `${data.length * 80}px` }}>
          <ResponsiveContainer width="100%" height={360}>
            <BarChart
              data={data}
              margin={{ top: 0, right: 0, bottom: 30, left: 0 }}
              barCategoryGap={70}
              barGap={0}
            >
              {/* เส้นกริด */}
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e2e2" />

              {/* แกน X ปรับเอียง + font */}
              <XAxis
                dataKey="name"
                interval={0}
                tick={<CustomXAxisTick />}
              />

              {/* แกน Y */}
              <YAxis
                allowDecimals={false}
                tick={{ fontSize: 14, fill: "#837958" }}
              />

              {/* กล่องลอย tooltip */}
              <Tooltip content={<CustomTooltipBar />} cursor={{ fill: "#f9f9f9" }} />

              {/* คำอธิบายด้านขวา */}
              <Legend
                verticalAlign="top"
                align="right"
                iconType="square"
                layout="centric"
                wrapperStyle={{
                  fontSize: "14px",
                  color: "#837958",
                }}
              />

              {/* แท่งกราฟ */}
              <Bar
                dataKey="pending"
                barSize={20}
                name={STATUS_LABELS.pending}
                fill={STATUS_COLORS.pending}
              />
              <Bar
                dataKey="in_progress"
                barSize={20}
                name={STATUS_LABELS.in_progress}
                fill={STATUS_COLORS.in_progress}
              />
              <Bar
                dataKey="completed"
                barSize={20}
                name={STATUS_LABELS.completed}
                fill={STATUS_COLORS.completed}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div >
  );
};

export default JobBarChart;
