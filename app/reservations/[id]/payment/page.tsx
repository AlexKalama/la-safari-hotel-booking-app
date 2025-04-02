"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabaseClient } from "@/lib/supabase";

export default function PaymentPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [booking, setBooking] = useState<any>(null);
  const [room, setRoom] = useState<any>(null);
  const [packageDetails, setPackageDetails] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);

  useEffect(() => {
    const fetchBookingData = async () => {
      try {
        const bookingId = localStorage.getItem("bookingId");
        
        if (!bookingId) {
          throw new Error("Booking ID not found");
        }

        const { data: bookingData, error: bookingError } = await supabaseClient
          .from("bookings")
          .select("*")
          .eq("id", bookingId)
          .single();

        if (bookingError) throw bookingError;
        setBooking(bookingData);

        // Fetch room details
        const { data: roomData, error: roomError } = await supabaseClient
          .from("rooms")
          .select("*")
          .eq("id", bookingData.room_id)
          .single();
          
        if (roomError) throw roomError;
        setRoom(roomData);

        // Fetch package details if selected
        if (bookingData.package_id) {
          const { data: packageData, error: packageError } = await supabaseClient
            .from("packages")
            .select("*")
            .eq("id", bookingData.package_id)
            .single();
            
          if (packageError) throw packageError;
          setPackageDetails(packageData);
        }
      } catch (error) {
        console.error("Error fetching booking data:", error);
        router.push("/reservations");
      } finally {
        setIsLoading(false);
      }
    };

    fetchBookingData();
  }, [router]);

  const handlePaymentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);

    try {
      // In a real application, you would integrate with a payment gateway here
      // For now, we'll simulate a successful payment
      
      // Update booking status in database
      const { error } = await supabaseClient
        .from("bookings")
        .update({
          payment_status: "paid",
          status: "confirmed",
          payment_id: "sim_" + Math.random().toString(36).substring(2, 15)
        })
        .eq("id", booking.id);

      if (error) throw error;

      // Send receipt email
      const emailResponse = await fetch('/api/email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          bookingId: booking.id,
          emailType: 'receipt'
        }),
      });
      
      const emailResult = await emailResponse.json();
      console.log("Email sending result:", emailResult);

      // Clear localStorage
      localStorage.removeItem("selectedRoom");
      localStorage.removeItem("checkInDate");
      localStorage.removeItem("checkOutDate");
      localStorage.removeItem("bookingId");

      // Show success dialog
      setShowSuccessDialog(true);
      
      // Don't navigate automatically - let the user see the success message first
    } catch (error) {
      console.error("Payment processing error:", error);
      alert("Payment failed. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto py-12 px-4 text-center">
        <p>Loading payment details...</p>
      </div>
    );
  }

  if (!booking || !room) {
    return (
      <div className="container mx-auto py-12 px-4 text-center">
        <h1 className="text-2xl font-semibold text-red-600">Booking information not found</h1>
        <Button 
          className="mt-4 bg-yellow-700 hover:bg-yellow-800"
          onClick={() => router.push("/reservations")}
        >
          Back to Reservations
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-12 px-4">
      <h1 className="text-3xl font-bold text-yellow-800 mb-6">Complete Your Payment</h1>
      
      {/* Success Dialog */}
      {showSuccessDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-8 rounded-lg shadow-xl max-w-md w-full">
            <div className="text-center">
              <div className="bg-green-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-yellow-800 mb-2">Booking Confirmed!</h2>
              <p className="text-gray-600 mb-4">
                Thank you for your booking at LA SAFARI HOTEL. A confirmation email has been sent to {booking?.guest_email}.
              </p>
              <p className="text-sm text-gray-500 mb-6">
                Your reservation is confirmed for {new Date(booking?.check_in_date).toLocaleDateString()} to {new Date(booking?.check_out_date).toLocaleDateString()}.
              </p>
              <p className="text-sm text-gray-500 mb-6">
                Booking Reference: <span className="font-mono font-medium">{booking?.id.substring(0, 8).toUpperCase()}</span>
              </p>
              <Button 
                className="w-full bg-yellow-700 hover:bg-yellow-800 text-white"
                onClick={() => router.push("/")}
              >
                Return to Homepage
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Booking Summary */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Booking Summary</CardTitle>
          <CardDescription>
            Booking reference: {booking.id.substring(0, 8).toUpperCase()}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h3 className="font-medium">Room:</h3>
            <p>{room.name}</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <h3 className="font-medium">Check-in:</h3>
              <p>{format(new Date(booking.check_in_date), "PPP")}</p>
            </div>
            <div>
              <h3 className="font-medium">Check-out:</h3>
              <p>{format(new Date(booking.check_out_date), "PPP")}</p>
            </div>
            <div>
              <h3 className="font-medium">Guests:</h3>
              <p>{booking.adults} Adults, {booking.children} Children</p>
            </div>
          </div>
          {packageDetails && (
            <div>
              <h3 className="font-medium">Package:</h3>
              <p>{packageDetails.name}</p>
            </div>
          )}
          <div className="pt-4 border-t">
            <h3 className="text-xl font-bold text-yellow-800">
              Total: KES {booking.total_price.toLocaleString()}
            </h3>
          </div>
        </CardContent>
      </Card>

      {/* Payment Methods */}
      <Tabs defaultValue="card" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="card">Pay with Card</TabsTrigger>
          <TabsTrigger value="mpesa">Pay with M-Pesa</TabsTrigger>
        </TabsList>
        <TabsContent value="card">
          <Card>
            <CardHeader>
              <CardTitle>Credit or Debit Card</CardTitle>
              <CardDescription>
                Enter your card details to complete the payment securely.
              </CardDescription>
            </CardHeader>
            <form onSubmit={handlePaymentSubmit}>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="card-number">Card Number</Label>
                  <Input id="card-number" placeholder="1234 5678 9012 3456" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="expiry">Expiry Date</Label>
                    <Input id="expiry" placeholder="MM/YY" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="cvc">CVC</Label>
                    <Input id="cvc" placeholder="123" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="name">Name on Card</Label>
                  <Input id="name" placeholder="J. Smith" />
                </div>
              </CardContent>
              <CardFooter>
                <Button 
                  type="submit" 
                  className="w-full bg-yellow-700 hover:bg-yellow-800"
                  disabled={isProcessing}
                >
                  {isProcessing ? "Processing..." : `Pay KES ${booking.total_price.toLocaleString()}`}
                </Button>
              </CardFooter>
            </form>
          </Card>
        </TabsContent>
        <TabsContent value="mpesa">
          <Card>
            <CardHeader>
              <CardTitle>M-Pesa Payment</CardTitle>
              <CardDescription>
                Pay using M-Pesa mobile money service.
              </CardDescription>
            </CardHeader>
            <form onSubmit={handlePaymentSubmit}>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="phone-number">Phone Number</Label>
                  <Input id="phone-number" placeholder="07XX XXX XXX" />
                  <p className="text-sm text-gray-500">
                    You will receive an STK push to complete the payment.
                  </p>
                </div>
              </CardContent>
              <CardFooter>
                <Button 
                  type="submit" 
                  className="w-full bg-green-600 hover:bg-green-700"
                  disabled={isProcessing}
                >
                  {isProcessing ? "Processing..." : `Pay KES ${booking.total_price.toLocaleString()} with M-Pesa`}
                </Button>
              </CardFooter>
            </form>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}