"use client";

import { useCallback, useEffect, useState } from "react";
import type { RequestState } from "@/types/table";
import { loadClasses } from "@/mocks/services";
import type { ClassRow } from "@/types/timetable";

type LoadState = {
  rows: readonly ClassRow[];
  status: "loading" | "ready" | "error";
  error?: string;
};

export function useClassTimetable() {
  const [attempt, setAttempt] = useState(0);
  const [state, setState] = useState<LoadState>({
    rows: [],
    status: "loading",
  });
  const retry = useCallback(() => {
    setState({ rows: [], status: "loading" });
    setAttempt((value) => value + 1);
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    let current = true;
    loadClasses({ signal: controller.signal })
      .then((rows) => {
        if (current && !controller.signal.aborted)
          setState({ rows, status: "ready" });
      })
      .catch((error: unknown) => {
        if (!current || controller.signal.aborted) return;
        setState({
          rows: [],
          status: "error",
          error:
            error instanceof Error
              ? error.message
              : "Unable to load classes. Please retry.",
        });
      });
    return () => {
      current = false;
      controller.abort();
    };
  }, [attempt]);

  const request: RequestState =
    state.status === "error"
      ? {
          status: "error",
          message: state.error ?? "Unable to load classes.",
          onRetry: retry,
        }
      : { status: state.status };
  return { rows: state.rows, request };
}
