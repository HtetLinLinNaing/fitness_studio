import type { StockMovement } from "@/types/inventory";

const dateTime = new Intl.DateTimeFormat("en-SG", {
  timeZone: "Asia/Singapore",
  day: "numeric",
  month: "short",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
});
export function StockMovementList({
  itemName,
  movements,
}: {
  itemName: string;
  movements: readonly StockMovement[];
}) {
  return (
    <div>
      <h3 className="mt-0 mb-3.5 text-[13px] font-bold text-[#244c35]">
        {itemName} stock movements{" "}
        <span className="ml-4 text-[11px] font-normal text-[#52685a]">
          Singapore time · UTC+08:00
        </span>
      </h3>
      <table className="w-full table-fixed border-collapse text-[13px] text-[#2d4b38]">
        <caption className="sr-only">{itemName} stock movements</caption>
        <colgroup>
          <col style={{ width: "38%" }} />
          <col style={{ width: "22%" }} />
          <col style={{ width: "40%" }} />
        </colgroup>
        <thead>
          <tr>
            <th
              scope="col"
              className="border-b border-[#ccdacd] px-3 py-[9px] text-left text-[11px] font-semibold"
            >
              Date/time
            </th>
            <th
              scope="col"
              className="border-b border-[#ccdacd] px-3 py-[9px] text-left text-[11px] font-semibold"
            >
              Quantity change
            </th>
            <th
              scope="col"
              className="border-b border-[#ccdacd] px-3 py-[9px] text-left text-[11px] font-semibold"
            >
              Reason
            </th>
          </tr>
        </thead>
        <tbody>
          {movements.map((movement) => (
            <tr key={movement.id} className="group">
              <td className="border-b border-[#dde6dd] px-3 py-[11px] wrap-anywhere group-last:border-b-0">
                <time dateTime={movement.occurredAt}>
                  {dateTime.format(new Date(movement.occurredAt))}
                </time>
              </td>
              <td
                className="border-b border-[#dde6dd] px-3 py-[11px] wrap-anywhere group-last:border-b-0 font-semibold text-[#245b35] tabular-nums data-[negative=true]:text-[#8b362d]"
                data-negative={movement.quantityChange < 0}
              >
                {movement.quantityChange > 0 ? "+" : ""}
                {movement.quantityChange}
              </td>
              <td className="border-b border-[#dde6dd] px-3 py-[11px] wrap-anywhere group-last:border-b-0">
                {movement.reason}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
