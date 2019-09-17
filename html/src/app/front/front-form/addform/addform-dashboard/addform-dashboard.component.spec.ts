import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AddformDashboardComponent } from './addform-dashboard.component';

describe('AddformDashboardComponent', () => {
  let component: AddformDashboardComponent;
  let fixture: ComponentFixture<AddformDashboardComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AddformDashboardComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AddformDashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
