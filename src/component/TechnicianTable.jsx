import React from 'react';
import { FaLine } from 'react-icons/fa';
import { UserPen, Trash2 } from 'lucide-react';

const TechnicianTable = ({
  technicians,
  getUniqueBuildings,
  handleEditTechnician,
  confirmDelete,
}) => {
  return (
    <div className="bg-white shadow-md overflow-hidden">
      <table className="min-w-full leading-normal">
        <thead>
          <tr>
            <th className="w-1 px-4 py-3 border-l-[1px] border-t-[1px] border-[#837958] bg-[#BC9D72]/50 text-center text-sm font-semibold text-black uppercase tracking-wider">
              ลำดับ
            </th>
            <th className="px-4 py-3 border-t-[1px] border-[#837958] bg-[#BC9D72]/50 text-center text-sm font-semibold text-black uppercase tracking-wider">
              เจ้าหน้าที่
            </th>
            <th className="px-4 py-3 border-t-[1px] border-[#837958] bg-[#BC9D72]/50 text-center text-sm font-semibold text-black uppercase tracking-wider">
              เบอร์โทรศัพท์
            </th>
            <th className="px-4 py-3 border-t-[1px] border-[#837958] bg-[#BC9D72]/50 text-center text-sm font-semibold text-black uppercase tracking-wider">
              สถานะ Line
            </th>
            <th className="px-4 py-3 border-t-[1px] border-[#837958] bg-[#BC9D72]/50 text-center text-sm font-semibold text-black uppercase tracking-wider">
              สังกัด
            </th>
            <th className="px-4 py-3 border-t-[1px] border-r-[1px] border-[#837958] bg-[#BC9D72]/50 text-center text-sm font-semibold text-black uppercase tracking-wider">
              จัดการ
            </th>
          </tr>
        </thead>
        <tbody>
          {technicians.length > 0 ? (
            technicians.map((tech, index) => {
              const uniqueBuildings = getUniqueBuildings(tech.techBuilds);

              return (
                <tr key={tech.id} className="hover:bg-gray-50">
                  <td className="px-4 py-2 border-l-[1px] border-b-[1px] border-[#837958] bg-white text-sm text-center">
                    {index + 1}
                  </td>
                  <td className="px-4 py-2 border-b-[1px] border-[#837958] bg-white text-sm text-center">
                    {tech.name || '-'}
                  </td>
                  <td className="px-4 py-2 border-b-[1px] border-[#837958] bg-white text-sm text-center">
                    {tech.phone?.startsWith("NO_PHONE_")
                    ? "-"
                    : (tech.phone || "-")}
                  </td>
                  <td className="px-4 py-2 border-b-[1px] border-[#837958] bg-white text-sm text-center leading-none">
                    {tech.userId ? (
                      <FaLine className="text-green-500 text-xl inline-block" title="เชื่อมต่อ Line แล้ว" />
                    ) : (
                      <FaLine className="text-red-500 text-xl inline-block" title="ยังไม่ได้เชื่อมต่อ Line" />
                    )}
                  </td>
                  <td className="px-4 py-2 border-b-[1px] border-[#837958] bg-white text-sm text-center">
                    {uniqueBuildings.length > 0 ? (
                      <div className="flex flex-row space-x-2">
                        {uniqueBuildings.join(', ')}
                      </div>
                    ) : '-'}
                  </td>
                  <td className="px-4 py-2 border-r-[1px] border-b-[1px] border-[#837958] bg-white text-sm text-center">
                    <button
                      className="text-blue-500 hover:text-blue-700 mr-3"
                      title="แก้ไข"
                      onClick={() => handleEditTechnician(tech.id)}
                    >
                      <UserPen className="inline-block" />
                    </button>
                    <button
                      className="text-red-500 hover:text-red-700"
                      title="ลบ"
                      onClick={() => confirmDelete(tech.id)}
                    >
                      <Trash2 className="inline-block" />
                    </button>
                  </td>
                </tr>
              );
            })
          ) : (
            <tr>
              <td colSpan="6" className="px-5 py-4 text-center text-gray-500">
                ไม่พบข้อมูลพนักงาน
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default TechnicianTable;
