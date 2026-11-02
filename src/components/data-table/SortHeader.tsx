import type { SortState } from "@/types/table";
import styles from "./DataTable.module.css";

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
      className={styles.sortButton}
      disabled={disabled}
      aria-label={`Sort by ${label}, ${nextAction}`}
      onClick={() => onSort(columnId)}
    >
      {label}
      {active && (
        <span
          className={styles.sortIcon}
          aria-hidden="true"
        >
          {icon}
        </span>
      )}
    </button>
  );
}
