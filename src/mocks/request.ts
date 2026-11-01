import type { MockContext } from "@/types/mock";

const failedOperations = new Set<string>();

export function resetMockFailures(): void {
  failedOperations.clear();
}

function cancellationError() {
  return new DOMException("Request cancelled", "AbortError");
}

function waitForDelay(delay: number, signal?: AbortSignal): Promise<void> {
  return new Promise((resolve, reject) => {
    if (signal?.aborted) {
      reject(cancellationError());
      return;
    }

    function cancel() {
      clearTimeout(timer);
      reject(cancellationError());
    }

    const timer = setTimeout(() => {
      signal?.removeEventListener("abort", cancel);
      resolve();
    }, delay);

    signal?.addEventListener("abort", cancel, { once: true });
  });
}

/** Simulate a request before a service returns its local data. */
export async function simulateRequest(
  operation: string,
  errorMessage: string,
  { signal, scenario = "normal" }: MockContext = {},
): Promise<void> {
  const delay = scenario === "slow" ? 2_000 : 500;
  await waitForDelay(delay, signal);

  // Cancellation must not consume the failure reserved for the next retry.
  if (signal?.aborted) {
    throw cancellationError();
  }

  // Fail once per operation so clicking Retry can succeed.
  if (scenario === "error" && !failedOperations.has(operation)) {
    failedOperations.add(operation);
    throw new Error(errorMessage);
  }
}
