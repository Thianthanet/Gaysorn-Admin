import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import dayjs from "dayjs";

const ReportCustomer = ({ id: propId, startDate, endDate }) => {
  const params = useParams();
  const id = propId || params.id;
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState("");
  const [data, setDate] = useState([]);

  // สร้าง state สำหรับ Modal รูปภาพ
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const [selectedImageUrl, setSelectedImageUrl] = useState(null);

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

  // ฟังก์ชัน render รูปภาพ พร้อม onClick เพื่อเปิด modal
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
        : `${import.meta.env.VITE_API_BASE_URL}/api${image.url.startsWith("/") ? image.url : `/${image.url}`}`;

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

  useEffect(() => {
    handleGetCompanyReport();
  }, [id, startDate, endDate]);

  const formatDateRange = () => {
    if (!startDate || !endDate) return "ทั้งหมด";
    const start = dayjs(startDate);
    const end = dayjs(endDate);

    const toBuddhistYear = (date, format) => {
      return date.format(format).replace(
        date.year().toString(),
        (date.year() + 543).toString()
      );
    };

    if (start.isSame(end, "day")) {
      return `วันที่ ${toBuddhistYear(start, "D MMMM YYYY")}`;
    }
    if (start.isSame(end, "month")) {
      return `${start.format("D")} - ${toBuddhistYear(end, "D MMMM YYYY")}`;
    }
    if (start.isSame(end, "year")) {
      return `${start.format("D MMM")} - ${toBuddhistYear(end, "D MMM YYYY")}`;
    }
    return `${toBuddhistYear(start, "D MMM YYYY")} - ${toBuddhistYear(end, "D MMM YYYY")}`;
  };

  const handleGetCompanyReport = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        `${import.meta.env.VITE_API_BASE_URL}/api/getCompanyAllRepair/${id}`,
        {
          params: {
            startDate: startDate || "2000-01-01",
            endDate: endDate || dayjs().add(10, "year").format("YYYY-MM-DD"),
          },
        }
      );
      setJobs(response.data.data);
      setTimeRange(formatDateRange());
      // console.log("Loaded jobs with date range:", { startDate, endDate }, response.data.data);
    } catch (error) {
      console.error("Error fetching company report:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getData();
  }, [id]);

  const getData = async () => {
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_API_BASE_URL}/api/getCompanyAllRepair/${id}`
      );
      setDate(res.data.data);
      // console.log("Company data:", res.data.data);
    } catch (error) {
      console.error("Error fetching company data:", error);
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <p>กำลังโหลดข้อมูล...</p>
      </div>
    );
  }

  const firstData = data.length > 0 ? data[0] : null;
  const companyName = firstData?.company?.companyName || "-";
  const buildingName = firstData?.building?.buildingName || "-";
  const unitName = firstData?.unit?.unitName || "-";

  return (
    <div className="p-6 mr-5">
      {/* ข้อมูลบริษัท */}
      <div className="sticky top-0 bg-white z-10 pt-2 pb-6 mb-6 border-b border-[#C3A96B] -mt-4">
        <h1 className="text-xl font-bold text-[#86754D] mb-2">{companyName}</h1>
        <p className="text-sm mb-1">
          <span className="font-semibold">สถานที่ :</span> {buildingName}, {companyName},{" "}
          {unitName}
        </p>
        <div className="flex justify-between items-center">
          <p className="text-sm">
            <span className="font-semibold">จำนวนการแจ้งซ่อม :</span> {jobs.length}
          </p>
          {timeRange && (
            <p className="text-sm bg-[#F5F3EE] px-3 py-1 rounded-full">
              <span className="font-semibold">ช่วงเวลา :</span> {timeRange}
            </p>
          )}
        </div>
      </div>

      {jobs.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          ไม่พบข้อมูลการแจ้งซ่อมในช่วงเวลานี้
        </div>
      ) : (
        jobs.map((job) => (
          <div key={job.id} className="border border-[#C3A96B] rounded-md p-4 mb-4">
            <h2 className="text-[#C3A96B] font-semibold mb-2">หมายเลขงาน : {job.jobNo || "-"}</h2>

            {/* รูปภาพ */}
            <div>
              <h3 className="font-semibold mb-1">ภาพแจ้งซ่อม</h3>
              <div className="flex gap-2 mb-4">{renderImagesByType(job, "แจ้งซ่อม")}</div>

              <h3 className="font-semibold mb-1">ภาพดำเนินการ</h3>
              <div className="flex gap-2 mb-4">{renderImagesByType(job, "ดำเนินการ")}</div>

              <h3 className="font-semibold mb-1">ลายเซ็น</h3>
              <div className="flex gap-2 mb-4">{renderImagesByType(job, "ลายเซ็น")}</div>
            </div>

            {/* รายละเอียดตรงบรรทัด */}
            <div className="space-y-1">
              <div className="flex">
                <span className="w-32 font-semibold">กลุ่มงาน :</span>
                <span>{job.choiceDesc || "-"}</span>
              </div>
              <div className="flex">
                <span className="w-32 font-semibold">รายละเอียด :</span>
                <span>{job.detail || "-"}</span>
              </div>
              <div className="flex">
                <span className="w-32 font-semibold">สถานะ :</span>
                <span
                  className={`${
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
              </div>
              <div className="flex">
                <span className="w-32 font-semibold">วันที่แจ้ง :</span>
                <span>
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
                </span>
              </div>
              <div className="flex">
                <span className="w-32 font-semibold">ผู้แจ้ง :</span>
                <span>
                  {job?.customer?.name || "-"} ({job?.customer?.phone || "-"})
                </span>
              </div>
              <div className="flex">
                <span className="w-32 font-semibold">ผู้ดำเนินการ :</span>
                <span>
                  {job?.completedBy?.name || "-"} ({job?.completedBy?.phone || "-"})
                </span>
              </div>
            </div>
          </div>
        ))
      )}

      {/* Modal แสดงรูปภาพแบบขยาย */}
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

export default ReportCustomer;
