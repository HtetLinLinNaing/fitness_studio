"use client";

import { DataTable } from "@/components/data-table/DataTable";
import { STUDIO_SETTINGS } from "@/config/studio";
import { classColumns } from "./columns";
import { formatClassDay } from "./formatters";
import type { Attendee, ClassRow } from "./types";
import type { ExpansionConfig } from "@/components/data-table/types";
import { AttendeeList } from "./AttendeeList";
import { useClassTimetable } from "./use-class-timetable";
import styles from "./timetable.module.css";

const getRowId = (row: ClassRow) => row.id;
const expansion: ExpansionConfig<ClassRow, Attendee> = {
  mode: "inline",
  getChildren: row => row.attendees,
  emptyMessage: "No attendees",
  getLabel: (row, expanded) => `${expanded ? "Collapse" : "Expand"} ${row.name} attendees`,
  renderChildren: ({ row, children }) => <AttendeeList classTitle={row.name} attendees={children} />,
};

export function Timetable() {
  const { rows, request } = useClassTimetable();
  const ready = request.status === "ready";
  const stats = [
    { label: "classes", value: rows.length },
    { label: "booked attendees", value: rows.reduce((sum, row) => sum + row.bookedCount, 0) },
    { label: "instructors", value: new Set(rows.map(row => row.instructorName)).size },
  ];

  return (
    <div className={styles.page}>
      <a className={styles.skip} href="#timetable-main">Skip to timetable</a>
      <header className={styles.header}>
        <div className={styles.headerInner}>
          <div className={styles.brand}><span className={styles.brandMark} aria-hidden="true">HL</span>
            <span>{STUDIO_SETTINGS.name}</span></div>
          <nav className={styles.navigation} aria-label="Main navigation"><span aria-current="page">Class timetable</span></nav>
          <span className={styles.location}>Singapore <span>SGT</span></span>
        </div>
      </header>
      <main className={styles.main} id="timetable-main">
        <p className={styles.eyebrow}>Your studio, at a glance</p>
        <div className={styles.heading}><h1>Class timetable</h1>
          {ready && rows[0] ? <time className={styles.date} dateTime={rows[0].startsAt.slice(0, 10)}>
            {formatClassDay(rows[0].startsAt)}</time> : <span className={styles.date}>Singapore time</span>}
        </div>
        <p className={styles.description}>A little movement. A well-planned day. Your classes, all in one place.</p>
        <dl className={styles.stats}>{stats.map(stat => <div key={stat.label}>
          <dt>{stat.label}</dt><dd>{ready ? stat.value : "—"}</dd>
        </div>)}</dl>
        <section className={styles.card} aria-labelledby="schedule-title">
          <div className={styles.cardHeader}><h2 id="schedule-title">Class schedule</h2>
            <span>Singapore time · UTC+08:00</span></div>
          <DataTable<ClassRow, Attendee> caption="Class timetable" datasetKey="classes:v1" data={rows}
            columns={classColumns} getRowId={getRowId} request={request} emptyMessage="No classes available."
            expansion={expansion} />
        </section>
        <p className={styles.footnote}>Sample timetable · Fictional studio data</p>
      </main>
    </div>
  );
}
