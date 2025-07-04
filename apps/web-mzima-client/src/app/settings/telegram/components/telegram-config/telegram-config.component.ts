import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Subject, takeUntil, finalize } from 'rxjs';
import { TelegramBotService } from '../../../../core/services/telegram-bot.service';
import {
  TelegramBotConfig,
  TelegramBotConfigRequest,
} from '../../../../core/interfaces/telegram-bot.interface';

@Component({
  selector: 'app-telegram-config',
  templateUrl: './telegram-config.component.html',
  styleUrls: ['./telegram-config.component.scss'],
})
export class TelegramConfigComponent implements OnInit, OnDestroy {
  configForm: FormGroup;
  loading = false;
  saving = false;
  private destroy$ = new Subject<void>();

  constructor(
    private fb: FormBuilder,
    private telegramService: TelegramBotService,
    private snackBar: MatSnackBar,
  ) {
    this.configForm = this.fb.group({
      is_enabled: [false],
      webhook_url: [''],
      default_survey_id: [null],
      bot_token: ['', [Validators.required]],
      bot_username: [''],
    });
  }

  ngOnInit(): void {
    this.loadConfig();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadConfig(): void {
    this.loading = true;
    this.telegramService
      .getConfig()
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => (this.loading = false)),
      )
      .subscribe({
        next: (config: TelegramBotConfig) => {
          this.configForm.patchValue({
            is_enabled: config.is_enabled,
            webhook_url: config.webhook_url,
            default_survey_id: config.default_survey_id,
            bot_token: config.settings?.['bot_token'] || '',
            bot_username: config.settings?.['bot_username'] || '',
          });
        },
        error: (error) => {
          console.error('Error loading config:', error);
          this.snackBar.open('Failed to load configuration', 'Close', {
            duration: 3000,
          });
        },
      });
  }

  onSave(): void {
    if (this.configForm.invalid) {
      this.configForm.markAllAsTouched();
      return;
    }

    this.saving = true;
    const formValue = this.configForm.value;
    const configRequest: TelegramBotConfigRequest = {
      is_enabled: formValue.is_enabled,
      webhook_url: formValue.webhook_url,
      default_survey_id: formValue.default_survey_id,
      settings: {
        bot_token: formValue.bot_token,
        bot_username: formValue.bot_username,
      },
    };

    this.telegramService
      .updateConfig(configRequest)
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => (this.saving = false)),
      )
      .subscribe({
        next: () => {
          this.snackBar.open('Configuration saved successfully', 'Close', {
            duration: 3000,
          });
        },
        error: (error) => {
          console.error('Error saving config:', error);
          this.snackBar.open('Failed to save configuration', 'Close', {
            duration: 3000,
          });
        },
      });
  }

  onSetupWebhook(): void {
    this.telegramService
      .setupWebhook()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          this.snackBar.open(response.message || 'Webhook setup successful', 'Close', {
            duration: 3000,
          });
          this.loadConfig(); // Reload to get updated webhook URL
        },
        error: (error) => {
          console.error('Error setting up webhook:', error);
          this.snackBar.open('Failed to setup webhook', 'Close', {
            duration: 3000,
          });
        },
      });
  }
}
