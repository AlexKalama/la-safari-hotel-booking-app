"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { supabaseClient } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";

// Type definitions for our data
type Room = {
  id: string;
  name: string;
  description: string;
  price: number;
  amenities: string[];
  image_url: string;
  capacity: number;
};

export default function RoomsPage() {
  const router = useRouter();
  const [rooms, setRooms] = useState<Room[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);

  useEffect(() => {
    const fetchRooms = async () => {
      try {
        setIsLoading(true);
        const { data, error } = await supabaseClient
          .from("rooms")
          .select("*")
          .order("created_at", { ascending: false });

        if (error) {
          throw error;
        }
        
        // Parse amenities if they're stored as JSON string
        const processedRooms = (data || []).map(room => ({
          ...room,
          amenities: room.amenities ? 
            (typeof room.amenities === 'string' ? 
              JSON.parse(room.amenities) : room.amenities) : []
        }));
        
        setRooms(processedRooms);
      } catch (error) {
        console.error("Error fetching rooms:", error);
        toast.error("Failed to load rooms. Please try again later.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchRooms();
  }, []);

  const handleBookNow = (room: Room) => {
    // Store selected room in local storage
    localStorage.setItem("selectedRoom", JSON.stringify(room));
    // Navigate to reservations page
    router.push("/reservations");
  };

  const handleViewDetails = (room: Room) => {
    setSelectedRoom(room);
  };

  return (
    <div className="container mx-auto py-12 px-4">
      <div className="max-w-3xl mx-auto text-center mb-12">
        <h1 className="text-4xl font-bold text-yellow-800 mb-4">Our Luxurious Rooms</h1>
        <p className="text-gray-600">
          Experience comfort and elegance in our carefully designed rooms. 
          Each room offers a unique atmosphere with modern amenities to make your stay memorable.
        </p>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(3)].map((_, index) => (
            <Card key={index} className="overflow-hidden">
              <Skeleton className="h-56 w-full" />
              <CardHeader>
                <Skeleton className="h-6 w-3/4 mb-2" />
                <Skeleton className="h-4 w-1/2" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-2/3" />
              </CardContent>
              <CardFooter>
                <Skeleton className="h-10 w-full" />
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {rooms.map((room) => (
            <Card key={room.id} className="overflow-hidden flex flex-col h-full hover:shadow-lg transition-shadow">
              <div className="h-56 relative">
                <Image
                  src={room.image_url || "/images/room-placeholder.jpg"}
                  alt={room.name}
                  fill
                  className="object-cover"
                />
              </div>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-xl">{room.name}</CardTitle>
                    <CardDescription className="text-lg font-semibold text-yellow-800 mt-1">
                      KES {room.price.toLocaleString()}/night
                    </CardDescription>
                  </div>
                  <Badge variant="outline" className="flex items-center gap-1">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-users">
                      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                      <circle cx="9" cy="7" r="4" />
                      <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
                      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                    </svg>
                    {room.capacity}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="flex-grow">
                <p className="text-gray-600 line-clamp-3 mb-4">{room.description}</p>
                {room.amenities && room.amenities.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {room.amenities.slice(0, 3).map((amenity, index) => (
                      <Badge key={index} variant="secondary" className="text-xs">
                        {amenity}
                      </Badge>
                    ))}
                    {room.amenities.length > 3 && (
                      <Badge variant="secondary" className="text-xs">
                        +{room.amenities.length - 3} more
                      </Badge>
                    )}
                  </div>
                )}
              </CardContent>
              <CardFooter className="pt-2 gap-2 grid grid-cols-2">
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="outline" onClick={() => handleViewDetails(room)}>
                      View Details
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-3xl">
                    <DialogHeader>
                      <DialogTitle className="text-2xl">{room.name}</DialogTitle>
                      <DialogDescription className="text-lg font-semibold text-yellow-800">
                        KES {room.price.toLocaleString()}/night
                      </DialogDescription>
                    </DialogHeader>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-4">
                      <div className="relative h-60 md:h-full rounded-md overflow-hidden">
                        <Image
                          src={room.image_url || "/images/room-placeholder.jpg"}
                          alt={room.name}
                          fill
                          className="object-cover"
                        />
                      </div>
                      
                      <div className="space-y-4">
                        <p>{room.description}</p>
                        
                        <div>
                          <h3 className="font-medium mb-2">Room Details:</h3>
                          <ul className="grid grid-cols-2 gap-y-1">
                            <li className="flex items-center gap-2 text-sm">
                              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-yellow-700">
                                <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                                <circle cx="9" cy="7" r="4" />
                                <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
                                <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                              </svg>
                              Capacity: {room.capacity} persons
                            </li>
                          </ul>
                        </div>
                        
                        <div>
                          <h3 className="font-medium mb-2">Amenities:</h3>
                          <div className="grid grid-cols-2 gap-1">
                            {room.amenities && room.amenities.map((amenity, index) => (
                              <div key={index} className="flex items-center gap-2 text-sm">
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-green-600">
                                  <polyline points="20 6 9 17 4 12" />
                                </svg>
                                {amenity}
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <Separator />
                    
                    <DialogFooter className="sm:justify-start">
                      <Button 
                        className="w-full sm:w-auto bg-yellow-700 hover:bg-yellow-800"
                        onClick={() => {
                          handleBookNow(room);
                        }}
                      >
                        Book This Room
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
                
                <Button 
                  className="bg-yellow-700 hover:bg-yellow-800"
                  onClick={() => handleBookNow(room)}
                >
                  Book Now
                </Button>
              </CardFooter>
            </Card>
          ))}
          
          {rooms.length === 0 && !isLoading && (
            <div className="col-span-full flex flex-col items-center justify-center p-8 text-center">
              <p className="text-gray-500 mb-4">No rooms are currently available.</p>
              <p className="text-sm text-gray-400">Please check back later or contact us for assistance.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
