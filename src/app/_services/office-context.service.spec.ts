import { TestBed } from '@angular/core/testing';

import { OfficeContextService } from './office-context.service';

describe('OfficeContextService', () => {
  let service: OfficeContextService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(OfficeContextService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
