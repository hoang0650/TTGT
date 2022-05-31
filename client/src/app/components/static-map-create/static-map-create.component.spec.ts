import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StaticMapCreateComponent } from './static-map-create.component';

describe('StaticMapCreateComponent', () => {
  let component: StaticMapCreateComponent;
  let fixture: ComponentFixture<StaticMapCreateComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ StaticMapCreateComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(StaticMapCreateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
