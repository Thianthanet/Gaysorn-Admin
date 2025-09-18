import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import dayjs from "dayjs";
import html2pdf from "html2pdf.js";

const ReportCustomer = ({ id: propId, startDate, endDate }) => {
  const params = useParams();
  const id = propId || params.id;

  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState("");
  const [status, setStatus] = useState({ pending: 0, inProgress: 0, completed: 0 });

  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const [selectedImageUrl, setSelectedImageUrl] = useState(null);

  // ช่วยกำหนดประเภทของรูป
  const getImageType = (image) => {
    if (image.mark === "cusRepair" || image.uploadBy === "cus" || (image.mark === "techRepair" && image.uploadBy === "tech")) return "แจ้งซ่อม";
    if (image.mark === "" || image.uploadBy === "tech" && !image?.url?.toLowerCase().includes("signature")) return "ดำเนินการ";
    // if (image.mark === "signature" || image.mark === "sign") return "ลายเซ็น";
    if (image?.url?.toLowerCase().includes("signature")) {
    return "ลายเซ็น";
  }
    return "อื่นๆ";
  };

  const openImageModal = (url) => {
    setSelectedImageUrl(url);
    setIsImageModalOpen(true);
  };

  const closeImageModal = () => {
    setSelectedImageUrl(null);
    setIsImageModalOpen(false);
  };

  const renderImagesByType = (job, typeLabel) => {
    const filteredImages = job.images?.filter((img) => getImageType(img) === typeLabel) || [];
    if (filteredImages.length === 0) {
      return (
        <div className="w-32 h-32 border rounded flex items-center justify-center text-xs text-gray-500">
          ไม่มีภาพ
        </div>
      );
    }
    return filteredImages.map((image, idx) => {
      const imageUrl = image.url.startsWith("http")
        ? image.url
        : `${import.meta.env.VITE_API_BASE_URL}/api${image.url.startsWith("/") ? image.url : `/${image.url}`}`;
      return (
        <img
          key={idx}
          src={imageUrl}
          alt={`${typeLabel}-${idx}`}
          className="w-32 h-32 object-cover border rounded cursor-pointer"
          crossOrigin="anonymous"
          onClick={() => openImageModal(imageUrl)}
        />
      );
    });
  };

  const formatDateRange = (start, end) => {
    if (!start || !end) return "ทั้งหมด";
    const s = dayjs(start);
    const e = dayjs(end);
    const toBuddhistYear = (date, fmt) =>
      date.format(fmt).replace(date.year().toString(), (date.year() + 543).toString());

    if (s.isSame(e, "day")) return `วันที่ ${toBuddhistYear(s, "D MMMM YYYY")}`;
    if (s.isSame(e, "month")) return `${s.format("D")} - ${toBuddhistYear(e, "D MMMM YYYY")}`;
    if (s.isSame(e, "year")) return `${s.format("D MMM")} - ${toBuddhistYear(e, "D MMM YYYY")}`;
    return `${toBuddhistYear(s, "D MMM YYYY")} - ${toBuddhistYear(e, "D MMM YYYY")}`;
  };

  // เรียก API ครั้งเดียว
  useEffect(() => {
    const fetchJobs = async () => {
      try {
        setLoading(true);
        const res = await axios.get(
          `${import.meta.env.VITE_API_BASE_URL}/api/getCompanyAllRepair/${id}`,
          {
            params: {
              startDate: startDate || "2000-01-01",
              endDate: endDate || dayjs().add(10, "year").format("YYYY-MM-DD"),
            },
          }
        );
        console.log("res", res.data.data)
        setJobs(res.data.data || []);
        setStatus(res.data.companyData?.statusCount || { pending: 0, inProgress: 0, completed: 0 });
        setTimeRange(formatDateRange(startDate, endDate));
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchJobs();
  }, [id, startDate, endDate]);

  const handleExportPDF = () => {
    const element = document.getElementById("pdf-content");
    html2pdf()
      .set({
        margin: [10, 10, 10, 10],
        filename: "report.pdf",
        image: { type: "jpeg", quality: 0.80 },
        html2canvas: { scale: 1, useCORS: true, allowTaint: true },
        jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
        pagebreak: { mode: ["css", "legacy"] },
      })
      .from(element)
      .save();
  };

  if (loading) return <p className="p-6">กำลังโหลดข้อมูล...</p>;

  const firstJob = jobs.length > 0 ? jobs[0] : {};
  const companyName = firstJob?.company?.companyName || "-";
  const buildingName = firstJob?.building?.buildingName || "-";
  const unitName = firstJob?.unit?.unitName || "-";

  const TableHeader = () => (
    <thead>
      <tr className="border-b border-gray-300">
        <td colSpan={2} className="py-1 px-2">
          <div className="flex justify-between w-full items-center text-sm">
            <span className="text-[#8B5B29]/75 font-bold text-xl">{companyName}</span>
            {timeRange && <span>{`ช่วงเวลา: ${timeRange}`}</span>}
          </div>
        </td>
      </tr>
      <tr className="border-b border-gray-300">
        <td className="font-semibold py-1 px-2 border-r border-gray-300 bg-gray-50 text-sm">สถานที่</td>
        <td className="py-1 px-2 text-sm">{buildingName}, {companyName}, {unitName}</td>
      </tr>
      <tr className="border-b border-gray-300">
        <td className="font-semibold py-1 px-2 border-r border-gray-300 bg-gray-50 text-sm">จำนวนการแจ้งซ่อม</td>
        <td className="py-1 px-2 text-sm">{jobs.length}</td>
      </tr>
      <tr className="border-b border-gray-300">
        <td className="font-semibold py-1 px-2 border-r border-gray-300 bg-gray-50 text-sm">รอดำเนินการ</td>
        <td className="py-1 px-2 text-sm">{status.pending}</td>
      </tr>
      <tr className="border-b border-gray-300">
        <td className="font-semibold py-1 px-2 border-r border-gray-300 bg-gray-50 text-sm">อยู่ระหว่างดำเนินการ</td>
        <td className="py-1 px-2 text-sm">{status.inProgress}</td>
      </tr>
      <tr>
        <td className="font-semibold py-1 px-2 border-r border-gray-300 bg-gray-50 text-sm">เสร็จสิ้น</td>
        <td className="py-1 px-2 text-sm">{status.completed}</td>
      </tr>
    </thead>
  );

  return (
    <div className="p-6 mr-5">
      <button
        onClick={handleExportPDF}
        className="mb-4 px-4 py-2 bg-[#C3A96B] text-white rounded"
      >
        Export PDF
      </button>

      <div id="pdf-content">
        {/* ตารางหัวตารางบริษัท */}
        <table className="w-full table-auto border border-gray-300 rounded-md mb-4">
          <TableHeader />
          <tbody></tbody>
        </table>

        {jobs.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            ไม่พบข้อมูลการแจ้งซ่อมในช่วงเวลานี้
          </div>
        ) : (
          jobs.map((job) => (
            <div key={job.id} className="border border-[#C3A96B] rounded-md p-4 mb-4 page-break">
              <h2 className="text-[#C3A96B] font-semibold mb-2">
                หมายเลขงาน : {job.jobNo || "-"}
              </h2>

              <div>
                <h3 className="font-semibold mb-1">ภาพแจ้งซ่อม</h3>
                <div className="flex gap-2 mb-4">{renderImagesByType(job, "แจ้งซ่อม")}</div>

                <h3 className="font-semibold mb-1">ภาพดำเนินการ</h3>
                <div className="flex gap-2 mb-4">{renderImagesByType(job, "ดำเนินการ")}</div>

                <h3 className="font-semibold mb-1">ลายเซ็น</h3>
                <div className="flex gap-2 mb-4">{renderImagesByType(job, "ลายเซ็น")}</div>
              </div>

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
                    className={`${job.status === "pending"
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
                      (อัพเดทล่าสุด: {new Date(job.updatedAt).toLocaleString("th-TH")})
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
                    })} เวลา{" "}
                    {new Date(job.createDate).toLocaleTimeString("th-TH", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })} น.
                  </span>
                </div>
                <div className="flex">
                  <span className="w-32 font-semibold">ผู้แจ้ง :</span>
                  <span>{job?.owner?.name || "-"} ({job?.owner?.phone || "-"})</span>
                </div>
                <div className="flex">
                  <span className="w-32 font-semibold">ผู้ดำเนินการ :</span>
                  <span>{job?.acceptedBy?.name || "-"} ({job?.acceptedBy?.phone || "-"})</span>
                </div>
                <div className="flex">
                  <span className="w-32 font-semibold">ผู้จบงาน :</span>
                  <span>{job?.completedBy?.name || "-"} ({job?.completedBy?.phone || "-"})</span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

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

      <style>{`
        .page-break { page-break-after: always; }
        thead { display: table-header-group; } /* หัวตารางซ้ำทุกหน้า PDF */
      `}</style>
    </div>
  );
};

export default ReportCustomer;
