import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { EnvService } from './env.service';
import {
  TelegramBotConfig,
  TelegramBotConfigRequest,
  TelegramBotUser,
  TelegramConversation,
  TelegramBotStats,
  TelegramWebhookSetupResponse,
} from '../interfaces/telegram-bot.interface';

@Injectable({
  providedIn: 'root',
})
export class TelegramBotService {
  private readonly baseUrl: string;

  constructor(private httpClient: HttpClient, private env: EnvService) {
    this.baseUrl = `${this.env.environment.backend_url}${this.env.environment.api_v5}telegram`;
  }

  /**
   * Get current bot configuration
   */
  getConfig(): Observable<TelegramBotConfig> {
    return this.httpClient.get<TelegramBotConfig>(`${this.baseUrl}/config`);
  }

  /**
   * Update bot configuration
   */
  updateConfig(config: TelegramBotConfigRequest): Observable<{ message: string }> {
    return this.httpClient.put<{ message: string }>(`${this.baseUrl}/config`, config);
  }

  /**
   * Setup webhook with Telegram
   */
  setupWebhook(): Observable<TelegramWebhookSetupResponse> {
    return this.httpClient.post<TelegramWebhookSetupResponse>(`${this.baseUrl}/setup`, {});
  }

  /**
   * Get bot usage statistics
   */
  getStats(): Observable<TelegramBotStats> {
    return this.httpClient.get<TelegramBotStats>(`${this.baseUrl}/stats`);
  }

  /**
   * Get list of Telegram bot users
   */
  getUsers(): Observable<{ results: TelegramBotUser[] }> {
    return this.httpClient.get<{ results: TelegramBotUser[] }>(`${this.baseUrl}/users`);
  }

  /**
   * Get list of active conversations
   */
  getConversations(): Observable<{ results: TelegramConversation[] }> {
    return this.httpClient.get<{ results: TelegramConversation[] }>(
      `${this.baseUrl}/conversations`,
    );
  }
}
