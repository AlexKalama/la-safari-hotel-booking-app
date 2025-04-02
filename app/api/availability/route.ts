import { NextResponse } from "next/server";
import { supabaseClient } from "@/lib/supabase";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const roomId = searchParams.get("roomId");

  if (!roomId) {
    return NextResponse.json(
      { error: "Room ID is required" },
      { status: 400 }
    );
  }

  try {
    // Get all bookings for the specified room
    const { data: bookings, error } = await supabaseClient
      .from("bookings")
      .select("check_in_date, check_out_date, status")
      .eq("room_id", roomId)
      .not("status", "eq", "cancelled");

    if (error) {
      throw error;
    }

    // Return the booking dates
    return NextResponse.json({
      bookings: bookings || [],
    });
  } catch (error) {
    console.error("Error fetching room availability:", error);
    return NextResponse.json(
      { error: "Failed to fetch room availability" },
      { status: 500 }
    );
  }
}
