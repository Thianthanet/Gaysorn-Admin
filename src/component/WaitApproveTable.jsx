// components/WaitApproveTable.jsx
import React from 'react';
import { FaLine } from 'react-icons/fa';

const WaitApproveTable = ({ activeTab, waitForApprove = [], handleApprove }) => {
  // Logic นี้สามารถเก็บไว้ได้ ถ้าต้องการให้คอมโพเนนต์จัดการการซ่อนตัวเอง
  if (activeTab !== 'waitApprove') return null;

  return (
    <div className="bg-white shadow-md overflow-hidden">
      <table className="min-w-full leading-normal">
        <thead>
          <tr>
            {[
              'ลำดับ',
              'อาคาร',
              'บริษัท',
              'ยูนิต',
              'ผู้ใช้',
              'เบอร์โทรศัพท์',
              'Email',
              'Line',
              'จัดการ',
            ].map((header) => ( // <--- เปลี่ยนจาก index เป็น header สำหรับ key
              <th
                key={header} // <--- ใช้ header เป็น key ได้เลย
                className={`px-4 py-3 border-t-[1px] border-[#837958] bg-[#BC9D72]/50 text-center text-sm font-semibold text-black uppercase tracking-wider`}
              >
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {waitForApprove.length > 0 ? (
            waitForApprove.map((user, index) => (
              <tr key={user.id} className="hover:bg-gray-50">
                <td className="px-5 py-4 border-b border-gray-200 bg-white text-sm text-left">{index + 1}</td>
                <td className="px-5 py-4 border-b border-gray-200 bg-white text-sm text-left">
                  {/* พิจารณา: ถ้าแน่ใจว่า user จะมี unit, company, building เสมอ ก็ลบ ?. ที่ user ออกได้ */}
                  {user.unit?.company?.building?.buildingName || '-'}
                </td>
                <td className="px-5 py-4 border-b border-gray-200 bg-white text-sm text-left">
                  {user.unit?.company?.companyName || '-'}
                </td>
                <td className="px-5 py-4 border-b border-gray-200 bg-white text-sm text-left">
                  {user.unit?.unitName || '-'}
                </td>
                <td className="px-5 py-4 border-b border-gray-200 bg-white text-sm text-left">
                  {user.name || '-'}
                </td>
                <td className="px-5 py-4 border-b border-gray-200 bg-white text-sm text-left">
                  {user.phone || '-'}
                </td>
                <td className="px-5 py-4 border-b border-gray-200 bg-white text-sm text-left">
                  {user.email || '-'}
                </td>
                <td className="px-5 py-4 border-b border-gray-200 bg-white text-sm text-left">
                  {user.userId ? (
                    <FaLine className="text-green-500 text-xl" title="เชื่อมต่อ Line แล้ว" />
                  ) : (
                    <FaLine className="text-red-500 text-xl" title="ยังไม่ได้เชื่อมต่อ Line" />
                  )}
                </td>
                <td className="px-5 py-4 border-b border-gray-200 bg-white text-sm text-left">
                  <button
                    className="bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600"
                    onClick={() => handleApprove(user.userId)}
                  >
                    อนุมัติ
                  </button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="9" className="px-5 py-4 text-center text-gray-500">
                ไม่พบข้อมูลรออนุมัติ
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default WaitApproveTable;