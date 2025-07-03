import { TextFieldModule } from '@angular/cdk/text-field';
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { IonicModule } from '@ionic/angular';
import { TranslateModule } from '@ngx-translate/core';
import { SortByFieldModule } from '@pipes';
import { SharedModule } from '@shared';
import { DateSelectModule } from '../../map/components/date-select/date-select.module';
import { PostComponentsModule } from '../components/post-components.module';
import { PostEditPage } from './post-edit.page';
import { PostEditRoutingModule } from './post-edit.routing.module';
import { VideoUploaderComponent } from '../video-uploader/video-uploader.component';
import { MultipleImageUploaderComponent } from '../multiple-image-uploader/multiple-image-uploader.component';

@NgModule({
  imports: [
    PostEditRoutingModule,
    CommonModule,
    IonicModule,
    ReactiveFormsModule,
    SharedModule,
    DateSelectModule,
    FormsModule,
    TextFieldModule,
    TranslateModule,
    PostComponentsModule,
    SortByFieldModule,
    TranslateModule,
    MatProgressBarModule,
  ],
  declarations: [PostEditPage, VideoUploaderComponent, MultipleImageUploaderComponent],
})
export class PostEditModule {}
