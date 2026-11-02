"use client";

import { useEffect, useRef, useState } from "react";
import type { ExpansionConfig } from "@/types/table";

export type ChildRequest<TChild> =
  | { status: "loading" }
  | { status: "error"; message: string }
  | { status: "success"; children: readonly TChild[] };

export function useRowExpansion<T, TChild>(
  expansion: ExpansionConfig<T, TChild> | undefined,
) {
  const [openRows, setOpenRows] = useState<ReadonlySet<string>>(
    () => new Set(),
  );
  const [requests, setRequests] = useState<
    ReadonlyMap<string, ChildRequest<TChild>>
  >(() => new Map());
  const pending = useRef(new Map<string, AbortController>());

  useEffect(() => {
    const activeRequests = pending.current;
    return () => {
      activeRequests.forEach((controller) => controller.abort());
      activeRequests.clear();
    };
  }, []);

  function publish(id: string, state: ChildRequest<TChild>) {
    setRequests((previous) => new Map(previous).set(id, state));
  }

  function load(row: T, id: string) {
    if (!expansion || expansion.mode !== "lazy" || pending.current.has(id))
      return;
    // Successful requests, including empty results, are the cache for this dataset.
    if (requests.get(id)?.status === "success") return;
    const controller = new AbortController();
    const loader = expansion.loadChildren;
    pending.current.set(id, controller);
    publish(id, { status: "loading" });
    // The microtask also converts a synchronous loader throw into a row-local error.
    Promise.resolve()
      .then(() =>
        controller.signal.aborted
          ? []
          : loader(row, { signal: controller.signal }),
      )
      .then((children) => {
        if (controller.signal.aborted || pending.current.get(id) !== controller)
          return;
        pending.current.delete(id);
        publish(id, { status: "success", children });
      })
      .catch((error: unknown) => {
        if (controller.signal.aborted || pending.current.get(id) !== controller)
          return;
        pending.current.delete(id);
        publish(id, {
          status: "error",
          message:
            error instanceof Error
              ? error.message
              : "Unable to load details. Please retry.",
        });
      });
  }

  function toggle(row: T, id: string) {
    if (!expansion) return;
    const opening = !openRows.has(id);
    setOpenRows((previous) => {
      const next = new Set(previous);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
    if (opening) load(row, id);
  }

  return { openRows, requests, toggle, retry: load };
}
