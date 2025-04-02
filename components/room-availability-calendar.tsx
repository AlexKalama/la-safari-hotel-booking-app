"use client";

import { useEffect, useState } from "react";
import { format, addDays, isSameDay, isWithinInterval, parseISO } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { supabaseClient } from "@/lib/supabase";

type Booking = {
  check_in_date: string;
  check_out_date: string;
  status: string;
};

type RoomAvailabilityCalendarProps = {
  roomId: string;
  selectedCheckIn: Date | undefined;
  selectedCheckOut: Date | undefined;
  onCheckInChange: (date: Date | undefined) => void;
  onCheckOutChange: (date: Date | undefined) => void;
};

export function RoomAvailabilityCalendar({
  roomId,
  selectedCheckIn,
  selectedCheckOut,
  onCheckInChange,
  onCheckOutChange,
}: RoomAvailabilityCalendarProps) {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [checkoutCalendarDefaultMonth, setCheckoutCalendarDefaultMonth] = useState<Date | undefined>(undefined);

  useEffect(() => {
    const fetchAvailability = async () => {
      setIsLoading(true);
      try {
        const response = await fetch(`/api/availability?roomId=${roomId}`);
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || "Failed to fetch availability");
        }

        setBookings(data.bookings);
      } catch (err: any) {
        setError(err.message || "Error fetching availability");
        console.error("Error fetching room availability:", err);
      } finally {
        setIsLoading(false);
      }
    };

    if (roomId) {
      fetchAvailability();
    }
  }, [roomId]);

  useEffect(() => {
    // When check-in date changes, set the default month for check-out calendar
    if (selectedCheckIn) {
      setCheckoutCalendarDefaultMonth(selectedCheckIn);
    }
  }, [selectedCheckIn]);

  // Create a function to check if a date is booked
  const isDateBooked = (date: Date) => {
    return bookings.some((booking) => {
      const checkIn = parseISO(booking.check_in_date);
      const checkOut = parseISO(booking.check_out_date);
      
      // Check if the date falls within any booking interval (inclusive of check-in, exclusive of check-out)
      return isWithinInterval(date, { start: checkIn, end: addDays(checkOut, -1) });
    });
  };

  // Function to handle check-in date selection
  const handleCheckInSelect = (date: Date | undefined) => {
    onCheckInChange(date);
    // If check-out date is before or same as new check-in date, reset it
    if (date && selectedCheckOut && (selectedCheckOut <= date)) {
      onCheckOutChange(undefined);
    }
  };

  // Function to handle check-out date selection
  const handleCheckOutSelect = (date: Date | undefined) => {
    // Ensure the check-out date is after check-in
    if (date && selectedCheckIn && date > selectedCheckIn) {
      // Check if any date in the range is booked
      let hasBookedDateInRange = false;
      let currentDate = addDays(selectedCheckIn, 1);
      
      while (currentDate <= date) {
        if (isDateBooked(currentDate)) {
          hasBookedDateInRange = true;
          break;
        }
        currentDate = addDays(currentDate, 1);
      }

      if (!hasBookedDateInRange) {
        onCheckOutChange(date);
      } else {
        // Alert the user if there's an overlapping booking
        alert("There's already a booking in your selected date range. Please choose different dates.");
      }
    } else if (date) {
      onCheckOutChange(date);
    }
  };

  return (
    <div className="flex flex-col md:flex-row gap-6">
      {/* Check-in Date Selector */}
      <div className="flex-1">
        <label className="block text-sm font-medium mb-2">
          Check-in Date
        </label>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={`w-full justify-start text-left font-normal ${
                isLoading ? "opacity-50 cursor-not-allowed" : ""
              }`}
              disabled={isLoading}
            >
              {isLoading ? (
                <span className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-yellow-800" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Loading availability...
                </span>
              ) : selectedCheckIn ? (
                format(selectedCheckIn, "PPP")
              ) : (
                "Select check-in date"
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0">
            <Calendar
              mode="single"
              selected={selectedCheckIn}
              onSelect={handleCheckInSelect}
              disabled={(date: Date) => {
                // Disable past dates
                const today = new Date();
                today.setHours(0, 0, 0, 0);
                if (date < today) return true;
                
                // Disable booked dates
                return isDateBooked(date);
              }}
              modifiers={{
                booked: (date: Date) => isDateBooked(date),
              }}
              className="rounded-md border"
              modifiersClassNames={{
                booked: "bg-red-100 text-red-800 opacity-60",
              }}
            />
          </PopoverContent>
        </Popover>
      </div>

      {/* Check-out Date Selector */}
      <div className="flex-1">
        <label className="block text-sm font-medium mb-2">
          Check-out Date
        </label>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={`w-full justify-start text-left font-normal ${
                isLoading || !selectedCheckIn ? "opacity-50 cursor-not-allowed" : ""
              }`}
              disabled={isLoading || !selectedCheckIn}
            >
              {isLoading ? (
                <span className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-yellow-800" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Loading availability...
                </span>
              ) : selectedCheckOut ? (
                format(selectedCheckOut, "PPP")
              ) : (
                "Select check-out date"
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0">
            <Calendar
              mode="single"
              selected={selectedCheckOut}
              onSelect={handleCheckOutSelect}
              defaultMonth={checkoutCalendarDefaultMonth}
              disabled={(date: Date) => {
                // Ensure check-out is after check-in
                if (!selectedCheckIn || date <= selectedCheckIn) return true;
                
                // Calculate if there's any booked date between check-in and check-out
                let currentDate = addDays(selectedCheckIn, 1);
                while (currentDate < date) {
                  if (isDateBooked(currentDate)) return true;
                  currentDate = addDays(currentDate, 1);
                }
                
                // Also disable the check-out date if it's booked
                return isDateBooked(date);
              }}
              modifiers={{
                booked: (date: Date) => isDateBooked(date),
              }}
              className="rounded-md border"
              modifiersClassNames={{
                booked: "bg-red-100 text-red-800 opacity-60",
              }}
            />
          </PopoverContent>
        </Popover>
      </div>
    </div>
  );
}
