import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatSelectModule } from '@angular/material/select';
import { MatTabsModule } from '@angular/material/tabs';
import { MatTableModule } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBarModule } from '@angular/material/snack-bar';

import { TelegramRoutingModule } from './telegram-routing.module';
import { TelegramComponent } from './telegram.component';
import { TelegramConfigComponent } from './components/telegram-config/telegram-config.component';
import { TelegramUsersComponent } from './components/telegram-users/telegram-users.component';
import { TelegramStatsComponent } from './components/telegram-stats/telegram-stats.component';

@NgModule({
  declarations: [
    TelegramComponent,
    TelegramConfigComponent,
    TelegramUsersComponent,
    TelegramStatsComponent,
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    TelegramRoutingModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatSlideToggleModule,
    MatSelectModule,
    MatTabsModule,
    MatTableModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
  ],
})
export class TelegramModule {}
