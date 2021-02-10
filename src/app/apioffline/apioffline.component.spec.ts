import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ApiofflineComponent } from './apioffline.component';

describe('ApiofflineComponent', () => {
  let component: ApiofflineComponent;
  let fixture: ComponentFixture<ApiofflineComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ApiofflineComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ApiofflineComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
