import axios from "axios";
import { useEffect, useState } from "react";
import { FaStar, FaRegStar } from "react-icons/fa";

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
      <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/70">
        <div className="bg-white rounded-2xl shadow-lg p-6 w-[360px] text-center">
          <div className="flex flex-col items-center justify-center text-[#837958] text-center">
            {/* ไอคอนหรือวงกลม loading */}
            <div className="animate-spin rounded-full border-4 border-t-[#837958] border-gray-200 h-12 w-12 mb-4"></div>
            <h2 className="text-lg font-semibold">กำลังโหลด...</h2>
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
            className="absolute top-3 right-3 text-red-500 hover:text-red-700"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="size-6">
              <path fillRule="evenodd" d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25Zm-1.72 6.97a.75.75 0 1 0-1.06 1.06L10.94 12l-1.72 1.72a.75.75 0 1 0 1.06 1.06L12 13.06l1.72 1.72a.75.75 0 1 0 1.06-1.06L13.06 12l1.72-1.72a.75.75 0 1 0-1.06-1.06L12 10.94l-1.72-1.72Z" clipRule="evenodd" />
            </svg>
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
            className="absolute top-3 right-3 text-red-500 hover:text-red-700"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="size-6">
              <path fillRule="evenodd" d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25Zm-1.72 6.97a.75.75 0 1 0-1.06 1.06L10.94 12l-1.72 1.72a.75.75 0 1 0 1.06 1.06L12 13.06l1.72 1.72a.75.75 0 1 0 1.06-1.06L13.06 12l1.72-1.72a.75.75 0 1 0-1.06-1.06L12 10.94l-1.72-1.72Z" clipRule="evenodd" />
            </svg>
          </button>
          <div className="text-center py-10">
            <p className="text-gray-500">ไม่พบข้อมูลงาน</p>
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

  // ฟังก์ชันแปลงวันที่เป็นรูปแบบไทย
  const formatThaiDateTime = (dateStr) => {
    if (!dateStr) return "-"; // ถ้าไม่มีค่าวันที่ ให้แสดง "-"
    const date = new Date(dateStr);

    const datePart = date.toLocaleDateString("th-TH", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });

    const timePart = date.toLocaleTimeString("th-TH", {
      hour: "2-digit",
      minute: "2-digit",
    });

    return `${datePart} เวลา ${timePart} น.`; // เพิ่ม "น."
  };

  // การเรียกใช้
  const createDateTime = formatThaiDateTime(job?.createDate);
  const preworkDateTime = formatThaiDateTime(job?.preworkDate);
  const acceptDateTime = formatThaiDateTime(job?.acceptDate);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
      <div className="bg-white max-w-[620px] w-full rounded-lg pl-12 pt-8 pb-8 pr-8 overflow-y-auto max-h-[90vh] relative">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-red-500 hover:text-red-700"
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="size-6">
            <path fillRule="evenodd" d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25Zm-1.72 6.97a.75.75 0 1 0-1.06 1.06L10.94 12l-1.72 1.72a.75.75 0 1 0 1.06 1.06L12 13.06l1.72 1.72a.75.75 0 1 0 1.06-1.06L13.06 12l1.72-1.72a.75.75 0 1 0-1.06-1.06L12 10.94l-1.72-1.72Z" clipRule="evenodd" />
          </svg>
        </button>

        <h1 className="text-[#837958] text-[18px] font-bold">
          หมายเลขงาน : {job.jobNo}
        </h1>

        <div className="text-[12px]">
          <h1>วันที่แจ้ง : {createDateTime}</h1>
          <h1>วันที่นัดเข้าซ่อม : {preworkDateTime || "-"}</h1>
          <h1>บริษัท : {job?.company?.companyName || "-"}</h1>
          <h1>
            สถานที่ : {job?.building?.buildingName || "-"},{" "}
            {job?.company?.companyName || "-"}, {job?.unit?.unitName || "-"}
          </h1>
          <h1>
            ผู้แจ้ง :{" "}
            {job?.customer?.name
              ? `${job.customer.name} (${job.customer.phone})`
              : "-"}
          </h1>
          <h1>กลุ่มงาน : {job?.choiceDesc || "-"}</h1>
          <h1 className="whitespace-pre-line">
            รายละเอียด : {job?.detail || "-"}
          </h1>

          {/* ภาพแจ้งซ่อม */}
          <div className="-1">
            <h1>ภาพแจ้งซ่อม :</h1>
            <div className="flex flex-wrap gap-3 mt-1">
              {allImages?.length > 0 ? (
                allImages.map((img) => (
                  <img
                    key={img.id}
                    src={img.url}
                    alt="repair"
                    className="w-20 h-20 object-cover rounded-lg border-[1px] border-[#837958] cursor-pointer hover:opacity-80"
                    onClick={() => window.open(img.url, "_blank")}
                  />
                ))
              ) : (
                <p className="text-[12px] text-gray-500">ไม่มีภาพแจ้งซ่อม</p>
              )}
            </div>
          </div>

          <h1 className="mt-1">ผู้ดำเนินการ : {job?.acceptedBy?.name || "-"}</h1>
          <h1>วันที่รับงาน : {acceptDateTime || "-"}</h1>

          <h1>
            สถานะ :{" "}
            <span className={getStatusInfo(job?.status).color}>
              {getStatusInfo(job?.status).label}
            </span>
          </h1>

          <h1 className="whitespace-pre-line">
            ข้อมูลการดำเนินการ : {job?.actionDetail || "-"}
          </h1>

          {/* ภาพดำเนินการโดยช่าง */}
          <div className="">
            <h1 className="">
              ภาพดำเนินการโดยช่าง :
            </h1>
            <div className="flex flex-wrap gap-3 mt-1">
              {techImages?.length > 1 ? (
                techImages
                  .slice(0, -1) // ตัดรูปสุดท้ายออก เพราะเป็นลายเซ็น
                  .map((img) => (
                    <img
                      key={img.id}
                      src={img.url}
                      alt="tech-process"
                      className="w-20 h-20 object-cover rounded-lg border-[1px] border-[#837958] cursor-pointer hover:opacity-80"
                      onClick={() => window.open(img.url, "_blank")}
                    />
                  ))
              ) : (
                <p className="text-gray-500 text-[12px]">ไม่มีภาพจากช่างซ่อม</p>
              )}
            </div>
          </div>

          {/* ลายเซ็นลูกค้า */}
          <div className="mt-1">
            <h1 className="">ลายเซ็นลูกค้า :</h1>
            {signatureImage ? (
              <img
                src={signatureImage.url}
                alt="customer-signature"
                className="w-20 h-20 object-contain rounded-lg border-[1px] border-[#837958] bg-white p-2 mt-2 cursor-pointer hover:opacity-80"
                onClick={() => window.open(signatureImage.url, "_blank")}
              />
            ) : (
              <p className="text-[12px] text-gray-500 mt-2 mb-2">ไม่มีลายเซ็นลูกค้า</p>
            )}
          </div>

          {/* ความพึงพอใจ */}
          <div className="mt-1">
            <div className="flex gap-1 items-center">
              <h1 className="">ความพึงพอใจ :</h1>
              {[...Array(5)].map((_, index) =>
                index < (job?.workStar || 0) ? (
                  <FaStar key={index} style={{ color: "#837958" }} />
                ) : (
                  <FaRegStar key={index} style={{ color: "#e0e0e0" }} />
                )
              )}
              <span className="ml-1 text-[12px] text-gray-500">
                {job?.workStar ? `` : "ยังไม่มีการประเมิน"}
              </span>
            </div>
          </div>
          {/* ปุ่มปิดด้านล่าง */}
          <div className="mt-8 flex justify-center">
            <button
              onClick={onClose}
              className="px-32 py-2 bg-white font-bold text-[#837958] border-[1px] border-[#837958] rounded-xl hover:bg-[#837958] hover:text-white transition-colors"
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
