import type { MockScenario } from "@/types/mock";

type InventoryControlsProps = {
  mode: "client" | "manual";
  listScenario: MockScenario;
  childScenario: MockScenario;
  changeMode: (mode: "client" | "manual") => void;
  changeListScenario: (scenario: MockScenario) => void;
  changeChildScenario: (scenario: MockScenario) => void;
  reset: () => void;
};

const labelClassName =
  "flex flex-col gap-[7px] text-xs font-semibold text-[#344e40] max-[520px]:flex-[1_1_100%]";
const selectClassName =
  "min-h-10 min-w-[158px] cursor-pointer rounded-md border border-[#9db8a5] bg-white px-3 py-2 text-[13px] text-[#244e36] max-[520px]:min-h-11 max-[520px]:w-full max-[520px]:text-base";

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
    <label className={labelClassName}>
      {label}
      <select
        className={selectClassName}
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
      className="mb-[18px] rounded-[9px] border border-line bg-white px-[18px] py-4 max-[520px]:p-[18px]"
      aria-labelledby="demo-controls-title"
    >
      <div className="flex flex-wrap items-baseline gap-4">
        <h2 id="demo-controls-title" className="m-0 text-sm font-semibold">
          Demo controls
        </h2>
        <span className="text-xs text-subtle">
          Simulated responses · Local mock data
        </span>
      </div>
      <div className="mt-[18px] flex flex-wrap items-end gap-4 max-[520px]:gap-3.5">
        <label className={labelClassName}>
          Processing
          <select
            className={selectClassName}
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
          className="min-h-10 cursor-pointer rounded-md border border-[#9db8a5] bg-white px-3 py-2 text-[13px] font-semibold text-[#244e36] hover:bg-[#edf5ef] max-[520px]:min-h-11"
        >
          Reset demo
        </button>
      </div>
      <p className="mt-[15px] mb-0 text-xs leading-[1.6] text-[#4b6055]">
        Changing demo settings returns to page 1 and clears open details. Error
        responses recover with Retry.
      </p>
    </section>
  );
}
