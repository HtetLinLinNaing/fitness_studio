import type { ReactNode } from "react";
import styles from "./DataTable.module.css";

type ExpandableCellProps = {
  canExpand: boolean;
  expanded: boolean;
  detailsId: string;
  label?: string;
  onToggle: () => void;
  children: ReactNode;
};

export function ExpandableCell({
  canExpand,
  expanded,
  detailsId,
  label,
  onToggle,
  children,
}: ExpandableCellProps) {
  return (
    <div className={styles.expandCell}>
      {canExpand ? (
        <button
          type="button"
          className={styles.expandButton}
          aria-label={label ?? `${expanded ? "Collapse" : "Expand"} details`}
          aria-expanded={expanded}
          aria-controls={detailsId}
          onClick={onToggle}
        >
          <span className={styles.expandIcon} aria-hidden="true">
            ›
          </span>
        </button>
      ) : (
        <span className={styles.expandPlaceholder} aria-hidden="true" />
      )}
      <div className={styles.cellContent}>{children}</div>
    </div>
  );
}
