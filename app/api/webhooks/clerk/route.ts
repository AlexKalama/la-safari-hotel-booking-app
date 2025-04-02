import { WebhookEvent } from "@clerk/nextjs/server";
import { createUser } from "@/lib/users";
import { NextResponse } from "next/server";

// Webhook secret from environment variable
const webhookSecret = process.env.CLERK_WEBHOOK_SECRET || '';

export async function POST(req: Request) {
  // Get the request headers using Request.headers instead of next/headers
  const svix_id = req.headers.get("svix-id");
  const svix_timestamp = req.headers.get("svix-timestamp");
  const svix_signature = req.headers.get("svix-signature");

  // If there are no headers, error out
  if (!svix_id || !svix_timestamp || !svix_signature) {
    return new NextResponse("Error: Missing svix headers", { status: 400 });
  }

  // Get the body
  const payload = await req.json();
  const body = JSON.stringify(payload);

  let evt: WebhookEvent;

  // Verify the webhook payload
  try {
    // Dynamically import svix to avoid issues with SSR
    const { Webhook } = await import('svix');
    const wh = new Webhook(webhookSecret);
    
    evt = wh.verify(body, {
      "svix-id": svix_id,
      "svix-timestamp": svix_timestamp,
      "svix-signature": svix_signature,
    }) as WebhookEvent;
  } catch (err) {
    console.error("Error verifying webhook:", err);
    return new NextResponse("Error verifying webhook", { status: 400 });
  }

  // Handle the webhook
  const eventType = evt.type;

  // Handle user creation
  if (eventType === "user.created") {
    const { id, email_addresses, public_metadata } = evt.data;
    
    // Default role is 'user', unless specified in public_metadata
    const role = public_metadata?.role || 'user';
    const primaryEmail = email_addresses && email_addresses.length > 0 ? 
      email_addresses[0].email_address : '';
    
    if (id && primaryEmail) {
      await createUser({
        id,
        email: primaryEmail,
        role: role as 'user' | 'admin',
      });
      console.log(`User created: ${id}, ${primaryEmail}, role: ${role}`);
    }
  }

  return new NextResponse("Webhook processed successfully", { status: 200 });
}
