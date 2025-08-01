import React, { createContext, useState } from "react";

// สร้าง Context
export const UserTabContext = createContext();

// Provider สำหรับใช้ครอบ component หลัก
export const UserTabProvider = ({ children }) => {
  const [activeTab, setActiveTab] = useState("customers"); // ค่าเริ่มต้น

  return (
    <UserTabContext.Provider value={{ activeTab, setActiveTab }}>
      {children}
    </UserTabContext.Provider>
  );
};
