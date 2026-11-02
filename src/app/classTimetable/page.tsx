import type { Metadata } from "next";
import { ClassTimetable } from "@/components/classTimetable/ClassTimetable";

export const metadata: Metadata = {
  title: "HL Fitness Studio | Class timetable",
};

export default function ClassTimetablePage() {
  return <ClassTimetable />;
}
