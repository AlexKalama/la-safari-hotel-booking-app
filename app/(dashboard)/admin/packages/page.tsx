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

// Type definitions
type Package = {
  id: string;
  name: string;
  description: string;
  price_addon: number;
  created_at?: string;
  updated_at?: string;
};

type PackageFormData = {
  id?: string;
  name: string;
  description: string;
  price_addon: string;
};

// Component for package card
const PackageCard = ({ pkg, onEdit, onDelete }) => (
  <Card key={pkg.id} className="overflow-hidden border border-gray-200 rounded-md hover:shadow-md transition-shadow">
    <div className="relative h-48 bg-gradient-to-r from-blue-500 to-purple-600">
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="bg-white/90 rounded-full p-4">
          <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-blue-600">
            <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
            <polyline points="3.29 7 12 12 20.71 7"></polyline>
            <line x1="12" y1="22" x2="12" y2="12"></line>
          </svg>
        </div>
      </div>
      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4">
        <h3 className="text-xl font-bold text-white">{pkg.name}</h3>
      </div>
      <div className="absolute top-3 right-3">
        <Badge className="bg-green-600 text-white border-transparent hover:bg-green-700">
          + KES {pkg.price_addon.toLocaleString()}
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
            KES {pkg.price_addon.toLocaleString()}<span className="text-sm font-normal text-gray-600"> addon</span>
          </p>
        </div>
        <div className="bg-blue-50 text-blue-800 px-3 py-2 rounded-lg font-bold">
          Premium
        </div>
      </div>
      
      <p className="text-gray-600 mb-3 line-clamp-2 text-sm">{pkg.description}</p>
    </CardContent>
    
    <CardFooter className="bg-gray-50 px-5 py-3 flex justify-between items-center border-t border-gray-200">
      <div className="text-xs text-gray-500">
        ID: {pkg.id.substring(0, 8).toUpperCase()}...
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
const PackageSkeleton = ({ count = 6 }) => (
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
const EmptyPackageState = ({ onAddPackage }) => (
  <div className="col-span-full bg-white rounded-lg border border-gray-200 p-12 text-center shadow-sm">
    <div className="mx-auto w-24 h-24 bg-blue-50 rounded-full flex items-center justify-center mb-6">
      <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-500">
        <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
        <polyline points="3.29 7 12 12 20.71 7"></polyline>
        <line x1="12" y1="22" x2="12" y2="12"></line>
      </svg>
    </div>
    <h3 className="text-xl font-bold text-gray-900 mb-2">No packages available</h3>
    <p className="text-gray-500 mb-8">Start adding packages to enhance your hotel offerings.</p>
    <Button 
      size="lg" 
      className="bg-blue-600 hover:bg-blue-700 text-white px-6"
      onClick={onAddPackage}
    >
      Add Your First Package
    </Button>
  </div>
);

// Delete confirmation dialog
const DeletePackageDialog = ({ isOpen, onOpenChange, pkg, isDeleting, onDelete }) => (
  <Dialog open={isOpen} onOpenChange={onOpenChange}>
    <DialogContent className="sm:max-w-[425px]">
      <DialogHeader>
        <DialogTitle className="text-xl text-red-600">Delete Package</DialogTitle>
        <DialogDescription>
          Are you sure you want to delete this package? This action cannot be undone.
        </DialogDescription>
      </DialogHeader>
      
      {pkg && (
        <div className="py-4">
          <div className="flex items-center gap-4">
            <div className="relative h-16 w-16 rounded-md overflow-hidden bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-white">
                <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
                <polyline points="3.29 7 12 12 20.71 7"></polyline>
                <line x1="12" y1="22" x2="12" y2="12"></line>
              </svg>
            </div>
            <div>
              <h3 className="font-medium text-gray-900">{pkg.name}</h3>
              <p className="text-sm text-gray-500">KES {pkg.price_addon.toLocaleString()} addon</p>
            </div>
          </div>
        </div>
      )}
      
      <DialogFooter className="flex gap-3">
        <Button 
          variant="outline" 
          onClick={() => onOpenChange(false)}
          disabled={isDeleting}
        >
          Cancel
        </Button>
        <Button 
          type="button" 
          className="bg-red-600 hover:bg-red-700 focus:ring-red-500" 
          disabled={isDeleting}
          onClick={onDelete}
        >
          {isDeleting ? (
            <>
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Deleting...
            </>
          ) : "Delete Package"}
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
);

// Package form component
const PackageForm = ({ 
  isSubmitting, 
  onSubmit, 
  packageData, 
  onInputChange, 
  onClose, 
  mode 
}) => {
  const isEditMode = mode === "edit";
  
  return (
    <form onSubmit={onSubmit}>
      <DialogHeader>
        <DialogTitle className="text-2xl text-blue-900">{isEditMode ? "Edit Package" : "Add New Package"}</DialogTitle>
        <DialogDescription>
          {isEditMode 
            ? "Update the details for this package." 
            : "Fill in the details to create a new package. Fields marked with * are required."
          }
        </DialogDescription>
      </DialogHeader>
      
      <div className="grid gap-6 py-6">
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name" className="font-medium">
              Package Name *
            </Label>
            <Input
              id="name"
              name="name"
              value={packageData.name}
              onChange={onInputChange}
              placeholder="Honeymoon Special"
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="price_addon" className="font-medium">
              Price Addon (KES) *
            </Label>
            <Input
              id="price_addon"
              name="price_addon"
              type="number"
              value={packageData.price_addon}
              onChange={onInputChange}
              min="0"
              step="0.01"
              placeholder="5000"
              required
            />
            <p className="text-xs text-gray-500">This is the additional cost on top of the room price.</p>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="description" className="font-medium">
              Description *
            </Label>
            <Textarea
              id="description"
              name="description"
              value={packageData.description}
              onChange={onInputChange}
              placeholder="A romantic package including champagne, rose petals, and complimentary breakfast..."
              rows={4}
              required
            />
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
              {isEditMode ? "Updating..." : "Creating..."}
            </>
          ) : (
            isEditMode ? "Update Package" : "Create Package"
          )}
        </Button>
      </DialogFooter>
    </form>
  );
};

// Main Packages Page component
export default function PackagesPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // State variables
  const [packages, setPackages] = useState<Package[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState<Package | null>(null);
  
  // Form state
  const [newPackage, setNewPackage] = useState<PackageFormData>({
    name: '',
    description: '',
    price_addon: '',
  });
  
  const [editPackage, setEditPackage] = useState<PackageFormData>({
    name: '',
    description: '',
    price_addon: '',
  });

  // Fetch packages
  useEffect(() => {
    const fetchPackages = async () => {
      try {
        setIsLoading(true);
        const { data, error } = await supabaseClient
          .from("packages")
          .select("*")
          .order("created_at", { ascending: false });

        if (error) {
          throw error;
        }

        setPackages(data || []);
      } catch (error) {
        console.error("Error fetching packages:", error);
        toast.error("Failed to load packages");
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchPackages();
  }, []);

  // Handle input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setNewPackage((prev) => ({ ...prev, [name]: value }));
  };

  // Handle edit dialog open
  const handleEditDialogOpen = (pkg: Package) => {
    setSelectedPackage(pkg);
    setEditPackage({
      id: pkg.id,
      name: pkg.name,
      description: pkg.description,
      price_addon: pkg.price_addon.toString(),
    });
    setIsEditDialogOpen(true);
  };

  // Handle delete dialog open
  const handleDeleteDialogOpen = (pkg: Package) => {
    setSelectedPackage(pkg);
    setIsDeleteDialogOpen(true);
  };

  // Handle edit form input changes
  const handleEditInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setEditPackage((prev) => ({ ...prev, [name]: value }));
  };

  // Handle form submission for new package
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSubmitting(true);
      
      // Validate form
      if (!newPackage.name || !newPackage.description || !newPackage.price_addon) {
        toast.error("Please fill in all required fields");
        setIsSubmitting(false);
        return;
      }

      // Insert package into database
      const { data, error } = await supabaseClient
        .from("packages")
        .insert([
          {
            name: newPackage.name,
            description: newPackage.description,
            price_addon: parseFloat(newPackage.price_addon),
          }
        ])
        .select();

      if (error) {
        throw error;
      }

      // Update local state
      if (data && data.length > 0) {
        setPackages((prev) => [data[0], ...prev]);
        toast.success("Package created successfully!");
        
        // Reset form
        setNewPackage({
          name: '',
          description: '',
          price_addon: '',
        });
        
        // Close dialog
        setIsAddDialogOpen(false);
      }
    } catch (error: any) {
      console.error("Error creating package:", error);
      toast.error(`Failed to create package: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle edit form submission
  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSubmitting(true);
      
      // Validate form
      if (!editPackage.name || !editPackage.description || !editPackage.price_addon) {
        toast.error("Please fill in all required fields");
        setIsSubmitting(false);
        return;
      }

      // Update package in database
      const { data, error } = await supabaseClient
        .from("packages")
        .update({
          name: editPackage.name,
          description: editPackage.description,
          price_addon: parseFloat(editPackage.price_addon),
          updated_at: new Date().toISOString(),
        })
        .eq("id", editPackage.id)
        .select();

      if (error) {
        throw error;
      }

      // Update local state
      if (data && data.length > 0) {
        setPackages((prev) => 
          prev.map((pkg) => (pkg.id === data[0].id ? data[0] : pkg))
        );
        toast.success("Package updated successfully!");
        
        // Close dialog
        setIsEditDialogOpen(false);
      }
    } catch (error: any) {
      console.error("Error updating package:", error);
      toast.error(`Failed to update package: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle package deletion
  const handleDeletePackage = async (id: string) => {
    try {
      setIsSubmitting(true);
      
      // Delete package from database
      const { error } = await supabaseClient
        .from("packages")
        .delete()
        .eq("id", id);

      if (error) {
        throw error;
      }

      // Update local state
      setPackages((prev) => prev.filter((pkg) => pkg.id !== id));
      toast.success("Package deleted successfully!");
      
      // Close dialog
      setIsDeleteDialogOpen(false);
    } catch (error: any) {
      console.error("Error deleting package:", error);
      toast.error(`Failed to delete package: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">Packages</h1>
          <p className="text-gray-500 mt-1">Manage your special packages and offerings</p>
        </div>
        <Button 
          className="bg-blue-600 hover:bg-blue-700"
          onClick={() => setIsAddDialogOpen(true)}
        >
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            width="16" 
            height="16" 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="2" 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            className="mr-2"
          >
            <path d="M5 12h14" />
            <path d="M12 5v14" />
          </svg>
          Add Package
        </Button>
      </div>
      
      {isLoading ? (
        <PackageSkeleton count={3} />
      ) : packages.length === 0 ? (
        <EmptyPackageState onAddPackage={() => setIsAddDialogOpen(true)} />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {packages.map((pkg) => (
            <PackageCard
              key={pkg.id}
              pkg={pkg}
              onEdit={() => handleEditDialogOpen(pkg)}
              onDelete={() => handleDeleteDialogOpen(pkg)}
            />
          ))}
        </div>
      )}
      
      {/* Add Package Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="sm:max-w-[550px]">
          <PackageForm
            isSubmitting={isSubmitting}
            onSubmit={handleSubmit}
            packageData={newPackage}
            onInputChange={handleInputChange}
            onClose={() => setIsAddDialogOpen(false)}
            mode="add"
          />
        </DialogContent>
      </Dialog>
      
      {/* Edit Package Dialog */}
      <Dialog 
        open={isEditDialogOpen} 
        onOpenChange={(open) => {
          setIsEditDialogOpen(open);
        }}
      >
        <DialogContent className="sm:max-w-[550px]">
          <PackageForm 
            isSubmitting={isSubmitting}
            onSubmit={handleEditSubmit}
            packageData={editPackage}
            onInputChange={handleEditInputChange}
            onClose={() => setIsEditDialogOpen(false)}
            mode="edit"
          />
        </DialogContent>
      </Dialog>
      
      {/* Delete Confirmation Dialog */}
      <DeletePackageDialog 
        isOpen={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        pkg={selectedPackage}
        isDeleting={isSubmitting}
        onDelete={() => selectedPackage && handleDeletePackage(selectedPackage.id)}
      />
    </div>
  );
}
