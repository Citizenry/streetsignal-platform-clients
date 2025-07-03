import { Component, forwardRef, Input, OnDestroy, OnInit } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { HttpClient, HttpEventType, HttpRequest } from '@angular/common/http';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { ActionSheetController, AlertController } from '@ionic/angular';
import { BehaviorSubject, Observable, Subject, forkJoin } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { MediaFile, MediaUploadResponse } from '../../core/interfaces/media';

@Component({
  selector: 'app-multiple-image-uploader',
  templateUrl: './multiple-image-uploader.component.html',
  styleUrls: ['./multiple-image-uploader.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => MultipleImageUploaderComponent),
      multi: true,
    },
  ],
})
export class MultipleImageUploaderComponent implements OnInit, OnDestroy, ControlValueAccessor {
  @Input() maxFiles = 10;
  @Input() maxUploadSize = '10MB';
  @Input() acceptedFormats = 'JPEG, PNG, WebP';
  @Input() required = false;

  private destroy$ = new Subject<void>();
  private uploadProgress$ = new BehaviorSubject<{ [key: string]: number }>({});

  imageFiles: MediaFile[] = [];
  isUploading = false;
  uploadErrors: string[] = [];
  isDisabled = false;

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  private onChange = (value: any) => {};
  private onTouched = () => {};

  constructor(
    private http: HttpClient,
    private actionSheetController: ActionSheetController,
    private alertController: AlertController,
  ) {}

  ngOnInit() {
    // Initialize upload progress tracking
    this.uploadProgress$.next({});
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // ControlValueAccessor implementation
  writeValue(value: any): void {
    if (Array.isArray(value)) {
      this.imageFiles = value;
    } else {
      this.imageFiles = [];
    }
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.isDisabled = isDisabled;
  }

  async selectImages() {
    const actionSheet = await this.actionSheetController.create({
      header: 'Select Image Source',
      buttons: [
        {
          text: 'Camera',
          icon: 'camera',
          handler: () => {
            this.captureImage();
          },
        },
        {
          text: 'Gallery',
          icon: 'images',
          handler: () => {
            this.selectFromGallery();
          },
        },
        {
          text: 'Cancel',
          icon: 'close',
          role: 'cancel',
        },
      ],
    });
    await actionSheet.present();
  }

  private async captureImage() {
    try {
      const image = await Camera.getPhoto({
        quality: 90,
        allowEditing: true,
        resultType: CameraResultType.Uri,
        source: CameraSource.Camera,
      });

      if (image.webPath) {
        await this.handleImageSelection([image.webPath]);
      }
    } catch (error) {
      console.error('Error capturing image:', error);
      this.showError('Failed to capture image');
    }
  }

  private async selectFromGallery() {
    try {
      // Note: Capacitor Camera plugin doesn't support multiple selection
      // For multiple selection, you might need a different plugin like @capacitor-community/media
      const image = await Camera.getPhoto({
        quality: 90,
        allowEditing: true,
        resultType: CameraResultType.Uri,
        source: CameraSource.Photos,
      });

      if (image.webPath) {
        await this.handleImageSelection([image.webPath]);
      }
    } catch (error) {
      console.error('Error selecting image:', error);
      this.showError('Failed to select image');
    }
  }

  private async handleImageSelection(imagePaths: string[]) {
    const newFiles: MediaFile[] = [];

    for (const imagePath of imagePaths) {
      try {
        // Check if we've reached the maximum number of files
        if (this.imageFiles.length + newFiles.length >= this.maxFiles) {
          this.showError(`Maximum ${this.maxFiles} images allowed`);
          break;
        }

        const response = await fetch(imagePath);
        const blob = await response.blob();
        const file = new File([blob], `image_${Date.now()}.jpg`, { type: 'image/jpeg' });

        // Validate file size (10MB limit)
        const maxSize = 10 * 1024 * 1024;
        if (file.size > maxSize) {
          this.showError('Image file is too large. Maximum size is 10MB.');
          continue;
        }

        const mediaFile: MediaFile = {
          file,
          url: imagePath,
        };

        newFiles.push(mediaFile);
      } catch (error) {
        console.error('Error processing image:', error);
        this.showError('Failed to process image');
      }
    }

    if (newFiles.length > 0) {
      this.imageFiles = [...this.imageFiles, ...newFiles];
      this.uploadImages(newFiles);
    }
  }

  private uploadImages(files: MediaFile[]) {
    this.isUploading = true;
    this.uploadErrors = [];

    const uploadRequests = files.map((file) => {
      const formData = new FormData();
      formData.append('file', file.file);
      formData.append('type', 'image');

      const uploadRequest = new HttpRequest('POST', '/api/v3/media', formData, {
        reportProgress: true,
      });

      return this.http.request<MediaUploadResponse>(uploadRequest);
    });

    forkJoin(uploadRequests)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (events) => {
          events.forEach((event, index) => {
            if (event.type === HttpEventType.UploadProgress && event.total) {
              const progress = Math.round((100 * event.loaded) / event.total);
              const currentProgress = this.uploadProgress$.value;
              currentProgress[`file_${index}`] = progress;
              this.uploadProgress$.next(currentProgress);
            } else if (event.type === HttpEventType.Response && event.body) {
              this.handleUploadSuccess(files[index], event.body);
            }
          });
        },
        error: (error) => {
          this.handleUploadError(error);
        },
        complete: () => {
          this.isUploading = false;
        },
      });
  }

  private handleUploadSuccess(file: MediaFile, response: MediaUploadResponse) {
    file.id = response.id;
    file.url = response.url;

    this.onChange(this.imageFiles);
    this.onTouched();
  }

  private handleUploadError(error: any) {
    console.error('Upload error:', error);
    this.isUploading = false;
    this.uploadErrors.push('Failed to upload some images. Please try again.');
  }

  removeImage(index: number) {
    this.imageFiles.splice(index, 1);
    this.onChange(this.imageFiles);
    this.onTouched();
  }

  updateCaption(index: number, event: any) {
    if (this.imageFiles[index]) {
      this.imageFiles[index].caption = event.detail.value;
      this.onChange(this.imageFiles);
      this.onTouched();
    }
  }

  get uploadProgressValue(): Observable<{ [key: string]: number }> {
    return this.uploadProgress$.asObservable();
  }

  get canAddMore(): boolean {
    return this.imageFiles.length < this.maxFiles;
  }

  get remainingSlots(): number {
    return this.maxFiles - this.imageFiles.length;
  }

  private async showError(message: string) {
    const alert = await this.alertController.create({
      header: 'Error',
      message,
      buttons: ['OK'],
    });
    await alert.present();
  }
}
