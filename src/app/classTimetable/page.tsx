import type { Metadata } from "next";
import { ClassTimetable } from "@/features/timetable/ClassTimetable";

export const metadata: Metadata = {
  title: "HL Fitness Studio | Class timetable",
};

export default function ClassTimetablePage() {
  return <ClassTimetable />;
}
