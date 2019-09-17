import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ArchivedLobComponent } from './archived-lob.component';

describe('ArchivedLobComponent', () => {
  let component: ArchivedLobComponent;
  let fixture: ComponentFixture<ArchivedLobComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ArchivedLobComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ArchivedLobComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
