import {NgModule} from '@angular/core';
import {Gw2GoldPipe} from '@app/shared/pipes/gw2-gold.pipe';

@NgModule({
  declarations: [
    Gw2GoldPipe
  ],
  exports: [
    Gw2GoldPipe
  ]
})
export class SharedModule {
}
