"use client";

import { useState } from "react";
import { DataTable } from "@/components/data-table/DataTable";
import { StudioShell } from "@/components/studio-shell/StudioShell";
import { loadAttendees } from "@/mocks/services";
import { classColumns } from "./columns";
import { formatClassDay } from "./formatters";
import type { Attendee, ClassRow } from "./types";
import type { ExpansionConfig } from "@/components/data-table/types";
import { AttendeeList } from "./AttendeeList";
import { useClassTimetable } from "./use-class-timetable";
import styles from "./timetable.module.css";

const getRowId = (row: ClassRow) => row.id;
const presentation: Pick<ExpansionConfig<ClassRow, Attendee>, "emptyMessage" | "getLabel" | "renderChildren"> = {
  emptyMessage: "No attendees",
  getLabel: (row, expanded) => `${expanded ? "Collapse" : "Expand"} ${row.name} attendees`,
  renderChildren: ({ row, children }) => <AttendeeList classTitle={row.name} attendees={children} />,
};

export function Timetable() {
  const [attendeeMode, setAttendeeMode] = useState<"inline" | "lazy">("inline");
  const { rows, request } = useClassTimetable();
  const expansion: ExpansionConfig<ClassRow, Attendee> = attendeeMode === "inline"
    ? { ...presentation, mode: "inline", getChildren: row => row.attendees }
    : { ...presentation, mode: "lazy", loadChildren: (row, { signal }) => loadAttendees(row.id, { signal }) };
  const ready = request.status === "ready";
  const stats = [
    { label: "classes", value: rows.length },
    { label: "booked attendees", value: rows.reduce((sum, row) => sum + row.bookedCount, 0) },
    { label: "instructors", value: new Set(rows.map(row => row.instructorName)).size },
  ];

  return (
    <StudioShell active="timetable">
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
          <div className={styles.attendeeControls}>
            <label>Attendee loading<select value={attendeeMode} aria-describedby="attendee-mode-hint"
              onChange={event => setAttendeeMode(event.target.value === "lazy" ? "lazy" : "inline")}>
              <option value="inline">Inline</option><option value="lazy">On-demand</option>
            </select></label>
            <p id="attendee-mode-hint">On-demand loads attendees when expanded. Switching modes resets the table.</p>
          </div>
          <DataTable<ClassRow, Attendee> caption="Class timetable" datasetKey={`classes:v1:${attendeeMode}`} data={rows}
            columns={classColumns} getRowId={getRowId} request={request} emptyMessage="No classes available."
            expansion={expansion} />
        </section>
        <p className={styles.footnote}>Sample timetable · Fictional studio data</p>
      </main>
    </StudioShell>
  );
}
