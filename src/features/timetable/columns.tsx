import type { ColumnDef } from "@/components/data-table/types";
import { formatClassTime } from "./formatters";
import type { ClassRow } from "./types";
import styles from "./timetable.module.css";

const statusLabels: Record<ClassRow["status"], string> = {
  scheduled: "Scheduled", full: "Full", cancelled: "Cancelled",
};

export const classColumns: readonly ColumnDef<ClassRow>[] = [
  {
    id: "name", accessorKey: "name", header: "Class", pinned: "left", width: 210, sortable: true,
    cell: ({ row }) => <div><span className={styles.className}>{row.name}</span>
      <span className={styles.secondary}>{(Date.parse(row.endsAt) - Date.parse(row.startsAt)) / 60_000} min class</span></div>,
  },
  {
    id: "instructorName", accessorKey: "instructorName", header: "Instructor", width: 195, sortable: true,
    cell: ({ row }) => <span className={styles.instructor}><span className={styles.initials} aria-hidden="true">
      {row.instructorName.split(/\s+/).slice(0, 2).map(part => part[0]).join("")}
    </span>{row.instructorName}</span>,
  },
  {
    id: "time", accessorFn: row => Date.parse(row.startsAt), header: "Time", width: 225, sortable: true,
    cell: ({ row }) => <span className={styles.time}>{formatClassTime(row)}</span>,
  },
  {
    id: "attendance", accessorKey: "bookedCount", header: "Attendance", width: 145, sortable: true,
    cell: ({ row }) => <div className={styles.attendance}><span><strong>{row.bookedCount}</strong> / {row.capacity}</span>
      <span className={styles.bar} aria-hidden="true"><span style={{ width:
        `${row.capacity > 0 ? Math.min(100, Math.max(0, row.bookedCount / row.capacity * 100)) : 0}%` }} /></span></div>,
  },
  {
    id: "status", accessorKey: "status", header: "Status", width: 150, sortable: true,
    cell: ({ row }) => <span className={styles.status} data-status={row.status}>{statusLabels[row.status]}</span>,
  },
];
