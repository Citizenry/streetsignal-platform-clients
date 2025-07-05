import { Component, OnInit } from '@angular/core';
import { takeUntilDestroy$ } from '@helpers';
import { WebhooksService, WebhookResultInterface } from '@mzima-client/sdk';
import { Observable } from 'rxjs';
import { BreakpointService } from '@services';
import { LoggingService } from '../../core/services/logging.service';

@Component({
  selector: 'app-webhooks',
  templateUrl: './webhooks.component.html',
  styleUrls: ['./webhooks.component.scss'],
})
export class WebhooksComponent implements OnInit {
  public webhookList: WebhookResultInterface[] = [];
  public webhookState$: Observable<any>;
  public isDesktop$: Observable<boolean>;

  constructor(
    private webhooksService: WebhooksService,
    private breakpointService: BreakpointService,
    private logger: LoggingService,
  ) {
    this.isDesktop$ = this.breakpointService.isDesktop$.pipe(takeUntilDestroy$());
    this.webhookState$ = this.webhooksService.changeWebhookState$.pipe(takeUntilDestroy$());
  }

  ngOnInit() {
    this.getWebhookList();
    this.webhookState$.subscribe({
      next: (value) => {
        if (value) this.getWebhookList();
      },
      error: (err) => this.logger.error('Failed to subscribe to webhook state changes', err),
    });
  }

  getWebhookList() {
    this.webhooksService.get().subscribe({
      next: (response) => {
        this.webhookList = response.results;
        this.webhooksService.setState(false);
      },
      error: (err: any) => this.logger.error('Failed to fetch webhook list', err),
    });
  }
}
