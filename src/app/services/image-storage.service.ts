import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export interface StoredImage {
  id: string;
  name: string;
  dataUrl: string;
  size: number;
  type: string;
  uploadDate: Date;
}

@Injectable({
  providedIn: 'root'
})
export class ImageStorageService {
  private readonly STORAGE_KEY = 'pdf-designer-images';
  private imagesSubject = new BehaviorSubject<StoredImage[]>([]);
  
  images$ = this.imagesSubject.asObservable();

  constructor() {
    this.loadImagesFromStorage();
  }

  private loadImagesFromStorage() {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (stored) {
        const images = JSON.parse(stored).map((img: any) => ({
          ...img,
          uploadDate: new Date(img.uploadDate)
        }));
        this.imagesSubject.next(images);
      }
    } catch (error) {
      console.error('Error loading images from storage:', error);
    }
  }

  private saveImagesToStorage() {
    try {
      const images = this.imagesSubject.value;
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(images));
    } catch (error) {
      console.error('Error saving images to storage:', error);
    }
  }

  storeImage(file: File, dataUrl: string): StoredImage {
    const storedImage: StoredImage = {
      id: this.generateImageId(),
      name: file.name,
      dataUrl,
      size: file.size,
      type: file.type,
      uploadDate: new Date()
    };

    const currentImages = this.imagesSubject.value;
    const updatedImages = [...currentImages, storedImage];
    
    this.imagesSubject.next(updatedImages);
    this.saveImagesToStorage();
    
    return storedImage;
  }

  removeImage(imageId: string) {
    const currentImages = this.imagesSubject.value;
    const updatedImages = currentImages.filter(img => img.id !== imageId);
    
    this.imagesSubject.next(updatedImages);
    this.saveImagesToStorage();
  }

  getImage(imageId: string): StoredImage | undefined {
    return this.imagesSubject.value.find(img => img.id === imageId);
  }

  getAllImages(): StoredImage[] {
    return this.imagesSubject.value;
  }

  clearAllImages() {
    this.imagesSubject.next([]);
    localStorage.removeItem(this.STORAGE_KEY);
  }

  private generateImageId(): string {
    return `img-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  // Utility methods for image handling
  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  isValidImageUrl(url: string): boolean {
    try {
      new URL(url);
      return /\.(jpg|jpeg|png|gif|webp)$/i.test(url);
    } catch {
      return false;
    }
  }

  // Get storage usage statistics
  getStorageStats() {
    const images = this.imagesSubject.value;
    const totalSize = images.reduce((sum, img) => sum + img.size, 0);
    const totalCount = images.length;
    
    return {
      totalCount,
      totalSize,
      formattedSize: this.formatFileSize(totalSize)
    };
  }
}
