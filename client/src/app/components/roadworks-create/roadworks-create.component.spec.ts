import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RoadworksCreateComponent } from './roadworks-create.component';

describe('RoadworksCreateComponent', () => {
  let component: RoadworksCreateComponent;
  let fixture: ComponentFixture<RoadworksCreateComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ RoadworksCreateComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(RoadworksCreateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
