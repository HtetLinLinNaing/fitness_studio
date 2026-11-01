import type { ColumnDef } from "@/types/table";
import { formatClassTime } from "./formatters";
import type { ClassRow } from "@/types/timetable";

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
        <span className="block text-sm leading-[1.4] font-semibold text-[#193b2b]">
          {row.name}
        </span>
        <span className="mt-0.5 block text-xs leading-normal text-[#52685a]">
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
      <span className="flex items-center gap-2.5 text-sm font-medium text-[#354e40]">
        {row.instructorName}
      </span>
    ),
  },
  {
    id: "time",
    accessorFn: (row) => Date.parse(row.startsAt),
    header: "Time",
    width: 225,
    sortable: true,
    cell: ({ row }) => (
      <span className="text-[13px] font-medium whitespace-nowrap text-[#354e40]">
        {formatClassTime(row)}
      </span>
    ),
  },
  {
    id: "attendance",
    accessorKey: "bookedCount",
    header: "Attendance",
    width: 145,
    sortable: true,
    cell: ({ row }) => (
      <div className="text-sm text-[#52685a] tabular-nums">
        <span>
          <strong className="font-bold text-[#234e35]">
            {row.bookedCount}
          </strong>{" "}
          / {row.capacity}
        </span>
      </div>
    ),
  },
  {
    id: "status",
    accessorKey: "status",
    header: "Status",
    width: 150,
    sortable: true,
    cell: ({ row }) => (
      <span
        className="inline-flex items-center gap-1.5 rounded-[5px] bg-[#edf6ef] px-2 py-[3px] text-xs font-semibold whitespace-nowrap text-[#245b35] before:size-1 before:rounded-full before:bg-current before:content-[''] data-[status=full]:bg-[#fbf3df] data-[status=full]:text-[#76500a] data-[status=cancelled]:bg-[#f9eeee] data-[status=cancelled]:text-[#8b362d]"
        data-status={row.status}
      >
        {statusLabels[row.status]}
      </span>
    ),
  },
];
