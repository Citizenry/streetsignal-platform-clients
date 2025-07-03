export interface MediaFile {
  id?: string;
  file: File;
  url?: string;
  caption?: string;
  uploadProgress?: number;
  uploadError?: string;
}

export interface VideoFile {
  id?: string;
  file: File;
  url?: string;
  thumbnail?: string;
  duration?: number;
  caption?: string;
  uploadProgress?: number;
  uploadError?: string;
}

export interface MediaUploadResponse {
  id: string;
  url: string;
  thumbnail?: string;
  metadata?: {
    size: number;
    type: string;
    duration?: number;
    dimensions?: {
      width: number;
      height: number;
    };
  };
}

export interface MediaUploadConfig {
  maxFileSize: number;
  maxFiles?: number;
  allowedTypes: string[];
  endpoint: string;
}
