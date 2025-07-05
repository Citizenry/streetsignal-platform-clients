import { Injectable } from '@angular/core';
import { LoggingService } from './logging.service';
// import { MatSnackBar } from '@angular/material/snack-bar';

@Injectable({
  providedIn: 'root',
})
export class ClipboardService {
  constructor(private logger: LoggingService) {}
  // constructor(private snackBar: MatSnackBar) {}

  public copy(str: string): void {
    const selBox = document.createElement('textarea');
    selBox.style.position = 'fixed';
    selBox.style.left = '0';
    selBox.style.top = '0';
    selBox.style.opacity = '0';
    selBox.value = str;
    document.body.appendChild(selBox);
    selBox.focus();
    selBox.select();
    document.execCommand('copy');
    document.body.removeChild(selBox);

    this.logger.info('Copied to clipboard');

    // this.snackBar.open('Copied to clipboard', 'Ok', {
    //   duration: 2000,
    // });
  }
}
