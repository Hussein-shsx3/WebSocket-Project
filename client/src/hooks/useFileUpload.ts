"use client";

import { useState } from "react";
import { axiosInstance } from "@/lib/axios";
import toast from "react-hot-toast";

/**
 * Hook for managing file upload functionality
 */
export const useFileUpload = () => {
  const [mediaUrls, setMediaUrls] = useState<string[]>([]);
  const [isUploading, setIsUploading] = useState(false);

  const uploadFile = async (file: File): Promise<string | null> => {
    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await axiosInstance.post("/messages/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      const { url } = response.data.data;
      setMediaUrls([url]); // For now, one file
      return url;
    } catch (error) {
      console.error("Upload failed:", error);
      toast.error("Failed to upload file");
      return null;
    } finally {
      setIsUploading(false);
    }
  };

  const clearMedia = () => {
    setMediaUrls([]);
  };

  const addMediaUrl = (url: string) => {
    setMediaUrls([url]);
  };

  return {
    mediaUrls,
    isUploading,
    uploadFile,
    clearMedia,
    addMediaUrl,
  };
};