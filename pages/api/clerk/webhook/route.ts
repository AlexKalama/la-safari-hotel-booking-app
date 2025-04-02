// @ts-nocheck
import { Webhook } from 'svix';
import { headers } from 'next/headers';
import { WebhookEvent } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function POST(req: Request) {
  // Get the webhook signature from the header
  const headerPayload = headers();
  const svix_id = headerPayload.get("svix-id");
  const svix_timestamp = headerPayload.get("svix-timestamp");
  const svix_signature = headerPayload.get("svix-signature");

  // If there's no signature, error out
  if (!svix_id || !svix_timestamp || !svix_signature) {
    return new Response("Missing svix headers", { status: 400 });
  }

  // Get the body
  const payload = await req.json();
  const body = JSON.stringify(payload);

  // Create a new Svix webhook with your secret
  const wh = new Webhook(process.env.CLERK_WEBHOOK_SECRET || "");

  let evt: WebhookEvent;

  // Verify the webhook
  try {
    evt = wh.verify(body, {
      "svix-id": svix_id,
      "svix-timestamp": svix_timestamp,
      "svix-signature": svix_signature,
    }) as WebhookEvent;
  } catch (err) {
    console.error("Error verifying webhook:", err);
    return new Response("Error verifying webhook", { status: 400 });
  }

  // Handle the webhook event
  const eventType = evt.type;

  if (eventType === "user.created" || eventType === "user.updated") {
    const { id, email_addresses, first_name, last_name } = evt.data;
    const email = email_addresses[0]?.email_address;

    if (!email) {
      return NextResponse.json({ message: "No email found" }, { status: 400 });
    }

    // Check if this is an admin email
    const isAdmin = email.endsWith("@lasafarihotel.com");

    if (!isAdmin) {
      return NextResponse.json({ message: "User is not an admin" }, { status: 200 });
    }

    // Store or update the admin user in your Supabase database
    try {
      const { error } = await supabaseAdmin
        .from("admin_users")
        .upsert({
          clerk_id: id,
          email,
          first_name: first_name || "",
          last_name: last_name || "",
          updated_at: new Date().toISOString(),
        })
        .select();

      if (error) throw error;

      return NextResponse.json({ message: "Admin user processed successfully" }, { status: 200 });
    } catch (error) {
      console.error("Error storing admin user:", error);
      return NextResponse.json({ message: "Error storing admin user", error }, { status: 500 });
    }
  }

  if (eventType === "user.deleted") {
    const { id } = evt.data;

    try {
      const { error } = await supabaseAdmin
        .from("admin_users")
        .delete()
        .eq("clerk_id", id);

      if (error) throw error;

      return NextResponse.json({ message: "Admin user deleted successfully" }, { status: 200 });
    } catch (error) {
      console.error("Error deleting admin user:", error);
      return NextResponse.json({ message: "Error deleting admin user", error }, { status: 500 });
    }
  }

  // Return a response for any other event types
  return NextResponse.json({ message: "Webhook received" }, { status: 200 });
}