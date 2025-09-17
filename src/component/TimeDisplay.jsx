import React, { useEffect, useState } from "react";
import moment from "moment";
import "moment/locale/th";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

moment.locale("th"); // ตั้ง locale ไทย

const TimeDisplay = ({
  isMobile,
  onDataChange,
  activeButton,
  setActiveButton,
}) => {
  const [currentTime, setCurrentTime] = useState("");
  const [customRange, setCustomRange] = useState([null, null]);
  const [startDate, endDate] = customRange;

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const formatter = new Intl.DateTimeFormat("th-TH", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      });
      setCurrentTime(formatter.format(now) + " น.");
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    handleSelectRange("today");
    return () => clearInterval(interval);
  }, []);

  const handleSelectRange = (type) => {
    setActiveButton(type);
    setCustomRange([null, null]);

    let start, end;

    switch (type) {
      case "today":
        start = moment().startOf("day");
        end = moment().endOf("day");
        break;
      case "yesterday":
        start = moment().subtract(1, "days").startOf("day");
        end = moment().subtract(1, "days").endOf("day");
        break;
      case "thisWeek":
        start = moment().startOf("isoWeek");
        end = moment().endOf("isoWeek");
        break;
      case "thisMonth":
        start = moment().startOf("month");
        end = moment().endOf("month");
        break;
      case "thisYear":
        start = moment().startOf("year");
        end = moment().endOf("year");
        break;
      default:
        return;
    }

    if (typeof onDataChange === "function") {
      onDataChange({
        startDate: start.format("YYYY-MM-DD"),
        endDate: end.format("YYYY-MM-DD"),
      });
    }
  };

  const handleCustomRangeChange = (dates) => {
    const [start, end] = dates;
    setCustomRange(dates);
    setActiveButton("custom"); // เปลี่ยน active button เป็น custom

    if (start) {
      onDataChange({
        startDate: moment(start).format("YYYY-MM-DD"),
        endDate: end
          ? moment(end).format("YYYY-MM-DD")
          : moment(start).format("YYYY-MM-DD"),
      });
    }
  };

  const buttonClass = (type) =>
    `px-3 py-1 rounded-full ${
      isMobile ? "text-[10px]" : "text-[12px]"
    } font-medium border transition
        ${
          activeButton === type
            ? "bg-[#837958] text-white"
            : "bg-white text-[#D9D9D9] border-[#D9D9D9] hover:bg-[#f3f1ed] hover:text-[#837958] "
        }`;

  return (
    <div className="relative flex flex-col gap-2 mb-4">
      <div className="flex justify-between items-end flex-wrap gap-2">
        <div>
          <span
            className={`${
              isMobile ? "text-[15px]" : "text-[20px]"
            } text-black font-bold`}
          >
            {currentTime}
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-2 relative">
          <button
            onClick={() => handleSelectRange("today")}
            className={buttonClass("today")}
          >
            วันนี้
          </button>
          <button
            onClick={() => handleSelectRange("yesterday")}
            className={buttonClass("yesterday")}
          >
            เมื่อวาน
          </button>
          <button
            onClick={() => handleSelectRange("thisWeek")}
            className={buttonClass("thisWeek")}
          >
            สัปดาห์นี้
          </button>
          <button
            onClick={() => handleSelectRange("thisMonth")}
            className={buttonClass("thisMonth")}
          >
            เดือนนี้
          </button>
          <button
            onClick={() => handleSelectRange("thisYear")}
            className={buttonClass("thisYear")}
          >
            ปีนี้
          </button>

          {/* Date Picker สำหรับช่วงวันที่กำหนดเอง */}
          <DatePicker
            selectsRange
            startDate={startDate}
            endDate={endDate}
            onChange={handleCustomRangeChange}
            dateFormat="dd/MM/yyyy"
            placeholderText="ระบุช่วงวันที่"
            popperPlacement="bottom-start"
            className={`rounded-full px-2 py-1 transition-all duration-200
    ${isMobile ? "text-[10px]" : "text-[12px]"}
    ${
      activeButton === "custom"
        ? "bg-[#837958] text-white border border-[#837958]"
        : "bg-white text-[#D9D9D9] border border-[#D9D9D9] hover:bg-[#f3f1ed] hover:text-[#837958] "
    }
    ${startDate || endDate ? "w-40" : "w-24"}`}
            renderCustomHeader={({
              date,
              changeYear,
              changeMonth,
              decreaseMonth,
              increaseMonth,
              prevMonthButtonDisabled,
              nextMonthButtonDisabled,
            }) => (
              <div className="flex justify-between items-center px-2 py-1 bg-white">
                <button
                  onClick={decreaseMonth}
                  disabled={prevMonthButtonDisabled}
                >
                  {"<"}
                </button>
                <select
                  value={date.getFullYear() + 543} // แสดงปี พ.ศ.
                  onChange={({ target: { value } }) => changeYear(value - 543)}
                >
                  {Array.from({ length: 100 }, (_, i) => {
                    const year = new Date().getFullYear() - 50 + i;
                    return (
                      <option key={year} value={year + 543}>
                        {year + 543}
                      </option>
                    );
                  })}
                </select>
                <select
                  value={date.getMonth()}
                  onChange={({ target: { value } }) =>
                    changeMonth(Number(value))
                  }
                >
                  {moment.months().map((month, index) => (
                    <option key={month} value={index}>
                      {month}
                    </option>
                  ))}
                </select>
                <button
                  onClick={increaseMonth}
                  disabled={nextMonthButtonDisabled}
                >
                  {">"}
                </button>
              </div>
            )}
          />
        </div>
      </div>
    </div>
  );
};

export default TimeDisplay;
