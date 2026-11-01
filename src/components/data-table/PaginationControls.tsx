import { useId } from "react";
import type { PaginationState } from "@/types/table";

const pageButtonClassName =
  "min-h-9 cursor-pointer rounded-md border border-[#b6c9bc] bg-white px-3 py-1.5 font-semibold text-[#245638] hover:enabled:border-[#7c9c87] hover:enabled:bg-[#e4eee6] disabled:cursor-default disabled:border-[#d7e0d9] disabled:bg-[#f3f6f3] disabled:text-[#798c80] max-[520px]:min-h-11";

type Props = {
  caption: string;
  page: PaginationState;
  totalRows: number;
  visibleCount: number;
  sizes: readonly number[];
  disabled: boolean;
  onChange: (next: PaginationState) => void;
};

export function PaginationControls({
  caption,
  page,
  totalRows,
  visibleCount,
  sizes,
  disabled,
  onChange,
}: Props) {
  const id = useId();
  const pages = Math.max(1, Math.ceil(totalRows / page.pageSize));
  const start =
    visibleCount > 0 && totalRows > 0 ? page.pageIndex * page.pageSize + 1 : 0;
  const end = start ? Math.min(totalRows, start + visibleCount - 1) : 0;
  return (
    <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-3.5 border-t border-line bg-white px-[18px] py-[13px] text-xs text-subtle max-[520px]:gap-3.5 max-[520px]:py-4">
      <div className="flex items-center gap-2.5">
        <label htmlFor={id}>Rows per page</label>
        <select
          className="min-h-9 min-w-[62px] cursor-pointer rounded-md border border-[#b6c9bc] bg-white px-2 py-[5px] text-[#244e36] disabled:cursor-default disabled:bg-[#f0f4f1] disabled:text-[#738579] max-[520px]:min-h-11 max-[520px]:text-base"
          id={id}
          value={page.pageSize}
          disabled={disabled}
          onChange={(event) =>
            onChange({ pageIndex: 0, pageSize: Number(event.target.value) })
          }
        >
          {sizes.map((size) => (
            <option key={size} value={size}>
              {size}
            </option>
          ))}
        </select>
      </div>
      <span className="tabular-nums" aria-live="polite">
        {start}–{end} of {totalRows}
      </span>
      <nav
        className="flex items-center gap-[13px] max-[520px]:w-full max-[520px]:justify-between max-[520px]:gap-2"
        aria-label={`${caption} pagination`}
      >
        <button
          className={pageButtonClassName}
          type="button"
          aria-label="Previous page"
          disabled={disabled || page.pageIndex === 0}
          onClick={() => onChange({ ...page, pageIndex: page.pageIndex - 1 })}
        >
          Previous
        </button>
        <span className="whitespace-nowrap tabular-nums">
          Page {page.pageIndex + 1} of {pages}
        </span>
        <button
          className={pageButtonClassName}
          type="button"
          aria-label="Next page"
          disabled={disabled || page.pageIndex >= pages - 1}
          onClick={() => onChange({ ...page, pageIndex: page.pageIndex + 1 })}
        >
          Next
        </button>
      </nav>
    </div>
  );
}
