import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {Gw2Component} from '@app/features/gw2/gw2.component';
import { BusinessComponent } from './business/business.component';
import {FlexLayoutModule} from '@angular/flex-layout';
import {
  ButtonModule,
  CheckboxModule,
  DropdownModule,
  InputTextModule,
  MultiSelectModule,
  TableModule,
  ToastModule
} from 'primeng';
import { RecipeDialogComponent } from './business/recipe-dialog/recipe-dialog.component';
import {SharedModule} from '@app/shared/shared.module';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {TranslateModule} from '@ngx-translate/core';

@NgModule({
  declarations: [
    Gw2Component,
    BusinessComponent,
    RecipeDialogComponent
  ],
  imports: [
    CommonModule,
    FlexLayoutModule,
    FormsModule,
    ButtonModule,
    TableModule,
    SharedModule,
    ReactiveFormsModule,
    MultiSelectModule,
    InputTextModule,
    CheckboxModule,
    ToastModule,
    TranslateModule,
    DropdownModule
  ]
})
export class Gw2Module {
}
