import { TestBed } from '@angular/core/testing';

import { FixnearService } from './fixnear.service';

describe('FixnearService', () => {
  let service: FixnearService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(FixnearService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
