import { TestBed } from '@angular/core/testing';

import { RoadworkService } from './roadwork.service';

describe('RoadworkService', () => {
  let service: RoadworkService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(RoadworkService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
