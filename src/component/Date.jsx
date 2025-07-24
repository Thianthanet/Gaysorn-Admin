import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
import "dayjs/locale/th";

dayjs.extend(utc);
dayjs.extend(timezone);

export const formatDateThaiShort = (isoDate) => {
  if (!isoDate) return "-";
  const date = dayjs(isoDate).tz("Asia/Bangkok");
  const thaiYear = date.year() + 543;
  const shortYear = thaiYear.toString().slice(2);
  return date.locale("th").format(`D MMM ${shortYear}`);
};

export const formatDateTimeThaiShort = (isoDate) => {
  if (!isoDate) return "-";
  const date = dayjs(isoDate).tz("Asia/Bangkok");
  const thaiYear = date.year() + 543;
  const shortYear = thaiYear.toString().slice(2);
  return date.locale("th").format(`D MMM ${shortYear} เวลา HH:mm น.`);
};