import { Component, Input, OnInit, ViewChild, ElementRef } from '@angular/core';
import { ModalController } from '@ionic/angular';
// eslint-disable-next-line import/no-extraneous-dependencies, import/no-unresolved, @nx/enforce-module-boundaries
import QRCode from 'qrcode';

@Component({
  selector: 'app-share-deployment-modal',
  templateUrl: './share-deployment-modal.component.html',
  styleUrls: ['./share-deployment-modal.component.scss'],
})
export class ShareDeploymentModalComponent implements OnInit {
  @Input() deploymentUrl: string = '';
  @ViewChild('qrCanvas', { static: true }) qrCanvas!: ElementRef<HTMLCanvasElement>;

  constructor(private modalController: ModalController) {}

  async ngOnInit() {
    if (this.deploymentUrl && this.qrCanvas) {
      try {
        await QRCode.toCanvas(this.qrCanvas.nativeElement, this.deploymentUrl, {
          width: 256,
          margin: 2,
          color: {
            dark: '#000000',
            light: '#FFFFFF',
          },
        });
      } catch (error) {
        console.error('Error generating QR code:', error);
      }
    }
  }

  closeModal() {
    this.modalController.dismiss();
  }
}
