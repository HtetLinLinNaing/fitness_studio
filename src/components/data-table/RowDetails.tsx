"use client";

import { Button, Skeleton } from "@heroui/react";
import { useEffect, useState } from "react";
import type { ExpansionConfig } from "@/types/table";
import type { ChildRequest } from "./use-row-expansion";

type Props<T, TChild> = {
  row: T;
  id: string;
  columns: number;
  expanded: boolean;
  expansion: ExpansionConfig<T, TChild>;
  request: ChildRequest<TChild> | undefined;
  onRetry: () => void;
};

function DetailContent<T, TChild>({
  row,
  expansion,
  request,
  onRetry,
}: Props<T, TChild>) {
  if (expansion.mode === "lazy" && (!request || request.status === "loading")) {
    return (
      <div className="sticky left-0 w-[min(360px,calc(100vw-96px))] text-[13px] leading-[1.6] text-[#365340]">
        <p className="mt-0 mb-3" role="status">
          Loading details…
        </p>
        <Skeleton className="table-skeleton mt-2.5 h-[11px] w-[85%] rounded bg-[#d5e2d8] last:w-3/5" />
        <Skeleton className="table-skeleton mt-2.5 h-[11px] w-[85%] rounded bg-[#d5e2d8] last:w-3/5" />
      </div>
    );
  }
  if (expansion.mode === "lazy" && request?.status === "error") {
    return (
      <div
        className="sticky left-0 w-[min(360px,calc(100vw-96px))] text-[13px] leading-[1.6] text-[#365340]"
        role="alert"
      >
        <p className="mt-0 mb-3">{request.message}</p>
        <Button size="sm" variant="secondary" onPress={onRetry}>
          Retry details
        </Button>
      </div>
    );
  }
  const children =
    expansion.mode === "inline"
      ? expansion.getChildren(row)
      : request?.status === "success"
        ? request.children
        : [];
  return children.length > 0 ? (
    expansion.renderChildren({ row, children })
  ) : (
    <p className="sticky left-0 m-0 w-[min(360px,calc(100vw-96px))] py-2 text-[13px] leading-[1.6] text-[#365340]">
      {expansion.emptyMessage ?? "No details available."}
    </p>
  );
}

export function RowDetails<T, TChild>(props: Props<T, TChild>) {
  const [showContent, setShowContent] = useState(props.expanded);
  if (props.expanded && !showContent) setShowContent(true);
  useEffect(() => {
    if (props.expanded || !showContent) return;
    const timer = setTimeout(() => setShowContent(false), 200);
    return () => clearTimeout(timer);
  }, [props.expanded, showContent]);
  const loading =
    props.expansion.mode === "lazy" &&
    (!props.request || props.request.status === "loading");

  return (
    <tr data-detail-row aria-hidden={!props.expanded}>
      <td colSpan={props.columns} className="data-table-detail">
        <div
          id={props.id}
          className="grid grid-rows-[0fr] opacity-0 transition-[grid-template-rows,opacity] duration-180 ease-[ease] data-[expanded=true]:grid-rows-[1fr] data-[expanded=true]:opacity-100 motion-reduce:transition-none motion-reduce:duration-0"
          data-expanded={props.expanded}
          inert={!props.expanded}
          aria-busy={loading}
        >
          <div className="min-h-0 overflow-hidden">
            {showContent && (
              <div className="px-6 pt-5 pb-6 max-[600px]:p-[18px]">
                <DetailContent {...props} />
              </div>
            )}
          </div>
        </div>
      </td>
    </tr>
  );
}
