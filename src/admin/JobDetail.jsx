import axios from "axios";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import AdminLayout from "./AdminLayout";
import { FaStar, FaRegStar } from "react-icons/fa";

//วันที่
import { formatDateTimeThaiShort } from "../component/Date";

const JobDetail = () => {
  const { id } = useParams();
  const [job, setJob] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    handleGetJob();
  }, []);

  const handleGetJob = async () => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_API_BASE_URL}/api/getRepairById/${id}`
      );
      console.log(response.data);
      setJob(response.data);
    } catch (error) {
      console.error(error);
    }
  };

  // รวมภาพจากลูกค้าและภาพที่ช่างแจ้ง (mark = "techRepair")
  const allImages = job?.images?.filter(
    (img) =>
      img.uploadBy === "cus" ||
      (img.uploadBy === "tech" && img.mark === "techRepair")
  );

  function getStatusInfo(status) {
    switch (status) {
      case "pending":
        return { label: "รอดำเนินการ", color: "text-red-500" };
      case "in_progress":
        return { label: "อยู่ระหว่างดำเนินการ", color: "text-yellow-500" };
      case "completed":
        return { label: "เสร็จสิ้น", color: "text-green-500" };
      default:
        return { label: "ไม่ทราบสถานะ", color: "text-gray-500" };
    }
  }

  return (
    <AdminLayout>
      <div className="bg-white rounded-lg shadow-md p-6 max-w-4xl mx-auto">
        <h1 className="text-[#837958] font-bold">หมายเลขงาน : {job.jobNo}</h1>
        <div>
          <h1>วันที่แจ้ง : {formatDateTimeThaiShort(job?.createDate)}</h1>
          <h1>วันที่นัดเข้าซ่อม : {job?.preworkDate || "-"}</h1>
          <h1>บริษัท : {job?.company?.companyName || "-"}</h1>
          <h1>
            สถานที่ : {job?.building?.buildingName || "-"},{" "}
            {job?.company?.companyName || "-"}, {job?.unit?.unitName || "-"}
          </h1>
          <h1>
            ผู้แจ้ง : {job?.customer?.name || "-"} (
            {job?.customer?.phone || "-"})
          </h1>
          <h1>กลุ่มงาน : {job?.choiceDesc || "-"}</h1>
          <h1>รายละเอียด : {job?.detail || "-"}</h1>
          {/* ภาพรวมทั้งจากลูกค้าและช่าง */}
          <div className="mt-4">
            <h1 className="font-semibold text-[#837958]">ภาพแจ้งซ่อม:</h1>
            <div className="flex flex-wrap gap-3 mt-2">
              {allImages?.length > 0 ? (
                allImages.map((img) => (
                  <img
                    key={img.id}
                    src={img.url}
                    alt="repair"
                    className="w-40 h-40 object-cover rounded-lg border"
                  />
                ))
              ) : (
                <p className="text-sm text-gray-500">ไม่มีภาพแจ้งซ่อม</p>
              )}
            </div>
          </div>
          <h1>ผู้ดำเนินการ : {job?.acceptedBy?.name || "-"}</h1>
          <h1>วันที่รับงาน : {job?.acceptDate || "-"}</h1>
          <h1>
            สถานะ :{" "}
            <span className={getStatusInfo(job?.status).color}>
              {getStatusInfo(job?.status).label}
            </span>
          </h1>
          <h1>ข้อมูลการดำเนินการ: {job?.actionDetail || "-"}</h1>
          {/* 2. ภาพจากช่าง (mark เป็น null) */}
          <div className="mt-6">
            <h1 className="font-semibold text-[#837958]">
              ภาพดำเนินการโดยช่าง :
            </h1>
            <div className="flex flex-wrap gap-3 mt-2">
              {job?.images?.filter(
                (img) => img.uploadBy === "tech" && !img.mark
              )?.length > 1 ? (
                job.images
                  .filter((img) => img.uploadBy === "tech" && !img.mark)
                  .slice(0, -1) // ตัดรูปสุดท้ายออก เพราะจะไว้สำหรับลายเซ็น
                  .map((img) => (
                    <img
                      key={img.id}
                      src={img.url}
                      alt="tech-process"
                      className="w-40 h-40 object-cover rounded-lg border"
                    />
                  ))
              ) : (
                <p className="text-sm text-gray-500">ไม่มีภาพจากช่างซ่อม</p>
              )}
            </div>
          </div>
          {/* 3. ลายเซ็นลูกค้า (ภาพสุดท้ายจาก tech ที่ mark เป็น null) */}
          <div className="mt-6">
            <h1 className="font-semibold text-[#837958]">ลายเซ็นลูกค้า :</h1>
            {job?.images?.filter((img) => img.uploadBy === "tech" && !img.mark)
              ?.length > 0 ? (
              <div className="mt-2">
                <img
                  src={
                    job.images
                      .filter((img) => img.uploadBy === "tech" && !img.mark)
                      .slice(-1)[0]?.url
                  }
                  alt="customer-signature"
                  className="w-40 h-40 object-contain rounded-lg border bg-white p-2"
                />
              </div>
            ) : (
              <p className="text-sm text-gray-500">ไม่มีลายเซ็นลูกค้า</p>
            )}
          </div>

          {/* ความพึงพอใจ */}
          <div className="mt-4">
            <h1 className="font-semibold text-black mb-1">ความพึงพอใจ :</h1>
            <div className="flex gap-1">
              {[...Array(5)].map((_, index) =>
                index < (job?.workStar || 0) ? (
                  <FaStar key={index} style={{ color: "#837958" }} />
                ) : (
                  <FaRegStar key={index} style={{ color: "#e0e0e0" }} />
                )
              )}
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};
export default JobDetail;
