import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {Gw2Component} from '@app/features/gw2/gw2.component';
import { BusinessComponent } from './business/business.component';
import {FlexLayoutModule} from '@angular/flex-layout';
import {ButtonModule} from 'primeng';

@NgModule({
  declarations: [
    Gw2Component,
    BusinessComponent
  ],
  imports: [
    CommonModule,
    FlexLayoutModule,
    ButtonModule
  ]
})
export class Gw2Module {
}
