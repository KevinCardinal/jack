import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {JobXpComponent} from './features/dofus/job-xp/job-xp.component';
import {HomeComponent} from './features/home/home.component';
import {DOFUS_JOB_XP_PATH} from './app-routing.constants';

const routes: Routes = [
  {
    path: DOFUS_JOB_XP_PATH,
    component: JobXpComponent,
  },
  {
    path: '',
    component: HomeComponent
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {
}
