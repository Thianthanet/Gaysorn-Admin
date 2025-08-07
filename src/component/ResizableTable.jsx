import React, { useRef, useState, useEffect, useCallback } from 'react';
import { TiStarFullOutline } from 'react-icons/ti'; // Assuming you're using react-icons

const ResizableTable = ({ data, requestSort, getSortIndicator, getSortPriority }) => {
  const tableRef = useRef(null);
  const [columnWidths, setColumnWidths] = useState({});

  // Function to initialize column widths (e.g., based on content or defaults)
  useEffect(() => {
    if (tableRef.current) {
      const headers = tableRef.current.querySelectorAll('th');
      const initialWidths = {};
      headers.forEach((header, index) => {
        // You might want to calculate initial widths based on content or set a default
        initialWidths[header.dataset.columnId || `col-${index}`] = header.offsetWidth;
      });
      setColumnWidths(initialWidths);
    }
  }, []);

  const startResizing = useCallback((e, columnId) => {
    e.preventDefault();
    const startX = e.clientX;
    const currentWidth = columnWidths[columnId];

    const doMouseMove = (moveEvent) => {
      const newWidth = currentWidth + (moveEvent.clientX - startX);
      setColumnWidths(prev => ({
        ...prev,
        [columnId]: Math.max(50, newWidth) // Set a minimum width, e.g., 50px
      }));
    };

    const doMouseUp = () => {
      document.removeEventListener('mousemove', doMouseMove);
      document.removeEventListener('mouseup', doMouseUp);
    };

    document.addEventListener('mousemove', doMouseMove);
    document.addEventListener('mouseup', doMouseUp);
  }, [columnWidths]);

  return (
    <div className="overflow-x-auto">
      <table ref={tableRef} className="min-w-full table-fixed leading-normal border-t-[1px] border-r-[1px] border-l-[1px] border-[#837958]">
        <thead className="border-[#837958] text-center font-semibold text-black bg-[#BC9D72]/50 h-[44px] text-[14px]">
          <tr>
            {/* Example of how to structure a resizable header */}
            <th style={{ width: columnWidths['empty-1'] || 'auto' }} className="relative">
              <div
                className="absolute right-0 top-0 bottom-0 w-2 cursor-col-resize"
                onMouseDown={(e) => startResizing(e, 'empty-1')}
              ></div>
            </th>
            <th data-column-id="ลำดับ" style={{ width: columnWidths['ลำดับ'] ? `${columnWidths['ลำดับ']}px` : 'auto' }} className="relative">
              ลำดับ
              <div
                className="absolute right-0 top-0 bottom-0 w-2 cursor-col-resize"
                onMouseDown={(e) => startResizing(e, 'ลำดับ')}
              ></div>
            </th>
            <th data-column-id="star" style={{ width: columnWidths['star'] ? `${columnWidths['star']}px` : 'auto' }} className="relative text-center">
              <TiStarFullOutline className="text-2xl mx-auto" />
              <div
                className="absolute right-0 top-0 bottom-0 w-2 cursor-col-resize"
                onMouseDown={(e) => startResizing(e, 'star')}
              ></div>
            </th>
            <th data-column-id="เลขงาน" style={{ width: columnWidths['เลขงาน'] ? `${columnWidths['เลขงาน']}px` : 'auto' }} className="relative truncate">
              เลขงาน
              <div
                className="absolute right-0 top-0 bottom-0 w-2 cursor-col-resize"
                onMouseDown={(e) => startResizing(e, 'เลขงาน')}
              ></div>
            </th>
            {/* Repeat for other columns, adding data-column-id and the resizing div */}
            {/* For dynamic columns, map over your column definitions */}
            <th
                onClick={() => requestSort("createDate")}
                className="cursor-pointer hover:underline relative w-[48px]"
                data-column-id="createDate"
                style={{ width: columnWidths['createDate'] ? `${columnWidths['createDate']}px` : 'auto' }}
              >
                วันที่แจ้ง {getSortIndicator("createDate")}
                {getSortPriority("createDate") && (
                  <sup>{getSortPriority("createDate")}</sup>
                )}
                <div
                  className="absolute right-0 top-0 bottom-0 w-2 cursor-col-resize"
                  onMouseDown={(e) => startResizing(e, 'createDate')}
                ></div>
              </th>
               <th
                onClick={() => requestSort("acceptDate")}
                className="cursor-pointer hover:underline relative w-[48px]"
                data-column-id="acceptDate"
                style={{ width: columnWidths['acceptDate'] ? `${columnWidths['acceptDate']}px` : 'auto' }}
              >
                วันที่รับงาน {getSortIndicator("acceptDate")}
                {getSortPriority("acceptDate") && (
                  <sup>{getSortPriority("acceptDate")}</sup>
                )}
                 <div
                  className="absolute right-0 top-0 bottom-0 w-2 cursor-col-resize"
                  onMouseDown={(e) => startResizing(e, 'acceptDate')}
                ></div>
              </th>
               <th
                onClick={() => requestSort("completeDate")}
                className="cursor-pointer hover:underline relative w-[48px]"
                data-column-id="completeDate"
                style={{ width: columnWidths['completeDate'] ? `${columnWidths['completeDate']}px` : 'auto' }}
              >
                วันที่เสร็จสิ้น {getSortIndicator("completeDate")}
                {getSortPriority("completeDate") && (
                  <sup>{getSortPriority("completeDate")}</sup>
                )}
                 <div
                  className="absolute right-0 top-0 bottom-0 w-2 cursor-col-resize"
                  onMouseDown={(e) => startResizing(e, 'completeDate')}
                ></div>
              </th>
            <th data-column-id="เจ้าหน้าที่" style={{ width: columnWidths['เจ้าหน้าที่'] ? `${columnWidths['เจ้าหน้าที่']}px` : 'auto' }} className="relative">
              เจ้าหน้าที่
              <div
                className="absolute right-0 top-0 bottom-0 w-2 cursor-col-resize"
                onMouseDown={(e) => startResizing(e, 'เจ้าหน้าที่')}
              ></div>
            </th>
            <th data-column-id="สถานะ" style={{ width: columnWidths['สถานะ'] ? `${columnWidths['สถานะ']}px` : 'auto' }} className="relative">
              สถานะ
              <div
                className="absolute right-0 top-0 bottom-0 w-2 cursor-col-resize"
                onMouseDown={(e) => startResizing(e, 'สถานะ')}
              ></div>
            </th>
          </tr>
        </thead>
        <tbody>
          {/* Your table body rows would go here, ensure TDs match THs in width management */}
          {/* Example row (you'd map over your actual data) */}
          {/* <tr>
            <td></td>
            <td>1</td>
            <td></td>
            <td>WO-001</td>
            <td>Building A</td>
            <td>Company X</td>
            <td>Group Y</td>
            <td>2023-01-01</td>
            <td>2023-01-02</td>
            <td>2023-01-03</td>
            <td>John Doe</td>
            <td>Completed</td>
          </tr> */}
        </tbody>
      </table>
    </div>
  );
};

export default ResizableTable;