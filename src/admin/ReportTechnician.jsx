import React, { useEffect, useState } from "react";
import axios from "axios";
import dayjs from "dayjs";

const ReportTechnician = ({ userId, startDate, endDate }) => {
  const [technicianReport, setTechnicianReport] = useState({});
  const [acceptedJobs, setAcceptedJobs] = useState([]);
  const [completedJobs, setCompletedJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState("");

  // State สำหรับ Modal รูปภาพ
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const [selectedImageUrl, setSelectedImageUrl] = useState(null);

  // ฟอร์แมตช่วงเวลาแสดงเป็น พ.ศ.
  const formatDateRange = () => {
    if (!startDate || !endDate) return "ทั้งหมด";
    const start = dayjs(startDate);
    const end = dayjs(endDate);

    const toBuddhistYear = (date, format) =>
      date
        .format(format)
        .replace(date.year().toString(), (date.year() + 543).toString());

    if (start.isSame(end, "day"))
      return `วันที่ ${toBuddhistYear(start, "D MMMM YYYY")}`;
    if (start.isSame(end, "month"))
      return `${start.format("D")} - ${toBuddhistYear(end, "D MMMM YYYY")}`;
    if (start.isSame(end, "year"))
      return `${start.format("D MMM")} - ${toBuddhistYear(end, "D MMM YYYY")}`;
    return `${toBuddhistYear(start, "D MMM YYYY")} - ${toBuddhistYear(
      end,
      "D MMM YYYY"
    )}`;
  };

  // ดึงข้อมูลรายงาน
  const handleGetTechnicianReport = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        `${import.meta.env.VITE_API_BASE_URL}/api/getTechReportById/${userId}`,
        {
          params: {
            startDate: startDate || "2000-01-01",
            endDate: endDate || dayjs().add(10, "year").format("YYYY-MM-DD"),
          },
        }
      );
      const data = response.data.data;
      setTechnicianReport(data);
      setAcceptedJobs(data.accepted || []);
      setCompletedJobs(data.completed || []);
      setTimeRange(formatDateRange());
    } catch (error) {
      console.error("Error fetching technician report:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    handleGetTechnicianReport();
  }, [userId, startDate, endDate]);

  // ช่วยจำแนกรูปตามประเภทเหมือนใน ReportCustomer
  const getImageType = (image) => {
    if (image.mark === "cusRepair" || image.uploadBy === "cus") return "แจ้งซ่อม";
    if (image.mark === "techRepair" || image.uploadBy === "tech") return "ดำเนินการ";
    if (image.mark === "signature" || image.mark === "sign") return "ลายเซ็น";
    return "อื่นๆ";
  };

  // เปิด modal รูปภาพ
  const openImageModal = (url) => {
    setSelectedImageUrl(url);
    setIsImageModalOpen(true);
  };

  // ปิด modal รูปภาพ
  const closeImageModal = () => {
    setIsImageModalOpen(false);
    setSelectedImageUrl(null);
  };

  // แสดงรูปภาพแบบคลิกได้และขยาย
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
          className="w-32 h-32 object-cover rounded-lg cursor-pointer hover:opacity-80 transition"
          onClick={() => openImageModal(imageUrl)}
        />
      );
    });
  };

  // แสดงข้อมูลงานแต่ละงาน
  const renderJobCard = (job) => (
    <div key={job.id} className="border border-[#C3A96B] rounded-md p-4 mb-4">
      <div className="flex justify-between items-start mb-2">
        <h2 className="text-[#C3A96B] font-semibold">
          หมายเลขงาน : {job.jobNo || "-"}
        </h2>
        <span
          className={`px-2 py-1 rounded text-sm ${
            job.status === "pending"
              ? "bg-red-100 text-red-800"
              : job.status === "in_progress"
              ? "bg-yellow-100 text-yellow-800"
              : job.status === "completed"
              ? "bg-green-100 text-green-800"
              : "bg-gray-100 text-gray-800"
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
      </div>

      <div className="grid grid-cols-1 md:grid-cols-1 gap-5 mb-4">
        <div>
          <h3 className="font-semibold mb-2">ภาพแจ้งซ่อม</h3>
          <div className="flex gap-2">{renderImagesByType(job, "แจ้งซ่อม")}</div>
        </div>
        <div>
          <h3 className="font-semibold mb-2">ภาพดำเนินการ</h3>
          <div className="flex gap-2">{renderImagesByType(job, "ดำเนินการ")}</div>
        </div>
        <div>
          <h3 className="font-semibold mb-2">ลายเซ็น</h3>
          <div className="flex gap-2">{renderImagesByType(job, "ลายเซ็น")}</div>
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex">
          <span className="w-32 font-semibold">กลุ่มงาน :</span>
          <span>{job.choiceDesc || "-"}</span>
        </div>
        <div className="flex">
          <span className="w-32 font-semibold">รายละเอียด :</span>
          <span>{job.detail || "-"}</span>
        </div>
        <div className="flex">
          <span className="w-32 font-semibold">อาคาร :</span>
          <span>{job.building?.buildingName || "-"}</span>
        </div>
        <div className="flex">
          <span className="w-32 font-semibold">บริษัท :</span>
          <span>{job.company?.companyName || "-"}</span>
        </div>
        <div className="flex">
          <span className="w-32 font-semibold">วันที่แจ้ง :</span>
          <span>
            {new Date(job.createDate).toLocaleDateString("th-TH", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </span>
        </div>
        <div className="flex">
          <span className="w-32 font-semibold">วันที่รับงาน :</span>
          <span>
            {job.acceptDate
              ? new Date(job.acceptDate).toLocaleDateString("th-TH", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })
              : "-"}
          </span>
        </div>
        <div className="flex">
          <span className="w-32 font-semibold">ผู้แจ้ง :</span>
          <span>
            {job.customer?.name || "-"} ({job.customer?.phone || "-"})
          </span>
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="p-6">
        <p>กำลังโหลดข้อมูล...</p>
      </div>
    );
  }

  return (
    <div className="p-6 mr-5">
      <div className="sticky top-0 bg-white z-10 pt-2 pb-6 mb-6 border-b border-[#C3A96B] -mt-4">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-xl font-bold text-[#86754D] mb-2">
              {technicianReport?.technician?.name || "-"}
            </h1>
            <p className="text-sm mb-1">
              <span className="font-semibold">สถานที่ :</span>{" "}
              {technicianReport?.technician?.buildings?.join(", ") || "-"}
            </p>

            <p className="text-sm mb-1">
              <span className="font-semibold">เบอร์โทร :</span>{" "}
              {technicianReport?.technician?.phone || "-"}
            </p>
            <p className="text-sm mb-1">
              <span className="font-semibold">การประเมินเฉลี่ย :</span>{" "}
              {technicianReport?.summary?.averageStar || "-"}
            </p>
          </div>

          <div className="text-right">
            {timeRange && (
              <p className="text-sm bg-[#F5F3EE] px-3 py-1 rounded-full inline-block">
                <span className="font-semibold">ช่วงเวลา :</span> {timeRange}
              </p>
            )}
            <p className="text-sm mt-2">
              <span className="font-semibold">จำนวนงานที่รับ :</span>{" "}
              {acceptedJobs.length} งาน
            </p>
            <p className="text-sm mt-1">
              <span className="font-semibold">จำนวนงานที่เสร็จ :</span>{" "}
              {completedJobs.length} งาน
            </p>
          </div>
        </div>
      </div>

      <h2 className="text-lg font-bold text-[#C3A96B] mb-3">งานที่รับ</h2>
      {acceptedJobs.length === 0 ? (
        <div className="text-center py-4 text-gray-500">
          ไม่พบงานที่รับในช่วงเวลานี้
        </div>
      ) : (
        acceptedJobs.map((job) => renderJobCard(job))
      )}

      <h2 className="text-lg font-bold text-[#C3A96B] mt-6 mb-3">เสร็จสิ้น</h2>
      {completedJobs.length === 0 ? (
        <div className="text-center py-4 text-gray-500">
          ไม่พบงานที่เสร็จในช่วงเวลานี้
        </div>
      ) : (
        completedJobs.map((job) => renderJobCard(job))
      )}

      {/* Modal รูปภาพ */}
      {isImageModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
          onClick={closeImageModal}
        >
          <div
            className="bg-white max-h-[90vh] overflow-auto w-[90vw] max-w-5xl rounded-lg shadow-lg relative p-4"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={closeImageModal}
              className="absolute top-2 right-2 text-white bg-red-500 hover:bg-red-600 rounded-full w-8 h-8 flex items-center justify-center text-lg shadow"
            >
              ✕
            </button>
            <img
              src={selectedImageUrl}
              alt="ภาพขยาย"
              className="w-full h-auto max-h-[80vh] object-contain rounded"
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default ReportTechnician;
