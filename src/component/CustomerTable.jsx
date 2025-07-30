import React from "react";
import { FaLine } from "react-icons/fa";
import { UserPen, Trash2 } from "lucide-react";

const CustomerTable = ({
  customers,
  handleEditCustomer,
  confirmDelete,
}) => {
  return (
    <div className="bg-white shadow-md overflow-hidden">
      <table className="min-w-full leading-normal">
        <thead>
          <tr>
            <TableHead className="w-1 border-l-[1px]">ลำดับ</TableHead>
            <TableHead className="w-52">อาคาร</TableHead>
            <TableHead className="w-48">บริษัท/ร้านค้า</TableHead>
            <TableHead className="w-1">ยูนิต</TableHead>
            <TableHead className="w-52">ลูกค้า</TableHead>
            <TableHead className="w-32">เบอร์โทรศัพท์</TableHead>
            <TableHead className="w-32">สถานะ Line</TableHead>
            <TableHead className="w-28 border-r-[1px]">จัดการ</TableHead>
          </tr>
        </thead>
        <tbody>
          {customers.length > 0 ? (
            customers.map((customer, index) => (
              <tr key={customer.id} className="hover:bg-gray-50">
                <TableCell className="border-l-[1px]">{index + 1}</TableCell>
                <TableCell>
                  {customer.unit?.company?.building?.buildingName || "-"}
                </TableCell>
                <TableCell>
                  {customer.unit?.company?.companyName || "-"}
                </TableCell>
                <TableCell>{customer.unit?.unitName || "-"}</TableCell>
                <TableCell>{customer.name || "-"}</TableCell>
                <TableCell>
                  {customer.phone?.startsWith("NoPhone")
                    ? "-"
                    : (customer.phone || "-")}
                </TableCell>
                <TableCell className="pl-12">
                  {customer.userId ? (
                    <FaLine
                      className="text-green-500 text-xl"
                      title="เชื่อมต่อ Line แล้ว"
                    />
                  ) : (
                    <FaLine
                      className="text-red-500 text-xl"
                      title="ยังไม่ได้เชื่อมต่อ Line"
                    />
                  )}
                </TableCell>
                <TableCell className="border-r-[1px]">
                  <button
                    className="text-blue-500 hover:text-blue-700 mr-3"
                    title="แก้ไข"
                    onClick={() => {
                      handleEditCustomer(customer.id);
                    }}
                  >
                    <UserPen className="inline-block" />
                  </button>
                  <button
                    className="text-red-500 hover:text-red-700"
                    title="ลบ"
                    onClick={() => confirmDelete(customer.id)}
                  >
                    <Trash2 className="inline-block" />
                  </button>
                </TableCell>
              </tr>
            ))
          ) : (
            <tr>
              <td
                colSpan="9"
                className="px-5 py-4 text-center text-gray-500"
              >
                ไม่พบข้อมูลลูกค้า
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

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

export default CustomerTable;
