import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Fee } from '../schemas/fee-schema';
import { JournalPublication } from '../schemas/journal-publication-schema';

@Injectable()
export class JournalPublicationService {

    selectedItems = signal<any[]>([]);

    setSelectedItems(items: any[]) {
        this.selectedItems.set(items);
    }

    clearItems() {
        this.selectedItems.set([]);
    }

    getData(): JournalPublication[] {
        return [
            {
                journalCode: "PJ-2025-Q1-001",
                name: "Patent Journal Q1 2025",
                category: "patent",
                status: "closed",
                creationDate: "2023-01-02",
                publicationDate: "2024-03-15",
                files: 201
            },
            {
                journalCode: "TG-2025-01-001",
                name: "Trademark Gazette January",
                category: "patent",
                status: "pending",
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
                status: "closed",
                creationDate: "2020-01-02",
                publicationDate: "2024-03-15",
                files: 10
            },
        ];
    }

    constructor(private http: HttpClient) { }

    getJournalPublicationServices() {
        return Promise.resolve(this.getData());
    }
};