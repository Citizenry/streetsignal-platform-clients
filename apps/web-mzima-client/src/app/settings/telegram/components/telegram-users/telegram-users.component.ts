import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subject, takeUntil, finalize } from 'rxjs';
import { TelegramBotService } from '../../../../core/services/telegram-bot.service';
import { TelegramBotUser } from '../../../../core/interfaces/telegram-bot.interface';

@Component({
  selector: 'app-telegram-users',
  templateUrl: './telegram-users.component.html',
  styleUrls: ['./telegram-users.component.scss'],
})
export class TelegramUsersComponent implements OnInit, OnDestroy {
  users: TelegramBotUser[] = [];
  loading = false;
  displayedColumns: string[] = ['username', 'first_name', 'last_name', 'created_at', 'last_active'];
  private destroy$ = new Subject<void>();

  constructor(private telegramService: TelegramBotService) {}

  ngOnInit(): void {
    this.loadUsers();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadUsers(): void {
    this.loading = true;
    this.telegramService
      .getUsers()
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => (this.loading = false)),
      )
      .subscribe({
        next: (response) => {
          this.users = response.results;
        },
        error: (error) => {
          console.error('Error loading users:', error);
        },
      });
  }

  onRefresh(): void {
    this.loadUsers();
  }
}
