import axios from "axios";
import { useEffect, useState } from "react";
import { FaStar, FaRegStar, FaTimes } from "react-icons/fa";

const JobModal = ({ jobId, onClose }) => {
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (jobId) {
      fetchJobDetail();
    } else {
      setLoading(false);
    }
  }, [jobId]);

  const fetchJobDetail = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await axios.get(
        `${import.meta.env.VITE_API_BASE_URL}/api/getRepairById/${jobId}`
      );
      setJob(res.data);
    } catch (err) {
      console.error("Failed to fetch job details:", err);
      setError("ไม่สามารถโหลดข้อมูลงานได้ กรุณาลองใหม่ภายหลัง");
    } finally {
      setLoading(false);
    }
  };

  const getStatusInfo = (status) => {
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
  };

  const handleRefresh = () => {
    fetchJobDetail();
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
        <div className="bg-white max-w-4xl w-full rounded-lg p-6 relative">
          <div className="flex flex-col items-center justify-center py-10">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#837958] mb-4"></div>
            <p className="text-gray-600">กำลังโหลดข้อมูล...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
        <div className="bg-white max-w-4xl w-full rounded-lg p-6 relative">
          <button
            onClick={onClose}
            className="absolute top-3 right-3 text-gray-600 hover:text-black"
          >
            ❌
          </button>
          <div className="text-center py-10">
            <p className="text-red-500 text-lg mb-4">{error}</p>
            <button
              onClick={handleRefresh}
              className="px-4 py-2 bg-[#837958] text-white rounded-lg hover:bg-[#6b6149]"
            >
              โหลดใหม่
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
        <div className="bg-white max-w-4xl w-full rounded-lg p-6 relative">
          <button
            onClick={onClose}
            className="absolute top-3 right-3 text-gray-600 hover:text-black"
          >
            ❌
          </button>
          <div className="text-center py-10">
            <p className="text-gray-600">ไม่พบข้อมูลงาน</p>
          </div>
        </div>
      </div>
    );
  }

  // กรองภาพ
  const allImages = job?.images?.filter(
    (img) =>
      img.uploadBy === "cus" ||
      (img.uploadBy === "tech" && img.mark === "techRepair")
  );

  const techImages = job?.images?.filter(
    (img) => img.uploadBy === "tech" && !img.mark
  );

  const signatureImage = techImages?.slice(-1)[0];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center ">
      <div className="bg-white max-w-2xl w-full rounded-lg p-12 overflow-y-auto max-h-[90vh] relative">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 bg-red-600 rounded-full w-5 h-5 flex items-center justify-center hover:bg-red-700"
        >
          <FaTimes className="text-white text-xs" />
        </button>

        <h1 className="text-[#837958] font-bold mb-2 text-xl">
          หมายเลขงาน : {job.jobNo}
        </h1>

        <div className="text-[14px]">
          <h1>วันที่แจ้ง : {job?.createDate}</h1>
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
          <h1 className="whitespace-pre-line">
            รายละเอียด : {job?.detail || "-"}
          </h1>

          {/* ภาพแจ้งซ่อม */}
          <div>
            <h1>ภาพแจ้งซ่อม:</h1>
            <div className="flex flex-wrap gap-3 mt-2">
              {allImages?.length > 0 ? (
                allImages.map((img) => (
                  <img
                    key={img.id}
                    src={img.url}
                    alt="repair"
                    className="w-40 h-40 object-cover rounded-lg border cursor-pointer hover:opacity-80"
                    onClick={() => window.open(img.url, "_blank")}
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

          <h1 className="whitespace-pre-line">
            ข้อมูลการดำเนินการ: {job?.actionDetail || "-"}
          </h1>

          {/* ภาพดำเนินการโดยช่าง */}
          <div>
            <h1>ภาพ:</h1>
            <div className="flex flex-wrap gap-3 mt-2">
              {techImages?.length > 1 ? (
                techImages
                  .slice(0, -1) // ตัดรูปสุดท้ายออก เพราะเป็นลายเซ็น
                  .map((img) => (
                    <img
                      key={img.id}
                      src={img.url}
                      alt="tech-process"
                      className="w-40 h-40 object-cover rounded-lg border cursor-pointer hover:opacity-80"
                      onClick={() => window.open(img.url, "_blank")}
                    />
                  ))
              ) : (
                <p className="text-sm text-gray-500">ไม่มีภาพจากช่างซ่อม</p>
              )}
            </div>
          </div>

          {/* ลายเซ็นลูกค้า */}
          <div>
            <h1>ลายเซ็นลูกค้า :</h1>
            {signatureImage ? (
              <img
                src={signatureImage.url}
                alt="customer-signature"
                className="w-40 h-40 object-contain rounded-lg border bg-white p-2 cursor-pointer hover:opacity-80"
                onClick={() => window.open(signatureImage.url, "_blank")}
              />
            ) : (
              <p className="text-sm text-gray-500">ไม่มีลายเซ็นลูกค้า</p>
            )}
          </div>

          {/* ความพึงพอใจ */}
          <div className="flex items-center gap-2">
            <h1 className="whitespace-nowrap">ความพึงพอใจ :</h1>
            <div className="flex gap-1 items-center">
              {[...Array(5)].map((_, index) =>
                index < (job?.workStar || 0) ? (
                  <FaStar key={index} style={{ color: "#837958" }} />
                ) : (
                  <FaRegStar key={index} style={{ color: "#e0e0e0" }} />
                )
              )}
            </div>
            <span className="text-sm text-gray-600 whitespace-nowrap">
              {job?.workStar ? `${job.workStar} ดาว` : "ยังไม่มีการประเมิน"}
            </span>
          </div>

          {/* ปุ่มปิดด้านล่าง */}
          <div className="mt-8 flex justify-center">
            <button
              onClick={onClose}
              className="px-6 py-2 border-[#837958] border-2 text-[#837958] rounded-lg hover:bg-[#6b6149] transition-colors"
            >
              ปิดหน้าต่างนี้
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default JobModal;
