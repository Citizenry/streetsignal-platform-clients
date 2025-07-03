import { Component, forwardRef, Input, OnDestroy, OnInit } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { HttpClient, HttpEventType, HttpRequest } from '@angular/common/http';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { ActionSheetController, AlertController } from '@ionic/angular';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { VideoFile, MediaUploadResponse } from '../../core/interfaces/media';

@Component({
  selector: 'app-video-uploader',
  templateUrl: './video-uploader.component.html',
  styleUrls: ['./video-uploader.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => VideoUploaderComponent),
      multi: true,
    },
  ],
})
export class VideoUploaderComponent implements OnInit, OnDestroy, ControlValueAccessor {
  @Input() maxUploadSize = '100MB';
  @Input() acceptedFormats = 'MP4, WebM, MOV';
  @Input() required = false;

  private destroy$ = new Subject<void>();
  private uploadProgress$ = new BehaviorSubject<number>(0);

  videoFile: VideoFile | null = null;
  caption = '';
  isUploading = false;
  uploadError: string | null = null;
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
    this.uploadProgress$.next(0);
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // ControlValueAccessor implementation
  writeValue(value: any): void {
    if (value && typeof value === 'object') {
      this.videoFile = value;
    } else {
      this.videoFile = null;
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

  async selectVideo() {
    const actionSheet = await this.actionSheetController.create({
      header: 'Select Video Source',
      buttons: [
        {
          text: 'Camera',
          icon: 'videocam',
          handler: () => {
            this.recordVideo();
          },
        },
        {
          text: 'Gallery',
          icon: 'folder',
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

  private async recordVideo() {
    try {
      const video = await Camera.getPhoto({
        quality: 90,
        allowEditing: true,
        resultType: CameraResultType.Uri,
        source: CameraSource.Camera,
      });

      if (video.webPath) {
        await this.handleVideoSelection(video.webPath);
      }
    } catch (error) {
      console.error('Error recording video:', error);
      this.showError('Failed to record video');
    }
  }

  private async selectFromGallery() {
    try {
      const video = await Camera.getPhoto({
        quality: 90,
        allowEditing: true,
        resultType: CameraResultType.Uri,
        source: CameraSource.Photos,
      });

      if (video.webPath) {
        await this.handleVideoSelection(video.webPath);
      }
    } catch (error) {
      console.error('Error selecting video:', error);
      this.showError('Failed to select video');
    }
  }

  private async handleVideoSelection(videoPath: string) {
    try {
      const response = await fetch(videoPath);
      const blob = await response.blob();
      const file = new File([blob], `video_${Date.now()}.mp4`, { type: 'video/mp4' });

      // Validate file size (100MB limit)
      const maxSize = 100 * 1024 * 1024;
      if (file.size > maxSize) {
        this.showError('Video file is too large. Maximum size is 100MB.');
        return;
      }

      const mediaFile: VideoFile = {
        file,
        url: videoPath,
        caption: this.caption,
      };

      this.videoFile = mediaFile;
      this.uploadVideo(mediaFile);
    } catch (error) {
      console.error('Error processing video:', error);
      this.showError('Failed to process video');
    }
  }

  private uploadVideo(mediaFile: VideoFile) {
    this.isUploading = true;
    this.uploadError = null;

    const formData = new FormData();
    formData.append('file', mediaFile.file!);
    formData.append('type', 'video');
    formData.append('caption', this.caption || '');

    const uploadRequest = new HttpRequest('POST', '/api/v3/media', formData, {
      reportProgress: true,
    });

    this.http
      .request<MediaUploadResponse>(uploadRequest)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (event) => {
          if (event.type === HttpEventType.UploadProgress && event.total) {
            const progress = Math.round((100 * event.loaded) / event.total);
            this.uploadProgress$.next(progress);
          } else if (event.type === HttpEventType.Response && event.body) {
            this.handleUploadSuccess(event.body);
          }
        },
        error: (error) => {
          this.handleUploadError(error);
        },
        complete: () => {
          this.isUploading = false;
        },
      });
  }

  private handleUploadSuccess(response: MediaUploadResponse) {
    if (this.videoFile) {
      this.videoFile.id = response.id;
      this.videoFile.url = response.url;
      this.videoFile.caption = this.caption;

      this.onChange(this.videoFile);
      this.onTouched();
    }
  }

  private handleUploadError(error: any) {
    console.error('Upload error:', error);
    this.isUploading = false;
    this.uploadError = 'Failed to upload video. Please try again.';
  }

  removeVideo() {
    this.videoFile = null;
    this.caption = '';
    this.uploadProgress$.next(0);
    this.uploadError = null;
    this.onChange(null);
    this.onTouched();
  }

  onCaptionChange() {
    if (this.videoFile) {
      this.videoFile.caption = this.caption;
      this.onChange(this.videoFile);
      this.onTouched();
    }
  }

  get uploadProgressValue(): Observable<number> {
    return this.uploadProgress$.asObservable();
  }

  get hasVideo(): boolean {
    return !!this.videoFile;
  }

  formatDuration(seconds: number): string {
    if (!seconds || seconds < 0) return '0:00';

    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);

    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
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
