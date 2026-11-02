"use client";

import { Button, Skeleton } from "@heroui/react";
import { useEffect, useState } from "react";
import type { ExpansionConfig } from "@/types/table";
import type { ChildRequest } from "./use-row-expansion";
import styles from "./DataTable.module.css";

type RowDetailsProps<T, TChild> = {
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
}: RowDetailsProps<T, TChild>) {
  if (expansion.mode === "lazy" && (!request || request.status === "loading")) {
    return (
      <div className={styles.detailMessage}>
        <p role="status">Loading details…</p>
        <Skeleton className={`table-skeleton ${styles.detailSkeleton}`} />
        <Skeleton className={`table-skeleton ${styles.detailSkeleton}`} />
      </div>
    );
  }
  if (expansion.mode === "lazy" && request?.status === "error") {
    return (
      <div className={styles.detailMessage} role="alert">
        <p>{request.message}</p>
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
    <p className={`${styles.detailMessage} ${styles.detailEmpty}`}>
      {expansion.emptyMessage ?? "No details available."}
    </p>
  );
}

export function RowDetails<T, TChild>(props: RowDetailsProps<T, TChild>) {
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
      <td colSpan={props.columns} className={styles.detailCell}>
        <div
          id={props.id}
          className={styles.detailPanel}
          data-expanded={props.expanded}
          inert={!props.expanded}
          aria-busy={loading}
        >
          <div className={styles.detailClip}>
            {showContent && (
              <div className={styles.detailContent}>
                <DetailContent {...props} />
              </div>
            )}
          </div>
        </div>
      </td>
    </tr>
  );
}
