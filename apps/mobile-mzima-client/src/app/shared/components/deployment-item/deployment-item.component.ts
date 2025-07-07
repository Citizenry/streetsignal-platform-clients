import { Component, EventEmitter, Input, Output } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { ShareDeploymentModalComponent } from '../share-deployment-modal/share-deployment-modal.component';

@Component({
  selector: 'app-deployment-item',
  templateUrl: './deployment-item.component.html',
  styleUrls: ['./deployment-item.component.scss'],
})
export class DeploymentItemComponent {
  @Input() deployment: any = new Map();
  @Input() buttonVisible = true;
  @Input() shareButtonVisible = true;
  @Input() checkboxVisible = false;
  @Input() isBackgroundVisible = true;
  @Input() isBorderVisible = true;
  @Input() isCurrent = false;
  @Input() isOutdated?: boolean = false;
  @Output() selectedDeployment = new EventEmitter();

  constructor(private modalController: ModalController) {}

  selectDeployment(state: boolean, deployment: any) {
    this.selectedDeployment.emit({ checked: state, deployment });
  }

  removeDeployment(event: any, deployment: any) {
    event.stopPropagation();
    this.selectedDeployment.emit({ checked: false, deployment });
  }

  async shareDeployment(event: any, deployment: any) {
    event.stopPropagation();

    const deploymentUrl = `https://${deployment.fqdn}`;

    const modal = await this.modalController.create({
      component: ShareDeploymentModalComponent,
      componentProps: {
        deploymentUrl,
      },
    });

    await modal.present();
  }
}
