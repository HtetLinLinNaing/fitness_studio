// Temporary stress rows are generated in memory; shipped fixtures stay small.
import { performance } from "node:perf_hooks";
import { sortRows } from "../src/components/data-table/processing.ts";

const columns = [{ id: "label", accessorKey: "label", header: "Label", sortable: true }];
const results = [];
for (const count of [100, 5000]) {
  // Coprime multiplier produces a deterministic permutation rather than an already sorted run.
  const rows = Array.from({ length: count }, (_, index) => ({ id: String(index), label: `Item ${(index * 7919) % count + 1}` }));
  const originalSecond = rows[1].label;
  const durations = [];
  for (let iteration = 0; iteration < 55; iteration++) {
    const start = performance.now();
    const sorted = sortRows(rows, columns, { columnId: "label", direction: "asc" });
    const visible = sorted.slice(0, 10);
    const duration = performance.now() - start;
    if (visible[0].label !== "Item 1" || visible.length !== 10 || rows[1].label !== originalSecond) {
      throw new Error("Sorting, page size or input immutability failed.");
    }
    if (iteration >= 5) durations.push(duration);
  }
  durations.sort((left, right) => left - right);
  results.push({ rows: count, samples: durations.length, medianMs: Number(durations[25].toFixed(3)),
    p95Ms: Number(durations[47].toFixed(3)), maxMs: Number(durations.at(-1).toFixed(3)) });
}
console.log(JSON.stringify({ node: process.version, platform: process.platform, arch: process.arch,
  measured: "In-memory string sorting and slicing, not browser rendering", results }, null, 2));
