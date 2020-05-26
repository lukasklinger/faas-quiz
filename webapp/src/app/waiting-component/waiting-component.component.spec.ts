import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { WaitingComponentComponent } from './waiting-component.component';

describe('WaitingComponentComponent', () => {
  let component: WaitingComponentComponent;
  let fixture: ComponentFixture<WaitingComponentComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ WaitingComponentComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(WaitingComponentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
