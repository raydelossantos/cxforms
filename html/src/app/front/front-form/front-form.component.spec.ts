import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FrontFormComponent } from './front-form.component';

describe('FrontFormComponent', () => {
  let component: FrontFormComponent;
  let fixture: ComponentFixture<FrontFormComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FrontFormComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FrontFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
