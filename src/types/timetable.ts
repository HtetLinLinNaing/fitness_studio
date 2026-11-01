export type Attendee = {
  id: string;
  customerName: string;
  paymentType: "one-time" | "package" | "membership";
  bookingStatus: "booked" | "checked-in" | "cancelled" | "no-show";
};

export type ClassRow = {
  id: string;
  name: string;
  instructorName: string;
  startsAt: string;
  endsAt: string;
  bookedCount: number;
  capacity: number;
  status: "scheduled" | "full" | "cancelled";
  attendees: readonly Attendee[];
};
