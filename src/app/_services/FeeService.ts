import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Fee } from '../schemas/fee-schema';

@Injectable()
export class FeeService {

    selectedItems = signal<any[]>([]);

    setSelectedItems(items: any[]) {
        this.selectedItems.set(items);
    }

    clearItems() {
        this.selectedItems.set([]);
    }

    getData(): Fee[] {
        return [
            {
                name: "Amendment of title 1",
                category: "trademark",
                basicFee: 70,
                variableFee: 40
            },
            {
                name: "Amendment of Claim 1",
                category: "trademark",
                basicFee: 50,
                variableFee: 30
            },
            {
                name: "Amendment of description 1",
                category: "geographical indications",
                basicFee: 20,
                variableFee: 10
            },
            {
                name: "Amendment of title 3",
                category: "patent",
                basicFee: 70,
                variableFee: 40
            },
            {
                name: "PCT_Nation Phase Entry 1",
                category: "copyright",
                basicFee: 70,
                variableFee: 40
            },
            {
                name: "Amendment of title 4",
                category: "trademark",
                basicFee: 70,
                variableFee: 40
            },
            {
                name: "Amendment of Claim 2",
                category: "industrial design",
                basicFee: 50,
                variableFee: 30
            },
            {
                name: "Amendment of description 2",
                category: "patent",
                basicFee: 20,
                variableFee: 10
            },
            {
                name: "Amendment of title 5",
                category: "geographical indications",
                basicFee: 70,
                variableFee: 40
            },
            {
                name: "PCT_Nation Phase Entry 2",
                category: "industrial design",
                basicFee: 70,
                variableFee: 40
            },
            {
                name: "Amendment of title 6",
                category: "trademark",
                basicFee: 70,
                variableFee: 40
            },
            {
                name: "Amendment of Claim 3",
                category: "trademark",
                basicFee: 50,
                variableFee: 30
            },
            {
                name: "Amendment of description 3",
                category: "geographical indications",
                basicFee: 20,
                variableFee: 10
            },
            {
                name: "Amendment of title 7",
                category: "patent",
                basicFee: 70,
                variableFee: 40
            },
            {
                name: "PCT_Nation Phase Entry 3",
                category: "copyright",
                basicFee: 70,
                variableFee: 40
            },
            {
                name: "Amendment of title 8",
                category: "trademark",
                basicFee: 70,
                variableFee: 40
            },
            {
                name: "Amendment of Claim 4",
                category: "industrial design",
                basicFee: 50,
                variableFee: 30
            },
            {
                name: "Amendment of description 4",
                category: "patent",
                basicFee: 20,
                variableFee: 10
            },
            {
                name: "Amendment of title 9",
                category: "geographical indications",
                basicFee: 70,
                variableFee: 40
            },
            {
                name: "PCT_Nation Phase Entry 4",
                category: "industrial design",
                basicFee: 70,
                variableFee: 40
            }
        ];
    }

    constructor(private http: HttpClient) { }

    getFeeServices() {
        return Promise.resolve(this.getData());
    }
};