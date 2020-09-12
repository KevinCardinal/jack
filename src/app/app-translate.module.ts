import {HttpClient} from '@angular/common/http';
import {APP_INITIALIZER, Injector, NgModule} from '@angular/core';
import {TranslateLoader, TranslateModule, TranslateService} from '@ngx-translate/core';
import {TranslateHttpLoader} from '@ngx-translate/http-loader';
import {LOCATION_INITIALIZED} from '@angular/common';

@NgModule({
  imports: [
    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useFactory: createTranslateLoader,
        deps: [HttpClient]
      },
      isolate: false
    })
  ],
  exports: [TranslateModule],
  providers: [
    {
      provide: APP_INITIALIZER,
      useFactory: initTranslations,
      deps: [TranslateService, Injector],
      multi: true
    }
  ]
})
export class AppTranslateModule {
}

export function createTranslateLoader(http: HttpClient) {
  return new TranslateHttpLoader(http, 'assets/i18n/', '.json');
}

export function initTranslations(translate: TranslateService, injector: Injector) {
  return () => new Promise<any>((resolve: any) => {
    const locationInitialized = injector.get(LOCATION_INITIALIZED, Promise.resolve(null));
    locationInitialized.then(() => {
      let browserLang = translate.getBrowserLang();
      translate.setDefaultLang('fr');
      translate.use('fr')
        .subscribe(() => {}, () => {}, () => resolve(null));
    });
  });
}
