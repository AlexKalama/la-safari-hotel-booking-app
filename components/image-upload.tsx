"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Loader2, UploadCloud, X, Check } from "lucide-react";
import { supabaseClient } from "@/lib/supabase";
import Image from "next/image";

interface ImageUploadProps {
  onImageUploaded: (url: string) => void;
  currentImageUrl?: string;
  bucketName?: string;
  folderPath?: string;
}

export function ImageUpload({ 
  onImageUploaded, 
  currentImageUrl, 
  bucketName = "images", 
  folderPath = "uploads" 
}: ImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(currentImageUrl || null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }

    // Check file size (limit to 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size should be less than 5MB');
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);

    try {
      // Create file preview
      const fileReader = new FileReader();
      fileReader.onload = (e) => {
        setPreviewUrl(e.target?.result as string);
      };
      fileReader.readAsDataURL(file);

      // Generate a unique file name
      const fileExt = file.name.split('.').pop();
      const fileName = `${folderPath}/${Date.now()}-${Math.random().toString(36).substring(2, 15)}.${fileExt}`;
      
      // Create simulated progress updates
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 95) {
            clearInterval(progressInterval);
            return 95;
          }
          return prev + 5;
        });
      }, 100);

      // Upload file to Supabase Storage
      const { data, error } = await supabaseClient.storage
        .from(bucketName)
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false
        });

      clearInterval(progressInterval);

      if (error) {
        throw error;
      }

      setUploadProgress(100);

      // Get public URL
      const { data: { publicUrl } } = supabaseClient.storage
        .from(bucketName)
        .getPublicUrl(data.path);

      // Notify parent component about the uploaded image
      onImageUploaded(publicUrl);
      
      toast.success('Image uploaded successfully');
    } catch (error: any) {
      console.error('Error uploading image:', error);
      toast.error(error.message || 'Failed to upload image');
      setPreviewUrl(currentImageUrl || null);
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleRemoveImage = () => {
    setPreviewUrl(null);
    onImageUploaded('');
    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-4">
      <input
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
        ref={fileInputRef}
        disabled={isUploading}
      />

      {previewUrl ? (
        <div className="relative border border-gray-200 rounded-lg overflow-hidden">
          <div className="relative aspect-video w-full">
            <Image
              src={previewUrl}
              alt="Uploaded image preview"
              fill
              className="object-cover"
            />
          </div>
          <div className="absolute top-2 right-2 flex space-x-2">
            <Button
              type="button"
              size="icon"
              variant="secondary"
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
              className="bg-white text-gray-700 hover:bg-gray-100 h-8 w-8"
            >
              <UploadCloud className="h-4 w-4" />
            </Button>
            <Button
              type="button"
              size="icon"
              variant="destructive"
              onClick={handleRemoveImage}
              disabled={isUploading}
              className="h-8 w-8"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      ) : (
        <div
          onClick={() => fileInputRef.current?.click()}
          className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-yellow-500 transition-colors cursor-pointer"
        >
          <UploadCloud className="h-10 w-10 text-gray-400 mx-auto mb-2" />
          <p className="text-sm text-gray-600">
            Click to upload an image or drag and drop
          </p>
          <p className="text-xs text-gray-500 mt-1">
            PNG, JPG, GIF up to 5MB
          </p>
        </div>
      )}

      {isUploading && (
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-500">Uploading...</span>
            <span className="text-gray-700 font-medium">{uploadProgress}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-yellow-500 h-2 rounded-full transition-all"
              style={{ width: `${uploadProgress}%` }}
            />
          </div>
        </div>
      )}

      {!isUploading && !previewUrl && (
        <Button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="w-full bg-yellow-700 hover:bg-yellow-800"
        >
          Select Image
        </Button>
      )}
    </div>
  );
}
