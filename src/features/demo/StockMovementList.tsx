import type { StockMovement } from "./types";
import styles from "./inventory-demo.module.css";

const dateTime = new Intl.DateTimeFormat("en-SG", { timeZone: "Asia/Singapore", day: "numeric",
  month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
export function StockMovementList({ itemName, movements }: { itemName: string; movements: readonly StockMovement[] }) {
  return <div>
    <h3 className={styles.detailHeading}>{itemName} stock movements <span>Singapore time · UTC+08:00</span></h3>
    <table className={styles.movements}>
      <caption className="sr-only">{itemName} stock movements</caption>
      <colgroup><col style={{ width: "38%" }} /><col style={{ width: "22%" }} /><col style={{ width: "40%" }} /></colgroup>
      <thead><tr><th scope="col">Date/time</th><th scope="col">Quantity change</th><th scope="col">Reason</th></tr></thead>
      <tbody>{movements.map(movement => <tr key={movement.id}>
        <td><time dateTime={movement.occurredAt}>{dateTime.format(new Date(movement.occurredAt))}</time></td>
        <td className={styles.quantity} data-negative={movement.quantityChange < 0}>
          {movement.quantityChange > 0 ? "+" : ""}{movement.quantityChange}</td><td>{movement.reason}</td>
      </tr>)}</tbody>
    </table>
  </div>;
}
