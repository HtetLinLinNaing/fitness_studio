import type { ClassRow } from "@/types/timetable";

const locale = "en-SG";
const timeZone = "Asia/Singapore";

const timeFormat = new Intl.DateTimeFormat(locale, {
  timeZone,
  hour: "2-digit",
  minute: "2-digit",
  hour12: true,
});
const dayFormat = new Intl.DateTimeFormat(locale, {
  timeZone,
  weekday: "long",
  day: "numeric",
  month: "long",
  year: "numeric",
});

export function formatClassTime(row: ClassRow): string {
  return `${timeFormat.format(new Date(row.startsAt))} – ${timeFormat.format(new Date(row.endsAt))}`.toUpperCase();
}

export function formatClassDay(value: string): string {
  return dayFormat.format(new Date(value));
}
