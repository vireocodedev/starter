import dayjs from "dayjs";

export function formatDate(date: string | number | Date | dayjs.Dayjs | null | undefined) {
  return dayjs(date).format("DD.MM.YYYY");
}

export function formatDateTime(date: string | number | Date | dayjs.Dayjs | null | undefined) {
  return dayjs(date).format("DD.MM.YYYY HH:mm");
}

export function formatTime(date: string | number | Date | dayjs.Dayjs | null | undefined) {
  return dayjs(date).format("HH:mm");
}

export function formatDateUpsert(date: string | number | Date | dayjs.Dayjs | null | undefined) {
  return dayjs(date).format("YYYY-MM-DD");
}

export function formatDateTimeUpsert(date: string | number | Date | dayjs.Dayjs | null | undefined) {
  return dayjs(date).format("YYYY-MM-DDTHH:mm");
}

export function formatTimeUpsert(date: string | number | Date | dayjs.Dayjs | null | undefined) {
  return dayjs(date).format("HH:mm");
}
