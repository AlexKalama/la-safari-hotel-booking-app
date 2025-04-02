"use server";

import { supabaseAdmin } from "@/lib/supabase";

// Define Booking type
export interface Booking {
  id: string;
  guest_name: string;
  guest_email: string;
  room_id: string;
  package_id?: string;
  check_in_date: string;
  check_out_date: string;
  total_price: number;
  status: string;
  payment_status: string;
  created_at: string;
  updated_at: string;
  rooms: {
    name: string;
  };
  packages?: {
    name: string;
  };
}

export async function getBookings(): Promise<Booking[]> {
  const { data, error } = await supabaseAdmin
    .from("bookings")
    .select(`
      *,
      rooms:room_id (name),
      packages:package_id (name)
    `)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching bookings:", error);
    return [];
  }

  return data || [];
}
