import {BrowserModule} from '@angular/platform-browser';
import {NgModule} from '@angular/core';

import {AppRoutingModule} from './app-routing.module';
import {AppComponent} from './app.component';
import {DofusModule} from './features/dofus/dofus.module';
import {HomeModule} from './features/home/home.module';
import {DofusJobService} from './core/services/dofus-job.service';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {SharedModule} from '@app/shared/shared.module';
import {Gw2BusinessRepository} from '@app/core/repositories/gw2-business-repository.service';
import {Gw2Module} from '@app/features/gw2/gw2.module';
import {HttpClientModule} from '@angular/common/http';
import {CompressionService} from '@app/core/services/compression.service';
import {DialogModule, DialogService, MessageService} from 'primeng';
import {ReactiveFormsModule} from '@angular/forms';
import {TranslateModule} from '@ngx-translate/core';
import {AppTranslateModule} from '@app/app-translate.module';

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
    SharedModule,
    Gw2Module,
    HttpClientModule,
    DialogModule,
    ReactiveFormsModule,
    TranslateModule,
    AppTranslateModule
  ],
  providers: [
    DofusJobService,
    Gw2BusinessRepository,
    CompressionService,
    DialogService,
    MessageService
  ],
  bootstrap: [AppComponent]
})
export class AppModule {
}
