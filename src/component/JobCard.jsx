import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { formatDateTimeThaiShort } from "../component/Date";
import { CircleCheck, CircleX } from "lucide-react";

const JobCard = ({ job, isOpen, onToggle }) => {
  const navigate = useNavigate();
  const [localLoading, setLocalLoading] = useState(false);
  const [selectedImg, setSelectedImg] = useState(null);
  const [popupConfirm, setPopupConfirm] = useState(false);
  const [popupStatus, setPopupStatus] = useState("");

  const jobId = job.id || job._id;
  const rating = Number(job?.workStar) || 0;
  const colorFull = "#BC9D72";
  const colorEmpty = "rgba(188, 157, 114, 0.3)";

  if (!job) {
    return (
      <div className="bg-[#F9F6F1] rounded-xl p-4 mb-4 shadow text-red-500">
        ไม่พบข้อมูลงานซ่อม
      </div>
    );
  }

  const handleAcceptClick = () => {
    setPopupConfirm(true);
  };

  const confirmAccept = async () => {
    setLocalLoading(true);
    try {
      await onAccept(jobId);
      setPopupConfirm(false);
      setPopupStatus("success");
      setTimeout(() => {
        setPopupStatus("");
      }, 2000);
    } catch (error) {
      setPopupStatus("error");
      setTimeout(() => {
        setPopupStatus("");
      }, 2000);
    } finally {
      setLocalLoading(false);
    }
  };

  return (
    <div
      id={`job-card-${jobId}`}
      className="bg-[#FEFEFE] rounded-xl p-6 mb-6 shadow text-sm leading-6"
    >
      <p className="flex">
        <span className="w-[100px] font-semibold text-[#837958]">
          หมายเลขงาน :
        </span>
        <span className="font-semibold text-[#837958]">{job.jobNo || "-"}</span>
      </p>
      <p className="flex">
        <span className="w-[100px] text-[#1F1D1E]">วันที่แจ้ง :</span>
        <span className="w-[200px]">
          {formatDateTimeThaiShort(job?.createDate || "")}
        </span>
      </p>
      {job?.preworkDate && (
        <p className="flex">
          <span className="w-[100px] text-[#1F1D1E]">วันนัดเข้าซ่อม :</span>
          <span className="w-[200px]">
            {formatDateTimeThaiShort(job.preworkDate)}
          </span>
        </p>
      )}
      {(job.status === "in_progress" || job.status === "completed") && (
        <p className="flex">
          <span className="w-[100px] text-[#1F1D1E]">วันที่รับงาน :</span>
          <span className="w-[200px]">
            {formatDateTimeThaiShort(job?.acceptDate || "")}
          </span>
        </p>
      )}
      {job.status === "completed" && (
        <p className="flex">
          <span className="w-[100px] text-[#1F1D1E]">วันที่เสร็จสิ้น :</span>
          <span className="w-[200px]">
            {formatDateTimeThaiShort(job?.completeDate || "-")}
          </span>
        </p>
      )}
      <p className="flex">
        <span className="w-[100px] text-[#1F1D1E]">บริษัท :</span>
        <span className="w-[200px]">{job?.company?.companyName || "-"}</span>
      </p>
      <p className="flex">
        <span className="w-[100px] text-[#1F1D1E]">สถานที่ :</span>
        <span className="w-[200px]">
          {job.building?.buildingName || "-"}, {job?.unit?.unitName || "-"}
        </span>
      </p>
      <p className="flex">
        <span className="w-[100px] text-[#1F1D1E]">ผู้แจ้ง :</span>
        <span className="w-[200px] text-black">
          {job?.customer?.name || "-"}
          {job?.customer?.phone && ` (${job.customer.phone})`}
        </span>
      </p>
      <p className="flex">
        <span className="w-[100px] text-[#1F1D1E]">กลุ่มงาน :</span>
        <span className="w-[200px]">{job?.choiceDesc || "-"}</span>
      </p>
      {(job.status === "in_progress" || job.status === "completed") && (
        <p className="flex">
          <span className="w-[100px] text-[#1F1D1E]">ผู้รับงาน :</span>
          <span className="w-[200px]">{job?.acceptedBy?.name || "-"}</span>
        </p>
      )}

      {!isOpen && (
        <div className="mt-4 text-center">
          <button
            onClick={() => {
              onToggle(jobId);
              setTimeout(() => {
                const card = document.getElementById(`job-card-${jobId}`);
                const stickyHeader = document.getElementById("sticky-header");
                if (card) {
                  const headerHeight = stickyHeader?.offsetHeight || 0;
                  const elementPosition =
                    card.getBoundingClientRect().top + window.pageYOffset;
                  const offsetPosition = elementPosition - headerHeight - 20;
                  window.scrollTo({ top: offsetPosition, behavior: "smooth" });
                }
              }, 100);
            }}
            className="border border-[#BC9D72] text-[#BC9D72] rounded-full px-4 py-1 text-sm"
          >
            รายละเอียดเพิ่มเติม
          </button>
        </div>
      )}

      {isOpen && (
        <>
          <p className="flex">
            <span className="w-[100px] text-[#1F1D1E]">รายละเอียด :</span>
            <span className="w-[200px]">{job?.detail || "-"}</span>
          </p>
          {job.status === "completed" && (
            <>
              <p className="flex">
                <span className="w-[100px] text-[#1F1D1E]">ผู้จบงาน :</span>
                <span className="w-[200px]">
                  {job?.completedBy?.name || "-"}
                </span>
              </p>
              <p className="flex flex-col items-start">
                <span className="font-semibold text-[#837958]">
                  ข้อมูลการดำเนินการ :
                </span>
                <span className="w-full whitespace-pre-wrap break-words text-[#1F1D1E]">
                  {job?.actionDetail || "-"}
                </span>
              </p>
              <p className="flex items-center space-x-2">
                <span className="font-semibold text-[#837958]">
                  ความพึงพอใจ :
                </span>
                <span className="flex space-x-1">
                  {Array.from({ length: 5 }, (_, i) => {
                    const color =
                      rating === 0
                        ? colorEmpty
                        : i + 1 <= rating
                        ? colorFull
                        : colorEmpty;
                    return (
                      <span
                        key={i}
                        style={{ color, fontSize: "1.5rem", lineHeight: 1 }}
                      >
                        ★
                      </span>
                    );
                  })}
                </span>
              </p>
            </>
          )}
          {job.status === "in_progress" && (
            <p className="flex">
              <span className="w-[100px] text-[#1F1D1E]">เพิ่มเติม :</span>
              <span className="w-[200px]">{job?.contractorNote || "-"}</span>
            </p>
          )}
          <p
            className={`flex items-center ${
              job.status === "completed"
                ? "font-semibold text-[#837958]"
                : "text-[#1F1D1E]"
            }`}
          >
            <span className="w-[100px]">ภาพแจ้งซ่อม :</span>
            {job?.images?.length > 0 ? (
              <span className="w-[200px]"></span>
            ) : (
              <span className="w-[200px]">-</span>
            )}
          </p>
          <div className="flex gap-2 mt-2 overflow-x-auto">
            {job?.images
              ?.filter(
                (img) => img.mark === "cusRepair" || img.mark === "techRepair"
              )
              .map((img, index) => (
                <img
                  key={index}
                  src={img.url}
                  alt={`repair-img-${index}`}
                  className="w-24 h-24 object-cover rounded-md border flex-shrink-0 cursor-pointer"
                  onClick={() => setSelectedImg(img.url)}
                />
              ))}
          </div>
          {job.status === "completed" && (
            <>
              <p className="flex">
                <span className="w-[100px] font-semibold text-[#837958]">
                  ภาพดำเนินการ :
                </span>
                {job?.images?.some(
                  (img) => img.mark === "cusRepair" || img.mark === "techRepair"
                ) ? (
                  <span className="w-[200px]"></span>
                ) : (
                  <span className="w-[200px]">-</span>
                )}
              </p>
              <div className="flex gap-2 mt-2 overflow-x-auto">
                {(() => {
                  const nullMarkImages =
                    job?.images?.filter((img) => img.mark === null) || [];
                  const imagesExceptLast = nullMarkImages.slice(0, -1);
                  return imagesExceptLast.length > 0
                    ? imagesExceptLast.map((img, index) => (
                        <img
                          key={index}
                          src={img.url}
                          alt={`repair-img-${index}`}
                          className="w-24 h-24 object-cover rounded-md border flex-shrink-0 cursor-pointer"
                          onClick={() => setSelectedImg(img.url)}
                        />
                      ))
                    : null;
                })()}
              </div>
              <p className="flex">
                <span className="w-[100px] font-semibold text-[#837958]">
                  ลายเซ็น :
                </span>
                {job?.images?.some((img) => img.mark === null) ? (
                  <span className="w-[200px]"></span>
                ) : (
                  <span className="w-[200px]">-</span>
                )}
              </p>
              <div className="flex gap-2 mt-2 overflow-x-auto">
                {(() => {
                  const nullMarkImages = job?.images?.filter(
                    (img) => img.mark === null
                  );
                  if (!nullMarkImages || nullMarkImages.length === 0)
                    return null;
                  const lastImage = nullMarkImages[nullMarkImages.length - 1];
                  return (
                    <img
                      key={lastImage.url}
                      src={lastImage.url}
                      alt="repair-img-last-null"
                      className="w-24 h-24 object-cover rounded-md border flex-shrink-0 cursor-pointer"
                      onClick={() => setSelectedImg(lastImage.url)}
                    />
                  );
                })()}
              </div>
            </>
          )}
        </>
      )}

      {/* {selectedImg && (
        <div
          className="fixed inset-0 flex justify-center items-center z-50"
          onClick={() => setSelectedImg(null)}
        >
          <div className="absolute inset-0 backdrop-blur-sm bg-black bg-opacity-40"></div>
          <div
            className="relative max-w-[90vw] max-h-[90vh] z-10"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={selectedImg}
              alt="Selected"
              className="max-w-full max-h-[80vh] rounded-md"
            />
            <button
              onClick={() => setSelectedImg(null)}
              className="absolute top-2 right-2 bg-red-700 bg-opacity-80 hover:bg-opacity-100 text-black rounded-full p-1 shadow-md"
            >
              ✕
            </button>
          </div>
        </div>
      )} */}
      <button
        onClick={() => onToggle(jobId)}
        className="mt-4 w-full bg-[#BC9D72] text-white rounded-full py-2 hover:bg-[#a88b5c] transition-colors duration-200"
      >
        ปิดหน้าต่างนี้
      </button>
    </div>
  );
};

export default React.memo(JobCard);
