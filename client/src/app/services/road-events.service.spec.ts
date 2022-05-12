import { TestBed } from '@angular/core/testing';

import { RoadEventsService } from './road-events.service';

describe('RoadEventsService', () => {
  let service: RoadEventsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(RoadEventsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
