// Server component for bookings page
import { BookingsClient } from "./client";
import { getBookings } from "./actions";

export default async function BookingsPage() {
  const bookings = await getBookings();

  return <BookingsClient initialBookings={bookings} />;
}