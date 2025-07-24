import React, { useEffect, useState } from "react";
import AdminLayout from "./AdminLayout";
import axios from "axios";
//Time
import { formatDateTimeThaiShort } from "../component/Date";
//icons
import { TiStarFullOutline } from "react-icons/ti";
//components
import { Pagination } from "../component/Pagination";
import JobCard from "../component/JobCard";

const Jobs = () => {
  const [jobs, setJobs] = useState([]);
  const [sortBy, setSortBy] = useState("createDate");
  const [sortDirection, setSortDirection] = useState("desc");
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(25);

  useEffect(() => {
    handleGetAllJobs();
  }, []);

  const handleGetAllJobs = async () => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_API_BASE_URL}/api/getAllRepair`
      );
      console.log("Jobs data:", response.data.data);
      setJobs(response.data.data);
    } catch (error) {
      console.error("Error fetching jobs:", error);
    }
  };

  const getSortedJobs = () => {
    const sorted = [...jobs].sort((a, b) => {
      const aDate = new Date(a[sortBy]);
      const bDate = new Date(b[sortBy]);

      if (isNaN(aDate) || isNaN(bDate)) return 0; // ป้องกัน error

      return sortDirection === "asc" ? aDate - bDate : bDate - aDate;
    });

    return sorted;
  };

  const getPaginatedJobs = () => {
    const sortedJobs = getSortedJobs();
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return sortedJobs.slice(startIndex, endIndex);
  };

  const totalPages = Math.ceil(jobs.length / itemsPerPage);

  return (
    <AdminLayout>
      <div>
        <table className="min-w-full border border-[#837958]/50">
          <thead className="bg-[#837958]/50 ">
            <tr className="bg-[#BC9D72]/50 h-[50px] text-[14px]">
              <th className="min-w-[10px]"></th>
              <th>ลำดับ</th>
              <th className="text-center">
                <TiStarFullOutline className="text-2xl mx-auto" />
              </th>
              <th>เลขงาน</th>
              <th>อาคาร</th>
              <th>บริษัท</th>
              <th>กลุ่มงาน</th>
              <th
                onClick={() => {
                  if (sortBy === "createDate") {
                    setSortDirection(sortDirection === "asc" ? "desc" : "asc");
                  } else {
                    setSortBy("createDate");
                    setSortDirection("asc");
                  }
                }}
                className="cursor-pointer hover:underline"
              >
                วันที่แจ้ง{" "}
                {sortBy === "createDate" &&
                  (sortDirection === "asc" ? "↑" : "↓")}
              </th>
              <th
                onClick={() => {
                  if (sortBy === "acceptDate") {
                    setSortDirection(sortDirection === "asc" ? "desc" : "asc");
                  } else {
                    setSortBy("acceptDate");
                    setSortDirection("asc");
                  }
                }}
                className="cursor-pointer hover:underline"
              >
                วันที่รับงาน{" "}
                {sortBy === "acceptDate" &&
                  (sortDirection === "asc" ? "↑" : "↓")}
              </th>
              <th
                onClick={() => {
                  if (sortBy === "completeDate") {
                    setSortDirection(sortDirection === "asc" ? "desc" : "asc");
                  } else {
                    setSortBy("completeDate");
                    setSortDirection("asc");
                  }
                }}
                className="cursor-pointer hover:underline"
              >
                วันที่เสร็จสิ้น{" "}
                {sortBy === "completeDate" &&
                  (sortDirection === "asc" ? "↑" : "↓")}
              </th>
              <th>เจ้าหน้าที่</th>
              <th>สถานะ</th>
            </tr>
          </thead>
          <tbody>
            {getPaginatedJobs().map((job, index) => (
              <tr key={job.id} className="text-center border-b text-[12px]">
                <td className=" px-4 py-2 text-center  ">
                  <span
                    className={`inline-block w-4 h-4 rounded-full mx-auto ${
                      job.status === "pending"
                        ? "bg-red-500"
                        : job.status === "in_progress"
                        ? "bg-yellow-500"
                        : job.status === "completed"
                        ? "bg-green-500"
                        : "bg-gray-400"
                    }`}
                  ></span>
                </td>
                <td>{(currentPage - 1) * itemsPerPage + index + 1}</td>
                <td className=" px-4 py-2">{job?.workStar || "-"}</td>
                <td className=" px-4 py-2">{job?.jobNo || "-"}</td>
                <td className=" px-4 py-2 min-w-[160px]">
                  {job.building?.buildingName || "-"}
                </td>
                <td className=" px-4 py-2 min-w-[160px]">
                  {job.company?.companyName || "-"}
                </td>
                <td className=" px-4 py-2 min-w-[160px]">
                  {job?.choiceDesc || "-"}
                </td>
                <td className=" px-4 py-2 min-w-[200px]">
                  {formatDateTimeThaiShort(job?.createDate) || "-"}
                </td>
                <td className=" px-4 py-2 min-w-[200px]">
                  {formatDateTimeThaiShort(job?.acceptDate) || "-"}
                </td>
                <td className=" px-4 py-2 min-w-[200px]">
                  {formatDateTimeThaiShort(job?.completeDate) || "-"}
                </td>
                <td className=" px-4 py-2 min-w-[150px]">
                  {job?.acceptedBy?.name?.trim() ? job.acceptedBy.name : "-"}
                </td>
                <td
                  className={` px-4 py-2 min-w-[160px] ${
                    job.status === "pending"
                      ? "text-red-500"
                      : job.status === "in_progress"
                      ? "text-yellow-500"
                      : job.status === "completed"
                      ? "text-green-500"
                      : ""
                  }`}
                >
                  {job.status === "pending"
                    ? "รอดำเนินการ"
                    : job.status === "in_progress"
                    ? "อยู่ระหว่างดำเนินการ"
                    : job.status === "completed"
                    ? "เสร็จสิ้น"
                    : job.status}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
          itemsPerPage={itemsPerPage}
          onItemsPerPageChange={(num) => {
            setItemsPerPage(num);
            setCurrentPage(1);
          }}
          totalItems={jobs.length}
          advancedPagination={true}
        />
      </div>
    </AdminLayout>
  );
};

export default Jobs;
