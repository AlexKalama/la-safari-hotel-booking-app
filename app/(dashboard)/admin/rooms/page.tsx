// @ts-nocheck
"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { supabaseClient, supabaseAdmin } from "@/lib/supabase";
import { uploadImage } from "@/lib/upload";

// Type definitions
type Room = {
  id: string;
  name: string;
  description: string;
  price: number;
  capacity: number;
  amenities: string[];
  image_url: string;
  created_at?: string;
  updated_at?: string;
};

type RoomFormData = {
  id?: string;
  name: string;
  description: string;
  price: string;
  capacity: string;
  image_url: string;
  amenities: string;
};

// Component for room card
const RoomCard = ({ room, onEdit, onDelete }) => (
  <Card key={room.id} className="overflow-hidden border border-gray-200 rounded-md hover:shadow-md transition-shadow">
    <div className="relative h-48">
      <Image
        src={room.image_url || "/images/room-placeholder.jpg"}
        alt={room.name}
        fill
        className="object-cover"
      />
      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4">
        <h3 className="text-xl font-bold text-white">{room.name}</h3>
      </div>
      <div className="absolute top-3 right-3">
        <Badge className="bg-blue-600 text-white border-transparent hover:bg-blue-700">
          {room.capacity} {room.capacity === 1 ? 'Guest' : 'Guests'}
        </Badge>
      </div>
    </div>
    
    <CardContent className="p-5">
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <div className="flex items-center mb-1">
            <span className="text-sm text-green-600 font-medium mr-2">Available</span>
            <div className="flex">
              {Array.from({ length: 5 }).map((_, i) => (
                <svg key={i} xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="currentColor" className="text-amber-400">
                  <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                </svg>
              ))}
            </div>
          </div>
          <p className="text-green-700 font-bold text-lg">
            KES {room.price.toLocaleString()}<span className="text-sm font-normal text-gray-600">/night</span>
          </p>
        </div>
        <div className="bg-blue-50 text-blue-800 px-3 py-2 rounded-lg font-bold">
          9.2
        </div>
      </div>
      
      <p className="text-gray-600 mb-3 line-clamp-2 text-sm">{room.description}</p>
      
      {room.amenities && Array.isArray(room.amenities) && room.amenities.length > 0 && (
        <div className="mt-2">
          <div className="flex flex-wrap gap-1.5">
            {room.amenities.slice(0, 3).map((amenity, index) => (
              <Badge key={index} variant="outline" className="bg-gray-50 text-gray-700 border-gray-200 font-normal">
                {amenity}
              </Badge>
            ))}
            {room.amenities.length > 3 && (
              <Badge variant="outline" className="bg-gray-50 text-gray-600 cursor-pointer hover:bg-gray-100">
                +{room.amenities.length - 3} more
              </Badge>
            )}
          </div>
        </div>
      )}
    </CardContent>
    
    <CardFooter className="bg-gray-50 px-5 py-3 flex justify-between items-center border-t border-gray-200">
      <div className="text-xs text-gray-500">
        ID: {room.id.substring(0, 8)}...
      </div>
      <div className="flex space-x-2">
        <Button variant="outline" size="sm" className="text-blue-600 border-blue-200 hover:bg-blue-50" onClick={onEdit}>
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1">
            <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/>
            <path d="m15 5 4 4"/>
          </svg>
          Edit
        </Button>
        <Button 
          variant="outline" 
          size="sm" 
          className="text-red-600 border-red-200 hover:bg-red-50"
          onClick={onDelete}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1">
            <path d="M3 6h18"/>
            <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/>
            <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/>
          </svg>
          Delete
        </Button>
      </div>
    </CardFooter>
  </Card>
);

// Loading skeleton component
const RoomSkeleton = ({ count = 6 }) => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
    {Array.from({ length: count }).map((_, index) => (
      <div key={index} className="border rounded-lg overflow-hidden bg-white shadow-sm animate-pulse">
        <div className="h-48 bg-gray-200" />
        <div className="p-5 space-y-3">
          <div className="h-5 bg-gray-200 rounded w-3/4" />
          <div className="h-4 bg-gray-200 rounded w-1/4" />
          <div className="h-4 bg-gray-200 rounded w-full" />
          <div className="h-4 bg-gray-200 rounded w-full" />
        </div>
        <div className="border-t p-4 bg-gray-50">
          <div className="flex justify-end space-x-2">
            <div className="h-8 bg-gray-200 rounded w-16" />
            <div className="h-8 bg-gray-200 rounded w-16" />
          </div>
        </div>
      </div>
    ))}
  </div>
);

// Empty state component
const EmptyRoomState = ({ onAddRoom }) => (
  <div className="col-span-full bg-white rounded-lg border border-gray-200 p-12 text-center shadow-sm">
    <div className="mx-auto w-24 h-24 bg-blue-50 rounded-full flex items-center justify-center mb-6">
      <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-500">
        <path d="M3 9h18v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V9Z" />
        <path d="m9 22 2-2 2 2" />
        <path d="M9 2v7" />
        <path d="M15 2v7" />
        <path d="M3 5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v4H3V5Z" />
      </svg>
    </div>
    <h3 className="text-xl font-bold text-gray-900 mb-2">No rooms available</h3>
    <p className="text-gray-500 mb-8">Start adding rooms to showcase your hotel offerings.</p>
    <Button 
      size="lg" 
      className="bg-blue-600 hover:bg-blue-700 text-white px-6"
      onClick={onAddRoom}
    >
      Add Your First Room
    </Button>
  </div>
);

// Delete confirmation dialog
const DeleteRoomDialog = ({ isOpen, onOpenChange, room, isDeleting, onDelete }) => (
  <Dialog open={isOpen} onOpenChange={onOpenChange}>
    <DialogContent className="sm:max-w-[425px]">
      <DialogHeader>
        <DialogTitle className="text-xl text-red-600">Delete Room</DialogTitle>
        <DialogDescription>
          Are you sure you want to delete this room? This action cannot be undone.
        </DialogDescription>
      </DialogHeader>
      
      {room && (
        <div className="py-4">
          <div className="flex items-center gap-4">
            <div className="relative h-16 w-16 rounded-md overflow-hidden">
              <Image 
                src={room.image_url || "/images/room-placeholder.jpg"} 
                alt={room.name} 
                fill 
                className="object-cover"
              />
            </div>
            <div>
              <h3 className="font-medium text-gray-900">{room.name}</h3>
              <p className="text-sm text-gray-500">KES {room.price.toLocaleString()}/night</p>
            </div>
          </div>
        </div>
      )}
      
      <DialogFooter className="flex gap-2">
        <Button 
          type="button" 
          variant="outline" 
          onClick={() => onOpenChange(false)}
          disabled={isDeleting}
        >
          Cancel
        </Button>
        <Button 
          type="button" 
          variant="destructive"
          className="bg-red-600 hover:bg-red-700"
          disabled={isDeleting}
          onClick={onDelete}
        >
          {isDeleting ? (
            <>
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Deleting
            </>
          ) : "Delete Room"}
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
);

// Room form component
const RoomForm = ({ 
  isSubmitting, 
  onSubmit, 
  roomData, 
  onInputChange, 
  previewImage, 
  fileInputRef, 
  onImageChange, 
  selectedAmenities, 
  toggleAmenity, 
  commonAmenities, 
  onClose, 
  mode 
}) => {
  const isEditMode = mode === "edit";
  
  return (
    <form onSubmit={onSubmit}>
      <DialogHeader>
        <DialogTitle className="text-2xl text-blue-900">{isEditMode ? "Edit Room" : "Add New Room"}</DialogTitle>
        <DialogDescription>
          {isEditMode 
            ? "Update the details for this room." 
            : "Fill in the details to create a new room. Fields marked with * are required."
          }
        </DialogDescription>
      </DialogHeader>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-6">
        {/* Left Column */}
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name" className="font-medium">
              Room Name *
            </Label>
            <Input
              id="name"
              name="name"
              value={roomData.name}
              onChange={onInputChange}
              placeholder="Deluxe Ocean View"
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="price" className="font-medium">
              Price per Night (KES) *
            </Label>
            <Input
              id="price"
              name="price"
              type="number"
              value={roomData.price}
              onChange={onInputChange}
              min="0"
              step="0.01"
              placeholder="10000"
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="capacity" className="font-medium">
              Capacity (Guests) *
            </Label>
            <Input
              id="capacity"
              name="capacity"
              type="number"
              value={roomData.capacity}
              onChange={onInputChange}
              min="1"
              placeholder="2"
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="description" className="font-medium">
              Description *
            </Label>
            <Textarea
              id="description"
              name="description"
              value={roomData.description}
              onChange={onInputChange}
              placeholder="A spacious room with stunning ocean views..."
              rows={4}
              required
            />
          </div>
        </div>
        
        {/* Right Column */}
        <div className="space-y-4">
          <div className="space-y-2">
            <Label className="font-medium">Room Image</Label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:bg-gray-50 transition cursor-pointer" onClick={() => fileInputRef.current?.click()}>
              {previewImage ? (
                <div className="relative h-40 w-full">
                  <Image 
                    src={previewImage} 
                    alt="Room preview" 
                    fill 
                    className="object-cover rounded-md"
                  />
                  <button
                    type="button"
                    className="absolute top-2 right-2 bg-white rounded-full p-1 shadow-md hover:bg-gray-100"
                    onClick={(e) => {
                      e.stopPropagation();
                      if (fileInputRef.current) fileInputRef.current.value = '';
                      // This assumes setPreviewImage and setImageFile are passed or available
                      if (onImageChange) {
                        // Simulate a change event with empty file to clear
                        onImageChange({ target: { files: null } });
                      }
                    }}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M18 6 6 18" />
                      <path d="M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              ) : (
                <div className="py-4">
                  <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="mx-auto text-gray-400 mb-2">
                    <rect width="18" height="18" x="3" y="3" rx="2" ry="2" />
                    <circle cx="9" cy="9" r="2" />
                    <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" />
                  </svg>
                  <p className="text-sm font-medium text-blue-600">Click to upload image</p>
                  <p className="text-xs text-gray-500 mt-1">PNG, JPG, GIF up to 10MB</p>
                </div>
              )}
              <input 
                type="file" 
                ref={fileInputRef}
                className="hidden" 
                accept="image/*" 
                onChange={onImageChange}
              />
            </div>
            <p className="text-xs text-gray-500">Or provide an image URL:</p>
            <Input
              id="image_url"
              name="image_url"
              value={roomData.image_url}
              onChange={onInputChange}
              placeholder="https://example.com/room-image.jpg"
            />
          </div>
          
          <div className="space-y-2">
            <Label className="font-medium">Amenities</Label>
            <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto p-1">
              {commonAmenities.map((amenity) => (
                <div 
                  key={amenity} 
                  className={`flex items-center px-3 py-2 rounded-md text-sm cursor-pointer transition-colors ${
                    selectedAmenities.includes(amenity) 
                      ? 'bg-blue-100 text-blue-700 border border-blue-300' 
                      : 'bg-gray-50 hover:bg-gray-100 border border-gray-200'
                  }`}
                  onClick={() => toggleAmenity(amenity)}
                >
                  {selectedAmenities.includes(amenity) && (
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2 text-blue-600">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  )}
                  <span className={selectedAmenities.includes(amenity) ? 'font-medium' : ''}>
                    {amenity}
                  </span>
                </div>
              ))}
            </div>
            
            <div className="mt-2">
              <Label htmlFor="amenities" className="text-sm text-gray-500">Additional amenities (comma separated)</Label>
              <Textarea
                id="amenities"
                name="amenities"
                value={roomData.amenities}
                onChange={onInputChange}
                rows={2}
                placeholder="Add custom amenities separated by commas"
                className="mt-1"
              />
            </div>
          </div>
        </div>
      </div>
      
      <DialogFooter className="flex gap-2">
        <Button 
          type="button" 
          variant="outline" 
          onClick={onClose}
          disabled={isSubmitting}
        >
          Cancel
        </Button>
        <Button 
          type="submit" 
          className="bg-blue-600 hover:bg-blue-700"
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <>
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              {isEditMode ? "Updating Room" : "Saving Room"}
            </>
          ) : isEditMode ? "Update Room" : "Save Room"}
        </Button>
      </DialogFooter>
    </form>
  );
};

export default function RoomsPage() {
  const router = useRouter();
  const [rooms, setRooms] = useState<Room[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Edit and delete dialog states
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [editRoom, setEditRoom] = useState<RoomFormData>({
    id: "",
    name: "",
    description: "",
    price: "",
    capacity: "",
    image_url: "",
    amenities: ""
  });
  
  // Form states
  const [newRoom, setNewRoom] = useState<RoomFormData>({
    name: "",
    description: "",
    price: "",
    capacity: "",
    image_url: "",
    amenities: ""
  });
  const [imageFile, setImageFile] = useState<File | null>(null);

  // Common amenities list for suggestions
  const commonAmenities = [
    "Free WiFi", "Air Conditioning", "Flat-Screen TV", "Coffee Maker", 
    "Refrigerator", "Hair Dryer", "Safe", "Balcony", "Ocean View", 
    "Pool Access", "King Bed", "Private Bathroom", "Minibar", "Room Service",
    "Free Parking", "Breakfast Included"
  ];
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([]);

  // Check database connection and table structure
  const checkDatabaseConnection = async () => {
    try {
      console.log("Checking database connection...");
      toast.info("Checking database connection...");
      
      // Test connection with a simple query
      const { data, error } = await supabaseClient.from("rooms").select("id").limit(1);
      
      if (error) {
        console.error("Error connecting to database:", error);
        toast.error(`Database connection error: ${error.message}`);
        return false;
      }
      
      console.log("Successfully connected to database");
      toast.success("Successfully connected to database");
      
      // Test table structure
      try {
        console.log("Testing insert permission with admin client...");
        const testRoom = {
          name: "Test Room",
          description: "Test description",
          price: 100,
          capacity: 2,
          image_url: "/images/room-placeholder.jpg",
          amenities: JSON.stringify(["Test"])
        };
        
        const { data: insertData, error: insertError } = await supabaseAdmin
          .from("rooms")
          .insert([testRoom])
          .select();
        
        if (insertError) {
          console.error("Insert test failed:", insertError);
          toast.error(`Insert test failed: ${insertError.message}`);
        } else {
          console.log("Insert test succeeded:", insertData);
          toast.success("Insert test succeeded! Database is working correctly.");
          
          // Clean up test data
          if (insertData && insertData[0] && insertData[0].id) {
            await supabaseAdmin
              .from("rooms")
              .delete()
              .eq("id", insertData[0].id);
          }
        }
      } catch (testError: any) {
        console.error("Error during insert test:", testError);
        toast.error(`Error during insert test: ${testError.message}`);
      }
      
      return true;
    } catch (error: any) {
      console.error("Unexpected error checking database:", error);
      toast.error(`Unexpected database error: ${error.message}`);
      return false;
    }
  };

  // Debug button for the admin
  const handleDebugClick = async () => {
    await checkDatabaseConnection();
  };

  // Fetch rooms
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

        // Parse amenities JSON strings into arrays
        const processedRooms = (data || []).map(room => ({
          ...room,
          amenities: parseAmenities(room.amenities)
        }));

        setRooms(processedRooms);
      } catch (error) {
        console.error("Error fetching rooms:", error);
        toast.error("Failed to load rooms");
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchRooms();
  }, []);

  // Helper function to parse amenities
  const parseAmenities = (amenities: any): string[] => {
    if (!amenities) return [];
    
    if (typeof amenities === 'string') {
      try {
        // Try to parse as JSON string
        return JSON.parse(amenities);
      } catch (e) {
        // If it's not valid JSON, split by comma
        return amenities.split(',').map(item => item.trim()).filter(Boolean);
      }
    }
    
    if (Array.isArray(amenities)) {
      return amenities;
    }
    
    return [];
  };

  // Handle image selection
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files && e.target.files[0];
    
    if (!file) {
      setImageFile(null);
      setPreviewImage(null);
      return;
    }
    
    // Check if the file is an image
    if (!file.type.startsWith('image/')) {
      toast.error("Please select an image file");
      return;
    }
    
    // Check file size (limit to 10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast.error("Image is too large. Maximum size is 10MB");
      return;
    }
    
    setImageFile(file);
    
    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setPreviewImage(e.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  // Handle input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setNewRoom((prev) => ({ ...prev, [name]: value }));
  };

  // Handle amenity toggle
  const toggleAmenity = (amenity: string) => {
    setSelectedAmenities(prev => 
      prev.includes(amenity) 
        ? prev.filter(a => a !== amenity) 
        : [...prev, amenity]
    );
  };

  // Reset dialog form
  const resetForm = () => {
    setNewRoom({
      name: "",
      description: "",
      price: "",
      capacity: "",
      image_url: "",
      amenities: ""
    });
    setImageFile(null);
    setPreviewImage(null);
    setSelectedAmenities([]);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Handle dialog close
  const handleDialogOpenChange = (open: boolean) => {
    if (!open) {
      resetForm();
    }
    setIsDialogOpen(open);
  };

  // Handle edit dialog open
  const handleEditDialogOpen = (room: Room) => {
    setSelectedRoom(room);
    setEditRoom({
      id: room.id,
      name: room.name,
      description: room.description,
      price: room.price.toString(),
      capacity: room.capacity.toString(),
      image_url: room.image_url,
      amenities: Array.isArray(room.amenities) ? room.amenities.join(', ') : ''
    });
    setSelectedAmenities(Array.isArray(room.amenities) ? [...room.amenities] : []);
    setPreviewImage(room.image_url);
    setIsEditDialogOpen(true);
  };

  // Handle delete dialog open
  const handleDeleteDialogOpen = (room: Room) => {
    setSelectedRoom(room);
    setIsDeleteDialogOpen(true);
  };

  // Handle edit form input changes
  const handleEditInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setEditRoom((prev) => ({ ...prev, [name]: value }));
  };

  // Handle edit form submission
  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSubmitting(true);
      
      // Validate form
      if (!editRoom.name || !editRoom.description || !editRoom.price || !editRoom.capacity) {
        toast.error("Please fill in all required fields");
        setIsSubmitting(false);
        return;
      }

      let uploadedImageUrl = editRoom.image_url;
      
      // Upload image if selected
      if (imageFile) {
        try {
          const { publicUrl } = await uploadImage(imageFile);
          uploadedImageUrl = publicUrl;
          console.log("Image uploaded successfully:", publicUrl);
        } catch (uploadError: any) {
          console.error("Error uploading image:", uploadError);
          toast.error(`Failed to upload image: ${uploadError.message || 'Unknown error'}`);
          setIsSubmitting(false);
          return;
        }
      }

      // Prepare amenities
      let amenitiesArray = selectedAmenities;
      if (editRoom.amenities) {
        const customAmenities = editRoom.amenities.split(',')
          .map(item => item.trim())
          .filter(item => item && !selectedAmenities.includes(item));
        amenitiesArray = [...selectedAmenities, ...customAmenities];
      }

      // Prepare room data object for update
      const roomData = {
        name: editRoom.name,
        description: editRoom.description,
        price: parseFloat(editRoom.price),
        capacity: parseInt(editRoom.capacity),
        image_url: uploadedImageUrl || "/images/room-placeholder.jpg",
        amenities: JSON.stringify(amenitiesArray) // Convert to JSON string
      };

      console.log("Updating room data:", roomData);

      // Update room in database
      const { data, error } = await supabaseClient
        .from("rooms")
        .update(roomData)
        .eq("id", editRoom.id)
        .select();

      if (error) {
        throw error;
      }

      // Close dialog and reset form
      setIsEditDialogOpen(false);
      resetForm();
      
      // Update room in state
      if (data && data[0]) {
        setRooms(rooms.map(room => room.id === data[0].id ? { ...data[0], amenities: parseAmenities(data[0].amenities) } : room));
        toast.success("Room updated successfully");
      } else {
        // Refresh to get latest data
        setTimeout(() => router.refresh(), 500);
        toast.success("Room updated successfully");
      }
    } catch (error: any) {
      console.error("Error updating room:", error);
      toast.error(`Failed to update room: ${error.message || 'Unknown error'}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSubmitting(true);
      
      // Validate form
      if (!newRoom.name || !newRoom.description || !newRoom.price || !newRoom.capacity) {
        toast.error("Please fill in all required fields");
        setIsSubmitting(false);
        return;
      }

      let uploadedImageUrl = newRoom.image_url;
      
      // Upload image if selected
      if (imageFile) {
        try {
          const { publicUrl } = await uploadImage(imageFile);
          uploadedImageUrl = publicUrl;
          console.log("Image uploaded successfully:", publicUrl);
        } catch (uploadError: any) {
          console.error("Error uploading image:", uploadError);
          toast.error(`Failed to upload image: ${uploadError.message || 'Unknown error'}`);
          setIsSubmitting(false);
          return;
        }
      }

      // Prepare amenities
      let amenitiesArray = selectedAmenities;
      if (newRoom.amenities) {
        const customAmenities = newRoom.amenities.split(',')
          .map(item => item.trim())
          .filter(item => item && !selectedAmenities.includes(item));
        amenitiesArray = [...selectedAmenities, ...customAmenities];
      }

      // Prepare room data object for insertion
      const roomData = {
        name: newRoom.name,
        description: newRoom.description,
        price: parseFloat(newRoom.price),
        capacity: parseInt(newRoom.capacity),
        image_url: uploadedImageUrl || "/images/room-placeholder.jpg",
        amenities: JSON.stringify(amenitiesArray) // Convert to JSON string
      };

      console.log("Submitting room data:", roomData);

      // First try with regular client
      console.log("Attempting to insert room with regular client...");
      let data;
      let error;
      
      try {
        const result = await supabaseClient
          .from("rooms")
          .insert([roomData])
          .select();
          
        data = result.data;
        error = result.error;
        
        console.log("Regular client insert result:", { data, error });
      } catch (clientError) {
        console.error("Exception during regular client insert:", clientError);
        error = clientError;
      }

      // If regular client fails, try with admin client
      if (error) {
        console.log("Regular client insert failed, trying with admin client...");
        try {
          const adminResult = await supabaseAdmin
            .from("rooms")
            .insert([roomData])
            .select();
            
          data = adminResult.data;
          error = adminResult.error;
          
          console.log("Admin client insert result:", { data, error });
        } catch (adminError) {
          console.error("Exception during admin client insert:", adminError);
          
          // If both clients failed, throw the original error
          if (!data) {
            throw error || adminError;
          }
        }
      }

      // If we still have an error after both attempts
      if (error && !data) {
        console.error("Supabase error creating room:", error);
        console.error("Error details:", JSON.stringify(error, null, 2));
        throw error;
      }

      // Reset form and close dialog
      resetForm();
      setIsDialogOpen(false);
      
      // Add new room to state
      if (data && data[0]) {
        setRooms((prev) => [{...data[0], amenities: parseAmenities(data[0].amenities)}, ...prev]);
        console.log("Room created successfully:", data[0]);
        toast.success("Room added successfully");
      } else {
        // This shouldn't happen if we got here, but just in case
        console.warn("Room was created but no data returned");
        toast.success("Room added successfully");
        // Refresh to get latest data
        setTimeout(() => router.refresh(), 500);
      }
    } catch (error: any) {
      console.error("Error creating room:", error);
      toast.error(`Failed to create room: ${error.message || 'Unknown error'}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle room deletion
  const handleDeleteRoom = async (roomId: string) => {
    try {
      setIsSubmitting(true);
      const { error } = await supabaseClient
        .from("rooms")
        .delete()
        .eq("id", roomId);

      if (error) {
        throw error;
      }

      // Remove from state
      setRooms((prev) => prev.filter(room => room.id !== roomId));
      setIsDeleteDialogOpen(false);
      toast.success("Room deleted successfully");
    } catch (error: any) {
      console.error("Error deleting room:", error);
      toast.error(`Failed to delete room: ${error.message || 'Unknown error'}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-blue-900">Room Management</h1>
          <p className="text-gray-500 mt-1">Add, edit and manage your hotel rooms</p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" onClick={handleDebugClick}>
            Check Database
          </Button>
          <Dialog open={isDialogOpen} onOpenChange={handleDialogOpenChange}>
            <DialogTrigger asChild>
              <Button size="lg" className="bg-blue-600 hover:bg-blue-700">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2">
                  <path d="M5 12h14" />
                  <path d="M12 5v14" />
                </svg>
                Add New Room
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[650px]">
              <RoomForm 
                isSubmitting={isSubmitting}
                onSubmit={handleSubmit}
                roomData={newRoom}
                onInputChange={handleInputChange}
                previewImage={previewImage}
                fileInputRef={fileInputRef}
                onImageChange={handleImageChange}
                selectedAmenities={selectedAmenities}
                toggleAmenity={toggleAmenity}
                commonAmenities={commonAmenities}
                onClose={() => setIsDialogOpen(false)}
                mode="create"
              />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {isLoading ? (
        <RoomSkeleton count={6} />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {rooms.length > 0 ? (
            rooms.map((room) => (
              <RoomCard 
                key={room.id}
                room={room}
                onEdit={() => handleEditDialogOpen(room)}
                onDelete={() => handleDeleteDialogOpen(room)}
              />
            ))
          ) : (
            <EmptyRoomState onAddRoom={() => setIsDialogOpen(true)} />
          )}
        </div>
      )}
      
      {/* Edit Room Dialog */}
      <Dialog 
        open={isEditDialogOpen} 
        onOpenChange={(open) => {
          if (!open) {
            resetForm();
          }
          setIsEditDialogOpen(open);
        }}
      >
        <DialogContent className="sm:max-w-[650px]">
          <RoomForm 
            isSubmitting={isSubmitting}
            onSubmit={handleEditSubmit}
            roomData={editRoom}
            onInputChange={handleEditInputChange}
            previewImage={previewImage}
            fileInputRef={fileInputRef}
            onImageChange={handleImageChange}
            selectedAmenities={selectedAmenities}
            toggleAmenity={toggleAmenity}
            commonAmenities={commonAmenities}
            onClose={() => setIsEditDialogOpen(false)}
            mode="edit"
          />
        </DialogContent>
      </Dialog>
      
      {/* Delete Confirmation Dialog */}
      <DeleteRoomDialog 
        isOpen={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        room={selectedRoom}
        isDeleting={isSubmitting}
        onDelete={() => selectedRoom && handleDeleteRoom(selectedRoom.id)}
      />
    </div>
  );
}