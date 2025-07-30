// components/WaitApproveTable.jsx
import axios from 'axios';
import React from 'react';
import { FaLine } from 'react-icons/fa';

const WaitApproveTable = ({ activeTab, waitForApprove = [], handleApprove }) => {
  // Logic นี้สามารถเก็บไว้ได้ ถ้าต้องการให้คอมโพเนนต์จัดการการซ่อนตัวเอง
  if (activeTab !== 'waitApprove') return null;

  // const handleApproveAuto = async (userId) => {
  //   try {
  //     const response = await axios.post(`${import.meta.env.VITE_API_BASE_URL}/api/${handleApprove}`)
  //   } catch (error) {
  //     console.error(error)
  //   }
  }

//   return (
//     <div className="bg-white shadow-md overflow-hidden">
//       <table className="min-w-full leading-normal">
//         <thead>
//           <tr>
//             {/* {[
//               'ลำดับ',
//               'อาคาร',
//               'บริษัท',
//               'ยูนิต',
//               'ผู้ใช้',
//               'เบอร์โทรศัพท์',
//               'Email',
//               'Line',
//               'จัดการ',
//             ].map((header) => ( // <--- เปลี่ยนจาก index เป็น header สำหรับ key
//               <th
//                 key={header} // <--- ใช้ header เป็น key ได้เลย
//                 className={`px-4 py-3 border-t-[1px] border-[#837958] bg-[#BC9D72]/50 text-center text-sm font-semibold text-black uppercase tracking-wider`}
//               >
//                 {header}
//               </th>
//             ))} */}
//             <TableHead className="w-1 border-l-[1px]">ลำดับ</TableHead>
//             <TableHead className="w-52">อาคาร</TableHead>
//             <TableHead className="w-48">บริษัท/ร้านค้า</TableHead>
//             <TableHead className="w-1">ยูนิต</TableHead>
//             <TableHead className="w-52">ลูกค้า</TableHead>
//             <TableHead className="w-32">เบอร์โทรศัพท์</TableHead>
//             {/* <TableHead className="w-52">อีเมล</TableHead> */}
//             <TableHead className="w-52">สถานะ Line</TableHead>
//             <TableHead className="w-28 border-r-[1px]">จัดการ</TableHead>
//           </tr>
//         </thead>
//         <tbody>
//           {waitForApprove.length > 0 ? (
//             waitForApprove.map((customer, index) => (
//               <tr key={customer.id} className="hover:bg-gray-50">
//                 {/*
//                 <td className="px-5 py-4 border-b border-gray-200 bg-white text-sm text-left">{index + 1}</td>
//                 <td className="px-5 py-4 border-b border-gray-200 bg-white text-sm text-left">
//                   //พิจารณา: ถ้าแน่ใจว่า user จะมี unit, company, building เสมอ ก็ลบ ?. ที่ user ออกได้
//                   {user.unit?.company?.building?.buildingName || '-'}
//                 </td>
//                 <td className="px-5 py-4 border-b border-gray-200 bg-white text-sm text-left">
//                   {user.unit?.company?.companyName || '-'}
//                 </td>
//                 <td className="px-5 py-4 border-b border-gray-200 bg-white text-sm text-left">
//                   {user.unit?.unitName || '-'}
//                 </td>
//                 <td className="px-5 py-4 border-b border-gray-200 bg-white text-sm text-left">
//                   {user.name || '-'}
//                 </td>
//                 <td className="px-5 py-4 border-b border-gray-200 bg-white text-sm text-left">
//                   {user.phone || '-'}
//                 </td>
//                 <td className="px-5 py-4 border-b border-gray-200 bg-white text-sm text-left">
//                   {user.email || '-'}
//                 </td>
//                 <td className="px-5 py-4 border-b border-gray-200 bg-white text-sm text-left">
//                   {user.userId ? (
//                     <FaLine className="text-green-500 text-xl" title="เชื่อมต่อ Line แล้ว" />
//                   ) : (
//                     <FaLine className="text-red-500 text-xl" title="ยังไม่ได้เชื่อมต่อ Line" />
//                   )}
//                 </td>
//                 <td className="px-5 py-4 border-b border-gray-200 bg-white text-sm text-left">
//                   <button
//                     className="bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600"
//                     onClick={() => handleApprove(user.userId)}
//                   >
//                     อนุมัติ
//                   </button>
//                 </td> */}
//                 <TableCell className="border-l-[1px]">{index + 1}</TableCell>
//                 <TableCell>
//                   {customer.unit?.company?.building?.buildingName || "-"}
//                 </TableCell>
//                 <TableCell>
//                   {customer.unit?.company?.companyName || "-"}
//                 </TableCell>
//                 <TableCell>{customer.unit?.unitName || "-"}</TableCell>
//                 <TableCell>{customer.name || "-"}</TableCell>
//                 <TableCell>{customer.phone || "-"}</TableCell>
//                 {/* <TableCell>{customer.email || "-"}</TableCell> */}
//                 <TableCell className="pl-[72px]">
//                   {customer.userId ? (
//                     <FaLine
//                       className="text-green-500 text-xl"
//                       title="เชื่อมต่อ Line แล้ว"
//                     />
//                   ) : (
//                     <FaLine
//                       className="text-red-500 text-xl"
//                       title="ยังไม่ได้เชื่อมต่อ Line"
//                     />
//                   )}
//                 </TableCell>
//                 <TableCell className="border-r-[1px]">
//                   <button
//                     className="bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600"
//                     title="อนุมัติ"
//                     onClick={() => {
//                       handleApproveAuto(customer.userId);
//                     }}
//                   >อนุมัติ
//                   </button>
//                 </TableCell>
//               </tr>
//             ))
//           ) : (
//             <tr>
//               <td colSpan="9" className="px-5 py-4 text-center text-gray-500">
//                 ไม่พบข้อมูลรออนุมัติ
//               </td>
//             </tr>
//           )}
//         </tbody>
//       </table>
//     </div>
//   );
// };

const TableHead = ({ children, className = "" }) => (
  <th
    className={`px-4 py-3 border-t-[1px] border-[#837958] bg-[#BC9D72]/50 text-center text-sm font-semibold text-black uppercase tracking-wider ${className}`}
  >
    {children}
  </th>
);

const TableCell = ({ children, className = "" }) => (
  <td
    className={`px-4 py-2 border-b-[1px] border-[#837958] bg-white text-sm text-center ${className}`}
  >
    {children}
  </td>
);

export default WaitApproveTable;