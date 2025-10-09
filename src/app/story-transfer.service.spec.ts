import { TestBed } from '@angular/core/testing';

import { StoryTransferService } from './story-transfer.service';

describe('StoryTransferService', () => {
  let service: StoryTransferService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(StoryTransferService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
