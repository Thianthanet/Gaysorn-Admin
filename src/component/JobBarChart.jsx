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
            {entry.name} : {entry.value} งาน
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
          fontSize={"12px"}
        >
          {line}
        </text>
      ))}
    </g>
  );
};

const JobBarChart = ({ data, STATUS_LABELS, STATUS_COLORS, isMobile }) => {

  const CustomLegend = () => {
    const legendItems = [
      { label: STATUS_LABELS.pending, color: STATUS_COLORS.pending },
      { label: STATUS_LABELS.in_progress, color: STATUS_COLORS.in_progress },
      { label: STATUS_LABELS.completed, color: STATUS_COLORS.completed },
    ];

    return (
      <div className="flex justify-end w-full pr-6 pb-2">
        <ul className="flex flex-col gap-1">
          {legendItems.map((item, index) => (
            <li key={index} className="flex items-center gap-2">
              <span
                className="w-4 h-4 inline-block rounded-sm"
                style={{ backgroundColor: item.color }}
              ></span>
              <span className="text-[14px] text-[#837958]">{item.label}</span>
            </li>
          ))}
        </ul>
      </div>
    );
  };

  return (
    <div className="bg-[#F4F2ED] border-[1px] border-[#BC9D72] rounded-2xl pl-6 pt-4 mb-4 relative">
      <h2 className={`font-semibold text-[#837958] ${isMobile ? "text-[20px]" : "text-[26px]"}`}>
        จำนวนงานทั้งหมด
      </h2>

      {/* ✅ Legend ที่ลอยมุมขวาบน */}
      {/* <div className="absolute top-6 right-6 z-10">
        <CustomLegend />
      </div> */}
      <CustomLegend />

      <div className="overflow-x-auto">
        <div style={{ width: `${data.length * 100}px` }}>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart
              data={data}
              margin={{ top: 0, right: 30, bottom: 30, left: 0 }}
              barCategoryGap="100%"
              barGap={0}
            >
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e2e2" />

              <XAxis
                dataKey="name"
                interval={0}
                tick={<CustomXAxisTick />}
              />

              <YAxis
                allowDecimals={false}
                tick={{ fontSize: 12, fill: "#837958" }}
              />

              <Tooltip content={<CustomTooltipBar />} cursor={{ fill: "#f9f9f9" }} />

              {/* <Legend
                verticalAlign="top"
                align="right"
                iconType="square"
                content={<CustomLegend />}
                wrapperStyle={{
                  paddingTop: 10,
                  paddingRight: 10,
                }}
              /> */}

              <Bar
                dataKey="pending"
                barSize={25}
                name={STATUS_LABELS.pending}
                fill={STATUS_COLORS.pending}
                radius={[2, 2, 0, 0]}
              />
              <Bar
                dataKey="in_progress"
                barSize={25}
                name={STATUS_LABELS.in_progress}
                fill={STATUS_COLORS.in_progress}
                radius={[2, 2, 0, 0]}
              />
              <Bar
                dataKey="completed"
                barSize={25}
                name={STATUS_LABELS.completed}
                fill={STATUS_COLORS.completed}
                radius={[2, 2, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>

  );
};

export default JobBarChart;
