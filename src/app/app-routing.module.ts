import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {JobXpComponent} from './features/dofus/job-xp/job-xp.component';
import {HomeComponent} from './features/home/home.component';
import {DOFUS_JOB_XP_PATH, GW2_BUSINESS_PATH} from './app-routing.constants';
import {BusinessComponent} from '@app/features/gw2/business/business.component';

const routes: Routes = [
  {
    path: DOFUS_JOB_XP_PATH,
    component: JobXpComponent,
  },
  {
    path: GW2_BUSINESS_PATH,
    component: BusinessComponent
  },
  {
    path: '',
    component: HomeComponent
  },
  {
    path: '**',
    redirectTo: '',
    pathMatch: 'full'
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {
}
