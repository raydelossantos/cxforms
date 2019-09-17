import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ForminfoComponent } from './forminfo.component';

describe('ForminfoComponent', () => {
  let component: ForminfoComponent;
  let fixture: ComponentFixture<ForminfoComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ForminfoComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ForminfoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
