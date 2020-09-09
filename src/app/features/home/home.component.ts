import {Component, OnInit} from '@angular/core';
import {DOFUS_JOB_XP_PATH, GW2_BUSINESS_PATH} from 'src/app/app-routing.constants';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {

  DOFUS_JOB_XP_PATH = DOFUS_JOB_XP_PATH;
  GW2_BUSINESS_PATH = GW2_BUSINESS_PATH;

  constructor() { }

  ngOnInit() {
  }

}
