import { Injectable } from '@angular/core';

export interface BatchItem {
  batchId: string;
  capturedOn: string;
  modifiedOn: string;
  lockedBy: string;
  noOfDocs: number;
  noOfPages: number;
  status: string;
}

export interface IndexationStats {
  label: string;
  count: string;
  periodText?: string;
  period?: string;
  color?: string;
  icon?: string;
}

const MOCK_INDEXATION_STATS: IndexationStats[] = [
      {
        label: 'Total Batches',
        count: '127',
        periodText: '+12 from yesterday',
        period: 'this.totalBatchesPeriod',
        color: '#1976D2',
        icon: 'pi pi-folder',
      },
      {
        label: 'Pending Indexing',
        count: '8',
        periodText: 'Current queue',
        period: 'this.pendingIndexingPeriod',
        color: '#F57C00',
        icon: 'pi pi-clock',
      },
      {
        label: 'Completed Today',
        count: '45',
        periodText: '+18% from yesterday',
        period: 'this.completedTodayPeriod',
        color: '#388E3C',
        icon: 'pi pi-check-circle',
      },
      {
        label: 'Issues Detected',
        count: '3',
        periodText: 'Requires attention',
        period: 'this.issuesDetectedPeriod',
        color: '#D32F2F',
        icon: 'pi pi-exclamation-triangle',
      },
    ];

const MOCK_BATCHES: BatchItem[] = [
  {
    batchId: 'JO-ED6721EE-E988-4C4B-BEDF-721100984322',
    capturedOn: '2022-04-01 18:36:35',
    modifiedOn: '2022-04-01 18:37:13',
    lockedBy: 'admin',
    noOfDocs: 2,
    noOfPages: 2,
    status: 'Pending Indexing',
  },
  {
    batchId: 'JO-D75243B8-DBEC-49CA-BEC7-88F470EFA474',
    capturedOn: '2022-04-01 18:36:35',
    modifiedOn: '2023-04-01 18:37:13',
    lockedBy: 'user',
    noOfDocs: 2,
    noOfPages: 2,
    status: 'Pending Indexing',
  },
  {
    batchId: 'ganesh20220401071901',
    capturedOn: '2022-04-01 07:19:31',
    modifiedOn: '-',
    lockedBy: 'admin',
    noOfDocs: 4,
    noOfPages: 15,
    status: 'Pending Indexing',
  },
  {
    batchId: 'Batch1647953858569',
    capturedOn: '2024-04-01 07:15:55',
    modifiedOn: '-',
    lockedBy: 'user',
    noOfDocs: 1,
    noOfPages: 1,
    status: 'Pending Indexing',
  },
  {
    batchId: 'Batch164802945917',
    capturedOn: '2022-04-01 07:15:55',
    modifiedOn: '-',
    lockedBy: 'admin',
    noOfDocs: 1,
    noOfPages: 2,
    status: 'Pending Indexing',
  },
  {
    batchId: 'Batch1647953200922',
    capturedOn: '2022-04-01 07:15:55',
    modifiedOn: '-',
    lockedBy: 'admin',
    noOfDocs: 1,
    noOfPages: 1,
    status: 'Pending Indexing',
  },
  {
    batchId: 'mitesh20220401071408',
    capturedOn: '2022-04-01 07:15:55',
    modifiedOn: '-',
    lockedBy: 'user',
    noOfDocs: 16,
    noOfPages: 56,
    status: 'Pending Indexing',
  },
  {
    batchId: 'Batch1647953380964',
    capturedOn: '2022-04-01 07:15:55',
    modifiedOn: '-',
    lockedBy: 'admin',
    noOfDocs: 2,
    noOfPages: 2,
    status: 'Pending Indexing',
  },
];

@Injectable()
export class CaptureDocumentService {
  constructor() {}

  // replace with real API call later
  getIndexationStats(): Promise<IndexationStats[]> {
    return Promise.resolve(MOCK_INDEXATION_STATS.slice());
  }

  getBatches(): Promise<BatchItem[]> {
    return Promise.resolve(MOCK_BATCHES.slice());
  }
}