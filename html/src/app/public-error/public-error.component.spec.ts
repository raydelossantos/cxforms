import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PublicErrorComponent } from './public-error.component';

describe('PublicErrorComponent', () => {
  let component: PublicErrorComponent;
  let fixture: ComponentFixture<PublicErrorComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PublicErrorComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PublicErrorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
