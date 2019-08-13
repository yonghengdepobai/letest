import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RxoneComponent } from './rxone.component';

describe('RxoneComponent', () => {
  let component: RxoneComponent;
  let fixture: ComponentFixture<RxoneComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RxoneComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RxoneComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
