import { HttpErrorResponse, HttpEventType } from '@angular/common/http';
import { Component, forwardRef, Input, OnInit } from '@angular/core';
import {
  ControlValueAccessor,
  FormControl,
  NG_VALIDATORS,
  NG_VALUE_ACCESSOR,
  ValidationErrors,
} from '@angular/forms';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { formHelper } from '@helpers';
import { MediaFile, MediaFileError, MediaFileStatus, MediaService } from '@mzima-client/sdk';
import { TranslateService } from '@ngx-translate/core';
import { catchError, last, Observable, tap, throwError } from 'rxjs';
import { ConfirmModalService } from '../../core/services/confirm-modal.service';
import { MediaUploaderError, MediaType, mediaTypes } from '../../core/interfaces/media';

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
    {
      provide: NG_VALIDATORS,
      useExisting: VideoUploaderComponent,
      multi: true,
    },
  ],
})
export class VideoUploaderComponent implements ControlValueAccessor, OnInit {
  @Input() public maxUploadSize: number = 100; // MB
  @Input() public hasCaption?: boolean;
  @Input() public requiredError?: boolean;
  @Input() public allowedTypes?: string[];

  id?: number;
  captionControl = new FormControl('');
  isDisabled = false;
  error: MediaUploaderError = MediaUploaderError.NONE;
  mediaType: MediaType;
  onChange: any = () => {};
  onTouched: any = () => {};
  videoFile: MediaFile | null = null;
  uploadProgress = 0;
  isUploading = false;
  videoPreviewUrl: SafeUrl | null = null;

  constructor(
    protected sanitizer: DomSanitizer,
    private confirm: ConfirmModalService,
    private translate: TranslateService,
    private mediaService: MediaService,
  ) {}

  ngOnInit() {
    this.mediaType = mediaTypes.get('video_upload')!;
  }

  // helper method and enum imports for the template
  MediaUploaderError = MediaUploaderError;
  MediaFileError = MediaFileError;
  MediaFileStatus = MediaFileStatus;

  writeValue(obj: MediaFile | null): void {
    this.videoFile = obj;
    if (obj && obj.url) {
      this.videoPreviewUrl = this.sanitizer.bypassSecurityTrustUrl(obj.url);
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

  validate(): ValidationErrors | null {
    if (this.videoFile) {
      if (this.videoFile.status === MediaFileStatus.ERROR) {
        if (this.videoFile.error === MediaFileError.UNKNOWN) return { uploadError: true };
        if (this.videoFile.error === MediaFileError.TOO_BIG) return { uploadsInvalid: true };
        if (this.videoFile.error === MediaFileError.INVALID_TYPE) return { uploadsInvalid: true };
      } else if (this.videoFile.status === MediaFileStatus.UPLOADING) {
        return { uploadInProgress: true };
      }
    }
    return null;
  }

  onVideoSelected(event: Event) {
    const inputElement = event.target as HTMLInputElement;

    if (inputElement.files && inputElement.files.length > 0) {
      const file = inputElement.files[0];
      
      // Reset previous state
      this.error = MediaUploaderError.NONE;
      this.uploadProgress = 0;
      
      const videoUrl = URL.createObjectURL(file);
      this.videoPreviewUrl = this.sanitizer.bypassSecurityTrustUrl(videoUrl);
      
      const mediaFile = new MediaFile(file, videoUrl);

      // Validate file size
      if (mediaFile.size > this.maxUploadSize * 1000000) {
        mediaFile.status = MediaFileStatus.ERROR;
        mediaFile.error = MediaFileError.TOO_BIG;
        this.error = MediaUploaderError.MAX_SIZE;
      } 
      // Validate file type
      else if (!this.mediaType.fileTypes.split(', ').includes(mediaFile.mimeType)) {
        mediaFile.status = MediaFileStatus.ERROR;
        mediaFile.error = MediaFileError.INVALID_TYPE;
        this.error = MediaUploaderError.INVALID_TYPE;
      } 
      // Start upload
      else {
        mediaFile.status = MediaFileStatus.UPLOADING;
        this.isUploading = true;
        this.uploadVideo(mediaFile);
      }

      this.videoFile = mediaFile;
      this.onChange(this.videoFile);
      inputElement.value = '';
    }
  }

  private uploadVideo(mediaFile: MediaFile) {
    const uploadObservable: Observable<any> = this.mediaService
      .uploadFileProgress(mediaFile.file!, this.captionControl.value || '')
      .pipe(
        tap((uploadEvent) => {
          if (uploadEvent.type === HttpEventType.UploadProgress) {
            if (uploadEvent.total) {
              this.uploadProgress = Math.round((uploadEvent.loaded / uploadEvent.total) * 100);
            }
          } else if (uploadEvent.type === HttpEventType.Response) {
            mediaFile.status = MediaFileStatus.UPLOADED;
            mediaFile.value = uploadEvent.body.result.id;
            this.isUploading = false;
            this.uploadProgress = 100;
            
            // Set to ready after a short delay
            setTimeout(() => {
              if (this.videoFile) {
                this.videoFile.status = MediaFileStatus.READY;
                this.onChange(this.videoFile);
              }
            }, 1000);
          }
        }),
        last(),
        catchError((error: HttpErrorResponse) => {
          mediaFile.status = MediaFileStatus.ERROR;
          mediaFile.error = MediaFileError.UNKNOWN;
          this.isUploading = false;
          this.uploadProgress = 0;
          this.onChange(this.videoFile);
          return throwError(() => new Error(error.statusText));
        }),
      );

    uploadObservable.subscribe();
  }

  async removeVideo() {
    if (!this.videoFile) return;

    if (this.videoFile.status === MediaFileStatus.READY || this.videoFile.status === MediaFileStatus.UPLOADED) {
      const confirmed = await this.confirm.open({
        title: this.translate.instant('notify.default.are_you_sure_you_want_to_delete_this'),
        description: this.translate.instant('notify.default.proceed_warning'),
      });
      if (!confirmed) return;
    }

    this.videoFile = null;
    this.videoPreviewUrl = null;
    this.uploadProgress = 0;
    this.isUploading = false;
    this.error = MediaUploaderError.NONE;
    this.onChange(this.videoFile);
  }

  onCaptionChange() {
    if (this.videoFile && this.videoFile.value && this.captionControl.value !== null) {
      this.mediaService.updateCaption(this.videoFile.value, this.captionControl.value).subscribe();
    }
  }

  getVideoThumbnail(): string {
    return '/assets/images/logos/video_thumbnail.png';
  }

  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }
}