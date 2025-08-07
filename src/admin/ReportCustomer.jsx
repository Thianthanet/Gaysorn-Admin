import React, { useEffect, useState } from "react";
import AdminLayout from "./AdminLayout";
import { useParams } from "react-router-dom";
import axios from "axios";

const ReportCustomer = ({ id: propId }) => {
  const params = useParams();
  const id = propId || params.id;
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  // ฟังก์ชันแยกประเภทภาพจากข้อมูล image object
  const getImageType = (image) => {
    if (image.mark === "cusRepair" || image.uploadBy === "cus") {
      return "แจ้งซ่อม";
    }
    if (image.mark === "techRepair" || image.uploadBy === "tech") {
      return "ดำเนินการ";
    }
    if (image.mark === "signature" || image.mark === "sign") {
      return "ลายเซ็น";
    }
    return "อื่นๆ";
  };

  // ฟังก์ชันช่วยแสดงภาพตามประเภท
  const renderImagesByType = (job, typeLabel) => {
    const filteredImages =
      job.images?.filter((img) => getImageType(img) === typeLabel) || [];

    if (filteredImages.length === 0) {
      return (
        <div className="w-32 h-32 border rounded flex items-center justify-center text-xs text-gray-500">
          ไม่มีภาพ
        </div>
      );
    }

    return filteredImages.slice(0, 3).map((image, idx) => {
      const isFullUrl = image.url.startsWith("http");
      const imageUrl = isFullUrl
        ? image.url
        : `${import.meta.env.VITE_API_BASE_URL}/api${
            image.url.startsWith("/") ? image.url : `/${image.url}`
          }`;

      return (
        <img
          key={`${typeLabel}-${idx}`}
          src={imageUrl}
          alt={`${typeLabel} รูปที่ ${idx + 1}`}
          className="w-32 h-32 object-cover rounded-lg"
        />
      );
    });
  };

  useEffect(() => {
    handleGetCompanyReport();
  }, []);

  const handleGetCompanyReport = async () => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_API_BASE_URL}/api/getCompanyAllRepair/${id}`
      );
      setJobs(response.data.data);
    } catch (error) {
      console.error("Error fetching company report:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      
        <div className="p-6">
          <p>กำลังโหลดข้อมูล...</p>
        </div>
  
    );
  }

  console.log("Jobs data:", jobs);

  const firstJob = jobs.length > 0 ? jobs[0] : null;
  const companyName = firstJob?.company?.companyName || "-";
  const buildingName = firstJob?.building?.buildingName || "-";
  const unitName = firstJob?.unit?.unitName || "-";

  return (
    
      <div className="p-6 mr-5">
        {/* แสดงชื่อบริษัทและข้อมูลสถานที่ */}
        <div className="sticky top-0 bg-white z-10 pt-2 pb-6 mb-6 border-b border-[#C3A96B] -mt-4">
          <h1 className="text-xl font-bold text-[#86754D] mb-2">
            {companyName}
          </h1>
          <p className="text-sm mb-1">
            <span className="font-semibold">สถานที่ :</span> {buildingName},{" "}
            {companyName}, {unitName}
          </p>
          <p className="text-sm">
            <span className="font-semibold">จำนวนการแจ้งซ่อม :</span>{" "}
            {jobs.length}
          </p>
        </div>

        {/* รายงานงานซ่อมแต่ละงาน */}
        {jobs.map((job) => (
          <div
            key={job.id}
            className="border border-[#C3A96B] rounded-md p-4 mb-4"
          >
            <h2 className="text-[#C3A96B] font-semibold mb-2">
              หมายเลขงาน : {job.jobNo || "-"}
            </h2>

            {/* แสดงภาพแยกตามประเภท */}
            <div>
              <h3 className="font-semibold mb-1">ภาพแจ้งซ่อม</h3>
              <div className="flex gap-2 mb-4">
                {renderImagesByType(job, "แจ้งซ่อม")}
              </div>

              <h3 className="font-semibold mb-1">ภาพดำเนินการ</h3>
              <div className="flex gap-2 mb-4">
                {renderImagesByType(job, "ดำเนินการ")}
              </div>

              <h3 className="font-semibold mb-1">ลายเซ็น</h3>
              <div className="flex gap-2 mb-4">
                {renderImagesByType(job, "ลายเซ็น")}
              </div>
            </div>

            {/* รายละเอียดอื่นๆ */}
            <p>กลุ่มงาน : {job.choiceDesc || "-"}</p>
            <p>รายละเอียด : {job.detail || "-"}</p>
            <p>
              สถานะ :{" "}
              <span
                className={`px-4 py-2 min-w-[160px] align-text-top ${
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
              </span>
              {job.updatedAt && (
                <span className="text-gray-400 ml-2">
                  (อัพเดทล่าสุด:{" "}
                  {new Date(job.updatedAt).toLocaleString("th-TH")})
                </span>
              )}
            </p>
            <p>
              วันที่แจ้ง :{" "}
              {new Date(job.createDate).toLocaleDateString("th-TH", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}{" "}
              เวลา{" "}
              {new Date(job.createDate).toLocaleTimeString("th-TH", {
                hour: "2-digit",
                minute: "2-digit",
              })}
              {" น."}
            </p>
            <p>
              ผู้แจ้ง : {job?.customer?.name || "-"} (
              {job?.customer?.phone || "-"})
            </p>
            <p>
              ผู้ดำเนินการ : {job?.completedBy?.name || "-"} (
              {job?.completedBy?.phone || "-"})
            </p>
          </div>
        ))}
      </div>
  );
};

export default ReportCustomer;
