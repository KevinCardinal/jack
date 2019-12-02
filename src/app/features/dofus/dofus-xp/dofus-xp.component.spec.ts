import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DofusXpComponent } from './dofus-xp.component';

describe('DofusXpComponent', () => {
  let component: DofusXpComponent;
  let fixture: ComponentFixture<DofusXpComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DofusXpComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DofusXpComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
