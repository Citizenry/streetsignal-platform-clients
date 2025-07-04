import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subject, takeUntil, finalize } from 'rxjs';
import { TelegramBotService } from '../../../../core/services/telegram-bot.service';
import { TelegramBotStats } from '../../../../core/interfaces/telegram-bot.interface';

@Component({
  selector: 'app-telegram-stats',
  templateUrl: './telegram-stats.component.html',
  styleUrls: ['./telegram-stats.component.scss'],
})
export class TelegramStatsComponent implements OnInit, OnDestroy {
  stats: TelegramBotStats | null = null;
  loading = false;
  private destroy$ = new Subject<void>();

  constructor(private telegramService: TelegramBotService) {}

  ngOnInit(): void {
    this.loadStats();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadStats(): void {
    this.loading = true;
    this.telegramService
      .getStats()
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => (this.loading = false)),
      )
      .subscribe({
        next: (stats: TelegramBotStats) => {
          this.stats = stats;
        },
        error: (error) => {
          console.error('Error loading stats:', error);
        },
      });
  }

  onRefresh(): void {
    this.loadStats();
  }
}
