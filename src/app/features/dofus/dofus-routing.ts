import {Route, RouterModule} from '@angular/router';
import {DofusXpComponent} from "./dofus-xp/dofus-xp.component";

const DOFUS_ROUTES: Route[] = [
  {
    path: 'xp', component: DofusXpComponent
  }
];

export const dofusRouting = RouterModule.forChild(DOFUS_ROUTES);
