import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ArchivedClientComponent } from './archived-client.component';

describe('ArchivedClientComponent', () => {
  let component: ArchivedClientComponent;
  let fixture: ComponentFixture<ArchivedClientComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ArchivedClientComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ArchivedClientComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
