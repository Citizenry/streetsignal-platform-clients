import {
  ElementRef,
  EventEmitter,
  ViewChild,
  OnChanges,
  SimpleChanges,
  ChangeDetectorRef,
} from '@angular/core';
import { Component, Input, Output } from '@angular/core';
import { formHelper, validateFile } from '@helpers';
import { NotificationService } from '@services';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-file-uploader',
  templateUrl: './file-uploader.component.html',
  styleUrls: ['./file-uploader.component.scss'],
})
export class FileUploaderComponent implements OnChanges {
  @Input() required = false;
  @Input() imageSrc: any;
  @Input() validation = 'image';
  @Input() multiple?: boolean;
  @Output() fileUpload = new EventEmitter<File>();
  @Output() delete = new EventEmitter();
  @ViewChild('input') public input: ElementRef<HTMLInputElement>;

  constructor(
    private notificationService: NotificationService,
    private translateService: TranslateService,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['imageSrc']) {
      console.log(
        'FileUploader: imageSrc changed from',
        changes['imageSrc'].previousValue,
        'to',
        changes['imageSrc'].currentValue,
      );
      // Force change detection when imageSrc changes
      this.cdr.detectChanges();
    }
  }

  uploadFile($event: any) {
    if (!$event.target.files[0]) return;
    if (validateFile($event.target.files[0])) {
      const reader = new FileReader();
      reader.onload = () => {
        const file = formHelper.prepareImageFileToUpload($event.target.files[0]);
        const currentFile: any = {
          file,
          dataURI: reader.result,
          changed: true,
          deleted: false,
        };
        this.fileUpload.emit(currentFile);
      };
      reader.readAsDataURL($event.target.files[0]);
    } else {
      this.notificationService.showError(
        this.translateService.instant('post.media.error_in_upload'),
      );
    }
  }

  public deleteImage(index?: number) {
    this.delete.emit(index ?? true);
  }

  public chooseFile(): void {
    this.input.nativeElement.click();
  }
}
