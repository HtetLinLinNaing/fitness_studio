"use client";

import { Button, Skeleton } from "@heroui/react";
import { useEffect, useState } from "react";
import type { ExpansionConfig } from "./types";
import type { ChildRequest } from "./use-row-expansion";
import styles from "./data-table.module.css";

type Props<T, TChild> = {
  row: T;
  id: string;
  columns: number;
  expanded: boolean;
  expansion: ExpansionConfig<T, TChild>;
  request: ChildRequest<TChild> | undefined;
  onRetry: () => void;
};

function DetailContent<T, TChild>({ row, expansion, request, onRetry }: Props<T, TChild>) {
  if (expansion.mode === "lazy" && (!request || request.status === "loading")) {
    return <div className={styles.detailFeedback}>
      <p role="status">Loading details…</p>
      <Skeleton className={styles.detailSkeleton} /><Skeleton className={styles.detailSkeleton} />
    </div>;
  }
  if (expansion.mode === "lazy" && request?.status === "error") {
    return <div className={styles.detailFeedback} role="alert"><p>{request.message}</p>
      <Button size="sm" variant="secondary" onPress={onRetry}>Retry details</Button></div>;
  }
  const children = expansion.mode === "inline" ? expansion.getChildren(row)
    : request?.status === "success" ? request.children : [];
  return children.length > 0 ? expansion.renderChildren({ row, children })
    : <p className={styles.detailEmpty}>{expansion.emptyMessage ?? "No details available."}</p>;
}

export function RowDetails<T, TChild>(props: Props<T, TChild>) {
  const [showContent, setShowContent] = useState(props.expanded);
  if (props.expanded && !showContent) setShowContent(true);
  useEffect(() => {
    if (props.expanded || !showContent) return;
    const timer = setTimeout(() => setShowContent(false), 200);
    return () => clearTimeout(timer);
  }, [props.expanded, showContent]);
  const loading = props.expansion.mode === "lazy" && (!props.request || props.request.status === "loading");

  return <tr data-detail-row aria-hidden={!props.expanded}>
    <td colSpan={props.columns} className={styles.detailCell}>
      <div id={props.id} className={styles.detailPanel} data-expanded={props.expanded}
        inert={!props.expanded} aria-busy={loading}>
        <div className={styles.detailInner}>{showContent && <div className={styles.detailContent}>
          <DetailContent {...props} />
        </div>}</div>
      </div>
    </td>
  </tr>;
}
