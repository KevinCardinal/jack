import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DofusComponent } from './dofus.component';

describe('DofusComponent', () => {
  let component: DofusComponent;
  let fixture: ComponentFixture<DofusComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DofusComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DofusComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
