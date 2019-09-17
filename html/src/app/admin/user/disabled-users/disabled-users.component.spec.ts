import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DisabledUsersComponent } from './disabled-users.component';

describe('DisabledUsersComponent', () => {
  let component: DisabledUsersComponent;
  let fixture: ComponentFixture<DisabledUsersComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DisabledUsersComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DisabledUsersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
