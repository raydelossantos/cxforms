import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ArchivedFormsComponent } from './archived-forms.component';

describe('ArchivedFormsComponent', () => {
  let component: ArchivedFormsComponent;
  let fixture: ComponentFixture<ArchivedFormsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ArchivedFormsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ArchivedFormsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
