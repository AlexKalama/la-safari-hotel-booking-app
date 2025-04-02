import { z } from "zod";

export const roomSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(2, { message: "Name must be at least 2 characters." }),
  description: z.string().min(10, { message: "Description must be at least 10 characters." }),
  price: z.coerce.number().positive({ message: "Price must be a positive number." }),
  capacity: z.coerce.number().positive({ message: "Capacity must be a positive number." }),
  amenities: z.array(z.string()).min(1, { message: "Please add at least one amenity." }),
  image_url: z.string().url({ message: "Please provide a valid image URL." }),
});

export const packageSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(2, { message: "Name must be at least 2 characters." }),
  description: z.string().min(10, { message: "Description must be at least 10 characters." }),
  price_addon: z.coerce.number().nonnegative({ message: "Price add-on must be a non-negative number." }),
});

export const bookingSchema = z.object({
  room_id: z.string(),
  package_id: z.string().optional(),
  guest_name: z.string().min(2, { message: "Name must be at least 2 characters." }),
  guest_email: z.string().email({ message: "Please enter a valid email address." }),
  check_in_date: z.string().or(z.date()),
  check_out_date: z.string().or(z.date()),
  adults: z.coerce.number().positive({ message: "At least 1 adult is required." }),
  children: z.coerce.number().nonnegative(),
  total_price: z.coerce.number().positive(),
  special_requests: z.string().optional(),
});