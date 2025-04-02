// @ts-nocheck
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { format, differenceInDays } from "date-fns";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "react-hot-toast";
import { sendBookingConfirmationEmail, sendPaymentReceiptEmail } from "@/lib/email";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { supabaseClient } from "@/lib/supabase";

// Form schema
const formSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters." }),
  email: z.string().email({ message: "Please enter a valid email address." }),
  phone: z.string().min(10, { message: "Please enter a valid phone number." }),
  adults: z.coerce.number().min(1, { message: "At least 1 adult is required." }),
  children: z.coerce.number().min(0),
  packageId: z.string(),
  specialRequests: z.string().optional(),
});

type PackageOption = {
  id: string;
  name: string;
  description: string;
  price_addon: number;
};

// Define the correct type for params in Next.js dynamic routes
type PageProps = {
  params: {
    id: string;
  };
};

export default function BookingConfirmationPage({ params }: PageProps) {
  const router = useRouter();
  // Get the room ID directly from params
  const roomId = params.id;
  const [room, setRoom] = useState<any>(null);
  const [packages, setPackages] = useState<PackageOption[]>([]);
  const [selectedPackage, setSelectedPackage] = useState<PackageOption | null>(null);
  const [checkInDate, setCheckInDate] = useState<Date | null>(null);
  const [checkOutDate, setCheckOutDate] = useState<Date | null>(null);
  const [nights, setNights] = useState(0);
  const [totalPrice, setTotalPrice] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [guestCount, setGuestCount] = useState({ adults: 1, children: 0 });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [step, setStep] = useState(1); // 1: Room Details, 2: Guest details
  const [activeTab, setActiveTab] = useState("details");
  const [roomAmenities, setRoomAmenities] = useState<string[]>([]);
  const [reviewsCount, setReviewsCount] = useState(0);
  const [averageRating, setAverageRating] = useState(4.8);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      adults: guestCount.adults,
      children: guestCount.children,
      packageId: "",
      specialRequests: "",
    },
  });

  useEffect(() => {
    // Check if there's data in localStorage first
    const storedRoom = localStorage.getItem("selectedRoom");
    const storedCheckIn = localStorage.getItem("checkInDate");
    const storedCheckOut = localStorage.getItem("checkOutDate");
    const storedGuestCount = localStorage.getItem("guestCount");

    // Always fetch the fresh room data from database
    fetchRoomData();
    
    // Use localStorage data for dates and guest count if available
    if (storedRoom && storedCheckIn && storedCheckOut) {
      const parsedRoom = JSON.parse(storedRoom);
      console.log("Using stored room data:", parsedRoom);
      
      const checkIn = new Date(storedCheckIn);
      const checkOut = new Date(storedCheckOut);
      
      setCheckInDate(checkIn);
      setCheckOutDate(checkOut);
      
      const nightCount = differenceInDays(checkOut, checkIn);
      setNights(nightCount);
      
      // We'll update the total price after the room data is fetched from DB
      // to ensure we have the latest pricing
    }
    
    if (storedGuestCount) {
      const parsedGuestCount = JSON.parse(storedGuestCount);
      setGuestCount(parsedGuestCount);
      form.setValue("adults", parsedGuestCount.adults);
      form.setValue("children", parsedGuestCount.children);
    }

    // Fetch package options
    fetchPackages();
  }, [roomId, form]);

  useEffect(() => {
    if (room && checkInDate && checkOutDate) {
      const nightCount = differenceInDays(checkOutDate, checkInDate);
      let totalCost = room.price * nightCount;
      
      if (selectedPackage) {
        totalCost += selectedPackage.price_addon * nightCount;
      }
      
      setTotalPrice(totalCost);
    }
  }, [room, checkInDate, checkOutDate, selectedPackage]);

  const fetchRoomData = async () => {
    try {
      console.log("Fetching room data for roomId:", roomId);
      
      // Fetch room details
      const { data: roomData, error: roomError } = await supabaseClient
        .from("rooms")
        .select("*")
        .eq("id", roomId)
        .single();

      console.log("Room data response:", roomData);
      console.log("Room error (if any):", roomError);

      if (roomError) throw roomError;
      
      // Process amenities
      let amenities = [];
      if (roomData && roomData.amenities) {
        if (typeof roomData.amenities === 'string') {
          try {
            amenities = JSON.parse(roomData.amenities);
          } catch {
            amenities = roomData.amenities.split(',').map(item => item.trim());
          }
        } else if (Array.isArray(roomData.amenities)) {
          amenities = roomData.amenities;
        }
      }
      
      setRoomAmenities(amenities);
      setRoom(roomData);
      setIsLoading(false);
      
      // Fetch reviews summary (mock data for now)
      setReviewsCount(24);
      
      // Fetch any existing bookings for availability check
      const now = new Date();
      const { data: bookingsData } = await supabaseClient
        .from("bookings")
        .select("check_in_date, check_out_date")
        .eq("room_id", roomId)
        .gte("check_out_date", now.toISOString());
      
      // Could use this to display a calendar of availability
      // but for now we'll just log it
      console.log("Existing bookings:", bookingsData);
      
    } catch (error) {
      console.error("Error fetching room:", error);
      setIsLoading(false);
      toast.error("Failed to load room details. Please try again.");
      // Don't redirect immediately, so user can see the error
      setTimeout(() => {
        router.push("/reservations");
      }, 2000);
    }
  };

  const fetchPackages = async () => {
    try {
      console.log("Fetching packages...");
      const { data, error } = await supabaseClient
        .from("packages")
        .select("*")
        .order("price_addon", { ascending: true });

      if (error) throw error;
      console.log("Packages loaded:", data);
      setPackages(data || []);
    } catch (error) {
      console.error("Error fetching packages:", error);
      toast.error("Could not load package options. You can still continue with your booking.");
      // Don't fail loading the whole page just because packages fail to load
      setPackages([]);
    }
  };

  const handlePackageSelect = (packageId: string) => {
    console.log("Package selected:", packageId);
    
    if (packageId) {
      const selectedPackage = packages.find(pkg => pkg.id === packageId);
      setSelectedPackage(selectedPackage || null);
      
      if (selectedPackage) {
        toast.success(`${selectedPackage.name} package selected`);
      }
    } else {
      // If no packageId is provided, deselect the current package
      setSelectedPackage(null);
      form.setValue("packageId", "");
    }
    
    // Always recalculate the total price
    if (room && nights > 0) {
      const basePrice = room.price * nights;
      const packagePrice = selectedPackage ? selectedPackage.price_addon * nights : 0;
      const newTotal = basePrice + packagePrice;
      
      console.log("Price calculation:", {
        basePrice,
        packagePrice,
        nights,
        newTotal
      });
      
      setTotalPrice(newTotal);
    }
  };
  
  const navigateToStep = (newStep: number) => {
    setStep(newStep);
    // Scroll to top when changing steps
    window.scrollTo(0, 0);
  };

  const onSubmit = async (data: any) => {
    try {
      setIsSubmitting(true);
      
      if (!room) {
        toast.error("Room information is missing. Please refresh the page and try again.");
        return;
      }
      
      // Create booking record in Supabase
      const { data: booking, error } = await supabaseClient
        .from("bookings")
        .insert({
          room_id: roomId,
          package_id: data.packageId || null,
          guest_name: data.name,
          guest_email: data.email,
          guest_phone: data.phone, // Added guest_phone field
          check_in_date: checkInDate.toISOString(),
          check_out_date: checkOutDate.toISOString(),
          adults: data.adults,
          children: data.children,
          total_price: totalPrice,
          special_requests: data.specialRequests,
          status: "pending",
          payment_status: "unpaid"
        })
        .select()
        .single();
      
      if (error) {
        throw error;
      }

      console.log("Booking created:", booking);
      
      // Store booking ID with the correct key for the payment page
      localStorage.setItem("bookingId", booking.id);
      
      // Send confirmation email via our API endpoint
      try {
        toast.loading("Sending confirmation email...");
        
        const emailResponse = await fetch('/api/email', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            bookingId: booking.id,
            emailType: 'confirmation'
          }),
        });
        
        const emailResult = await emailResponse.json();
        
        toast.dismiss();
        
        if (emailResult.success) {
          console.log("Confirmation email sent successfully");
          toast.success("Booking confirmation email sent!");
        } else {
          console.error("Failed to send confirmation email:", emailResult.error);
          toast.error("Could not send confirmation email, but your booking is still created.");
        }
      } catch (emailError) {
        toast.dismiss();
        console.error("Error sending confirmation email:", emailError);
        toast.error("Could not send confirmation email, but your booking is still created.");
        // Don't stop the booking process if email fails
      }
      
      // Show success message
      toast.success("Booking successful! Redirecting to payment...");
      
      // Redirect to payment page instead of just showing step 3
      router.push(`/reservations/${roomId}/payment`);
      
    } catch (error: any) {
      console.error("Error creating booking:", error);
      toast.error(error.message || "Failed to create booking. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto py-12 px-4 text-center">
        <div className="flex flex-col items-center justify-center">
          <svg className="animate-spin -ml-1 mr-3 h-10 w-10 text-yellow-800" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <p className="mt-4 text-lg">Loading booking details...</p>
        </div>
      </div>
    );
  }

  if (!room) {
    return (
      <div className="container mx-auto py-12 px-4 text-center">
        <h1 className="text-2xl font-semibold text-red-600">Room not found</h1>
        <Button 
          className="mt-4 bg-yellow-700 hover:bg-yellow-800"
          onClick={() => router.push("/reservations")}
        >
          Back to Reservations
        </Button>
      </div>
    );
  }
  
  // Render reservation steps
  const renderStepContent = () => {
    switch (step) {
      case 1: // Room Details and Package Selection
        return (
          <>
            {/* Navigation Breadcrumbs */}
            <div className="mb-8 overflow-hidden">
              <div className="flex items-center w-full">
                <div className="flex items-center flex-1">
                  <div className="w-8 h-8 rounded-full bg-yellow-700 text-white flex items-center justify-center font-bold">1</div>
                  <div className="ml-2 font-medium">Room Details</div>
                </div>
                <div className="flex-1 h-1 bg-gray-200">
                  <div className="h-full bg-gray-200"></div>
                </div>
                <div className="flex items-center flex-1">
                  <div className="w-8 h-8 rounded-full bg-gray-200 text-gray-600 flex items-center justify-center font-bold">2</div>
                  <div className="ml-2 font-medium text-gray-600">Guest Details</div>
                </div>
                <div className="flex-1 h-1 bg-gray-200">
                  <div className="h-full bg-gray-200"></div>
                </div>
                <div className="flex items-center flex-1">
                  <div className="w-8 h-8 rounded-full bg-gray-200 text-gray-600 flex items-center justify-center font-bold">3</div>
                  <div className="ml-2 font-medium text-gray-600">Payment</div>
                </div>
              </div>
            </div>
          
            {/* Room Detail Main Section */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-10">
              {/* Left Column: Room Image and Gallery */}
              <div className="md:col-span-2">
                <div className="relative h-[400px] rounded-xl overflow-hidden mb-4">
                  <Image 
                    src={room.image_url || "/images/room-placeholder.jpg"} 
                    alt={room.name}
                    fill
                    className="object-cover"
                    priority
                  />
                  <div className="absolute top-4 right-4">
                    <Badge className="bg-yellow-700 hover:bg-yellow-800 text-white border-0 text-sm px-3 py-1">
                      {room.capacity || 2} {(room.capacity || 2) === 1 ? 'Guest' : 'Guests'}
                    </Badge>
                  </div>
                </div>
                
                {/* Room Details Tabs */}
                <Tabs defaultValue="details" value={activeTab} onValueChange={setActiveTab} className="w-full">
                  <TabsList className="grid grid-cols-3 mb-6">
                    <TabsTrigger value="details">Details</TabsTrigger>
                    <TabsTrigger value="amenities">Amenities</TabsTrigger>
                    <TabsTrigger value="reviews">Reviews</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="details" className="mt-0">
                    <div className="bg-white rounded-lg p-6 border">
                      <h2 className="text-2xl font-bold text-gray-800 mb-4">{room.name}</h2>
                      <div className="flex items-center mb-4">
                        <div className="flex mr-2">
                          {[...Array(5)].map((_, i) => (
                            <svg key={i} className={`w-4 h-4 ${i < Math.floor(averageRating) ? 'text-yellow-400' : 'text-gray-300'}`} 
                                fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path>
                            </svg>
                          ))}
                        </div>
                        <p className="text-sm text-gray-500">{averageRating} • {reviewsCount} reviews</p>
                      </div>
                      
                      <p className="text-gray-600 mb-6">{room.description}</p>
                      
                      <div className="grid grid-cols-2 gap-4 mb-6">
                        <div className="flex items-center">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-yellow-700 mr-2" viewBox="0 0 20 20" fill="currentColor">
                            <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
                          </svg>
                          <span>Max {room.capacity || 2} guests</span>
                        </div>
                        <div className="flex items-center">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-yellow-700 mr-2" viewBox="0 0 20 20" fill="currentColor">
                            <path d="M7 3a1 1 0 000 2h6a1 1 0 100-2H7zM4 7a1 1 0 011-1h10a1 1 0 110 2H5a1 1 0 01-1-1zM2 11a2 2 0 012-2h12a2 2 0 012 2v4a2 2 0 01-2 2H4a2 2 0 01-2-2v-4z" />
                          </svg>
                          <span>King-size bed</span>
                        </div>
                        <div className="flex items-center">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-yellow-700 mr-2" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                          </svg>
                          <span>Prime Location</span>
                        </div>
                        <div className="flex items-center">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-yellow-700 mr-2" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M5 2a1 1 0 011 1v1h1a1 1 0 010 2H6v1a1 1 0 01-2 0V6H3a1 1 0 010-2h1V3a1 1 0 011-1zm0 10a1 1 0 011 1v1h1a1 1 0 110 2H6v1a1 1 0 11-2 0v-1H3a1 1 0 110-2h1v-1a1 1 0 011-1zM18 11a1 1 0 011 1v1h1a1 1 0 110 2h-1v1a1 1 0 11-2 0v-1h-1a1 1 0 110-2h1v-1a1 1 0 011-1z" clipRule="evenodd" />
                          </svg>
                          <span>Luxury Room</span>
                        </div>
                      </div>
                      
                      <div className="border-t border-gray-200 pt-6 mt-6">
                        <h3 className="font-semibold text-lg mb-3">Room Policy</h3>
                        <ul className="space-y-2 text-sm text-gray-600">
                          <li className="flex items-start">
                            <svg className="h-5 w-5 text-green-500 mr-2 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                            </svg>
                            <span>Check-in from 2:00 PM, check-out by 12:00 PM</span>
                          </li>
                          <li className="flex items-start">
                            <svg className="h-5 w-5 text-green-500 mr-2 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                            </svg>
                            <span>Free cancellation up to 24 hours before check-in</span>
                          </li>
                          <li className="flex items-start">
                            <svg className="h-5 w-5 text-green-500 mr-2 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                            </svg>
                            <span>No smoking allowed in room</span>
                          </li>
                        </ul>
                      </div>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="amenities" className="mt-0">
                    <div className="bg-white rounded-lg p-6 border">
                      <h2 className="text-xl font-semibold mb-4">Room Amenities</h2>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        {roomAmenities.map((amenity, index) => (
                          <div key={index} className="flex items-center">
                            <svg className="h-5 w-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                            </svg>
                            <span>{amenity}</span>
                          </div>
                        ))}
                        
                        {/* If no amenities are provided, show some defaults */}
                        {roomAmenities.length === 0 && [
                          "Free Wi-Fi", "Air Conditioning", "Flat-screen TV", 
                          "Private Bathroom", "Mini Bar", "Coffee Maker",
                          "In-room Safe", "Hairdryer", "Ironing Facilities"
                        ].map((amenity, index) => (
                          <div key={index} className="flex items-center">
                            <svg className="h-5 w-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                            </svg>
                            <span>{amenity}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="reviews" className="mt-0">
                    <div className="bg-white rounded-lg p-6 border">
                      <div className="flex items-center justify-between mb-6">
                        <h2 className="text-xl font-semibold">Guest Reviews</h2>
                        <div className="flex items-center">
                          <div className="bg-green-100 text-green-800 px-3 py-1 rounded-lg font-bold mr-2">
                            {averageRating}
                          </div>
                          <span className="text-sm text-gray-500">{reviewsCount} reviews</span>
                        </div>
                      </div>
                      
                      {/* Dummy reviews */}
                      <div className="space-y-6">
                        {[
                          {
                            name: "John D.",
                            date: "March 2025",
                            rating: 5,
                            comment: "Exceptional room with stunning views. The bed was incredibly comfortable and the staff was very attentive."
                          },
                          {
                            name: "Sarah M.",
                            date: "February 2025",
                            rating: 4,
                            comment: "Great location and beautiful room. Would definitely stay here again! The only minor issue was the noise from the street in the evening."
                          },
                          {
                            name: "Michael K.",
                            date: "January 2025",
                            rating: 5,
                            comment: "Absolutely loved our stay. The room was spotless and the amenities were top-notch. Will be recommending to friends and family."
                          }
                        ].map((review, index) => (
                          <div key={index} className="border-b border-gray-200 pb-5 last:border-0 last:pb-0">
                            <div className="flex justify-between">
                              <div>
                                <h3 className="font-semibold">{review.name}</h3>
                                <p className="text-sm text-gray-500">{review.date}</p>
                              </div>
                              <div className="flex items-center">
                                {[...Array(5)].map((_, i) => (
                                  <svg key={i} className={`w-4 h-4 ${i < review.rating ? 'text-yellow-400' : 'text-gray-300'}`} 
                                      fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path>
                                  </svg>
                                ))}
                              </div>
                            </div>
                            <p className="mt-2 text-gray-600">{review.comment}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>
              </div>
              
              {/* Right Column: Booking Summary */}
              <div className="md:col-span-1">
                <div className="bg-white p-6 rounded-lg border sticky top-24">
                  <h2 className="text-xl font-bold text-yellow-800 border-b pb-4 mb-4">Price Details</h2>
                  
                  <div className="flex justify-between mb-2">
                    <span className="font-medium">KES {room.price?.toLocaleString()}</span>
                    <span>per night</span>
                  </div>
                  
                  {checkInDate && checkOutDate && (
                    <>
                      <div className="border-t border-dashed pt-4 mt-4">
                        <div className="flex justify-between mb-2">
                          <span>KES {room.price?.toLocaleString()} × {nights} nights</span>
                          <span className="font-medium">KES {(room.price * nights).toLocaleString()}</span>
                        </div>
                        
                        {selectedPackage && (
                          <div className="flex justify-between mb-2 text-yellow-800">
                            <span>{selectedPackage.name} package</span>
                            <span className="font-medium">+ KES {(selectedPackage.price_addon * nights).toLocaleString()}</span>
                          </div>
                        )}
                        
                        <div className="border-t pt-4 mt-4">
                          <div className="flex justify-between text-lg font-bold">
                            <span>Total</span>
                            <span>KES {totalPrice.toLocaleString()}</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="mt-6">
                        <h3 className="font-semibold mb-2">Your stay</h3>
                        <div className="bg-gray-50 p-3 rounded-md text-sm">
                          <div className="flex justify-between mb-1">
                            <span className="text-gray-600">Check-in</span>
                            <span className="font-medium">{format(checkInDate, "EEE, MMM d, yyyy")}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Check-out</span>
                            <span className="font-medium">{format(checkOutDate, "EEE, MMM d, yyyy")}</span>
                          </div>
                          <div className="flex justify-between mt-2 pt-1 border-t border-gray-200">
                            <span className="text-gray-600">Guests</span>
                            <span className="font-medium">{guestCount.adults} adults, {guestCount.children} children</span>
                          </div>
                        </div>
                      </div>
                    </>
                  )}
                  
                  <Button 
                    className="w-full mt-6 bg-yellow-700 hover:bg-yellow-800"
                    size="lg"
                    onClick={() => navigateToStep(2)}
                    disabled={!checkInDate || !checkOutDate}
                  >
                    Reserve Now
                  </Button>
                  
                  <p className="text-xs text-center text-gray-500 mt-4">You won't be charged yet</p>
                </div>
              </div>
            </div>

            {/* Package Selection */}
            <h2 className="text-2xl font-semibold mb-4">Enhance Your Stay (Optional)</h2>
            {packages.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                {/* No Package Option */}
                <Card 
                  key="no-package" 
                  className={`cursor-pointer transition-all ${
                    !form.getValues("packageId") ? "border-2 border-yellow-500 shadow-lg" : "hover:shadow-md hover:border-yellow-200"
                  }`}
                  onClick={() => {
                    form.setValue("packageId", "");
                    handlePackageSelect("");
                  }}
                >
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-center">
                      <CardTitle className="text-lg">Standard Room Only</CardTitle>
                      {!form.getValues("packageId") && (
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5 text-yellow-600">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                      )}
                    </div>
                    <CardDescription className="text-lg font-medium text-gray-600">
                      No additional cost
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600">Basic room accommodation without any additional packages or upgrades.</p>
                  </CardContent>
                </Card>
                
                {/* Package Options */}
                {packages.map((pkg) => (
                  <Card 
                    key={pkg.id} 
                    className={`cursor-pointer transition-all ${
                      form.getValues("packageId") === pkg.id ? "border-2 border-yellow-500 shadow-lg" : "hover:shadow-md hover:border-yellow-200"
                    }`}
                    onClick={() => {
                      form.setValue("packageId", pkg.id);
                      handlePackageSelect(pkg.id);
                    }}
                  >
                    <CardHeader className="pb-2">
                      <div className="flex justify-between items-center">
                        <CardTitle className="text-lg">{pkg.name}</CardTitle>
                        {form.getValues("packageId") === pkg.id && (
                          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5 text-yellow-600">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                        )}
                      </div>
                      <CardDescription className="text-lg font-medium text-yellow-800">
                        + KES {pkg.price_addon.toLocaleString()}/night
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <p className="text-gray-600">{pkg.description}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg mb-8">
                <div className="flex items-center text-yellow-800">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                  <span className="font-medium">No package options are currently available. You can continue with the standard booking.</span>
                </div>
              </div>
            )}
            
            <div className="flex justify-between mt-8">
              <Button 
                variant="outline" 
                onClick={() => router.push("/reservations")}
              >
                Back to Rooms
              </Button>
              <Button 
                onClick={() => navigateToStep(2)}
                className="bg-yellow-700 hover:bg-yellow-800"
              >
                Continue to Guest Details
              </Button>
            </div>
          </>
        );
        
      case 2: // Guest Information
        return (
          <>
            {/* Navigation Breadcrumbs */}
            <div className="mb-8 overflow-hidden">
              <div className="flex items-center w-full">
                <div className="flex items-center flex-1">
                  <div className="w-8 h-8 rounded-full bg-green-600 text-white flex items-center justify-center font-bold">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-2 font-medium">Room Details</div>
                </div>
                <div className="flex-1 h-1 bg-green-600">
                  <div className="h-full bg-green-600"></div>
                </div>
                <div className="flex items-center flex-1">
                  <div className="w-8 h-8 rounded-full bg-yellow-700 text-white flex items-center justify-center font-bold">2</div>
                  <div className="ml-2 font-medium">Guest Details</div>
                </div>
                <div className="flex-1 h-1 bg-gray-200">
                  <div className="h-full bg-gray-200"></div>
                </div>
                <div className="flex items-center flex-1">
                  <div className="w-8 h-8 rounded-full bg-gray-200 text-gray-600 flex items-center justify-center font-bold">3</div>
                  <div className="ml-2 font-medium text-gray-600">Payment</div>
                </div>
              </div>
            </div>
            
            {/* Booking Summary */}
            <Card className="mb-8">
              <CardHeader>
                <CardTitle>Booking Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span>{room.name}</span>
                    <span className="font-medium">KES {(room.price * nights).toLocaleString()}</span>
                  </div>
                  {selectedPackage && (
                    <div className="flex justify-between text-yellow-800">
                      <span>{selectedPackage.name} Package</span>
                      <span className="font-medium">KES {(selectedPackage.price_addon * nights).toLocaleString()}</span>
                    </div>
                  )}
                  <div className="pt-2 border-t">
                    <div className="flex justify-between text-lg font-bold">
                      <span>Total</span>
                      <span>KES {totalPrice.toLocaleString()}</span>
                    </div>
                    <div className="text-sm text-gray-600 mt-1">
                      {checkInDate && checkOutDate && (
                        <div className="flex justify-between">
                          <span>
                            {format(checkInDate, "PP")} to {format(checkOutDate, "PP")} • {nights} nights
                          </span>
                          <span>{guestCount.adults} adults, {guestCount.children} children</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Guest Information Form */}
            <h2 className="text-2xl font-semibold mb-4">Guest Information</h2>
            <div className="bg-white p-6 rounded-lg shadow-md mb-8">
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <div className="grid grid-cols-1 gap-4">
                    <div>
                      <Label htmlFor="name">Full Name</Label>
                      <Input
                        id="name"
                        placeholder="Enter your full name"
                        {...form.register("name", { required: "Name is required" })}
                      />
                      {form.formState.errors.name && <p className="text-sm text-red-500 mt-1">{form.formState.errors.name.message}</p>}
                    </div>
                    <div>
                      <Label htmlFor="email">Email Address</Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="Enter your email address"
                        {...form.register("email", { 
                          required: "Email is required",
                          pattern: {
                            value: /\S+@\S+\.\S+/,
                            message: "Please enter a valid email address"
                          }
                        })}
                      />
                      {form.formState.errors.email && <p className="text-sm text-red-500 mt-1">{form.formState.errors.email.message}</p>}
                    </div>
                    <div>
                      <Label htmlFor="phone">Phone Number</Label>
                      <Input
                        id="phone"
                        placeholder="Enter your phone number"
                        {...form.register("phone", { 
                          required: "Phone number is required",
                          pattern: {
                            value: /^[+]?[(]?[0-9]{3}[)]?[-\s.]?[0-9]{3}[-\s.]?[0-9]{4,6}$/,
                            message: "Please enter a valid phone number"
                          }
                        })}
                      />
                      {form.formState.errors.phone && <p className="text-sm text-red-500 mt-1">{form.formState.errors.phone.message}</p>}
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="adults"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Adults</FormLabel>
                          <FormControl>
                            <Input type="number" min={1} {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="children"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Children</FormLabel>
                          <FormControl>
                            <Input type="number" min={0} {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <FormField
                    control={form.control}
                    name="specialRequests"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Special Requests</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Any special requests or requirements..."
                            className="resize-none"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="flex flex-col space-y-4 md:flex-row md:space-y-0 md:space-x-4 md:justify-between">
                    <Button 
                      type="button" 
                      variant="outline"
                      onClick={() => navigateToStep(1)}
                    >
                      Back to Packages
                    </Button>
                    <Button 
                      type="submit" 
                      className="bg-yellow-700 hover:bg-yellow-800"
                      disabled={!checkInDate || !checkOutDate || isSubmitting}
                    >
                      {isSubmitting ? (
                        <>
                          <svg className="animate-spin -ml-1 mr-3 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Processing...
                        </>
                      ) : "Proceed to Payment"}
                    </Button>
                  </div>
                </form>
              </Form>
            </div>
          </>
        );
      default:
        return null;
    }
  };

  return (
    <div className="container mx-auto py-12 px-4">
      <h1 className="text-3xl font-bold text-yellow-800 mb-6">Complete Your Booking</h1>
      {renderStepContent()}
    </div>
  );
}