import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DeletedTeamComponent } from './deleted-team.component';

describe('DeletedTeamComponent', () => {
  let component: DeletedTeamComponent;
  let fixture: ComponentFixture<DeletedTeamComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DeletedTeamComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DeletedTeamComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
