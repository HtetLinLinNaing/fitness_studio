import type { ColumnDef } from "@/types/table";
import { formatClassTime } from "./class-timetable-formatters";
import type { ClassRow } from "@/types/timetable";
import styles from "./ClassTimetable.module.css";

const statusLabels: Record<ClassRow["status"], string> = {
  scheduled: "Scheduled",
  full: "Full",
  cancelled: "Cancelled",
};

export const classColumns: readonly ColumnDef<ClassRow>[] = [
  {
    id: "name",
    accessorKey: "name",
    header: "Class",
    pinned: "left",
    width: 260,
    sortable: true,
    cell: ({ row }) => (
      <div>
        <span className={styles.classTitle}>{row.name}</span>
        <span className={styles.duration}>
          {(Date.parse(row.endsAt) - Date.parse(row.startsAt)) / 60_000} min
        </span>
      </div>
    ),
  },
  {
    id: "instructorName",
    accessorKey: "instructorName",
    header: "Instructor",
    width: 195,
    sortable: true,
    cell: ({ row }) => (
      <span className={styles.instructor}>{row.instructorName}</span>
    ),
  },
  {
    id: "time",
    accessorFn: (row) => Date.parse(row.startsAt),
    header: "Time",
    width: 225,
    sortable: true,
    cell: ({ row }) => (
      <span className={styles.time}>{formatClassTime(row)}</span>
    ),
  },
  {
    id: "attendance",
    accessorKey: "bookedCount",
    header: "Attendance",
    width: 145,
    sortable: true,
    cell: ({ row }) => (
      <span className={styles.attendance}>
        <strong>{row.bookedCount}</strong> / {row.capacity}
      </span>
    ),
  },
  {
    id: "status",
    accessorKey: "status",
    header: "Status",
    width: 150,
    sortable: true,
    cell: ({ row }) => (
      <span className={styles.status} data-status={row.status}>
        {statusLabels[row.status]}
      </span>
    ),
  },
];
