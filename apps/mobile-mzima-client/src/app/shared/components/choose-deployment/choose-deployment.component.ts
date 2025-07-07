import { Component, EventEmitter, Input, Output, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { Platform } from '@ionic/angular';
import { App } from '@capacitor/app';
import { MainLayoutComponent } from '../main-layout/main-layout.component';
import { Deployment } from '@mzima-client/sdk';
import { Subject, debounceTime } from 'rxjs';
import {
  AlertService,
  AuthService,
  ConfigService,
  DeploymentService,
  EnvService,
  SessionService,
} from '@services';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { ToastService } from '@services';
import { BarcodeScanner } from '@capacitor-community/barcode-scanner';

@UntilDestroy()
@Component({
  selector: 'app-choose-deployment',
  templateUrl: './choose-deployment.component.html',
  styleUrls: ['./choose-deployment.component.scss'],
})
export class ChooseDeploymentComponent {
  @Input() isProfile: boolean;
  @Output() back = new EventEmitter();
  @Output() chosen = new EventEmitter();
  @ViewChild('layout') public layout: MainLayoutComponent;
  public isSearchView = false;
  public showSearch = true;
  public deploymentList: Deployment[] = [];
  public foundDeploymentList: Deployment[] = [];
  private selectedDeployments: Deployment[] = [];
  public isDeploymentsLoading = false;
  public addButtonVisible = false;
  public currentDeploymentId?: number | string;
  private domain: string | null = null;
  private readonly searchSubject = new Subject<string>();
  public manualUrl: string = '';

  tap = 0;

  constructor(
    private router: Router,
    private envService: EnvService,
    private configService: ConfigService,
    private deploymentService: DeploymentService,
    private alertService: AlertService,
    private authService: AuthService,
    private sessionService: SessionService,
    protected toastService: ToastService,
    protected platform: Platform,
  ) {
    this.showSearch = true;
    this.searchSubject.pipe(debounceTime(500)).subscribe({
      next: (query: string) => {
        console.log('Search Subject', query);
        this.deploymentService.addDeploymentByUrl(query).subscribe({
          next: (deployment: any) => {
            console.log(deployment);
            this.isDeploymentsLoading = false;
            this.foundDeploymentList = [deployment];
          },
          error: (err: any) => {
            this.isDeploymentsLoading = false;
            console.log(err);

            // Provide specific error message for domain discovery
            let errorMessage =
              'Failed to find StreetSignal installation. Please check the domain and try again.';
            if (err.message && err.message.includes('Could not find StreetSignal installation')) {
              errorMessage =
                'Could not find a StreetSignal installation at that domain. Please verify the domain is correct and has StreetSignal installed.';
            }

            this.toastService.presentToast({
              header: 'Error',
              message: errorMessage,
              buttons: [],
            });
          },
        });
      },
    });

    this.deploymentService.deployment$.pipe(untilDestroyed(this)).subscribe({
      next: (deployment) => {
        this.currentDeploymentId = deployment?.id;
      },
    });

    if (!this.isProfile && this.platform.is('android')) {
      this.platform.backButton.subscribeWithPriority(65, () => {
        console.log('back button via hardware click from choose deployment view');

        this.tap++;
        console.log('Back Button Tap', this.tap);
        if (this.tap === 3) App.exitApp();
        else if (this.tap === 2) this.doubleTapExitToast();
      });
    }
  }

  public loadDeployments() {
    this.deploymentList = this.deploymentService.getDeployments();

    if (this.deploymentService.hasDuplicates(this.deploymentList)) {
      this.deploymentService.setDeployments(
        this.deploymentService.removeDuplicates(this.deploymentList),
      );
      this.deploymentList = this.deploymentService.getDeployments();
    }
  }

  public async callModal(event: any) {
    const result = await this.alertService.presentAlert({
      header: 'Are you sure you want to delete this deployment?',
      message: 'Deleting means that from now you will not see it in your deployment list.',
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
        },
        {
          text: 'Delete',
          role: 'confirm',
          cssClass: 'danger',
        },
      ],
    });

    if (result.role === 'confirm') {
      const { deployment } = event;
      this.removeDeployment(deployment.id);
    }
  }

  public removeDeployment(deploymentId: number) {
    this.deploymentList = this.deploymentList.filter(
      (deployment) => deployment.id !== deploymentId,
    );
    this.deploymentService.setDeployments(this.deploymentList);
    if (this.deploymentList.length === 0) {
      this.currentDeploymentId = undefined;
      this.authService.logout();
      this.deploymentService.setDeployment(null);
      if (this.isProfile) this.router.navigate(['deployment']);
    } else if (this.currentDeploymentId === deploymentId) {
      this.currentDeploymentId = this.deploymentList[0].id;
      this.chooseDeployment(this.deploymentList[0]);
    }
  }

  public async chooseDeployment(deployment: Deployment) {
    const currentDeployment = this.deploymentService.getDeployment() ?? null;

    const isLoggedIn = this.sessionService.isLogged();
    if (isLoggedIn) {
      const result = await this.alertService.presentAlert({
        header: 'Log out of current deployment?',
        message:
          'Switching deployments will log out out of your current deployment, and you may need to log in again.',
        buttons: [
          {
            text: 'Cancel',
            role: 'cancel',
          },
          {
            text: 'Confirm',
            role: 'confirm',
            cssClass: 'danger',
          },
        ],
      });

      if (result.role !== 'confirm') {
        return;
      }
    }

    this.authService.logout();
    this.deploymentService.setDeployment(deployment);
    this.envService.setDynamicBackendUrl();
    try {
      await this.configService.initAllConfigurations();
      deployment.isOutdated = false;
      this.deploymentService.updateDeployment(deployment.id, { isOutdated: false });
      this.chosen.emit();
    } catch (error: any) {
      if (error.status === 404) {
        deployment.isOutdated = true;
        this.deploymentService.updateDeployment(deployment.id, { isOutdated: true });
        this.showDeploymentOutdatedWarning();
        this.deploymentService.setDeployment(currentDeployment);
        this.envService.setDynamicBackendUrl();
        await this.configService.initAllConfigurations();
      }
    }
  }

  private showDeploymentOutdatedWarning(): void {
    this.alertService.presentAlert({
      icon: {
        name: 'warning',
        color: 'danger',
      },
      header: 'Outdated Deployment!',
      message:
        "<p>We're sorry, but the deployment option you're trying to select is not supported by the application as the administrator hasn't updated it yet. Until the update is performed, the deployment won't function properly.</p><p>If you are the administrator of this deployment, please feel free to contact us for more information.</p>",
      buttons: [
        {
          text: 'Ok',
          cssClass: 'primary',
        },
      ],
    });
  }

  public selectDeployment(event: any) {
    const { checked, deployment } = event;
    if (checked) {
      if (this.selectedDeployments.some((i: any) => i.id === deployment.id)) {
        return;
      }
      this.selectedDeployments.push(deployment);
    } else {
      const index = this.selectedDeployments.findIndex((i: any) => i.id === deployment.id);
      if (index !== -1) {
        this.selectedDeployments.splice(index, 1);
      }
    }
    this.addButtonVisible = !!this.selectedDeployments.length;
  }

  public searchDeployments(query: string | null): void {
    console.log('Add StreetSignal URL', query);
    if (query == null || query.length === 0) {
      this.isDeploymentsLoading = false;
      this.foundDeploymentList = [];
      this.domain = null;
    } else {
      this.isDeploymentsLoading = true;
      this.domain = query;
      console.log('URL for StreetSignal', this.domain);
      this.searchSubject.next(this.domain);
    }
  }

  public addDeployment(): void {
    console.log('Selected Deployments', this.selectedDeployments);
    this.deploymentService.addDeployments(this.selectedDeployments);
    this.layout.closeSearchForm();
    this.foundDeploymentList = [];
    this.addButtonVisible = false;
    this.loadDeployments();

    const deploymentCount = this.selectedDeployments.length;
    const header =
      deploymentCount > 1
        ? deploymentCount + ' StreetSignal Installations Added Successfully!'
        : '1 StreetSignal Installation Added Successfully!';
    const message =
      deploymentCount > 1
        ? 'You can now view these installations and add posts to them'
        : 'You can now view this installation and add posts to it';

    this.toastService.presentToast({
      header: header,
      message: message,
      buttons: [],
    });

    this.selectedDeployments = [];
  }

  public backHandle(): void {
    this.showSearch = false;
    this.back.emit();
  }

  protected async doubleTapExitToast() {
    const result = await this.toastService.presentToast({
      message: 'Tap back button again to exit the App',
      buttons: [],
    });
    if (result) {
      this.tap = 0;
    }
  }

  public submitManualUrl(): void {
    if (!this.manualUrl || this.manualUrl.trim().length === 0) {
      return;
    }

    const url = this.manualUrl.trim();
    this.isDeploymentsLoading = true;

    this.deploymentService.addDeploymentByUrl(url).subscribe({
      next: (deployment: Deployment) => {
        this.isDeploymentsLoading = false;
        this.foundDeploymentList = [deployment];
        this.manualUrl = '';
      },
      error: (err: any) => {
        this.isDeploymentsLoading = false;
        console.error('Error adding deployment by manual URL:', err);

        // Provide specific error message for domain discovery
        let errorMessage = 'Failed to add StreetSignal. Please check the URL and try again.';
        if (err.message && err.message.includes('Could not find StreetSignal installation')) {
          errorMessage =
            'Could not find a StreetSignal installation at that domain. Please verify the domain is correct and has StreetSignal installed.';
        }

        this.toastService.presentToast({
          header: 'Error',
          message: errorMessage,
          buttons: [],
        });
      },
    });
  }

  public async addByQrCode(): Promise<void> {
    try {
      // Check camera permission
      const status = await BarcodeScanner.checkPermission({ force: true });

      if (status.granted) {
        // Hide background to show camera
        BarcodeScanner.hideBackground();

        // Start scanning
        const result = await BarcodeScanner.startScan();

        // Show background again
        BarcodeScanner.showBackground();

        if (result.hasContent) {
          const scannedUrl = result.content;
          console.log('QR Code scanned:', scannedUrl);

          // Validate if it's a valid URL
          if (this.deploymentService.isValidUrl(scannedUrl)) {
            this.isDeploymentsLoading = true;

            // Use the deployment service to add the scanned URL
            this.deploymentService.addDeploymentByUrl(scannedUrl).subscribe({
              next: (deployment: Deployment) => {
                this.isDeploymentsLoading = false;
                this.foundDeploymentList = [deployment];

                this.toastService.presentToast({
                  header: 'QR Code Scanned Successfully',
                  message: 'StreetSignal deployment found and ready to add.',
                  buttons: [],
                });
              },
              error: (err: any) => {
                this.isDeploymentsLoading = false;
                console.error('Error adding deployment from QR code:', err);

                // Provide specific error message for domain discovery
                let errorMessage =
                  'Failed to add StreetSignal from QR code. Please check the URL and try again.';
                if (
                  err.message &&
                  err.message.includes('Could not find StreetSignal installation')
                ) {
                  errorMessage =
                    'Could not find a StreetSignal installation at that domain. Please verify the QR code contains a valid StreetSignal URL.';
                }

                this.toastService.presentToast({
                  header: 'Error',
                  message: errorMessage,
                  buttons: [],
                });
              },
            });
          } else {
            this.toastService.presentToast({
              header: 'Invalid QR Code',
              message: 'The scanned QR code does not contain a valid StreetSignal URL.',
              buttons: [],
            });
          }
        }
      } else {
        // Permission denied
        this.toastService.presentToast({
          header: 'Camera Permission Required',
          message: 'Please allow camera access to scan QR codes.',
          buttons: [],
        });
      }
    } catch (error) {
      console.error('QR Code scanning error:', error);

      // Show background again in case of error
      BarcodeScanner.showBackground();

      this.toastService.presentToast({
        header: 'Scanning Error',
        message: 'An error occurred while scanning the QR code. Please try again.',
        buttons: [],
      });
    }
  }
}
