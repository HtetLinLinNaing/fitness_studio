import { useId } from "react";
import type { PaginationState } from "./types";
import styles from "./data-table.module.css";

type Props = {
  caption: string;
  page: PaginationState;
  totalRows: number;
  visibleCount: number;
  sizes: readonly number[];
  disabled: boolean;
  onChange: (next: PaginationState) => void;
};

export function PaginationControls({ caption, page, totalRows, visibleCount, sizes, disabled, onChange }: Props) {
  const id = useId();
  const pages = Math.max(1, Math.ceil(totalRows / page.pageSize));
  const start = visibleCount > 0 && totalRows > 0 ? page.pageIndex * page.pageSize + 1 : 0;
  const end = start ? Math.min(totalRows, start + visibleCount - 1) : 0;
  return <div className={styles.pagination}>
    <div className={styles.sizeControl}><label htmlFor={id}>Rows per page</label>
      <select id={id} value={page.pageSize} disabled={disabled}
        onChange={event => onChange({ pageIndex: 0, pageSize: Number(event.target.value) })}>
        {sizes.map(size => <option key={size} value={size}>{size}</option>)}
      </select></div>
    <span className={styles.range} aria-live="polite">{start}–{end} of {totalRows}</span>
    <nav className={styles.pageNavigation} aria-label={`${caption} pagination`}>
      <button type="button" aria-label="Previous page" disabled={disabled || page.pageIndex === 0}
        onClick={() => onChange({ ...page, pageIndex: page.pageIndex - 1 })}>Previous</button>
      <span>Page {page.pageIndex + 1} of {pages}</span>
      <button type="button" aria-label="Next page" disabled={disabled || page.pageIndex >= pages - 1}
        onClick={() => onChange({ ...page, pageIndex: page.pageIndex + 1 })}>Next</button>
    </nav>
  </div>;
}
