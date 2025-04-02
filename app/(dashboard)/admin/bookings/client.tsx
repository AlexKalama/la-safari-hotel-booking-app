"use client";

import React from "react";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { 
  Select, 
  SelectContent, 
  SelectGroup, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { CalendarIcon, ArrowUpDown, User, Mail, Home, Package, Clock, CreditCard, CalendarCheck, CalendarX } from "lucide-react";
import { Booking } from "./actions";
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from "@/components/ui/dialog";

interface BookingsClientProps {
  initialBookings: Booking[];
}

export function BookingsClient({ initialBookings }: BookingsClientProps) {
  const [searchTerm, setSearchTerm] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState("all");
  const [sortField, setSortField] = React.useState("created_at");
  const [sortDirection, setSortDirection] = React.useState("desc");
  const [currentPage, setCurrentPage] = React.useState(1);
  const [selectedBooking, setSelectedBooking] = React.useState<Booking | null>(null);
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);
  const bookingsPerPage = 10;

  // Filter and sort bookings
  const filteredBookings = React.useMemo(() => {
    return initialBookings
      .filter(booking => {
        const searchFields = [
          booking.id,
          booking.guest_name,
          booking.guest_email,
          booking.rooms?.name,
          booking.packages?.name
        ].filter(Boolean).join(" ").toLowerCase();
        
        const matchesSearch = !searchTerm || searchFields.includes(searchTerm.toLowerCase());
        const matchesStatus = statusFilter === "all" || booking.status === statusFilter;
        
        return matchesSearch && matchesStatus;
      })
      .sort((a: Booking, b: Booking) => {
        // Sorting
        let fieldA: any = a[sortField as keyof Booking];
        let fieldB: any = b[sortField as keyof Booking];
        
        // Handle dates
        if (sortField === "check_in_date" || sortField === "check_out_date" || sortField === "created_at") {
          fieldA = new Date(fieldA as string).getTime();
          fieldB = new Date(fieldB as string).getTime();
        }
        
        // Handle nested fields
        if (sortField === "room") {
          fieldA = a.rooms?.name;
          fieldB = b.rooms?.name;
        }
        
        if (sortField === "package") {
          fieldA = a.packages?.name;
          fieldB = b.packages?.name;
        }
        
        if (sortDirection === "asc") {
          return fieldA > fieldB ? 1 : -1;
        } else {
          return fieldA < fieldB ? 1 : -1;
        }
      });
  }, [initialBookings, searchTerm, statusFilter, sortField, sortDirection]);

  // Pagination
  const totalPages = Math.ceil(filteredBookings.length / bookingsPerPage);
  const startIndex = (currentPage - 1) * bookingsPerPage;
  const paginatedBookings = filteredBookings.slice(startIndex, startIndex + bookingsPerPage);
  
  // Sorting logic
  const toggleSort = (field: string) => {
    if (field === sortField) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };
  
  // Column header with sorting
  const SortableHeader = ({ field, title }: { field: string, title: string }) => {
    return (
      <div 
        className="flex items-center cursor-pointer select-none"
        onClick={() => toggleSort(field)}
      >
        {title}
        <ArrowUpDown className={`ml-1 h-4 w-4 ${sortField === field ? 'opacity-100' : 'opacity-30'}`} />
      </div>
    );
  };

  // Handle booking view/manage
  const handleViewBooking = (booking: Booking) => {
    setSelectedBooking(booking);
    setIsDialogOpen(true);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-amber-100 text-amber-800 border-amber-200 hover:bg-amber-100/80";
      case "confirmed":
        return "bg-emerald-100 text-emerald-800 border-emerald-200 hover:bg-emerald-100/80";
      case "cancelled":
        return "bg-rose-100 text-rose-800 border-rose-200 hover:bg-rose-100/80";
      case "completed":
        return "bg-sky-100 text-sky-800 border-sky-200 hover:bg-sky-100/80";
      default:
        return "bg-slate-100 text-slate-800 border-slate-200 hover:bg-slate-100/80";
    }
  };

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case "paid":
        return "bg-emerald-100 text-emerald-800 border-emerald-200 hover:bg-emerald-100/80";
      case "unpaid":
        return "bg-rose-100 text-rose-800 border-rose-200 hover:bg-rose-100/80";
      case "refunded":
        return "bg-slate-100 text-slate-800 border-slate-200 hover:bg-slate-100/80";
      default:
        return "bg-slate-100 text-slate-800 border-slate-200 hover:bg-slate-100/80";
    }
  };

  // Calculate nights and price per night
  const calculateDetails = (booking: Booking) => {
    const checkIn = new Date(booking.check_in_date);
    const checkOut = new Date(booking.check_out_date);
    const nights = Math.floor((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24));
    const pricePerNight = nights > 0 ? booking.total_price / nights : booking.total_price;
    
    return {
      nights,
      pricePerNight: Math.round(pricePerNight)
    };
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">Bookings</h1>
          <p className="text-gray-500 mt-1">View and manage all customer bookings</p>
        </div>
        <Button className="bg-indigo-600 hover:bg-indigo-700 text-white">Export Data</Button>
      </div>

      <div className="bg-white p-4 rounded-lg shadow-md">
        <div className="flex justify-between items-center mb-4 gap-4">
          <div className="flex-1">
            <Input
              placeholder="Search by guest, email, room..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-xs"
            />
          </div>
          <div className="w-40">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="border-slate-200">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="confirmed">Confirmed</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
        </div>
        
        <div className="rounded-md border border-slate-200 shadow-sm overflow-hidden">
          <Table>
            <TableHeader className="bg-slate-50">
              <TableRow>
                <TableHead className="w-16">#</TableHead>
                <TableHead><SortableHeader field="guest_name" title="Guest" /></TableHead>
                <TableHead><SortableHeader field="room" title="Room" /></TableHead>
                <TableHead><SortableHeader field="check_in_date" title="Check-in" /></TableHead>
                <TableHead><SortableHeader field="check_out_date" title="Check-out" /></TableHead>
                <TableHead><SortableHeader field="total_price" title="Total" /></TableHead>
                <TableHead><SortableHeader field="status" title="Status" /></TableHead>
                <TableHead><SortableHeader field="payment_status" title="Payment" /></TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedBookings.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} className="h-24 text-center">
                    No bookings found.
                  </TableCell>
                </TableRow>
              ) : (
                paginatedBookings.map((booking, index) => (
                  <TableRow key={booking.id} className="hover:bg-slate-50">
                    <TableCell className="font-medium">{startIndex + index + 1}</TableCell>
                    <TableCell>
                      <div className="font-medium text-slate-900">{booking.guest_name}</div>
                      <div className="text-sm text-slate-500">{booking.guest_email}</div>
                    </TableCell>
                    <TableCell>
                      <div className="font-medium text-slate-900">{booking.rooms?.name || "N/A"}</div>
                      {booking.packages?.name && (
                        <div className="text-xs text-slate-500">+{booking.packages.name}</div>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        <CalendarIcon className="mr-1 h-4 w-4 text-indigo-500" />
                        <span>{format(new Date(booking.check_in_date), "MMM d, yyyy")}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        <CalendarIcon className="mr-1 h-4 w-4 text-indigo-500" />
                        <span>{format(new Date(booking.check_out_date), "MMM d, yyyy")}</span>
                      </div>
                    </TableCell>
                    <TableCell className="font-medium">KES {booking.total_price.toLocaleString()}</TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(booking.status)}>
                        {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge className={getPaymentStatusColor(booking.payment_status)}>
                        {booking.payment_status.charAt(0).toUpperCase() + booking.payment_status.slice(1)}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="border-indigo-200 text-indigo-600 hover:bg-indigo-50"
                        onClick={() => handleViewBooking(booking)}
                      >
                        View
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
        
        {totalPages > 1 && (
          <div className="flex justify-between items-center mt-4">
            <div className="text-sm text-slate-500">
              Showing {startIndex + 1}-{Math.min(startIndex + bookingsPerPage, filteredBookings.length)} of {filteredBookings.length}
            </div>
            <div className="flex gap-1">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="border-slate-200 text-slate-700"
              >
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="border-slate-200 text-slate-700"
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Booking Details Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[900px]">
          {selectedBooking && (
            <>
              <DialogHeader>
                <DialogTitle className="text-xl font-bold flex items-center text-indigo-700">
                  <span className="mr-2">Booking Details</span>
                  <Badge className={getStatusColor(selectedBooking.status)}>
                    {selectedBooking.status.charAt(0).toUpperCase() + selectedBooking.status.slice(1)}
                  </Badge>
                </DialogTitle>
                <DialogDescription>
                  Booking ID: <span className="font-mono">{selectedBooking.id}</span>
                </DialogDescription>
              </DialogHeader>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-4">
                {/* Guest Information */}
                <div className="space-y-4">
                  <div className="border border-slate-200 rounded-md p-4 bg-slate-50">
                    <h3 className="font-semibold text-slate-900 mb-3 flex items-center">
                      <User className="w-4 h-4 mr-2 text-indigo-600" />
                      Guest Information
                    </h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-start">
                        <User className="w-4 h-4 mr-2 text-slate-500 mt-0.5" />
                        <div>
                          <div className="font-medium">{selectedBooking.guest_name}</div>
                          <div className="text-slate-500 flex items-center">
                            <Mail className="w-3 h-3 mr-1" />
                            {selectedBooking.guest_email}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Stay Details */}
                  <div className="border border-slate-200 rounded-md p-4 bg-slate-50">
                    <h3 className="font-semibold text-slate-900 mb-3 flex items-center">
                      <Home className="w-4 h-4 mr-2 text-indigo-600" />
                      Stay Details
                    </h3>
                    <div className="space-y-2 text-sm">
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <div className="text-slate-500">Room</div>
                          <div className="font-medium">{selectedBooking.rooms?.name || "N/A"}</div>
                        </div>
                        {selectedBooking.packages?.name && (
                          <div>
                            <div className="text-slate-500">Package</div>
                            <div className="font-medium">{selectedBooking.packages.name}</div>
                          </div>
                        )}
                        <div className="flex items-center">
                          <CalendarCheck className="w-4 h-4 mr-2 text-emerald-600" />
                          <div>
                            <div className="text-slate-500">Check-in</div>
                            <div className="font-medium">{format(new Date(selectedBooking.check_in_date), "PP")}</div>
                          </div>
                        </div>
                        <div className="flex items-center">
                          <CalendarX className="w-4 h-4 mr-2 text-rose-600" />
                          <div>
                            <div className="text-slate-500">Check-out</div>
                            <div className="font-medium">{format(new Date(selectedBooking.check_out_date), "PP")}</div>
                          </div>
                        </div>
                        <div>
                          <div className="text-slate-500">Nights</div>
                          <div className="font-medium">{calculateDetails(selectedBooking).nights}</div>
                        </div>
                        <div>
                          <div className="text-slate-500">Guests</div>
                          <div className="font-medium">2 Adults</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Payment Information */}
                <div className="space-y-4">
                  <div className="border border-slate-200 rounded-md p-4 bg-slate-50">
                    <h3 className="font-semibold text-slate-900 mb-3 flex items-center">
                      <CreditCard className="w-4 h-4 mr-2 text-indigo-600" />
                      Payment Information
                    </h3>
                    <div className="space-y-2 text-sm">
                      <div className="grid grid-cols-2 gap-y-2">
                        <div className="text-slate-500">Price per night</div>
                        <div className="font-medium text-right">KES {calculateDetails(selectedBooking).pricePerNight.toLocaleString()}</div>
                        
                        <div className="text-slate-500">Nights</div>
                        <div className="font-medium text-right">{calculateDetails(selectedBooking).nights}</div>
                        
                        {selectedBooking.packages?.name && (
                          <>
                            <div className="text-slate-500">Package fee</div>
                            <div className="font-medium text-right">KES 5,000</div>
                          </>
                        )}
                        
                        <div className="text-slate-500 font-medium pt-2 border-t">Total amount</div>
                        <div className="font-bold text-right text-indigo-700 pt-2 border-t">KES {selectedBooking.total_price.toLocaleString()}</div>
                        
                        <div className="text-slate-500">Payment status</div>
                        <div className="text-right">
                          <Badge className={getPaymentStatusColor(selectedBooking.payment_status)}>
                            {selectedBooking.payment_status.charAt(0).toUpperCase() + selectedBooking.payment_status.slice(1)}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Booking Dates */}
                  <div className="border border-slate-200 rounded-md p-4 bg-slate-50">
                    <h3 className="font-semibold text-slate-900 mb-3 flex items-center">
                      <Clock className="w-4 h-4 mr-2 text-indigo-600" />
                      Booking Timeline
                    </h3>
                    <div className="space-y-2 text-sm">
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <div className="text-slate-500">Booked on</div>
                          <div className="font-medium">{format(new Date(selectedBooking.created_at), "PPp")}</div>
                        </div>
                        <div>
                          <div className="text-slate-500">Last updated</div>
                          <div className="font-medium">{format(new Date(selectedBooking.updated_at), "PPp")}</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <DialogFooter className="flex justify-between items-center border-t pt-4">
                <div className="flex gap-2">
                  <Button 
                    variant="destructive" 
                    size="sm"
                    disabled={selectedBooking.status === "cancelled"}
                  >
                    Cancel Booking
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-indigo-200 text-indigo-600"
                  >
                    Send Receipt
                  </Button>
                </div>
                <Button 
                  className="bg-indigo-600 hover:bg-indigo-700"
                  onClick={() => setIsDialogOpen(false)}
                >
                  Close
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
