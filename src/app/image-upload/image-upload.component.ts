import { Component, Output, EventEmitter, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface ImageUploadResult {
  file: File;
  dataUrl: string;
  name: string;
  size: number;
  type: string;
}

@Component({
  selector: 'app-image-upload',
  imports: [CommonModule],
  templateUrl: './image-upload.component.html',
  styleUrl: './image-upload.component.css'
})
export class ImageUploadComponent implements OnInit {
  @Input() acceptedTypes = 'image/jpeg,image/jpg,image/png,image/gif,image/webp';
  @Input() maxSizeInMB = 5;
  @Input() showPreview = true;
  @Input() currentImageUrl = '';
  @Output() imageSelected = new EventEmitter<ImageUploadResult>();
  @Output() imageRemoved = new EventEmitter<void>();

  isDragOver = false;
  isLoading = false;
  errorMessage = '';
  previewUrl = '';

  ngOnInit() {
    this.previewUrl = this.currentImageUrl;
  }

  onFileSelect(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      this.handleFile(input.files[0]);
    }
  }

  onDragOver(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    this.isDragOver = true;
  }

  onDragLeave(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    this.isDragOver = false;
  }

  onDrop(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    this.isDragOver = false;

    const files = event.dataTransfer?.files;
    if (files && files[0]) {
      this.handleFile(files[0]);
    }
  }

  private handleFile(file: File) {
    this.errorMessage = '';
    this.isLoading = true;

    // Validate file type
    if (!this.isValidFileType(file)) {
      this.errorMessage = `Invalid file type. Accepted types: ${this.acceptedTypes}`;
      this.isLoading = false;
      return;
    }

    // Validate file size
    if (!this.isValidFileSize(file)) {
      this.errorMessage = `File size exceeds ${this.maxSizeInMB}MB limit`;
      this.isLoading = false;
      return;
    }

    // Convert to base64
    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string;
      this.previewUrl = dataUrl;
      this.isLoading = false;

      const result: ImageUploadResult = {
        file,
        dataUrl,
        name: file.name,
        size: file.size,
        type: file.type
      };

      this.imageSelected.emit(result);
    };

    reader.onerror = () => {
      this.errorMessage = 'Error reading file';
      this.isLoading = false;
    };

    reader.readAsDataURL(file);
  }

  private isValidFileType(file: File): boolean {
    const acceptedTypesArray = this.acceptedTypes.split(',').map(type => type.trim());
    return acceptedTypesArray.includes(file.type);
  }

  private isValidFileSize(file: File): boolean {
    const maxSizeInBytes = this.maxSizeInMB * 1024 * 1024;
    return file.size <= maxSizeInBytes;
  }

  removeImage() {
    this.previewUrl = '';
    this.errorMessage = '';
    this.imageRemoved.emit();
  }

  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }
}
