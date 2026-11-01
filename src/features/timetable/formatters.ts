import { STUDIO_SETTINGS } from "@/config/studio";
import type { ClassRow } from "./types";

const timeFormat = new Intl.DateTimeFormat(STUDIO_SETTINGS.locale, {
  timeZone: STUDIO_SETTINGS.timeZone, hour: "2-digit", minute: "2-digit", hour12: true,
});
const dayFormat = new Intl.DateTimeFormat(STUDIO_SETTINGS.locale, {
  timeZone: STUDIO_SETTINGS.timeZone, weekday: "long", day: "numeric", month: "long", year: "numeric",
});

export function formatClassTime(row: ClassRow): string {
  return `${timeFormat.format(new Date(row.startsAt))} – ${timeFormat.format(new Date(row.endsAt))}`.toUpperCase();
}

export function formatClassDay(value: string): string {
  return dayFormat.format(new Date(value));
}
