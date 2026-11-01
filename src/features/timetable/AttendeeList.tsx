import type { Attendee } from "@/types/timetable";

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
      <div className="mb-3 flex items-baseline gap-[15px]">
        <h3 className="m-0 text-[13px] font-bold text-[#244c35]">
          {classTitle} attendees
        </h3>
        <span className="text-[11px] text-[#52685a]">
          {attendees.length} booking records
        </span>
      </div>
      <table className="w-full table-fixed border-collapse text-[13px] text-[#2d4b38]">
        <caption className="sr-only">{classTitle} attendees</caption>
        <colgroup>
          <col style={{ width: "44%" }} />
          <col style={{ width: "28%" }} />
          <col style={{ width: "28%" }} />
        </colgroup>
        <thead>
          <tr>
            <th
              scope="col"
              className="border-b border-[#ccdacd] px-3 py-[9px] text-left text-[11px] font-semibold text-[#486550]"
            >
              Customer
            </th>
            <th
              scope="col"
              className="border-b border-[#ccdacd] px-3 py-[9px] text-left text-[11px] font-semibold text-[#486550]"
            >
              Payment type
            </th>
            <th
              scope="col"
              className="border-b border-[#ccdacd] px-3 py-[9px] text-left text-[11px] font-semibold text-[#486550]"
            >
              Booking status
            </th>
          </tr>
        </thead>
        <tbody>
          {attendees.map((attendee) => (
            <tr key={attendee.id} className="group">
              <td className="h-42px border-b border-[#dde6dd] px-3 py-2.5 wrap-anywhere group-last:border-b-0 group-hover:bg-[#e7f0e8]">
                {attendee.customerName}
              </td>
              <td className="h-42px border-b border-[#dde6dd] px-3 py-2.5 wrap-anywhere group-last:border-b-0 group-hover:bg-[#e7f0e8]">
                {paymentLabels[attendee.paymentType]}
              </td>
              <td className="h-42px border-b border-[#dde6dd] px-3 py-2.5 wrap-anywhere group-last:border-b-0 group-hover:bg-[#e7f0e8]">
                <span
                  className="inline-block rounded bg-[#e1ebe4] px-[7px] py-1 text-[11px] font-semibold text-[#345b41] data-[booking-status=checked-in]:bg-[#d5eadc] data-[booking-status=checked-in]:text-[#245b35] data-[booking-status=cancelled]:bg-[#f9eeee] data-[booking-status=cancelled]:text-[#8b362d] data-[booking-status=no-show]:bg-[#fbf3df] data-[booking-status=no-show]:text-[#76500a]"
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
