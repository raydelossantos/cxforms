import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SysadminListComponent } from './sysadmin-list.component';

describe('SysadminListComponent', () => {
  let component: SysadminListComponent;
  let fixture: ComponentFixture<SysadminListComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SysadminListComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SysadminListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
