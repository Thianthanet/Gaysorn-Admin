import React from "react";
import { Trash2, UserPen } from "lucide-react";
// ถ้าต้องการให้แสดงรหัสผ่านด้วย ให้ import FaEye และ FaEyeSlash จาก react-icons

const AdminTable = ({
  admin,
  handleEditAdmin,
  confirmDelete,
  // toggleShowPassword,
  // showPasswords
}) => {
  return (
    <div className="bg-white shadow-md overflow-hidden">
      <table className="min-w-full leading-normal">
        <thead>
          <tr>
            <th className="w-1 px-4 py-2 border-l-[1px] border-t-[1px] border-[#837958] bg-[#BC9D72]/50 text-center text-sm font-semibold text-black uppercase tracking-wider">
              ลำดับ
            </th>
            <th className="px-4 py-2 border-t-[1px] border-[#837958] bg-[#BC9D72]/50 text-center text-sm font-semibold text-black uppercase tracking-wider">
              ชื่อผู้ใช้งาน
            </th>
            {/* <th className="px-4 py-3 border-t-[1px] border-[#837958] bg-[#BC9D72]/50 text-center text-sm font-semibold text-black uppercase tracking-wider">
              รหัสผ่าน
            </th> */}
            <th className="w-24 px-4 py-3 border-r-[1px] border-t-[1px] border-[#837958] bg-[#BC9D72]/50 text-center text-sm font-semibold text-black uppercase tracking-wider">
              จัดการ
            </th>
          </tr>
        </thead>
        <tbody>
          {admin.length > 0 ? (
            admin.map((admin, index) => (
              <tr key={admin.id} className="hover:bg-gray-50">
                <td className="px-4 border-l-[1px] border-b-[1px] border-[#837958] bg-white text-sm text-center">
                  {index + 1}
                </td>
                <td className="px-4 border-b-[1px] border-[#837958] bg-white text-sm text-center">
                  {admin.username}
                </td>
                {/* <td className="px-4 border-b-[1px] border-[#837958] bg-white text-sm text-center">
                  <span className="mx-2">
                    {showPasswords[admin.id] ? admin.password : "********"}
                  </span>
                  <button
                    onClick={() => toggleShowPassword(admin.id)}
                    className="focus:outline-none"
                  >
                    {showPasswords[admin.id] ? <FaEyeSlash /> : <FaEye />}
                  </button>
                </td> */}
                <td className="h-[16px] px-4 py-2 border-r-[1px] border-b-[1px] border-[#837958] text-sm text-center">
                  <button
                    className="text-blue-500 hover:text-blue-700 mr-3"
                    title="แก้ไข"
                    onClick={() => handleEditAdmin(admin.id)}
                  >
                    <UserPen className="inline-block" />
                  </button>
                  <button
                    className="text-red-500 hover:text-red-700"
                    title="ลบ"
                    onClick={() => confirmDelete(admin.id)}
                  >
                    <Trash2 className="inline-block" />
                  </button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="4" className="text-center py-4 text-gray-500">
                ไม่มีข้อมูลผู้ใช้งาน
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default AdminTable;
