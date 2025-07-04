import { HttpErrorResponse, HttpEventType } from '@angular/common/http';
import { Component, forwardRef, Input, OnInit } from '@angular/core';
import {
  ControlValueAccessor,
  NG_VALIDATORS,
  NG_VALUE_ACCESSOR,
  ValidationErrors,
} from '@angular/forms';
import { DomSanitizer } from '@angular/platform-browser';
import { formHelper } from '@helpers';
import { MediaFile, MediaFileError, MediaFileStatus, MediaService } from '@mzima-client/sdk';
import { TranslateService } from '@ngx-translate/core';
import { catchError, forkJoin, last, Observable, tap, throwError } from 'rxjs';
import { ConfirmModalService } from '../../core/services/confirm-modal.service';
import { MediaUploaderError, MediaType, mediaTypes } from '../../core/interfaces/media';

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
    {
      provide: NG_VALIDATORS,
      useExisting: MultipleImageUploaderComponent,
      multi: true,
    },
  ],
})
export class MultipleImageUploaderComponent implements ControlValueAccessor, OnInit {
  @Input() public maxUploadSize: number = 10; // MB
  @Input() public maxFiles: number = 10;
  @Input() public hasCaption?: boolean;
  @Input() public requiredError?: boolean;
  @Input() public allowedTypes?: string[];

  id?: number;
  isDisabled = false;
  error: MediaUploaderError = MediaUploaderError.NONE;
  mediaType: MediaType;
  onChange: any = () => {};
  onTouched: any = () => {};
  mediaFiles: MediaFile[] = [];
  uploads: Map<number, Observable<any>> = new Map();
  dragOver = false;

  constructor(
    protected sanitizer: DomSanitizer,
    private confirm: ConfirmModalService,
    private translate: TranslateService,
    private mediaService: MediaService,
  ) {}

  ngOnInit() {
    this.mediaType = mediaTypes.get('multiple_images')!;
  }

  // helper method and enum imports for the template
  MediaUploaderError = MediaUploaderError;
  MediaFileError = MediaFileError;
  MediaFileStatus = MediaFileStatus;

  writeValue(obj: MediaFile[]): void {
    if (Array.isArray(obj)) {
      this.mediaFiles = obj;
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
    for (const upload of this.mediaFiles) {
      if (upload.status === MediaFileStatus.ERROR) {
        if (upload.error === MediaFileError.UNKNOWN) return { uploadError: true };
        if (upload.error === MediaFileError.TOO_BIG) return { uploadsInvalid: true };
        if (upload.error === MediaFileError.INVALID_TYPE) return { uploadsInvalid: true };
      } else if (upload.status === MediaFileStatus.UPLOADING) return { uploadInProgress: true };
    }
    return null;
  }

  onDragOver(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    this.dragOver = true;
  }

  onDragLeave(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    this.dragOver = false;
  }

  onDrop(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    this.dragOver = false;

    const files = event.dataTransfer?.files;
    if (files) {
      this.processFiles(files);
    }
  }

  onFileSelected(event: Event) {
    const inputElement = event.target as HTMLInputElement;
    if (inputElement.files) {
      this.processFiles(inputElement.files);
      inputElement.value = '';
    }
  }

  private processFiles(files: FileList) {
    // Check max files limit
    if (this.mediaFiles.length + files.length > this.maxFiles) {
      this.error = MediaUploaderError.MAX_FILES;
      return;
    }

    this.error = MediaUploaderError.NONE;
    const newFiles: MediaFile[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files.item(i);
      if (file) {
        const imageUrl = formHelper.prepareImageFileToUpload(file);
        const mediaFile = new MediaFile(file, URL.createObjectURL(imageUrl));

        // Validate file size
        if (mediaFile.size > this.maxUploadSize * 1000000) {
          mediaFile.status = MediaFileStatus.ERROR;
          mediaFile.error = MediaFileError.TOO_BIG;
        }
        // Validate file type
        else if (!this.mediaType.fileTypes.split(', ').includes(mediaFile.mimeType)) {
          mediaFile.status = MediaFileStatus.ERROR;
          mediaFile.error = MediaFileError.INVALID_TYPE;
        }
        // Ready for upload
        else {
          mediaFile.status = MediaFileStatus.UPLOADING;
        }

        newFiles.push(mediaFile);
        this.mediaFiles.push(mediaFile);
      }
    }

    // Start uploads for valid files
    this.startUploads(newFiles.filter((f) => f.status === MediaFileStatus.UPLOADING));
    this.onChange(this.mediaFiles);
  }

  private startUploads(filesToUpload: MediaFile[]) {
    this.uploads = new Map();

    filesToUpload.forEach((mediaFile) => {
      const uploadObservable: Observable<any> = this.mediaService
        .uploadFileProgress(mediaFile.file!, '')
        .pipe(
          tap((uploadEvent) => {
            if (uploadEvent.type === HttpEventType.Response) {
              this.updateMediaFileById(
                mediaFile.generatedId,
                uploadEvent.body,
                (file, resultBody) => {
                  file.status = MediaFileStatus.UPLOADED;
                  file.value = resultBody.result.id;
                  return file;
                },
              );

              // Set to ready after delay
              setTimeout(() => {
                this.updateMediaFileById(mediaFile.generatedId, uploadEvent.body, (file) => {
                  file.status = MediaFileStatus.READY;
                  return file;
                });
              }, 1000);
            }
          }),
          last(),
          catchError((error: HttpErrorResponse) => {
            this.updateMediaFileById(mediaFile.generatedId, null, (file) => {
              file.status = MediaFileStatus.ERROR;
              file.error = MediaFileError.UNKNOWN;
              return file;
            });
            return throwError(() => new Error(error.statusText));
          }),
        );

      this.uploads.set(mediaFile.generatedId, uploadObservable);
    });

    // Wait for all uploads to complete
    forkJoin(Array.from(this.uploads.values())).subscribe((results) => {
      for (const result of results) {
        const filename = MediaFile.getFileNameFromUrl(result.body.result.original_file_url);
        this.updateMediaFileByNameAndSize(
          filename,
          result.body.result.original_file_size,
          (mediaFile) => {
            mediaFile.value = result.body.result.id;
            return mediaFile;
          },
        );
      }
      this.onChange(this.mediaFiles);
    });
  }

  async removeImage(generatedId: number) {
    const index = this.mediaFiles.findIndex((f) => f.generatedId === generatedId);
    if (index === -1) return;

    const mediaFile = this.mediaFiles[index];

    if (
      mediaFile.status === MediaFileStatus.READY ||
      mediaFile.status === MediaFileStatus.UPLOADED
    ) {
      const confirmed = await this.confirm.open({
        title: this.translate.instant('notify.default.are_you_sure_you_want_to_delete_this'),
        description: this.translate.instant('notify.default.proceed_warning'),
      });
      if (!confirmed) return;
    } else if (mediaFile.status === MediaFileStatus.UPLOADING) {
      const uploadObservable = this.uploads.get(generatedId);
      if (uploadObservable) {
        const uploadSubscription = uploadObservable.subscribe(() =>
          uploadSubscription.unsubscribe(),
        );
      }
    }

    this.mediaFiles.splice(index, 1);

    // Check for errors
    const filteredItems = this.mediaFiles.filter((item) => item.status === MediaFileStatus.ERROR);
    if (filteredItems.length === 0) this.error = MediaUploaderError.NONE;

    this.onChange(this.mediaFiles);
  }

  updateCaption(mediaFile: MediaFile, event: Event) {
    const target = event.target as HTMLInputElement;
    const caption = target.value;
    if (mediaFile.value && caption !== null) {
      this.mediaService.updateCaption(mediaFile.value, caption).subscribe();
    }
  }

  reorderImages(fromIndex: number, toIndex: number) {
    const item = this.mediaFiles.splice(fromIndex, 1)[0];
    this.mediaFiles.splice(toIndex, 0, item);
    this.onChange(this.mediaFiles);
  }

  trackByFn(index: number, item: MediaFile): number {
    return item.generatedId;
  }

  private updateMediaFileById(
    id: number,
    resultBody: any,
    updateCallback: (mediaFile: MediaFile, body: any) => MediaFile,
  ) {
    for (let i = 0; i < this.mediaFiles.length; i++) {
      if (this.mediaFiles[i].generatedId === id) {
        this.mediaFiles[i] = updateCallback(this.mediaFiles[i], resultBody);
        break;
      }
    }
  }

  private updateMediaFileByNameAndSize(
    filename: string,
    size: number,
    updateCallback: (mediaFile: MediaFile) => MediaFile,
  ) {
    for (let i = 0; i < this.mediaFiles.length; i++) {
      const mediaFile = this.mediaFiles[i];
      if (
        mediaFile.file?.name.toLowerCase() === filename.toLowerCase() &&
        mediaFile.file?.size === size
      ) {
        this.mediaFiles[i] = updateCallback(mediaFile);
        break;
      }
    }
  }

  getRemainingSlots(): number {
    return Math.max(0, this.maxFiles - this.mediaFiles.length);
  }

  canAddMore(): boolean {
    return this.mediaFiles.length < this.maxFiles;
  }
}
