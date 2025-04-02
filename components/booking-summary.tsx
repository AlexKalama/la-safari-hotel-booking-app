"use client";

import { format } from "date-fns";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

interface BookingSummaryProps {
  room: any;
  package: any | null;
  checkInDate: Date;
  checkOutDate: Date;
  nights: number;
  adults: number;
  children: number;
  totalPrice: number;
}

export function BookingSummary({
  room,
  package: selectedPackage,
  checkInDate,
  checkOutDate,
  nights,
  adults,
  children,
  totalPrice,
}: BookingSummaryProps) {
  // Calculate base room price and package add-on
  const roomTotal = room ? room.price * nights : 0;
  const packageTotal = selectedPackage ? selectedPackage.price_addon * nights : 0;

  return (
    <Card className="border-yellow-200">
      <CardHeader className="bg-yellow-50 rounded-t-lg border-b border-yellow-100">
        <CardTitle className="text-xl">Booking Summary</CardTitle>
        <CardDescription>Review your reservation details</CardDescription>
      </CardHeader>
      <CardContent className="p-5 space-y-4">
        {/* Room Details */}
        <div>
          <h3 className="font-semibold text-lg">{room?.name || "Selected Room"}</h3>
          <p className="text-sm text-gray-600">{room?.description?.substring(0, 100)}...</p>
        </div>

        <Separator className="bg-gray-200" />

        {/* Dates */}
        <div className="space-y-2">
          <div className="flex justify-between">
            <span className="text-gray-600">Check-in</span>
            <span className="font-medium">{format(checkInDate, "EEE, MMM d, yyyy")}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Check-out</span>
            <span className="font-medium">{format(checkOutDate, "EEE, MMM d, yyyy")}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Total nights</span>
            <span className="font-medium">{nights}</span>
          </div>
        </div>

        <Separator className="bg-gray-200" />

        {/* Guests */}
        <div className="flex justify-between">
          <span className="text-gray-600">Guests</span>
          <span className="font-medium">{adults} adults, {children} children</span>
        </div>

        {/* Package Info */}
        {selectedPackage && (
          <>
            <Separator className="bg-gray-200" />
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">Selected Package</span>
                <span className="font-medium">{selectedPackage.name}</span>
              </div>
              <p className="text-sm text-gray-600">{selectedPackage.description}</p>
            </div>
          </>
        )}

        <Separator className="bg-gray-200" />

        {/* Price Breakdown */}
        <div className="space-y-2">
          <div className="flex justify-between">
            <span className="text-gray-600">Room rate ({nights} nights)</span>
            <span>KES {roomTotal.toLocaleString()}</span>
          </div>
          
          {selectedPackage && (
            <div className="flex justify-between">
              <span className="text-gray-600">{selectedPackage.name} ({nights} nights)</span>
              <span>+ KES {packageTotal.toLocaleString()}</span>
            </div>
          )}
          
          <div className="flex justify-between font-bold pt-2 text-lg">
            <span>Total</span>
            <span>KES {totalPrice.toLocaleString()}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
