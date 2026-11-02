import type { MockScenario } from "@/types/mock";
import styles from "./Inventory.module.css";

type InventoryControlsProps = {
  mode: "client" | "manual";
  listScenario: MockScenario;
  childScenario: MockScenario;
  changeMode: (mode: "client" | "manual") => void;
  changeListScenario: (scenario: MockScenario) => void;
  changeChildScenario: (scenario: MockScenario) => void;
  reset: () => void;
};

const scenarios: readonly { value: MockScenario; label: string }[] = [
  { value: "normal", label: "Normal (500ms)" },
  { value: "slow", label: "Slow (2s)" },
  { value: "empty", label: "Empty" },
  { value: "error", label: "Error" },
];
function ScenarioSelect({
  label,
  value,
  onChange,
}: {
  label: string;
  value: MockScenario;
  onChange: (value: MockScenario) => void;
}) {
  return (
    <label className={styles.label}>
      {label}
      <select
        className={styles.select}
        value={value}
        onChange={(event) => {
          const selected = scenarios.find(
            (option) => option.value === event.target.value,
          );
          if (selected) onChange(selected.value);
        }}
      >
        {scenarios.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}
export function InventoryControls({
  mode,
  listScenario,
  childScenario,
  changeMode,
  changeListScenario,
  changeChildScenario,
  reset,
}: InventoryControlsProps) {
  return (
    <section
      className={styles.controls}
      aria-labelledby="demo-controls-title"
    >
      <div className={styles.heading}>
        <h2 id="demo-controls-title" className={styles.title}>
          Demo controls
        </h2>
        <span className={styles.description}>
          Simulated responses · Local mock data
        </span>
      </div>
      <div className={styles.fields}>
        <label className={styles.label}>
          Processing
          <select
            className={styles.select}
            value={mode}
            onChange={(event) =>
              changeMode(event.target.value === "manual" ? "manual" : "client")
            }
          >
            <option value="client">Client</option>
            <option value="manual">Simulated server</option>
          </select>
        </label>
        <ScenarioSelect
          label="List response"
          value={listScenario}
          onChange={changeListScenario}
        />
        <ScenarioSelect
          label="Detail response"
          value={childScenario}
          onChange={changeChildScenario}
        />
        <button
          type="button"
          onClick={reset}
          className={styles.reset}
        >
          Reset demo
        </button>
      </div>
      <p className={styles.hint}>
        Changing demo settings returns to page 1 and clears open details. Error
        responses recover with Retry.
      </p>
    </section>
  );
}
