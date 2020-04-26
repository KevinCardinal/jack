import {BrowserModule} from '@angular/platform-browser';
import {NgModule} from '@angular/core';

import {AppRoutingModule} from './app-routing.module';
import {AppComponent} from './app.component';
import {DofusModule} from './features/dofus/dofus.module';
import {HomeModule} from './features/home/home.module';
import {DofusJobService} from './core/services/dofus-job.service';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {SharedModule} from '@app/shared/shared.module';

@NgModule({
  declarations: [
    AppComponent,
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    AppRoutingModule,
    DofusModule,
    HomeModule,
    SharedModule
  ],
  providers: [
    DofusJobService
  ],
  bootstrap: [AppComponent]
})
export class AppModule {
}
