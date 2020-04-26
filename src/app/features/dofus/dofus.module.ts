import {NgModule} from '@angular/core';
import {JobXpComponent} from './job-xp/job-xp.component';
import {ButtonModule, DropdownModule, InputTextModule, KeyFilterModule} from 'primeng';
import {FormsModule} from '@angular/forms';
import {FlexLayoutModule} from '@angular/flex-layout';
import {CommonModule} from '@angular/common';
import {DofusComponent} from './dofus.component';
import {SharedModule} from '@app/shared/shared.module';

@NgModule({
  declarations: [
    JobXpComponent,
    DofusComponent
  ],
  imports: [
    DropdownModule,
    FormsModule,
    InputTextModule,
    FlexLayoutModule,
    ButtonModule,
    CommonModule,
    KeyFilterModule
  ]
})
export class DofusModule {
}
