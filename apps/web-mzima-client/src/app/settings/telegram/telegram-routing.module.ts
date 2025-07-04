import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { TelegramComponent } from './telegram.component';

const routes: Routes = [
  {
    path: '',
    component: TelegramComponent,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class TelegramRoutingModule {}
