import type { SortState } from "@/types/table";

type SortHeaderProps = {
  columnId: string;
  label: string;
  sort: SortState;
  disabled: boolean;
  onSort: (columnId: string) => void;
};

export function SortHeader({
  columnId,
  label,
  sort,
  disabled,
  onSort,
}: SortHeaderProps) {
  const active = sort?.columnId === columnId;
  let nextAction = "ascending";
  let icon = "";

  if (active && sort.direction === "asc") {
    nextAction = "descending";
    icon = "↑";
  } else if (active) {
    nextAction = "restore original order";
    icon = "↓";
  }

  return (
    <button
      type="button"
      className="flex min-h-8 w-full cursor-pointer items-center justify-start gap-2.5 border-0 bg-transparent p-0 text-left text-inherit [font:inherit] transition-colors duration-120 hover:enabled:text-[#0a5135] disabled:cursor-default motion-reduce:transition-none motion-reduce:duration-0 max-[520px]:min-h-11"
      disabled={disabled}
      aria-label={`Sort by ${label}, ${nextAction}`}
      onClick={() => onSort(columnId)}
    >
      {label}
      {active && (
        <span
          className="text-[15px] font-bold text-[#0e623e]"
          aria-hidden="true"
        >
          {icon}
        </span>
      )}
    </button>
  );
}
