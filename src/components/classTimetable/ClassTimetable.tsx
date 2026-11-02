"use client";

import { useState } from "react";
import { DataTable } from "@/components/data-table/DataTable";
import { StudioPage } from "@/components/StudioPage";
import { SectionCard } from "@/components/SectionCard";
import { loadAttendees } from "@/mocks/services";
import { classColumns } from "./class-timetable-columns";
import { formatClassDay } from "./class-timetable-formatters";
import type { Attendee, ClassRow } from "@/types/timetable";
import type { ExpansionConfig } from "@/types/table";
import { AttendeeList } from "./AttendeeList";
import { useClassTimetable } from "./use-class-timetable";
import styles from "./ClassTimetable.module.css";

const getRowId = (row: ClassRow) => row.id;
const presentation: Pick<
  ExpansionConfig<ClassRow, Attendee>,
  "emptyMessage" | "getLabel" | "renderChildren"
> = {
  emptyMessage: "No attendees",
  getLabel: (row, expanded) =>
    `${expanded ? "Collapse" : "Expand"} ${row.name} attendees`,
  renderChildren: ({ row, children }) => (
    <AttendeeList classTitle={row.name} attendees={children} />
  ),
};

export function ClassTimetable() {
  const [attendeeMode, setAttendeeMode] = useState<"inline" | "lazy">("inline");
  const { rows, request } = useClassTimetable();
  const expansion: ExpansionConfig<ClassRow, Attendee> =
    attendeeMode === "inline"
      ? { ...presentation, mode: "inline", getChildren: (row) => row.attendees }
      : {
          ...presentation,
          mode: "lazy",
          loadChildren: (row, { signal }) => loadAttendees(row.id, { signal }),
        };
  const ready = request.status === "ready";
  const stats = [
    { label: "classes", value: rows.length },
    {
      label: "booked attendees",
      value: rows.reduce((sum, row) => sum + row.bookedCount, 0),
    },
    {
      label: "instructors",
      value: new Set(rows.map((row) => row.instructorName)).size,
    },
  ];
  const pageContext =
    ready && rows[0] ? (
      <time dateTime={rows[0].startsAt.slice(0, 10)}>
        {formatClassDay(rows[0].startsAt)}
      </time>
    ) : (
      "Singapore time"
    );
  const pageSummary = (
    <dl className={styles.summary}>
      {stats.map((stat) => (
        <div key={stat.label} className={styles.stat}>
          <dt className={styles.statLabel}>{stat.label}</dt>
          <dd className={styles.statValue}>{ready ? stat.value : "—"}</dd>
        </div>
      ))}
    </dl>
  );

  return (
    <StudioPage
      title="Class timetable"
      context={pageContext}
      footnote="Sample timetable · Fictional studio data"
      summary={pageSummary}
    >
      <SectionCard
        titleId="schedule-title"
        title="Class schedule"
        description="SGT · UTC+08:00"
        actions={
          <div>
            <label className={styles.modeLabel}>
              Attendee loading
              <select
                className={styles.modeSelect}
                value={attendeeMode}
                aria-describedby="attendee-mode-hint"
                onChange={(event) =>
                  setAttendeeMode(
                    event.target.value === "lazy" ? "lazy" : "inline",
                  )
                }
              >
                <option value="inline">Inline</option>
                <option value="lazy">On-demand</option>
              </select>
            </label>
            <p className="sr-only" id="attendee-mode-hint">
              On-demand loads attendees when expanded. Switching modes resets
              the table.
            </p>
          </div>
        }
      >
        <DataTable<ClassRow, Attendee>
          caption="Class timetable"
          datasetKey={`classes:v1:${attendeeMode}`}
          data={rows}
          columns={classColumns}
          getRowId={getRowId}
          request={request}
          emptyMessage="No classes available."
          expansion={expansion}
        />
      </SectionCard>
    </StudioPage>
  );
}
