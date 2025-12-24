import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Fee } from '../schemas/fee-schema';
import { JournalPublication } from '../schemas/journal-publication-schema';
import { Observable, of } from 'rxjs';

@Injectable()
export class OnlinePublicationJournalService {

    selectedItems = signal<any[]>([]);

    setSelectedItems(items: any[]) {
        this.selectedItems.set(items);
    }

    clearItems() {
        this.selectedItems.set([]);
    }

    getData(): any[] {
        return [
            {
                journalCode: "PJ-2025-Q1-001",
                name: "Patent Journal Q1 2025",
                category: "patent",
                status: "pending",
                creationDate: "2023-01-02",
                publicationDate: "2024-03-15",
                files: 201
            },
            {
                journalCode: "PJ-2025-01-001",
                name: "Patent Gazette January",
                category: "patent",
                status: "pending",
                creationDate: "2022-01-02",
                publicationDate: "2024-03-15",
                files: 100
            },
            {
                journalCode: "PJ-2025-01-006",
                name: "Patent Gazette February",
                category: "patent",
                status: "published",
                creationDate: "2022-01-02",
                publicationDate: "2024-03-15",
                files: 100
            },
            {
                journalCode: "DJ-2024-12-003",
                name: "Design Journal December",
                category: "trademark",
                status: "published",
                creationDate: "2021-01-02",
                publicationDate: "2025-03-15",
                files: 126
            },
            {
                journalCode: "CB-2024-Q4-001",
                name: "Copyright Bulletin Q4",
                category: "industrial design",
                status: "pending",
                creationDate: "2024-01-02",
                publicationDate: "2024-03-15",
                files: 33
            },
            {
                journalCode: "AL-2024-12-001",
                name: "Assignments & Licenses December",
                category: "industrial design",
                status: "pending",
                creationDate: "2024-01-02",
                publicationDate: "2024-03-15",
                files: 48
            },
            {
                journalCode: "PJ-2025-Q2-002",
                name: "Patent Journal Q2 2025",
                category: "post filings",
                status: "published",
                creationDate: "2020-01-02",
                publicationDate: "2024-03-15",
                files: 10
            },
        ];
    }

    getOnlinePublicationJournalData(): Observable<any> {
        return of({
            regularExtraction: [
                {
                    category: "trademarks",
                    lastExecution: "2025-11-25 14:30",
                    totalApplications: 1247,
                    nextPublication: "2025-11-27 02:00",
                    status: "completed",
                    progressPercentage: 100
                },
                {
                    category: "patents",
                    lastExecution: "2025-11-26 03:15",
                    totalApplications: 892,
                    nextPublication: "2025-11-26 15:45",
                    status: "processing",
                    progressPercentage: 64
                },
                {
                    category: "industrial designs",
                    lastExecution: "2025-11-25 18:20",
                    totalApplications: 534,
                    nextPublication: "2025-11-27 04:00",
                    status: "completed",
                    progressPercentage: 100
                },
            ],
            fullExtraction: [
                {
                    category: "trademarks",
                    lastFullExecution: "2025-11-01 00:00",
                    totalApplications: 45678,
                    nextPublication: "2025-12-01 00:00",
                    status: "completed",
                    progressPercentage: 100
                },
                {
                    category: "patents",
                    lastFullExecution: "2025-10-28 22:30",
                    totalApplications: 32145,
                    nextPublication: "2025-11-26 14:20",
                    status: "processing",
                    progressPercentage: 64
                },
                {
                    category: "industrial designs",
                    lastFullExecution: "2025-11-15 12:00",
                    totalApplications: 18923,
                    nextPublication: "2025-12-15 12:00",
                    status: "completed",
                    progressPercentage: 100
                },
            ],
            activityFeed: [
                {
                    category: "patents",
                    status: "completed",
                    message: "Incremental extraction completed successfully",
                    updatedAt: "2025-11-26 15:45:32",
                    progressPercentage: 100
                },
                {
                    category: "patents",
                    status: "processing",
                    message: "Full extraction in progress - Processing year 2020",
                    updatedAt: "2025-11-26 14:20:15",
                    progressPercentage: 64
                },
                {
                    category: "trademarks",
                    status: "scheduled",
                    message: "Next incremental extraction scheduled",
                    updatedAt: "2025-11-26 14:20:15",
                    progressPercentage: 0
                },
                {
                    category: "industial Designs",
                    status: "scheduled",
                    message: "Data validation completed - 534 records processed",
                    updatedAt: "2025-11-25 18:25:10",
                    progressPercentage: 100
                },
            ]
        })
    }

    constructor(private http: HttpClient) { }

    getJournalPublicationServices() {
        return Promise.resolve(this.getData());
    }
};