// components/WaitApproveTable.jsx
import React from 'react';
import { FaLine } from 'react-icons/fa';

const WaitApproveTable = ({ activeTab, waitForApprove = [], handleApprove }) => {
  if (activeTab !== 'waitApprove') return null;

  return (
    <div className="bg-white shadow-md rounded-lg overflow-hidden">
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
            ].map((header, index) => (
              <th
                key={index}
                className="px-5 py-3 border-b-2 border-gray-200 bg-[#BC9D72] text-left text-sm font-semibold text-white uppercase tracking-wider"
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
                  {user?.unit?.company?.building?.buildingName || '-'}
                </td>
                <td className="px-5 py-4 border-b border-gray-200 bg-white text-sm text-left">
                  {user?.unit?.company?.companyName || '-'}
                </td>
                <td className="px-5 py-4 border-b border-gray-200 bg-white text-sm text-left">
                  {user?.unit?.unitName || '-'}
                </td>
                <td className="px-5 py-4 border-b border-gray-200 bg-white text-sm text-left">
                  {user?.name || '-'}
                </td>
                <td className="px-5 py-4 border-b border-gray-200 bg-white text-sm text-left">
                  {user?.phone || '-'}
                </td>
                <td className="px-5 py-4 border-b border-gray-200 bg-white text-sm text-left">
                  {user?.email || '-'}
                </td>
                <td className="px-5 py-4 border-b border-gray-200 bg-white text-sm text-left">
                  {user?.userId ? (
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
