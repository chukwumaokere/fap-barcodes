import { TestBed } from '@angular/core/testing';

import { OfflineDetectorService } from './offline-detector.service';

describe('OfflineDetectorService', () => {
  let service: OfflineDetectorService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(OfflineDetectorService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
