import {NgModule} from "@angular/core";
import {DofusXpComponent} from "./dofus-xp/dofus-xp.component";
import {dofusRouting} from "./dofus-routing";

@NgModule({
    declarations: [
        DofusXpComponent
    ],
    imports: [
        dofusRouting
    ]
})
export class DofusModule {}
