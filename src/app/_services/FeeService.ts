import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Fee } from '../schemas/fee-schema';

@Injectable()
export class FeeService {
    getData(): Fee[] {
        return [
            {
                name: "Amendment of title",
                category: "trademark",
                basicFee: 70,
                variableFee: 40
            },
            {
                name: "Amendment of Claim",
                category: "trademark",
                basicFee: 50,
                variableFee: 30
            },
            {
                name: "Amendment of description",
                category: "gi",
                basicFee: 20,
                variableFee: 10
            },
            {
                name: "Amendment of title",
                category: "patent",
                basicFee: 70,
                variableFee: 40
            },
            {
                name: "PCT_Nation Phase Entry",
                category: "copyright",
                basicFee: 70,
                variableFee: 40
            },
            {
                name: "Amendment of title",
                category: "trademark",
                basicFee: 70,
                variableFee: 40
            },
            {
                name: "Amendment of Claim",
                category: "industrial design",
                basicFee: 50,
                variableFee: 30
            },
            {
                name: "Amendment of description",
                category: "patent",
                basicFee: 20,
                variableFee: 10
            },
            {
                name: "Amendment of title",
                category: "gi",
                basicFee: 70,
                variableFee: 40
            },
            {
                name: "PCT_Nation Phase Entry",
                category: "industrial design",
                basicFee: 70,
                variableFee: 40
            },
            {
                name: "Amendment of title",
                category: "trademark",
                basicFee: 70,
                variableFee: 40
            },
            {
                name: "Amendment of Claim",
                category: "trademark",
                basicFee: 50,
                variableFee: 30
            },
            {
                name: "Amendment of description",
                category: "gi",
                basicFee: 20,
                variableFee: 10
            },
            {
                name: "Amendment of title",
                category: "patent",
                basicFee: 70,
                variableFee: 40
            },
            {
                name: "PCT_Nation Phase Entry",
                category: "copyright",
                basicFee: 70,
                variableFee: 40
            },
            {
                name: "Amendment of title",
                category: "trademark",
                basicFee: 70,
                variableFee: 40
            },
            {
                name: "Amendment of Claim",
                category: "industrial design",
                basicFee: 50,
                variableFee: 30
            },
            {
                name: "Amendment of description",
                category: "patent",
                basicFee: 20,
                variableFee: 10
            },
            {
                name: "Amendment of title",
                category: "gi",
                basicFee: 70,
                variableFee: 40
            },
            {
                name: "PCT_Nation Phase Entry",
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