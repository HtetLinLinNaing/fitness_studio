import type { Attendee } from "@/types/timetable";
import styles from "@/components/DetailTable.module.css";

const paymentLabels: Record<Attendee["paymentType"], string> = {
  "one-time": "One-time",
  package: "Package",
  membership: "Membership",
};
const bookingLabels: Record<Attendee["bookingStatus"], string> = {
  booked: "Booked",
  "checked-in": "Checked-in",
  cancelled: "Cancelled",
  "no-show": "No-show",
};

export function AttendeeList({
  classTitle,
  attendees,
}: {
  classTitle: string;
  attendees: readonly Attendee[];
}) {
  return (
    <div>
      <div className={styles.heading}>
        <h3 className={styles.title}>{classTitle} attendees</h3>
        <span className={styles.description}>
          {attendees.length} booking records
        </span>
      </div>
      <table className={styles.table}>
        <caption className="sr-only">{classTitle} attendees</caption>
        <colgroup>
          <col style={{ width: "44%" }} />
          <col style={{ width: "28%" }} />
          <col style={{ width: "28%" }} />
        </colgroup>
        <thead>
          <tr>
            <th scope="col">Customer</th>
            <th scope="col">Payment type</th>
            <th scope="col">Booking status</th>
          </tr>
        </thead>
        <tbody>
          {attendees.map((attendee) => (
            <tr key={attendee.id}>
              <td>{attendee.customerName}</td>
              <td>{paymentLabels[attendee.paymentType]}</td>
              <td>
                <span
                  className={styles.bookingStatus}
                  data-booking-status={attendee.bookingStatus}
                >
                  {bookingLabels[attendee.bookingStatus]}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
