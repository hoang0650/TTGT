import { TestBed } from '@angular/core/testing';

import { StaticMapService } from './static-map.service';

describe('StaticMapService', () => {
  let service: StaticMapService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(StaticMapService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
