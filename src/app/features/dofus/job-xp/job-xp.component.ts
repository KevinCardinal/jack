import {Component, OnInit} from '@angular/core';
import {SelectItem} from 'primeng';
import {DofusJobService} from '@app/core/services/dofus-job.service';

@Component({
  selector: 'app-job-xp',
  templateUrl: './job-xp.component.html',
  styleUrls: ['./job-xp.component.scss']
})
export class JobXpComponent implements OnInit {

  jobs: SelectItem[] = [];
  selectedJobId: string = null;
  crafts: SelectItem[] = [];
  selectedCraftCategoryId: string = null;
  startXp: number = null;
  startLevel: number = null;
  craftLevel: number = null;
  endLevel: number = null;
  craftNumber: number = null;

  constructor(private dofusJobService: DofusJobService) { }

  ngOnInit() {
    this.dofusJobService.getJobs()
      .subscribe(jobs => {
        this.jobs = jobs.map(job => ({label: job.name, value: job.id}));
        this.selectedJobId = this.jobs[0].value;
        this.retrieveCrafts();
      });
  }

  retrieveCrafts(): void {
    if (this.selectedJobId != null) {
      this.dofusJobService.getCraftCategories(this.selectedJobId)
        .subscribe(crafts => {
          this.crafts = crafts.map(craft => ({label: craft.name, value: craft.id}));
          this.selectedCraftCategoryId = this.crafts[0].value;
        });
    }
  }

  convertLevelToXp(): void {
    this.startXp = null;
    this.dofusJobService.convertLevelTpXp(this.startLevel)
      .subscribe(startXp => this.startXp = startXp);
  }

  computeRemainingCrafts(): void {
    this.craftNumber = null;
    this.dofusJobService.convertLevelTpXp(this.endLevel)
      .subscribe(endXp => {
        this.dofusJobService.remainingCrafts(this.startXp, endXp, this.selectedCraftCategoryId, this.craftLevel)
          .subscribe(craftNumber => this.craftNumber = craftNumber);
      });
  }

}
