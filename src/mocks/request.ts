import type { MockContext } from "./types";

const injectedFailures = new Set<string>();

/** Re-arm one-shot errors when the demo selects a new failure scenario. */
export function resetMockFailures(): void {
  injectedFailures.clear();
}

export function mockRequest<T>(
  operation: string,
  errorMessage: string,
  read: () => T,
  { signal, scenario = "normal" }: MockContext = {},
): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const abortError = () => new DOMException("Request cancelled", "AbortError");

    if (signal?.aborted) {
      reject(abortError());
      return;
    }

    const onAbort = () => {
      clearTimeout(timer);
      signal?.removeEventListener("abort", onAbort);
      reject(abortError());
    };

    const timer = setTimeout(() => {
      signal?.removeEventListener("abort", onAbort);

      if (scenario === "error" && !injectedFailures.has(operation)) {
        injectedFailures.add(operation);
        reject(new Error(errorMessage));
        return;
      }

      try {
        resolve(read());
      } catch (error) {
        reject(error);
      }
    }, scenario === "slow" ? 2_000 : 500);

    signal?.addEventListener("abort", onAbort, { once: true });
  });
}
