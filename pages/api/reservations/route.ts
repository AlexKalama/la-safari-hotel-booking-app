import { NextResponse } from "next/server";
import { z } from "zod";
import { supabaseAdmin } from "@/lib/supabase";
import { bookingSchema } from "@/lib/validators";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const result = bookingSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: "Invalid request data", details: result.error.format() },
        { status: 400 }
      );
    }

    const { data, error } = await supabaseAdmin
      .from("bookings")
      .insert(result.data)
      .select()
      .single();

    if (error) {
      return NextResponse.json(
        { error: "Database error", details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, data }, { status: 201 });
  } catch (error) {
    console.error("Error in booking API:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const bookingId = url.searchParams.get("id");

    if (bookingId) {
      const { data, error } = await supabaseAdmin
        .from("bookings")
        .select(`
          *,
          rooms:room_id (name, price, image_url),
          packages:package_id (name, price_addon)
        `)
        .eq("id", bookingId)
        .single();

      if (error) {
        return NextResponse.json(
          { error: "Database error", details: error.message },
          { status: 500 }
        );
      }

      return NextResponse.json({ data }, { status: 200 });
    }

    // List bookings with pagination
    const page = parseInt(url.searchParams.get("page") || "1");
    const limit = parseInt(url.searchParams.get("limit") || "10");
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    const { data, error, count } = await supabaseAdmin
      .from("bookings")
      .select(`
        *,
        rooms:room_id (name),
        packages:package_id (name)
      `, { count: "exact" })
      .order("created_at", { ascending: false })
      .range(from, to);

    if (error) {
      return NextResponse.json(
        { error: "Database error", details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      data,
      meta: {
        total: count || 0,
        page,
        limit,
        pages: count ? Math.ceil(count / limit) : 0,
      }
    }, { status: 200 });
  } catch (error) {
    console.error("Error in booking API:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}