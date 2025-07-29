import React, { useState, useRef, useEffect, useCallback } from 'react';
import { HiChevronDown } from 'react-icons/hi';

const CustomSelect = ({
  options, // [{ id: 'all', value: 'all', name: 'ทั้งหมด' }, { id: 1, value: 'Gaysorn Center', name: 'Gaysorn Center' }, ...]
  value, // ค่าที่ถูกเลือกในปัจจุบัน
  onChange, // ฟังก์ชันเมื่อมีการเลือก (รับ value)
  placeholder = "เลือกอาคาร",
  // className for the main button and options are handled internally for consistency
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const selectRef = useRef(null);

  // Find the currently selected option's name for display
  const selectedOption = options.find(opt => opt.value === value);
  const displayValue = selectedOption ? selectedOption.name : placeholder;

  // Handles clicks outside to close the dropdown
  const handleClickOutside = useCallback((event) => {
    if (selectRef.current && !selectRef.current.contains(event.target)) {
      setIsOpen(false);
    }
  }, []);

  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [handleClickOutside]);

  // Handles option selection
  const handleOptionClick = (optionValue) => {
    onChange(optionValue);
    setIsOpen(false);
  };

  return (
    <div className="relative inline-block" ref={selectRef}>
      {/* The main button that displays the current value and toggles the dropdown */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`
          flex items-center justify-between
          px-4 pr-8 h-[36px] bg-[#837958] text-white
          rounded-full shadow-[0_2px_4px_rgba(0,0,0,0.1)] cursor-pointer
          appearance-none outline-none border-none
          min-w-[120px] max-w-[300px]
          transition-all duration-300 ease-in-out
          text-[14px] font-medium
          focus:ring-2 focus:ring-[#BC9D72] focus:ring-opacity-50
        `}
        aria-haspopup="listbox" // For accessibility
        aria-expanded={isOpen} // For accessibility
      >
        <span>{displayValue}</span>
        <HiChevronDown
          size={20}
          className={`
            text-white transition-transform duration-200
            ${isOpen ? 'rotate-180' : 'rotate-0'}
          `}
        />
      </button>

      {/* The dropdown list of options */}
      {isOpen && (
        <ul
          role="listbox" // For accessibility
          className={`
            absolute z-10 w-full mt-2
            bg-white // พื้นหลังของ panel เป็นสีขาว (ตามที่เห็นจากภาพที่สอง)
            rounded-lg shadow-lg // เพิ่ม shadow และ rounded-lg ให้กับ panel ตามรูป
            border border-gray-200 // เพิ่ม border รอบ panel
            max-h-60 overflow-y-auto // กำหนดความสูงสูงสุดและ scrollbar
          `}
        >
          {options.map((option) => (
            <li
              key={option.id}
              role="option" // For accessibility
              aria-selected={option.value === value} // For accessibility
              onClick={() => handleOptionClick(option.value)}
              className={`
                px-4 py-2 text-[14px] cursor-pointer
                text-black // ข้อความสีดำ
                bg-[#F4F2ED] // พื้นหลังเป็นสีครีม (ตามภาพล่าสุด)
                first:rounded-t-lg last:rounded-b-lg // ทำให้ option แรกและสุดท้ายมีมุมโค้งมน
                
                // Hover and selected states - นี่คือส่วนที่สำคัญเพื่อให้ได้ตามรูป!
                // ถ้าค่าตรงกับที่เลือกอยู่ และไม่ได้อยู่ใน state hover (เบราว์เซอร์จะจัดการให้)
                ${option.value === value ? 'bg-blue-600 text-white' : ''} // สีน้ำเงินเมื่อถูกเลือก (เหมือน Native)
                hover:bg-blue-100 hover:text-black // สีพื้นหลังเมื่อ hover (คุณอาจปรับเป็นสีน้ำเงินอ่อนๆ หรือสีอื่นได้)

                // ถ้าต้องการเส้นคั่นระหว่าง option
                ${option.id !== 'all' && option.value !== 'all' ? 'border-t border-gray-100' : ''} // เส้นคั่นสำหรับ option อื่นๆ ยกเว้น "ทั้งหมด"
              `}
              // Note: Native select options don't typically have borders between them
              // but if you desire a divider, you can add it here.
            >
              {option.name}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default CustomSelect;