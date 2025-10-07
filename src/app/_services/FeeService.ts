import { Injectable, signal } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Fee } from '../schemas/fee-schema';
import { catchError, Observable, of, switchMap, throwError } from 'rxjs';
import { AuthService } from './auth.service';
import { environment } from 'src/environments/environment';
import { ToastService } from './toast.service';

@Injectable()
export class FeeService {

    selectedItems = signal<any[]>([]);

    setSelectedItems(items: any[]) {
        this.selectedItems.set(items);
    }

    clearItems() {
        this.selectedItems.set([]);
    }

    constructor(
        private http: HttpClient,
        private authService: AuthService,
        private toastService: ToastService
    ) { }

    /**
 * Get the authorization headers with Bearer token
 */
    private getAuthHeaders(): Observable<HttpHeaders> {
        return this.authService.getEncodedTokens().pipe(
            switchMap((tokens) => {
                const officeCode = this.authService.getCurrentOfficeCode();
                if (tokens && tokens.accessToken) {
                    const headers = new HttpHeaders({
                        Authorization: `Bearer ${tokens.accessToken}`,
                        'Content-Type': 'application/json',
                        'wipo-platform-code': officeCode,
                    });
                    return of(headers);
                } else {
                    console.error('No access token available');
                    // Return headers without authorization - this will likely result in a 401
                    const headers = new HttpHeaders({
                        'Content-Type': 'application/json',
                        'wipo-platform-code': officeCode,
                    });
                    return of(headers);
                }
            })
        );
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

    /**
     * Handle HTTP errors and show appropriate toast messages
     */
    private handleError(error: any, operation: string): Observable<never> {
        let errorMessage = 'An unexpected error occurred';

        if (error.status === 401) {
            errorMessage = 'Authentication failed. Please log in again.';
            this.toastService.showError('Authentication Error', errorMessage);
        } else if (error.status === 403) {
            errorMessage = "You don't have permission to perform this action.";
            this.toastService.showError('Permission Denied', errorMessage);
        } else if (error.status === 404) {
            errorMessage = 'The requested resource was not found.';
            this.toastService.showError('Not Found', errorMessage);
        } else if (error.status === 0) {
            errorMessage = 'Network error. Please check your connection.';
            this.toastService.showError('Network Error', errorMessage);
        } else if (error.status >= 500) {
            errorMessage = 'Server error. Please try again later.';
            this.toastService.showError('Server Error', errorMessage);
        } else {
            errorMessage =
                error.message || error.error?.message || 'Unknown error occurred';
            this.toastService.showError('Error', errorMessage);
        }

        console.error(`${operation} failed:`, error);
        return throwError(() => new Error(errorMessage));
    }

    /**
     * Get Fees Conditions
     * Based on the API endpoint: {{baseUrl}}/services/fees/v1/conditions/all/application
     */
    getFeesConditions(): Observable<any> {
        return this.getAuthHeaders().pipe(
            switchMap((headers) =>
                this.http.get<any>(`${environment.feesConditionsUrl}`, {
                    headers: headers,
                })
            ),
            catchError((error) => this.handleError(error, 'Loading Fees Conditions'))
        );
    }

    getAPIData() {

        return {
            "platformCode": "vc",
            "currencyCode": "USD",
            "feePayableTotalAmount": 0.0,
            "feePayableTotalGrossAmount": 0.0,
            "feePayableTotalDiscountAmount": 0.0,
            "feePayableTotalTaxAmount": 0.0,
            "feeCalculationDate": "2025-09-22T12:05:24.130Z",
            "requestBag": [
                {
                    "responseFeeCount": 128,
                    "feeBag": [
                        {
                            "feeId": "010",
                            "feeCategory": "registration fee",
                            "feeTypeCode": "CLM",
                            "feeDescription": "Patent-Regular",
                            "basicFeeUnitAmount": 100.0,
                            "basicFeeUnitQuantity": 10,
                            "additionalFeeUnitAmount": 50.0,
                            "additionalFeeUnitQuantity": 5,
                            "taxInclusionFeeIndicator": false,
                            "globalTaxExclusionIndicator": true,
                            "feePayableTotalAmount": 0.0,
                            "feePayableTotalGrossAmount": 0.0,
                            "feePayableTotalDiscountAmount": 0.0,
                            "feePayableTotalTaxAmount": 0.0,
                            "ipRightCategoryCode": "P",
                            "ipRightCategory": "PATENTS",
                            "fileType": "P",
                            "fileTypeName": "Patents",
                            "applicationCategoryCode": "PT",
                            "applicationCategory": "Patents",
                            "documentOriginCode": "BF",
                            "documentOriginName": "Back-File"
                        },
                        {
                            "feeId": "039",
                            "feeCategory": "registration fee",
                            "feeTypeCode": "PCL",
                            "feeDescription": "Patent-AppType_AppSubType_NoOfClaims",
                            "basicFeeUnitAmount": 200.0,
                            "basicFeeUnitQuantity": 5,
                            "additionalFeeUnitAmount": 50.0,
                            "additionalFeeUnitQuantity": 1,
                            "taxInclusionFeeIndicator": false,
                            "globalTaxExclusionIndicator": true,
                            "feePayableTotalAmount": 0.0,
                            "feePayableTotalGrossAmount": 0.0,
                            "feePayableTotalDiscountAmount": 0.0,
                            "feePayableTotalTaxAmount": 0.0,
                            "ipRightCategoryCode": "P",
                            "ipRightCategory": "PATENTS",
                            "fileType": "P",
                            "fileTypeName": "Patents",
                            "applicationCategoryCode": "PT",
                            "applicationCategory": "Patents",
                            "documentOriginCode": "BF",
                            "documentOriginName": "Back-File"
                        },
                        {
                            "feeId": "057",
                            "feeCategory": "registration fee",
                            "feeTypeCode": "ANU",
                            "feeDescription": "Patent-Annuity (1-3)",
                            "basicFeeUnitAmount": 100.0,
                            "basicFeeUnitQuantity": 1,
                            "additionalFeeUnitAmount": 100.0,
                            "additionalFeeUnitQuantity": 1,
                            "taxInclusionFeeIndicator": false,
                            "globalTaxExclusionIndicator": false,
                            "feePayableTotalAmount": 0.0,
                            "feePayableTotalGrossAmount": 0.0,
                            "feePayableTotalDiscountAmount": 0.0,
                            "feePayableTotalTaxAmount": 0.0,
                            "ipRightCategoryCode": "P",
                            "ipRightCategory": "PATENTS",
                            "fileType": "P",
                            "fileTypeName": "Patents",
                            "applicationCategoryCode": "PT",
                            "applicationCategory": "Patents",
                            "documentOriginCode": "BF",
                            "documentOriginName": "Back-File",
                            "taxBag": [
                                {
                                    "taxId": "Tax2",
                                    "taxDescription": "Gift Tax",
                                    "taxAmount": 20.0,
                                    "taxMinimumAmount": 0.0,
                                    "taxPercentage": 0
                                },
                                {
                                    "taxId": "Tax4",
                                    "taxDescription": "GST",
                                    "taxAmount": 0.0,
                                    "taxMinimumAmount": 0.0,
                                    "taxPercentage": 5
                                }
                            ],
                            "discountBag": [
                                {
                                    "discountScheme": {
                                        "discountCategory": "DID01",
                                        "discountDescription": "SME",
                                        "documentCode": "SME"
                                    },
                                    "discountAmount": 0.0,
                                    "discountPercentage": "5"
                                },
                                {
                                    "discountScheme": {
                                        "discountCategory": "DID02",
                                        "discountDescription": "Individual",
                                        "documentCode": "NID"
                                    },
                                    "discountAmount": 5.0,
                                    "discountPercentage": null
                                }
                            ]
                        },
                        {
                            "feeId": "058",
                            "feeCategory": "registration fee",
                            "feeTypeCode": "ANU",
                            "feeDescription": "Patent Annuity (4-6)",
                            "basicFeeUnitAmount": 150.0,
                            "basicFeeUnitQuantity": 1,
                            "additionalFeeUnitAmount": 150.0,
                            "additionalFeeUnitQuantity": 1,
                            "taxInclusionFeeIndicator": false,
                            "globalTaxExclusionIndicator": true,
                            "feePayableTotalAmount": 0.0,
                            "feePayableTotalGrossAmount": 0.0,
                            "feePayableTotalDiscountAmount": 0.0,
                            "feePayableTotalTaxAmount": 0.0,
                            "ipRightCategoryCode": "P",
                            "ipRightCategory": "PATENTS",
                            "fileType": "P",
                            "fileTypeName": "Patents",
                            "applicationCategoryCode": "PT",
                            "applicationCategory": "Patents",
                            "documentOriginCode": "BF",
                            "documentOriginName": "Back-File",
                            "taxBag": [
                                {
                                    "taxId": "Tax4",
                                    "taxDescription": "GST",
                                    "taxAmount": 0.0,
                                    "taxMinimumAmount": 0.0,
                                    "taxPercentage": 5
                                },
                                {
                                    "taxId": "Tax2",
                                    "taxDescription": "Gift Tax",
                                    "taxAmount": 20.0,
                                    "taxMinimumAmount": 0.0,
                                    "taxPercentage": 0
                                }
                            ],
                            "discountBag": [
                                {
                                    "discountScheme": {
                                        "discountCategory": "DID01",
                                        "discountDescription": "SME",
                                        "documentCode": "SME"
                                    },
                                    "discountAmount": 10.0,
                                    "discountPercentage": null
                                },
                                {
                                    "discountScheme": {
                                        "discountCategory": "DID02",
                                        "discountDescription": "Individual",
                                        "documentCode": "NID"
                                    },
                                    "discountAmount": 0.0,
                                    "discountPercentage": "10"
                                }
                            ]
                        },
                        {
                            "feeId": "059",
                            "feeCategory": "registration fee",
                            "feeTypeCode": "ANU",
                            "feeDescription": "Patent Annuity (10-12)",
                            "basicFeeUnitAmount": 200.0,
                            "basicFeeUnitQuantity": 1,
                            "additionalFeeUnitAmount": 200.0,
                            "additionalFeeUnitQuantity": 1,
                            "taxInclusionFeeIndicator": false,
                            "globalTaxExclusionIndicator": false,
                            "feePayableTotalAmount": 0.0,
                            "feePayableTotalGrossAmount": 0.0,
                            "feePayableTotalDiscountAmount": 0.0,
                            "feePayableTotalTaxAmount": 0.0,
                            "ipRightCategoryCode": "P",
                            "ipRightCategory": "PATENTS",
                            "fileType": "P",
                            "fileTypeName": "Patents",
                            "applicationCategoryCode": "PT",
                            "applicationCategory": "Patents",
                            "documentOriginCode": "BF",
                            "documentOriginName": "Back-File",
                            "taxBag": [
                                {
                                    "taxId": "Tax2",
                                    "taxDescription": "Gift Tax",
                                    "taxAmount": 20.0,
                                    "taxMinimumAmount": 0.0,
                                    "taxPercentage": 0
                                }
                            ]
                        },
                        {
                            "feeId": "060",
                            "feeCategory": "registration fee",
                            "feeTypeCode": "ANU",
                            "feeDescription": "Patent Annuity (7-9)",
                            "basicFeeUnitAmount": 250.0,
                            "basicFeeUnitQuantity": 1,
                            "additionalFeeUnitAmount": 250.0,
                            "additionalFeeUnitQuantity": 1,
                            "taxInclusionFeeIndicator": false,
                            "globalTaxExclusionIndicator": true,
                            "feePayableTotalAmount": 0.0,
                            "feePayableTotalGrossAmount": 0.0,
                            "feePayableTotalDiscountAmount": 0.0,
                            "feePayableTotalTaxAmount": 0.0,
                            "ipRightCategoryCode": "P",
                            "ipRightCategory": "PATENTS",
                            "fileType": "P",
                            "fileTypeName": "Patents",
                            "applicationCategoryCode": "PT",
                            "applicationCategory": "Patents",
                            "documentOriginCode": "BF",
                            "documentOriginName": "Back-File",
                            "taxBag": [
                                {
                                    "taxId": "Tax4",
                                    "taxDescription": "GST",
                                    "taxAmount": 0.0,
                                    "taxMinimumAmount": 0.0,
                                    "taxPercentage": 5
                                },
                                {
                                    "taxId": "Tax2",
                                    "taxDescription": "Gift Tax",
                                    "taxAmount": 20.0,
                                    "taxMinimumAmount": 0.0,
                                    "taxPercentage": 0
                                }
                            ],
                            "discountBag": [
                                {
                                    "discountScheme": {
                                        "discountCategory": "DID02",
                                        "discountDescription": "Individual",
                                        "documentCode": "NID"
                                    },
                                    "discountAmount": 0.0,
                                    "discountPercentage": "5"
                                },
                                {
                                    "discountScheme": {
                                        "discountCategory": "DID01",
                                        "discountDescription": "SME",
                                        "documentCode": "SME"
                                    },
                                    "discountAmount": 0.0,
                                    "discountPercentage": "10"
                                }
                            ]
                        },
                        {
                            "feeId": "040",
                            "feeCategory": "registration fee",
                            "feeTypeCode": "DRW",
                            "feeDescription": "Patent-AppType_NoOfDrawingImages",
                            "basicFeeUnitAmount": 200.0,
                            "basicFeeUnitQuantity": 5,
                            "additionalFeeUnitAmount": 50.0,
                            "additionalFeeUnitQuantity": 1,
                            "taxInclusionFeeIndicator": false,
                            "globalTaxExclusionIndicator": false,
                            "feePayableTotalAmount": 0.0,
                            "feePayableTotalGrossAmount": 0.0,
                            "feePayableTotalDiscountAmount": 0.0,
                            "feePayableTotalTaxAmount": 0.0,
                            "ipRightCategoryCode": "P",
                            "ipRightCategory": "PATENTS",
                            "fileType": "P",
                            "fileTypeName": "Patents",
                            "applicationCategoryCode": "PT",
                            "applicationCategory": "Patents",
                            "applicationSubCategoryCode": "NP",
                            "applicationSubCategory": "National Patents",
                            "documentOriginCode": "BF",
                            "documentOriginName": "Back-File",
                            "discountBag": [
                                {
                                    "discountScheme": {
                                        "discountCategory": "DID02",
                                        "discountDescription": "Individual",
                                        "documentCode": "NID"
                                    },
                                    "discountAmount": 0.0,
                                    "discountPercentage": "5"
                                },
                                {
                                    "discountScheme": {
                                        "discountCategory": "DID01",
                                        "discountDescription": "SME",
                                        "documentCode": "SME"
                                    },
                                    "discountAmount": 0.0,
                                    "discountPercentage": "7"
                                }
                            ]
                        },
                        {
                            "feeId": "043",
                            "feeCategory": "registration fee",
                            "feeTypeCode": "PCL",
                            "feeDescription": "Patent-AppSubType_NP_NoOfPriorityClaims",
                            "basicFeeUnitAmount": 100.0,
                            "basicFeeUnitQuantity": 10,
                            "additionalFeeUnitAmount": 25.0,
                            "additionalFeeUnitQuantity": 2,
                            "taxInclusionFeeIndicator": false,
                            "globalTaxExclusionIndicator": false,
                            "feePayableTotalAmount": 0.0,
                            "feePayableTotalGrossAmount": 0.0,
                            "feePayableTotalDiscountAmount": 0.0,
                            "feePayableTotalTaxAmount": 0.0,
                            "ipRightCategoryCode": "P",
                            "ipRightCategory": "PATENTS",
                            "fileType": "P",
                            "fileTypeName": "Patents",
                            "applicationCategoryCode": "PT",
                            "applicationCategory": "Patents",
                            "applicationSubCategoryCode": "NP",
                            "applicationSubCategory": "National Patents",
                            "documentOriginCode": "BF",
                            "documentOriginName": "Back-File",
                            "taxBag": [
                                {
                                    "taxId": "Tax1",
                                    "taxDescription": "Corporate Tax",
                                    "taxAmount": 15.0,
                                    "taxMinimumAmount": 0.0,
                                    "taxPercentage": 0
                                }
                            ],
                            "discountBag": [
                                {
                                    "discountScheme": {
                                        "discountCategory": "DID01",
                                        "discountDescription": "SME",
                                        "documentCode": "SME"
                                    },
                                    "discountAmount": 5.0,
                                    "discountPercentage": null
                                },
                                {
                                    "discountScheme": {
                                        "discountCategory": "DID02",
                                        "discountDescription": "Individual",
                                        "documentCode": "NID"
                                    },
                                    "discountAmount": 7.0,
                                    "discountPercentage": null
                                }
                            ]
                        },
                        {
                            "feeId": "044",
                            "feeCategory": "registration fee",
                            "feeTypeCode": "CLM",
                            "feeDescription": "Patent-AppSubType_UM_NoOfClaims",
                            "basicFeeUnitAmount": 200.0,
                            "basicFeeUnitQuantity": 2,
                            "additionalFeeUnitAmount": 150.0,
                            "additionalFeeUnitQuantity": 1,
                            "taxInclusionFeeIndicator": false,
                            "globalTaxExclusionIndicator": false,
                            "feePayableTotalAmount": 0.0,
                            "feePayableTotalGrossAmount": 0.0,
                            "feePayableTotalDiscountAmount": 0.0,
                            "feePayableTotalTaxAmount": 0.0,
                            "ipRightCategoryCode": "P",
                            "ipRightCategory": "PATENTS",
                            "fileType": "P",
                            "fileTypeName": "Patents",
                            "applicationCategoryCode": "PT",
                            "applicationCategory": "Patents",
                            "applicationSubCategoryCode": "NP",
                            "applicationSubCategory": "National Patents",
                            "documentOriginCode": "BF",
                            "documentOriginName": "Back-File",
                            "taxBag": [
                                {
                                    "taxId": "Tax2",
                                    "taxDescription": "Gift Tax",
                                    "taxAmount": 20.0,
                                    "taxMinimumAmount": 0.0,
                                    "taxPercentage": 0
                                }
                            ],
                            "discountBag": [
                                {
                                    "discountScheme": {
                                        "discountCategory": "DID02",
                                        "discountDescription": "Individual",
                                        "documentCode": "NID"
                                    },
                                    "discountAmount": 0.0,
                                    "discountPercentage": "10"
                                },
                                {
                                    "discountScheme": {
                                        "discountCategory": "DID01",
                                        "discountDescription": "SME",
                                        "documentCode": "SME"
                                    },
                                    "discountAmount": 0.0,
                                    "discountPercentage": "5"
                                }
                            ]
                        },
                        {
                            "feeId": "047",
                            "feeCategory": "registration fee",
                            "feeTypeCode": "DPG",
                            "feeDescription": "Patent-AppSubType_NoOfDocumentPages",
                            "basicFeeUnitAmount": 100.0,
                            "basicFeeUnitQuantity": 2,
                            "additionalFeeUnitAmount": 150.0,
                            "additionalFeeUnitQuantity": 1,
                            "taxInclusionFeeIndicator": false,
                            "globalTaxExclusionIndicator": false,
                            "feePayableTotalAmount": 0.0,
                            "feePayableTotalGrossAmount": 0.0,
                            "feePayableTotalDiscountAmount": 0.0,
                            "feePayableTotalTaxAmount": 0.0,
                            "ipRightCategoryCode": "P",
                            "ipRightCategory": "PATENTS",
                            "fileType": "P",
                            "fileTypeName": "Patents",
                            "applicationCategoryCode": "PT",
                            "applicationCategory": "Patents",
                            "applicationSubCategoryCode": "NP",
                            "applicationSubCategory": "National Patents",
                            "documentOriginCode": "BF",
                            "documentOriginName": "Back-File",
                            "taxBag": [
                                {
                                    "taxId": "Tax2",
                                    "taxDescription": "Gift Tax",
                                    "taxAmount": 20.0,
                                    "taxMinimumAmount": 0.0,
                                    "taxPercentage": 0
                                }
                            ],
                            "discountBag": [
                                {
                                    "discountScheme": {
                                        "discountCategory": "DID02",
                                        "discountDescription": "Individual",
                                        "documentCode": "NID"
                                    },
                                    "discountAmount": 7.0,
                                    "discountPercentage": null
                                },
                                {
                                    "discountScheme": {
                                        "discountCategory": "DID01",
                                        "discountDescription": "SME",
                                        "documentCode": "SME"
                                    },
                                    "discountAmount": 10.0,
                                    "discountPercentage": null
                                }
                            ]
                        },
                        {
                            "feeId": "045",
                            "feeCategory": "registration fee",
                            "feeTypeCode": "CLM",
                            "feeDescription": "Patent-AppSubType_PCTP_NoOfClaims",
                            "basicFeeUnitAmount": 300.0,
                            "basicFeeUnitQuantity": 2,
                            "additionalFeeUnitAmount": 200.0,
                            "additionalFeeUnitQuantity": 1,
                            "taxInclusionFeeIndicator": false,
                            "globalTaxExclusionIndicator": true,
                            "feePayableTotalAmount": 0.0,
                            "feePayableTotalGrossAmount": 0.0,
                            "feePayableTotalDiscountAmount": 0.0,
                            "feePayableTotalTaxAmount": 0.0,
                            "ipRightCategoryCode": "P",
                            "ipRightCategory": "PATENTS",
                            "fileType": "P",
                            "fileTypeName": "Patents",
                            "applicationCategoryCode": "PT",
                            "applicationCategory": "Patents",
                            "applicationSubCategoryCode": "PP",
                            "applicationSubCategory": "PCT Patents",
                            "documentOriginCode": "BF",
                            "documentOriginName": "Back-File"
                        },
                        {
                            "feeId": "011",
                            "feeCategory": "registration fee",
                            "feeTypeCode": "DRW",
                            "feeDescription": "Patent-Special drawings",
                            "basicFeeUnitAmount": 0.0,
                            "basicFeeUnitQuantity": 4,
                            "additionalFeeUnitAmount": 2.0,
                            "additionalFeeUnitQuantity": 1,
                            "taxInclusionFeeIndicator": false,
                            "globalTaxExclusionIndicator": true,
                            "feePayableTotalAmount": 0.0,
                            "feePayableTotalGrossAmount": 0.0,
                            "feePayableTotalDiscountAmount": 0.0,
                            "feePayableTotalTaxAmount": 0.0,
                            "ipRightCategoryCode": "P",
                            "ipRightCategory": "PATENTS",
                            "fileType": "P",
                            "fileTypeName": "Patents",
                            "applicationCategoryCode": "PT",
                            "applicationCategory": "Patents",
                            "applicationSubCategoryCode": "UM",
                            "applicationSubCategory": "Utility Model",
                            "documentOriginCode": "BF",
                            "documentOriginName": "Back-File"
                        },
                        {
                            "feeId": "010",
                            "feeCategory": "registration fee",
                            "feeTypeCode": "CLM",
                            "feeDescription": "Patent-Regular",
                            "basicFeeUnitAmount": 100.0,
                            "basicFeeUnitQuantity": 10,
                            "additionalFeeUnitAmount": 50.0,
                            "additionalFeeUnitQuantity": 5,
                            "taxInclusionFeeIndicator": false,
                            "globalTaxExclusionIndicator": true,
                            "feePayableTotalAmount": 0.0,
                            "feePayableTotalGrossAmount": 0.0,
                            "feePayableTotalDiscountAmount": 0.0,
                            "feePayableTotalTaxAmount": 0.0,
                            "ipRightCategoryCode": "P",
                            "ipRightCategory": "PATENTS",
                            "fileType": "P",
                            "fileTypeName": "Patents",
                            "applicationCategoryCode": "PT",
                            "applicationCategory": "Patents",
                            "documentOriginCode": "V2",
                            "documentOriginName": "St. Vincent & Grenadines (Tax)"
                        },
                        {
                            "feeId": "039",
                            "feeCategory": "registration fee",
                            "feeTypeCode": "PCL",
                            "feeDescription": "Patent-AppType_AppSubType_NoOfClaims",
                            "basicFeeUnitAmount": 200.0,
                            "basicFeeUnitQuantity": 5,
                            "additionalFeeUnitAmount": 50.0,
                            "additionalFeeUnitQuantity": 1,
                            "taxInclusionFeeIndicator": false,
                            "globalTaxExclusionIndicator": true,
                            "feePayableTotalAmount": 0.0,
                            "feePayableTotalGrossAmount": 0.0,
                            "feePayableTotalDiscountAmount": 0.0,
                            "feePayableTotalTaxAmount": 0.0,
                            "ipRightCategoryCode": "P",
                            "ipRightCategory": "PATENTS",
                            "fileType": "P",
                            "fileTypeName": "Patents",
                            "applicationCategoryCode": "PT",
                            "applicationCategory": "Patents",
                            "documentOriginCode": "V2",
                            "documentOriginName": "St. Vincent & Grenadines (Tax)"
                        },
                        {
                            "feeId": "057",
                            "feeCategory": "registration fee",
                            "feeTypeCode": "ANU",
                            "feeDescription": "Patent-Annuity (1-3)",
                            "basicFeeUnitAmount": 100.0,
                            "basicFeeUnitQuantity": 1,
                            "additionalFeeUnitAmount": 100.0,
                            "additionalFeeUnitQuantity": 1,
                            "taxInclusionFeeIndicator": false,
                            "globalTaxExclusionIndicator": false,
                            "feePayableTotalAmount": 0.0,
                            "feePayableTotalGrossAmount": 0.0,
                            "feePayableTotalDiscountAmount": 0.0,
                            "feePayableTotalTaxAmount": 0.0,
                            "ipRightCategoryCode": "P",
                            "ipRightCategory": "PATENTS",
                            "fileType": "P",
                            "fileTypeName": "Patents",
                            "applicationCategoryCode": "PT",
                            "applicationCategory": "Patents",
                            "documentOriginCode": "V2",
                            "documentOriginName": "St. Vincent & Grenadines (Tax)",
                            "taxBag": [
                                {
                                    "taxId": "Tax2",
                                    "taxDescription": "Gift Tax",
                                    "taxAmount": 20.0,
                                    "taxMinimumAmount": 0.0,
                                    "taxPercentage": 0
                                },
                                {
                                    "taxId": "Tax4",
                                    "taxDescription": "GST",
                                    "taxAmount": 0.0,
                                    "taxMinimumAmount": 0.0,
                                    "taxPercentage": 5
                                }
                            ],
                            "discountBag": [
                                {
                                    "discountScheme": {
                                        "discountCategory": "DID01",
                                        "discountDescription": "SME",
                                        "documentCode": "SME"
                                    },
                                    "discountAmount": 0.0,
                                    "discountPercentage": "5"
                                },
                                {
                                    "discountScheme": {
                                        "discountCategory": "DID02",
                                        "discountDescription": "Individual",
                                        "documentCode": "NID"
                                    },
                                    "discountAmount": 5.0,
                                    "discountPercentage": null
                                }
                            ]
                        },
                        {
                            "feeId": "058",
                            "feeCategory": "registration fee",
                            "feeTypeCode": "ANU",
                            "feeDescription": "Patent Annuity (4-6)",
                            "basicFeeUnitAmount": 150.0,
                            "basicFeeUnitQuantity": 1,
                            "additionalFeeUnitAmount": 150.0,
                            "additionalFeeUnitQuantity": 1,
                            "taxInclusionFeeIndicator": false,
                            "globalTaxExclusionIndicator": true,
                            "feePayableTotalAmount": 0.0,
                            "feePayableTotalGrossAmount": 0.0,
                            "feePayableTotalDiscountAmount": 0.0,
                            "feePayableTotalTaxAmount": 0.0,
                            "ipRightCategoryCode": "P",
                            "ipRightCategory": "PATENTS",
                            "fileType": "P",
                            "fileTypeName": "Patents",
                            "applicationCategoryCode": "PT",
                            "applicationCategory": "Patents",
                            "documentOriginCode": "V2",
                            "documentOriginName": "St. Vincent & Grenadines (Tax)",
                            "taxBag": [
                                {
                                    "taxId": "Tax4",
                                    "taxDescription": "GST",
                                    "taxAmount": 0.0,
                                    "taxMinimumAmount": 0.0,
                                    "taxPercentage": 5
                                },
                                {
                                    "taxId": "Tax2",
                                    "taxDescription": "Gift Tax",
                                    "taxAmount": 20.0,
                                    "taxMinimumAmount": 0.0,
                                    "taxPercentage": 0
                                }
                            ],
                            "discountBag": [
                                {
                                    "discountScheme": {
                                        "discountCategory": "DID01",
                                        "discountDescription": "SME",
                                        "documentCode": "SME"
                                    },
                                    "discountAmount": 10.0,
                                    "discountPercentage": null
                                },
                                {
                                    "discountScheme": {
                                        "discountCategory": "DID02",
                                        "discountDescription": "Individual",
                                        "documentCode": "NID"
                                    },
                                    "discountAmount": 0.0,
                                    "discountPercentage": "10"
                                }
                            ]
                        },
                        {
                            "feeId": "059",
                            "feeCategory": "registration fee",
                            "feeTypeCode": "ANU",
                            "feeDescription": "Patent Annuity (10-12)",
                            "basicFeeUnitAmount": 200.0,
                            "basicFeeUnitQuantity": 1,
                            "additionalFeeUnitAmount": 200.0,
                            "additionalFeeUnitQuantity": 1,
                            "taxInclusionFeeIndicator": false,
                            "globalTaxExclusionIndicator": false,
                            "feePayableTotalAmount": 0.0,
                            "feePayableTotalGrossAmount": 0.0,
                            "feePayableTotalDiscountAmount": 0.0,
                            "feePayableTotalTaxAmount": 0.0,
                            "ipRightCategoryCode": "P",
                            "ipRightCategory": "PATENTS",
                            "fileType": "P",
                            "fileTypeName": "Patents",
                            "applicationCategoryCode": "PT",
                            "applicationCategory": "Patents",
                            "documentOriginCode": "V2",
                            "documentOriginName": "St. Vincent & Grenadines (Tax)",
                            "taxBag": [
                                {
                                    "taxId": "Tax2",
                                    "taxDescription": "Gift Tax",
                                    "taxAmount": 20.0,
                                    "taxMinimumAmount": 0.0,
                                    "taxPercentage": 0
                                }
                            ]
                        },
                        {
                            "feeId": "060",
                            "feeCategory": "registration fee",
                            "feeTypeCode": "ANU",
                            "feeDescription": "Patent Annuity (7-9)",
                            "basicFeeUnitAmount": 250.0,
                            "basicFeeUnitQuantity": 1,
                            "additionalFeeUnitAmount": 250.0,
                            "additionalFeeUnitQuantity": 1,
                            "taxInclusionFeeIndicator": false,
                            "globalTaxExclusionIndicator": true,
                            "feePayableTotalAmount": 0.0,
                            "feePayableTotalGrossAmount": 0.0,
                            "feePayableTotalDiscountAmount": 0.0,
                            "feePayableTotalTaxAmount": 0.0,
                            "ipRightCategoryCode": "P",
                            "ipRightCategory": "PATENTS",
                            "fileType": "P",
                            "fileTypeName": "Patents",
                            "applicationCategoryCode": "PT",
                            "applicationCategory": "Patents",
                            "documentOriginCode": "V2",
                            "documentOriginName": "St. Vincent & Grenadines (Tax)",
                            "taxBag": [
                                {
                                    "taxId": "Tax4",
                                    "taxDescription": "GST",
                                    "taxAmount": 0.0,
                                    "taxMinimumAmount": 0.0,
                                    "taxPercentage": 5
                                },
                                {
                                    "taxId": "Tax2",
                                    "taxDescription": "Gift Tax",
                                    "taxAmount": 20.0,
                                    "taxMinimumAmount": 0.0,
                                    "taxPercentage": 0
                                }
                            ],
                            "discountBag": [
                                {
                                    "discountScheme": {
                                        "discountCategory": "DID02",
                                        "discountDescription": "Individual",
                                        "documentCode": "NID"
                                    },
                                    "discountAmount": 0.0,
                                    "discountPercentage": "5"
                                },
                                {
                                    "discountScheme": {
                                        "discountCategory": "DID01",
                                        "discountDescription": "SME",
                                        "documentCode": "SME"
                                    },
                                    "discountAmount": 0.0,
                                    "discountPercentage": "10"
                                }
                            ]
                        },
                        {
                            "feeId": "040",
                            "feeCategory": "registration fee",
                            "feeTypeCode": "DRW",
                            "feeDescription": "Patent-AppType_NoOfDrawingImages",
                            "basicFeeUnitAmount": 200.0,
                            "basicFeeUnitQuantity": 5,
                            "additionalFeeUnitAmount": 50.0,
                            "additionalFeeUnitQuantity": 1,
                            "taxInclusionFeeIndicator": false,
                            "globalTaxExclusionIndicator": false,
                            "feePayableTotalAmount": 0.0,
                            "feePayableTotalGrossAmount": 0.0,
                            "feePayableTotalDiscountAmount": 0.0,
                            "feePayableTotalTaxAmount": 0.0,
                            "ipRightCategoryCode": "P",
                            "ipRightCategory": "PATENTS",
                            "fileType": "P",
                            "fileTypeName": "Patents",
                            "applicationCategoryCode": "PT",
                            "applicationCategory": "Patents",
                            "applicationSubCategoryCode": "NP",
                            "applicationSubCategory": "National Patents",
                            "documentOriginCode": "V2",
                            "documentOriginName": "St. Vincent & Grenadines (Tax)",
                            "discountBag": [
                                {
                                    "discountScheme": {
                                        "discountCategory": "DID02",
                                        "discountDescription": "Individual",
                                        "documentCode": "NID"
                                    },
                                    "discountAmount": 0.0,
                                    "discountPercentage": "5"
                                },
                                {
                                    "discountScheme": {
                                        "discountCategory": "DID01",
                                        "discountDescription": "SME",
                                        "documentCode": "SME"
                                    },
                                    "discountAmount": 0.0,
                                    "discountPercentage": "7"
                                }
                            ]
                        },
                        {
                            "feeId": "043",
                            "feeCategory": "registration fee",
                            "feeTypeCode": "PCL",
                            "feeDescription": "Patent-AppSubType_NP_NoOfPriorityClaims",
                            "basicFeeUnitAmount": 100.0,
                            "basicFeeUnitQuantity": 10,
                            "additionalFeeUnitAmount": 25.0,
                            "additionalFeeUnitQuantity": 2,
                            "taxInclusionFeeIndicator": false,
                            "globalTaxExclusionIndicator": false,
                            "feePayableTotalAmount": 0.0,
                            "feePayableTotalGrossAmount": 0.0,
                            "feePayableTotalDiscountAmount": 0.0,
                            "feePayableTotalTaxAmount": 0.0,
                            "ipRightCategoryCode": "P",
                            "ipRightCategory": "PATENTS",
                            "fileType": "P",
                            "fileTypeName": "Patents",
                            "applicationCategoryCode": "PT",
                            "applicationCategory": "Patents",
                            "applicationSubCategoryCode": "NP",
                            "applicationSubCategory": "National Patents",
                            "documentOriginCode": "V2",
                            "documentOriginName": "St. Vincent & Grenadines (Tax)",
                            "taxBag": [
                                {
                                    "taxId": "Tax1",
                                    "taxDescription": "Corporate Tax",
                                    "taxAmount": 15.0,
                                    "taxMinimumAmount": 0.0,
                                    "taxPercentage": 0
                                }
                            ],
                            "discountBag": [
                                {
                                    "discountScheme": {
                                        "discountCategory": "DID01",
                                        "discountDescription": "SME",
                                        "documentCode": "SME"
                                    },
                                    "discountAmount": 5.0,
                                    "discountPercentage": null
                                },
                                {
                                    "discountScheme": {
                                        "discountCategory": "DID02",
                                        "discountDescription": "Individual",
                                        "documentCode": "NID"
                                    },
                                    "discountAmount": 7.0,
                                    "discountPercentage": null
                                }
                            ]
                        },
                        {
                            "feeId": "044",
                            "feeCategory": "registration fee",
                            "feeTypeCode": "CLM",
                            "feeDescription": "Patent-AppSubType_UM_NoOfClaims",
                            "basicFeeUnitAmount": 200.0,
                            "basicFeeUnitQuantity": 2,
                            "additionalFeeUnitAmount": 150.0,
                            "additionalFeeUnitQuantity": 1,
                            "taxInclusionFeeIndicator": false,
                            "globalTaxExclusionIndicator": false,
                            "feePayableTotalAmount": 0.0,
                            "feePayableTotalGrossAmount": 0.0,
                            "feePayableTotalDiscountAmount": 0.0,
                            "feePayableTotalTaxAmount": 0.0,
                            "ipRightCategoryCode": "P",
                            "ipRightCategory": "PATENTS",
                            "fileType": "P",
                            "fileTypeName": "Patents",
                            "applicationCategoryCode": "PT",
                            "applicationCategory": "Patents",
                            "applicationSubCategoryCode": "NP",
                            "applicationSubCategory": "National Patents",
                            "documentOriginCode": "V2",
                            "documentOriginName": "St. Vincent & Grenadines (Tax)",
                            "taxBag": [
                                {
                                    "taxId": "Tax2",
                                    "taxDescription": "Gift Tax",
                                    "taxAmount": 20.0,
                                    "taxMinimumAmount": 0.0,
                                    "taxPercentage": 0
                                }
                            ],
                            "discountBag": [
                                {
                                    "discountScheme": {
                                        "discountCategory": "DID02",
                                        "discountDescription": "Individual",
                                        "documentCode": "NID"
                                    },
                                    "discountAmount": 0.0,
                                    "discountPercentage": "10"
                                },
                                {
                                    "discountScheme": {
                                        "discountCategory": "DID01",
                                        "discountDescription": "SME",
                                        "documentCode": "SME"
                                    },
                                    "discountAmount": 0.0,
                                    "discountPercentage": "5"
                                }
                            ]
                        },
                        {
                            "feeId": "047",
                            "feeCategory": "registration fee",
                            "feeTypeCode": "DPG",
                            "feeDescription": "Patent-AppSubType_NoOfDocumentPages",
                            "basicFeeUnitAmount": 100.0,
                            "basicFeeUnitQuantity": 2,
                            "additionalFeeUnitAmount": 150.0,
                            "additionalFeeUnitQuantity": 1,
                            "taxInclusionFeeIndicator": false,
                            "globalTaxExclusionIndicator": false,
                            "feePayableTotalAmount": 0.0,
                            "feePayableTotalGrossAmount": 0.0,
                            "feePayableTotalDiscountAmount": 0.0,
                            "feePayableTotalTaxAmount": 0.0,
                            "ipRightCategoryCode": "P",
                            "ipRightCategory": "PATENTS",
                            "fileType": "P",
                            "fileTypeName": "Patents",
                            "applicationCategoryCode": "PT",
                            "applicationCategory": "Patents",
                            "applicationSubCategoryCode": "NP",
                            "applicationSubCategory": "National Patents",
                            "documentOriginCode": "V2",
                            "documentOriginName": "St. Vincent & Grenadines (Tax)",
                            "taxBag": [
                                {
                                    "taxId": "Tax2",
                                    "taxDescription": "Gift Tax",
                                    "taxAmount": 20.0,
                                    "taxMinimumAmount": 0.0,
                                    "taxPercentage": 0
                                }
                            ],
                            "discountBag": [
                                {
                                    "discountScheme": {
                                        "discountCategory": "DID02",
                                        "discountDescription": "Individual",
                                        "documentCode": "NID"
                                    },
                                    "discountAmount": 7.0,
                                    "discountPercentage": null
                                },
                                {
                                    "discountScheme": {
                                        "discountCategory": "DID01",
                                        "discountDescription": "SME",
                                        "documentCode": "SME"
                                    },
                                    "discountAmount": 10.0,
                                    "discountPercentage": null
                                }
                            ]
                        },
                        {
                            "feeId": "045",
                            "feeCategory": "registration fee",
                            "feeTypeCode": "CLM",
                            "feeDescription": "Patent-AppSubType_PCTP_NoOfClaims",
                            "basicFeeUnitAmount": 300.0,
                            "basicFeeUnitQuantity": 2,
                            "additionalFeeUnitAmount": 200.0,
                            "additionalFeeUnitQuantity": 1,
                            "taxInclusionFeeIndicator": false,
                            "globalTaxExclusionIndicator": true,
                            "feePayableTotalAmount": 0.0,
                            "feePayableTotalGrossAmount": 0.0,
                            "feePayableTotalDiscountAmount": 0.0,
                            "feePayableTotalTaxAmount": 0.0,
                            "ipRightCategoryCode": "P",
                            "ipRightCategory": "PATENTS",
                            "fileType": "P",
                            "fileTypeName": "Patents",
                            "applicationCategoryCode": "PT",
                            "applicationCategory": "Patents",
                            "applicationSubCategoryCode": "PP",
                            "applicationSubCategory": "PCT Patents",
                            "documentOriginCode": "V2",
                            "documentOriginName": "St. Vincent & Grenadines (Tax)"
                        },
                        {
                            "feeId": "011",
                            "feeCategory": "registration fee",
                            "feeTypeCode": "DRW",
                            "feeDescription": "Patent-Special drawings",
                            "basicFeeUnitAmount": 0.0,
                            "basicFeeUnitQuantity": 4,
                            "additionalFeeUnitAmount": 2.0,
                            "additionalFeeUnitQuantity": 1,
                            "taxInclusionFeeIndicator": false,
                            "globalTaxExclusionIndicator": true,
                            "feePayableTotalAmount": 0.0,
                            "feePayableTotalGrossAmount": 0.0,
                            "feePayableTotalDiscountAmount": 0.0,
                            "feePayableTotalTaxAmount": 0.0,
                            "ipRightCategoryCode": "P",
                            "ipRightCategory": "PATENTS",
                            "fileType": "P",
                            "fileTypeName": "Patents",
                            "applicationCategoryCode": "PT",
                            "applicationCategory": "Patents",
                            "applicationSubCategoryCode": "UM",
                            "applicationSubCategory": "Utility Model",
                            "documentOriginCode": "V2",
                            "documentOriginName": "St. Vincent & Grenadines (Tax)"
                        },
                        {
                            "feeId": "001",
                            "feeCategory": "registration fee",
                            "feeTypeCode": "REG",
                            "feeDescription": "Regular fees IP",
                            "basicFeeUnitAmount": 100.0,
                            "basicFeeUnitQuantity": 2,
                            "additionalFeeUnitAmount": 50.0,
                            "additionalFeeUnitQuantity": 1,
                            "taxInclusionFeeIndicator": false,
                            "globalTaxExclusionIndicator": true,
                            "feePayableTotalAmount": 0.0,
                            "feePayableTotalGrossAmount": 0.0,
                            "feePayableTotalDiscountAmount": 0.0,
                            "feePayableTotalTaxAmount": 0.0,
                            "ipRightCategoryCode": "D",
                            "ipRightCategory": "DESIGNS",
                            "documentOriginCode": "VC",
                            "documentOriginName": "St. Vincent & Grenadines",
                            "taxBag": [
                                {
                                    "taxId": "Tax4",
                                    "taxDescription": "GST",
                                    "taxAmount": 0.0,
                                    "taxMinimumAmount": 0.0,
                                    "taxPercentage": 5
                                }
                            ],
                            "discountBag": [
                                {
                                    "discountScheme": {
                                        "discountCategory": "DID01",
                                        "discountDescription": "SME",
                                        "documentCode": "SME"
                                    },
                                    "discountAmount": 0.0,
                                    "discountPercentage": "5"
                                },
                                {
                                    "discountScheme": {
                                        "discountCategory": "DID02",
                                        "discountDescription": "Individual",
                                        "documentCode": "NID"
                                    },
                                    "discountAmount": 0.0,
                                    "discountPercentage": "5"
                                }
                            ]
                        },
                        {
                            "feeId": "004",
                            "feeCategory": "registration fee",
                            "feeTypeCode": "DSN",
                            "feeDescription": "Design-Special unit TID ID UDGEN UDDSN",
                            "basicFeeUnitAmount": 60.0,
                            "basicFeeUnitQuantity": 1,
                            "additionalFeeUnitAmount": 10.0,
                            "additionalFeeUnitQuantity": 1,
                            "taxInclusionFeeIndicator": false,
                            "globalTaxExclusionIndicator": false,
                            "feePayableTotalAmount": 0.0,
                            "feePayableTotalGrossAmount": 0.0,
                            "feePayableTotalDiscountAmount": 0.0,
                            "feePayableTotalTaxAmount": 0.0,
                            "ipRightCategoryCode": "D",
                            "ipRightCategory": "DESIGNS",
                            "fileType": "D",
                            "fileTypeName": "Industrial Designs",
                            "applicationCategoryCode": "ID",
                            "applicationCategory": "Industrial Design",
                            "documentOriginCode": "VC",
                            "documentOriginName": "St. Vincent & Grenadines",
                            "taxBag": [
                                {
                                    "taxId": "Tax2",
                                    "taxDescription": "Gift Tax",
                                    "taxAmount": 20.0,
                                    "taxMinimumAmount": 0.0,
                                    "taxPercentage": 0
                                },
                                {
                                    "taxId": "Tax4",
                                    "taxDescription": "GST",
                                    "taxAmount": 0.0,
                                    "taxMinimumAmount": 0.0,
                                    "taxPercentage": 5
                                },
                                {
                                    "taxId": "VAT",
                                    "taxDescription": "Global VAT",
                                    "taxAmount": 0.0,
                                    "taxMinimumAmount": 0.0,
                                    "taxPercentage": 10
                                }
                            ],
                            "discountBag": [
                                {
                                    "discountScheme": {
                                        "discountCategory": "DID01",
                                        "discountDescription": "SME",
                                        "documentCode": "SME"
                                    },
                                    "discountAmount": 0.0,
                                    "discountPercentage": "5"
                                }
                            ]
                        },
                        {
                            "feeId": "023",
                            "feeCategory": "registration fee",
                            "feeTypeCode": "RED",
                            "feeDescription": "UD-Renewal fee for Design Unit (RED|RDL)",
                            "basicFeeUnitAmount": 100.0,
                            "basicFeeUnitQuantity": 1,
                            "additionalFeeUnitAmount": 5.0,
                            "additionalFeeUnitQuantity": 1,
                            "taxInclusionFeeIndicator": false,
                            "globalTaxExclusionIndicator": false,
                            "feePayableTotalAmount": 0.0,
                            "feePayableTotalGrossAmount": 0.0,
                            "feePayableTotalDiscountAmount": 0.0,
                            "feePayableTotalTaxAmount": 0.0,
                            "ipRightCategoryCode": "D",
                            "ipRightCategory": "DESIGNS",
                            "fileType": "D",
                            "fileTypeName": "Industrial Designs",
                            "applicationCategoryCode": "ID",
                            "applicationCategory": "Industrial Design",
                            "documentOriginCode": "VC",
                            "documentOriginName": "St. Vincent & Grenadines",
                            "taxBag": [
                                {
                                    "taxId": "VAT",
                                    "taxDescription": "Global VAT",
                                    "taxAmount": 0.0,
                                    "taxMinimumAmount": 0.0,
                                    "taxPercentage": 10
                                },
                                {
                                    "taxId": "Tax2",
                                    "taxDescription": "Gift Tax",
                                    "taxAmount": 20.0,
                                    "taxMinimumAmount": 0.0,
                                    "taxPercentage": 0
                                },
                                {
                                    "taxId": "Tax4",
                                    "taxDescription": "GST",
                                    "taxAmount": 0.0,
                                    "taxMinimumAmount": 0.0,
                                    "taxPercentage": 5
                                }
                            ]
                        },
                        {
                            "feeId": "036",
                            "feeCategory": "registration fee",
                            "feeTypeCode": "REI",
                            "feeDescription": "UD-Renewal Fee Number of Logo/Drawing/Unit ( REN | RNL | RDL | RED )",
                            "basicFeeUnitAmount": 100.0,
                            "basicFeeUnitQuantity": 1,
                            "additionalFeeUnitAmount": 10.0,
                            "additionalFeeUnitQuantity": 1,
                            "taxInclusionFeeIndicator": false,
                            "globalTaxExclusionIndicator": true,
                            "feePayableTotalAmount": 0.0,
                            "feePayableTotalGrossAmount": 0.0,
                            "feePayableTotalDiscountAmount": 0.0,
                            "feePayableTotalTaxAmount": 0.0,
                            "ipRightCategoryCode": "D",
                            "ipRightCategory": "DESIGNS",
                            "fileType": "D",
                            "fileTypeName": "Industrial Designs",
                            "applicationCategoryCode": "ID",
                            "applicationCategory": "Industrial Design",
                            "documentOriginCode": "VC",
                            "documentOriginName": "St. Vincent & Grenadines",
                            "taxBag": [
                                {
                                    "taxId": "Tax2",
                                    "taxDescription": "Gift Tax",
                                    "taxAmount": 20.0,
                                    "taxMinimumAmount": 0.0,
                                    "taxPercentage": 0
                                },
                                {
                                    "taxId": "VAT",
                                    "taxDescription": "Global VAT",
                                    "taxAmount": 0.0,
                                    "taxMinimumAmount": 0.0,
                                    "taxPercentage": 10
                                },
                                {
                                    "taxId": "Tax4",
                                    "taxDescription": "GST",
                                    "taxAmount": 0.0,
                                    "taxMinimumAmount": 0.0,
                                    "taxPercentage": 5
                                }
                            ],
                            "discountBag": [
                                {
                                    "discountScheme": {
                                        "discountCategory": "DID01",
                                        "discountDescription": "SME",
                                        "documentCode": "SME"
                                    },
                                    "discountAmount": 0.0,
                                    "discountPercentage": "5"
                                }
                            ]
                        },
                        {
                            "feeId": "005",
                            "feeCategory": "registration fee",
                            "feeTypeCode": "DRW",
                            "feeDescription": "Design-Regular drawings FID",
                            "basicFeeUnitAmount": 50.0,
                            "basicFeeUnitQuantity": 4,
                            "additionalFeeUnitAmount": 10.0,
                            "additionalFeeUnitQuantity": 1,
                            "taxInclusionFeeIndicator": false,
                            "globalTaxExclusionIndicator": false,
                            "feePayableTotalAmount": 0.0,
                            "feePayableTotalGrossAmount": 0.0,
                            "feePayableTotalDiscountAmount": 0.0,
                            "feePayableTotalTaxAmount": 0.0,
                            "ipRightCategoryCode": "D",
                            "ipRightCategory": "DESIGNS",
                            "fileType": "D",
                            "fileTypeName": "Industrial Designs",
                            "applicationCategoryCode": "ID",
                            "applicationCategory": "Industrial Design",
                            "applicationSubCategoryCode": "RD",
                            "applicationSubCategory": "Design - Re-Regeneration",
                            "documentOriginCode": "VC",
                            "documentOriginName": "St. Vincent & Grenadines",
                            "taxBag": [
                                {
                                    "taxId": "Tax4",
                                    "taxDescription": "GST",
                                    "taxAmount": 0.0,
                                    "taxMinimumAmount": 0.0,
                                    "taxPercentage": 5
                                },
                                {
                                    "taxId": "Tax2",
                                    "taxDescription": "Gift Tax",
                                    "taxAmount": 20.0,
                                    "taxMinimumAmount": 0.0,
                                    "taxPercentage": 0
                                }
                            ],
                            "discountBag": [
                                {
                                    "discountScheme": {
                                        "discountCategory": "DID02",
                                        "discountDescription": "Individual",
                                        "documentCode": "NID"
                                    },
                                    "discountAmount": 0.0,
                                    "discountPercentage": "5"
                                },
                                {
                                    "discountScheme": {
                                        "discountCategory": "DID01",
                                        "discountDescription": "SME",
                                        "documentCode": "SME"
                                    },
                                    "discountAmount": 0.0,
                                    "discountPercentage": "5"
                                }
                            ]
                        },
                        {
                            "feeId": "006",
                            "feeCategory": "registration fee",
                            "feeTypeCode": "PCL",
                            "feeDescription": "Design-Special claims TID RD",
                            "basicFeeUnitAmount": 10.0,
                            "basicFeeUnitQuantity": 1,
                            "additionalFeeUnitAmount": 10.0,
                            "additionalFeeUnitQuantity": 1,
                            "taxInclusionFeeIndicator": false,
                            "globalTaxExclusionIndicator": true,
                            "feePayableTotalAmount": 0.0,
                            "feePayableTotalGrossAmount": 0.0,
                            "feePayableTotalDiscountAmount": 0.0,
                            "feePayableTotalTaxAmount": 0.0,
                            "ipRightCategoryCode": "D",
                            "ipRightCategory": "DESIGNS",
                            "fileType": "D",
                            "fileTypeName": "Industrial Designs",
                            "applicationCategoryCode": "ID",
                            "applicationCategory": "Industrial Design",
                            "applicationSubCategoryCode": "RD",
                            "applicationSubCategory": "Design - Re-Regeneration",
                            "documentOriginCode": "VC",
                            "documentOriginName": "St. Vincent & Grenadines"
                        },
                        {
                            "feeId": "037",
                            "feeCategory": "registration fee",
                            "feeTypeCode": "DSN",
                            "feeDescription": "Design-Special DSN unit RD",
                            "basicFeeUnitAmount": 40.0,
                            "basicFeeUnitQuantity": 1,
                            "additionalFeeUnitAmount": 10.0,
                            "additionalFeeUnitQuantity": 1,
                            "taxInclusionFeeIndicator": false,
                            "globalTaxExclusionIndicator": false,
                            "feePayableTotalAmount": 0.0,
                            "feePayableTotalGrossAmount": 0.0,
                            "feePayableTotalDiscountAmount": 0.0,
                            "feePayableTotalTaxAmount": 0.0,
                            "ipRightCategoryCode": "D",
                            "ipRightCategory": "DESIGNS",
                            "fileType": "D",
                            "fileTypeName": "Industrial Designs",
                            "applicationCategoryCode": "ID",
                            "applicationCategory": "Industrial Design",
                            "applicationSubCategoryCode": "RD",
                            "applicationSubCategory": "Design - Re-Regeneration",
                            "documentOriginCode": "VC",
                            "documentOriginName": "St. Vincent & Grenadines"
                        },
                        {
                            "feeId": "004",
                            "feeCategory": "registration fee",
                            "feeTypeCode": "DSN",
                            "feeDescription": "Design-Special unit TID ID UDGEN UDDSN",
                            "basicFeeUnitAmount": 60.0,
                            "basicFeeUnitQuantity": 1,
                            "additionalFeeUnitAmount": 10.0,
                            "additionalFeeUnitQuantity": 1,
                            "taxInclusionFeeIndicator": false,
                            "globalTaxExclusionIndicator": false,
                            "feePayableTotalAmount": 0.0,
                            "feePayableTotalGrossAmount": 0.0,
                            "feePayableTotalDiscountAmount": 0.0,
                            "feePayableTotalTaxAmount": 0.0,
                            "ipRightCategoryCode": "D",
                            "ipRightCategory": "DESIGNS",
                            "fileType": "D",
                            "fileTypeName": "Industrial Designs",
                            "applicationCategoryCode": "ID1",
                            "applicationCategory": "Test Industrial Design",
                            "documentOriginCode": "VC",
                            "documentOriginName": "St. Vincent & Grenadines",
                            "taxBag": [
                                {
                                    "taxId": "Tax2",
                                    "taxDescription": "Gift Tax",
                                    "taxAmount": 20.0,
                                    "taxMinimumAmount": 0.0,
                                    "taxPercentage": 0
                                },
                                {
                                    "taxId": "Tax4",
                                    "taxDescription": "GST",
                                    "taxAmount": 0.0,
                                    "taxMinimumAmount": 0.0,
                                    "taxPercentage": 5
                                },
                                {
                                    "taxId": "VAT",
                                    "taxDescription": "Global VAT",
                                    "taxAmount": 0.0,
                                    "taxMinimumAmount": 0.0,
                                    "taxPercentage": 10
                                }
                            ],
                            "discountBag": [
                                {
                                    "discountScheme": {
                                        "discountCategory": "DID01",
                                        "discountDescription": "SME",
                                        "documentCode": "SME"
                                    },
                                    "discountAmount": 0.0,
                                    "discountPercentage": "5"
                                }
                            ]
                        },
                        {
                            "feeId": "006",
                            "feeCategory": "registration fee",
                            "feeTypeCode": "PCL",
                            "feeDescription": "Design-Special claims TID RD",
                            "basicFeeUnitAmount": 10.0,
                            "basicFeeUnitQuantity": 1,
                            "additionalFeeUnitAmount": 10.0,
                            "additionalFeeUnitQuantity": 1,
                            "taxInclusionFeeIndicator": false,
                            "globalTaxExclusionIndicator": true,
                            "feePayableTotalAmount": 0.0,
                            "feePayableTotalGrossAmount": 0.0,
                            "feePayableTotalDiscountAmount": 0.0,
                            "feePayableTotalTaxAmount": 0.0,
                            "ipRightCategoryCode": "D",
                            "ipRightCategory": "DESIGNS",
                            "fileType": "D",
                            "fileTypeName": "Industrial Designs",
                            "applicationCategoryCode": "ID1",
                            "applicationCategory": "Test Industrial Design",
                            "documentOriginCode": "VC",
                            "documentOriginName": "St. Vincent & Grenadines"
                        },
                        {
                            "feeId": "036",
                            "feeCategory": "registration fee",
                            "feeTypeCode": "REI",
                            "feeDescription": "UD-Renewal Fee Number of Logo/Drawing/Unit ( REN | RNL | RDL | RED )",
                            "basicFeeUnitAmount": 100.0,
                            "basicFeeUnitQuantity": 1,
                            "additionalFeeUnitAmount": 10.0,
                            "additionalFeeUnitQuantity": 1,
                            "taxInclusionFeeIndicator": false,
                            "globalTaxExclusionIndicator": true,
                            "feePayableTotalAmount": 0.0,
                            "feePayableTotalGrossAmount": 0.0,
                            "feePayableTotalDiscountAmount": 0.0,
                            "feePayableTotalTaxAmount": 0.0,
                            "ipRightCategoryCode": "D",
                            "ipRightCategory": "DESIGNS",
                            "fileType": "D",
                            "fileTypeName": "Industrial Designs",
                            "applicationCategoryCode": "ID1",
                            "applicationCategory": "Test Industrial Design",
                            "documentOriginCode": "VC",
                            "documentOriginName": "St. Vincent & Grenadines",
                            "taxBag": [
                                {
                                    "taxId": "Tax2",
                                    "taxDescription": "Gift Tax",
                                    "taxAmount": 20.0,
                                    "taxMinimumAmount": 0.0,
                                    "taxPercentage": 0
                                },
                                {
                                    "taxId": "VAT",
                                    "taxDescription": "Global VAT",
                                    "taxAmount": 0.0,
                                    "taxMinimumAmount": 0.0,
                                    "taxPercentage": 10
                                },
                                {
                                    "taxId": "Tax4",
                                    "taxDescription": "GST",
                                    "taxAmount": 0.0,
                                    "taxMinimumAmount": 0.0,
                                    "taxPercentage": 5
                                }
                            ],
                            "discountBag": [
                                {
                                    "discountScheme": {
                                        "discountCategory": "DID01",
                                        "discountDescription": "SME",
                                        "documentCode": "SME"
                                    },
                                    "discountAmount": 0.0,
                                    "discountPercentage": "5"
                                }
                            ]
                        },
                        {
                            "feeId": "005",
                            "feeCategory": "registration fee",
                            "feeTypeCode": "DRW",
                            "feeDescription": "Design-Regular drawings FID",
                            "basicFeeUnitAmount": 50.0,
                            "basicFeeUnitQuantity": 4,
                            "additionalFeeUnitAmount": 10.0,
                            "additionalFeeUnitQuantity": 1,
                            "taxInclusionFeeIndicator": false,
                            "globalTaxExclusionIndicator": false,
                            "feePayableTotalAmount": 0.0,
                            "feePayableTotalGrossAmount": 0.0,
                            "feePayableTotalDiscountAmount": 0.0,
                            "feePayableTotalTaxAmount": 0.0,
                            "ipRightCategoryCode": "D",
                            "ipRightCategory": "DESIGNS",
                            "fileType": "D",
                            "fileTypeName": "Industrial Designs",
                            "applicationCategoryCode": "ID1",
                            "applicationCategory": "Test Industrial Design",
                            "applicationSubCategoryCode": "FD",
                            "applicationSubCategory": "Foreign ID",
                            "documentOriginCode": "VC",
                            "documentOriginName": "St. Vincent & Grenadines",
                            "taxBag": [
                                {
                                    "taxId": "Tax4",
                                    "taxDescription": "GST",
                                    "taxAmount": 0.0,
                                    "taxMinimumAmount": 0.0,
                                    "taxPercentage": 5
                                },
                                {
                                    "taxId": "Tax2",
                                    "taxDescription": "Gift Tax",
                                    "taxAmount": 20.0,
                                    "taxMinimumAmount": 0.0,
                                    "taxPercentage": 0
                                }
                            ],
                            "discountBag": [
                                {
                                    "discountScheme": {
                                        "discountCategory": "DID02",
                                        "discountDescription": "Individual",
                                        "documentCode": "NID"
                                    },
                                    "discountAmount": 0.0,
                                    "discountPercentage": "5"
                                },
                                {
                                    "discountScheme": {
                                        "discountCategory": "DID01",
                                        "discountDescription": "SME",
                                        "documentCode": "SME"
                                    },
                                    "discountAmount": 0.0,
                                    "discountPercentage": "5"
                                }
                            ]
                        },
                        {
                            "feeId": "023",
                            "feeCategory": "registration fee",
                            "feeTypeCode": "RED",
                            "feeDescription": "UD-Renewal fee for Design Unit (RED|RDL)",
                            "basicFeeUnitAmount": 100.0,
                            "basicFeeUnitQuantity": 1,
                            "additionalFeeUnitAmount": 5.0,
                            "additionalFeeUnitQuantity": 1,
                            "taxInclusionFeeIndicator": false,
                            "globalTaxExclusionIndicator": false,
                            "feePayableTotalAmount": 0.0,
                            "feePayableTotalGrossAmount": 0.0,
                            "feePayableTotalDiscountAmount": 0.0,
                            "feePayableTotalTaxAmount": 0.0,
                            "ipRightCategoryCode": "D",
                            "ipRightCategory": "DESIGNS",
                            "fileType": "V",
                            "fileTypeName": "Design VC",
                            "applicationCategoryCode": "ID2",
                            "applicationCategory": "Test Design VC",
                            "documentOriginCode": "VC",
                            "documentOriginName": "St. Vincent & Grenadines",
                            "taxBag": [
                                {
                                    "taxId": "VAT",
                                    "taxDescription": "Global VAT",
                                    "taxAmount": 0.0,
                                    "taxMinimumAmount": 0.0,
                                    "taxPercentage": 10
                                },
                                {
                                    "taxId": "Tax2",
                                    "taxDescription": "Gift Tax",
                                    "taxAmount": 20.0,
                                    "taxMinimumAmount": 0.0,
                                    "taxPercentage": 0
                                },
                                {
                                    "taxId": "Tax4",
                                    "taxDescription": "GST",
                                    "taxAmount": 0.0,
                                    "taxMinimumAmount": 0.0,
                                    "taxPercentage": 5
                                }
                            ]
                        },
                        {
                            "feeId": "050",
                            "feeCategory": "registration fee",
                            "feeTypeCode": "PCL",
                            "feeDescription": "Design-Special Claim CA",
                            "basicFeeUnitAmount": 100.0,
                            "basicFeeUnitQuantity": 1,
                            "additionalFeeUnitAmount": 10.0,
                            "additionalFeeUnitQuantity": 1,
                            "taxInclusionFeeIndicator": false,
                            "globalTaxExclusionIndicator": false,
                            "feePayableTotalAmount": 0.0,
                            "feePayableTotalGrossAmount": 0.0,
                            "feePayableTotalDiscountAmount": 0.0,
                            "feePayableTotalTaxAmount": 0.0,
                            "ipRightCategoryCode": "D",
                            "ipRightCategory": "DESIGNS",
                            "fileType": "V",
                            "fileTypeName": "Design VC",
                            "applicationCategoryCode": "ID2",
                            "applicationCategory": "Test Design VC",
                            "applicationSubCategoryCode": "D1",
                            "applicationSubCategory": "Claim Application",
                            "documentOriginCode": "VC",
                            "documentOriginName": "St. Vincent & Grenadines",
                            "taxBag": [
                                {
                                    "taxId": "Tax4",
                                    "taxDescription": "GST",
                                    "taxAmount": 0.0,
                                    "taxMinimumAmount": 0.0,
                                    "taxPercentage": 5
                                },
                                {
                                    "taxId": "Tax2",
                                    "taxDescription": "Gift Tax",
                                    "taxAmount": 20.0,
                                    "taxMinimumAmount": 0.0,
                                    "taxPercentage": 0
                                }
                            ],
                            "discountBag": [
                                {
                                    "discountScheme": {
                                        "discountCategory": "DID02",
                                        "discountDescription": "Individual",
                                        "documentCode": "NID"
                                    },
                                    "discountAmount": 0.0,
                                    "discountPercentage": "5"
                                }
                            ]
                        },
                        {
                            "feeId": "010",
                            "feeCategory": "registration fee",
                            "feeTypeCode": "CLM",
                            "feeDescription": "Patent-Regular",
                            "basicFeeUnitAmount": 100.0,
                            "basicFeeUnitQuantity": 10,
                            "additionalFeeUnitAmount": 50.0,
                            "additionalFeeUnitQuantity": 5,
                            "taxInclusionFeeIndicator": false,
                            "globalTaxExclusionIndicator": true,
                            "feePayableTotalAmount": 0.0,
                            "feePayableTotalGrossAmount": 0.0,
                            "feePayableTotalDiscountAmount": 0.0,
                            "feePayableTotalTaxAmount": 0.0,
                            "ipRightCategoryCode": "P",
                            "ipRightCategory": "PATENTS",
                            "fileType": "B",
                            "fileTypeName": "Patents Test",
                            "applicationCategoryCode": "PT2",
                            "applicationCategory": "Patents",
                            "documentOriginCode": "VC",
                            "documentOriginName": "St. Vincent & Grenadines"
                        },
                        {
                            "feeId": "057",
                            "feeCategory": "registration fee",
                            "feeTypeCode": "ANU",
                            "feeDescription": "Patent-Annuity (1-3)",
                            "basicFeeUnitAmount": 100.0,
                            "basicFeeUnitQuantity": 1,
                            "additionalFeeUnitAmount": 100.0,
                            "additionalFeeUnitQuantity": 1,
                            "taxInclusionFeeIndicator": false,
                            "globalTaxExclusionIndicator": false,
                            "feePayableTotalAmount": 0.0,
                            "feePayableTotalGrossAmount": 0.0,
                            "feePayableTotalDiscountAmount": 0.0,
                            "feePayableTotalTaxAmount": 0.0,
                            "ipRightCategoryCode": "P",
                            "ipRightCategory": "PATENTS",
                            "fileType": "B",
                            "fileTypeName": "Patents Test",
                            "applicationCategoryCode": "PT2",
                            "applicationCategory": "Patents",
                            "documentOriginCode": "VC",
                            "documentOriginName": "St. Vincent & Grenadines",
                            "taxBag": [
                                {
                                    "taxId": "Tax2",
                                    "taxDescription": "Gift Tax",
                                    "taxAmount": 20.0,
                                    "taxMinimumAmount": 0.0,
                                    "taxPercentage": 0
                                },
                                {
                                    "taxId": "Tax4",
                                    "taxDescription": "GST",
                                    "taxAmount": 0.0,
                                    "taxMinimumAmount": 0.0,
                                    "taxPercentage": 5
                                }
                            ],
                            "discountBag": [
                                {
                                    "discountScheme": {
                                        "discountCategory": "DID01",
                                        "discountDescription": "SME",
                                        "documentCode": "SME"
                                    },
                                    "discountAmount": 0.0,
                                    "discountPercentage": "5"
                                },
                                {
                                    "discountScheme": {
                                        "discountCategory": "DID02",
                                        "discountDescription": "Individual",
                                        "documentCode": "NID"
                                    },
                                    "discountAmount": 5.0,
                                    "discountPercentage": null
                                }
                            ]
                        },
                        {
                            "feeId": "058",
                            "feeCategory": "registration fee",
                            "feeTypeCode": "ANU",
                            "feeDescription": "Patent Annuity (4-6)",
                            "basicFeeUnitAmount": 150.0,
                            "basicFeeUnitQuantity": 1,
                            "additionalFeeUnitAmount": 150.0,
                            "additionalFeeUnitQuantity": 1,
                            "taxInclusionFeeIndicator": false,
                            "globalTaxExclusionIndicator": true,
                            "feePayableTotalAmount": 0.0,
                            "feePayableTotalGrossAmount": 0.0,
                            "feePayableTotalDiscountAmount": 0.0,
                            "feePayableTotalTaxAmount": 0.0,
                            "ipRightCategoryCode": "P",
                            "ipRightCategory": "PATENTS",
                            "fileType": "B",
                            "fileTypeName": "Patents Test",
                            "applicationCategoryCode": "PT2",
                            "applicationCategory": "Patents",
                            "documentOriginCode": "VC",
                            "documentOriginName": "St. Vincent & Grenadines",
                            "taxBag": [
                                {
                                    "taxId": "Tax4",
                                    "taxDescription": "GST",
                                    "taxAmount": 0.0,
                                    "taxMinimumAmount": 0.0,
                                    "taxPercentage": 5
                                },
                                {
                                    "taxId": "Tax2",
                                    "taxDescription": "Gift Tax",
                                    "taxAmount": 20.0,
                                    "taxMinimumAmount": 0.0,
                                    "taxPercentage": 0
                                }
                            ],
                            "discountBag": [
                                {
                                    "discountScheme": {
                                        "discountCategory": "DID01",
                                        "discountDescription": "SME",
                                        "documentCode": "SME"
                                    },
                                    "discountAmount": 10.0,
                                    "discountPercentage": null
                                },
                                {
                                    "discountScheme": {
                                        "discountCategory": "DID02",
                                        "discountDescription": "Individual",
                                        "documentCode": "NID"
                                    },
                                    "discountAmount": 0.0,
                                    "discountPercentage": "10"
                                }
                            ]
                        },
                        {
                            "feeId": "059",
                            "feeCategory": "registration fee",
                            "feeTypeCode": "ANU",
                            "feeDescription": "Patent Annuity (10-12)",
                            "basicFeeUnitAmount": 200.0,
                            "basicFeeUnitQuantity": 1,
                            "additionalFeeUnitAmount": 200.0,
                            "additionalFeeUnitQuantity": 1,
                            "taxInclusionFeeIndicator": false,
                            "globalTaxExclusionIndicator": false,
                            "feePayableTotalAmount": 0.0,
                            "feePayableTotalGrossAmount": 0.0,
                            "feePayableTotalDiscountAmount": 0.0,
                            "feePayableTotalTaxAmount": 0.0,
                            "ipRightCategoryCode": "P",
                            "ipRightCategory": "PATENTS",
                            "fileType": "B",
                            "fileTypeName": "Patents Test",
                            "applicationCategoryCode": "PT2",
                            "applicationCategory": "Patents",
                            "documentOriginCode": "VC",
                            "documentOriginName": "St. Vincent & Grenadines",
                            "taxBag": [
                                {
                                    "taxId": "Tax2",
                                    "taxDescription": "Gift Tax",
                                    "taxAmount": 20.0,
                                    "taxMinimumAmount": 0.0,
                                    "taxPercentage": 0
                                }
                            ]
                        },
                        {
                            "feeId": "060",
                            "feeCategory": "registration fee",
                            "feeTypeCode": "ANU",
                            "feeDescription": "Patent Annuity (7-9)",
                            "basicFeeUnitAmount": 250.0,
                            "basicFeeUnitQuantity": 1,
                            "additionalFeeUnitAmount": 250.0,
                            "additionalFeeUnitQuantity": 1,
                            "taxInclusionFeeIndicator": false,
                            "globalTaxExclusionIndicator": true,
                            "feePayableTotalAmount": 0.0,
                            "feePayableTotalGrossAmount": 0.0,
                            "feePayableTotalDiscountAmount": 0.0,
                            "feePayableTotalTaxAmount": 0.0,
                            "ipRightCategoryCode": "P",
                            "ipRightCategory": "PATENTS",
                            "fileType": "B",
                            "fileTypeName": "Patents Test",
                            "applicationCategoryCode": "PT2",
                            "applicationCategory": "Patents",
                            "documentOriginCode": "VC",
                            "documentOriginName": "St. Vincent & Grenadines",
                            "taxBag": [
                                {
                                    "taxId": "Tax4",
                                    "taxDescription": "GST",
                                    "taxAmount": 0.0,
                                    "taxMinimumAmount": 0.0,
                                    "taxPercentage": 5
                                },
                                {
                                    "taxId": "Tax2",
                                    "taxDescription": "Gift Tax",
                                    "taxAmount": 20.0,
                                    "taxMinimumAmount": 0.0,
                                    "taxPercentage": 0
                                }
                            ],
                            "discountBag": [
                                {
                                    "discountScheme": {
                                        "discountCategory": "DID02",
                                        "discountDescription": "Individual",
                                        "documentCode": "NID"
                                    },
                                    "discountAmount": 0.0,
                                    "discountPercentage": "5"
                                },
                                {
                                    "discountScheme": {
                                        "discountCategory": "DID01",
                                        "discountDescription": "SME",
                                        "documentCode": "SME"
                                    },
                                    "discountAmount": 0.0,
                                    "discountPercentage": "10"
                                }
                            ]
                        },
                        {
                            "feeId": "040",
                            "feeCategory": "registration fee",
                            "feeTypeCode": "DRW",
                            "feeDescription": "Patent-AppType_NoOfDrawingImages",
                            "basicFeeUnitAmount": 200.0,
                            "basicFeeUnitQuantity": 5,
                            "additionalFeeUnitAmount": 50.0,
                            "additionalFeeUnitQuantity": 1,
                            "taxInclusionFeeIndicator": false,
                            "globalTaxExclusionIndicator": false,
                            "feePayableTotalAmount": 0.0,
                            "feePayableTotalGrossAmount": 0.0,
                            "feePayableTotalDiscountAmount": 0.0,
                            "feePayableTotalTaxAmount": 0.0,
                            "ipRightCategoryCode": "P",
                            "ipRightCategory": "PATENTS",
                            "fileType": "P",
                            "fileTypeName": "Patents",
                            "applicationCategoryCode": "PA",
                            "applicationCategory": "Test Patent",
                            "documentOriginCode": "VC",
                            "documentOriginName": "St. Vincent & Grenadines",
                            "discountBag": [
                                {
                                    "discountScheme": {
                                        "discountCategory": "DID02",
                                        "discountDescription": "Individual",
                                        "documentCode": "NID"
                                    },
                                    "discountAmount": 0.0,
                                    "discountPercentage": "5"
                                },
                                {
                                    "discountScheme": {
                                        "discountCategory": "DID01",
                                        "discountDescription": "SME",
                                        "documentCode": "SME"
                                    },
                                    "discountAmount": 0.0,
                                    "discountPercentage": "7"
                                }
                            ]
                        },
                        {
                            "feeId": "042",
                            "feeCategory": "registration fee",
                            "feeTypeCode": "PCL",
                            "feeDescription": "Patent-AppType_NoOfPriorityClaims",
                            "basicFeeUnitAmount": 200.0,
                            "basicFeeUnitQuantity": 2,
                            "additionalFeeUnitAmount": 150.0,
                            "additionalFeeUnitQuantity": 1,
                            "taxInclusionFeeIndicator": false,
                            "globalTaxExclusionIndicator": true,
                            "feePayableTotalAmount": 0.0,
                            "feePayableTotalGrossAmount": 0.0,
                            "feePayableTotalDiscountAmount": 0.0,
                            "feePayableTotalTaxAmount": 0.0,
                            "ipRightCategoryCode": "P",
                            "ipRightCategory": "PATENTS",
                            "fileType": "P",
                            "fileTypeName": "Patents",
                            "applicationCategoryCode": "PA",
                            "applicationCategory": "Test Patent",
                            "documentOriginCode": "VC",
                            "documentOriginName": "St. Vincent & Grenadines"
                        },
                        {
                            "feeId": "048",
                            "feeCategory": "registration fee",
                            "feeTypeCode": "DPG",
                            "feeDescription": "Patent-AppType_NoOfDocumentPages",
                            "basicFeeUnitAmount": 210.0,
                            "basicFeeUnitQuantity": 3,
                            "additionalFeeUnitAmount": 80.0,
                            "additionalFeeUnitQuantity": 1,
                            "taxInclusionFeeIndicator": false,
                            "globalTaxExclusionIndicator": true,
                            "feePayableTotalAmount": 0.0,
                            "feePayableTotalGrossAmount": 0.0,
                            "feePayableTotalDiscountAmount": 0.0,
                            "feePayableTotalTaxAmount": 0.0,
                            "ipRightCategoryCode": "P",
                            "ipRightCategory": "PATENTS",
                            "fileType": "P",
                            "fileTypeName": "Patents",
                            "applicationCategoryCode": "PA",
                            "applicationCategory": "Test Patent",
                            "documentOriginCode": "VC",
                            "documentOriginName": "St. Vincent & Grenadines"
                        },
                        {
                            "feeId": "039",
                            "feeCategory": "registration fee",
                            "feeTypeCode": "PCL",
                            "feeDescription": "Patent-AppType_AppSubType_NoOfClaims",
                            "basicFeeUnitAmount": 200.0,
                            "basicFeeUnitQuantity": 5,
                            "additionalFeeUnitAmount": 50.0,
                            "additionalFeeUnitQuantity": 1,
                            "taxInclusionFeeIndicator": false,
                            "globalTaxExclusionIndicator": true,
                            "feePayableTotalAmount": 0.0,
                            "feePayableTotalGrossAmount": 0.0,
                            "feePayableTotalDiscountAmount": 0.0,
                            "feePayableTotalTaxAmount": 0.0,
                            "ipRightCategoryCode": "P",
                            "ipRightCategory": "PATENTS",
                            "fileType": "P",
                            "fileTypeName": "Patents",
                            "applicationCategoryCode": "PA",
                            "applicationCategory": "Test Patent",
                            "applicationSubCategoryCode": "FA",
                            "applicationSubCategory": "Foreign-PA",
                            "documentOriginCode": "VC",
                            "documentOriginName": "St. Vincent & Grenadines"
                        },
                        {
                            "feeId": "041",
                            "feeCategory": "registration fee",
                            "feeTypeCode": "DRW",
                            "feeDescription": "Patent_AppSubTypeNoOfDrawingImages",
                            "basicFeeUnitAmount": 200.0,
                            "basicFeeUnitQuantity": 5,
                            "additionalFeeUnitAmount": 60.0,
                            "additionalFeeUnitQuantity": 1,
                            "taxInclusionFeeIndicator": false,
                            "globalTaxExclusionIndicator": false,
                            "feePayableTotalAmount": 0.0,
                            "feePayableTotalGrossAmount": 0.0,
                            "feePayableTotalDiscountAmount": 0.0,
                            "feePayableTotalTaxAmount": 0.0,
                            "ipRightCategoryCode": "P",
                            "ipRightCategory": "PATENTS",
                            "fileType": "P",
                            "fileTypeName": "Patents",
                            "applicationCategoryCode": "PA",
                            "applicationCategory": "Test Patent",
                            "applicationSubCategoryCode": "RA",
                            "applicationSubCategory": "Research-Patent",
                            "documentOriginCode": "VC",
                            "documentOriginName": "St. Vincent & Grenadines"
                        },
                        {
                            "feeId": "010",
                            "feeCategory": "registration fee",
                            "feeTypeCode": "CLM",
                            "feeDescription": "Patent-Regular",
                            "basicFeeUnitAmount": 100.0,
                            "basicFeeUnitQuantity": 10,
                            "additionalFeeUnitAmount": 50.0,
                            "additionalFeeUnitQuantity": 5,
                            "taxInclusionFeeIndicator": false,
                            "globalTaxExclusionIndicator": true,
                            "feePayableTotalAmount": 0.0,
                            "feePayableTotalGrossAmount": 0.0,
                            "feePayableTotalDiscountAmount": 0.0,
                            "feePayableTotalTaxAmount": 0.0,
                            "ipRightCategoryCode": "P",
                            "ipRightCategory": "PATENTS",
                            "fileType": "P",
                            "fileTypeName": "Patents",
                            "applicationCategoryCode": "PT",
                            "applicationCategory": "Patents",
                            "documentOriginCode": "VC",
                            "documentOriginName": "St. Vincent & Grenadines"
                        },
                        {
                            "feeId": "039",
                            "feeCategory": "registration fee",
                            "feeTypeCode": "PCL",
                            "feeDescription": "Patent-AppType_AppSubType_NoOfClaims",
                            "basicFeeUnitAmount": 200.0,
                            "basicFeeUnitQuantity": 5,
                            "additionalFeeUnitAmount": 50.0,
                            "additionalFeeUnitQuantity": 1,
                            "taxInclusionFeeIndicator": false,
                            "globalTaxExclusionIndicator": true,
                            "feePayableTotalAmount": 0.0,
                            "feePayableTotalGrossAmount": 0.0,
                            "feePayableTotalDiscountAmount": 0.0,
                            "feePayableTotalTaxAmount": 0.0,
                            "ipRightCategoryCode": "P",
                            "ipRightCategory": "PATENTS",
                            "fileType": "P",
                            "fileTypeName": "Patents",
                            "applicationCategoryCode": "PT",
                            "applicationCategory": "Patents",
                            "documentOriginCode": "VC",
                            "documentOriginName": "St. Vincent & Grenadines"
                        },
                        {
                            "feeId": "057",
                            "feeCategory": "registration fee",
                            "feeTypeCode": "ANU",
                            "feeDescription": "Patent-Annuity (1-3)",
                            "basicFeeUnitAmount": 100.0,
                            "basicFeeUnitQuantity": 1,
                            "additionalFeeUnitAmount": 100.0,
                            "additionalFeeUnitQuantity": 1,
                            "taxInclusionFeeIndicator": false,
                            "globalTaxExclusionIndicator": false,
                            "feePayableTotalAmount": 0.0,
                            "feePayableTotalGrossAmount": 0.0,
                            "feePayableTotalDiscountAmount": 0.0,
                            "feePayableTotalTaxAmount": 0.0,
                            "ipRightCategoryCode": "P",
                            "ipRightCategory": "PATENTS",
                            "fileType": "P",
                            "fileTypeName": "Patents",
                            "applicationCategoryCode": "PT",
                            "applicationCategory": "Patents",
                            "documentOriginCode": "VC",
                            "documentOriginName": "St. Vincent & Grenadines",
                            "taxBag": [
                                {
                                    "taxId": "Tax2",
                                    "taxDescription": "Gift Tax",
                                    "taxAmount": 20.0,
                                    "taxMinimumAmount": 0.0,
                                    "taxPercentage": 0
                                },
                                {
                                    "taxId": "Tax4",
                                    "taxDescription": "GST",
                                    "taxAmount": 0.0,
                                    "taxMinimumAmount": 0.0,
                                    "taxPercentage": 5
                                }
                            ],
                            "discountBag": [
                                {
                                    "discountScheme": {
                                        "discountCategory": "DID01",
                                        "discountDescription": "SME",
                                        "documentCode": "SME"
                                    },
                                    "discountAmount": 0.0,
                                    "discountPercentage": "5"
                                },
                                {
                                    "discountScheme": {
                                        "discountCategory": "DID02",
                                        "discountDescription": "Individual",
                                        "documentCode": "NID"
                                    },
                                    "discountAmount": 5.0,
                                    "discountPercentage": null
                                }
                            ]
                        },
                        {
                            "feeId": "058",
                            "feeCategory": "registration fee",
                            "feeTypeCode": "ANU",
                            "feeDescription": "Patent Annuity (4-6)",
                            "basicFeeUnitAmount": 150.0,
                            "basicFeeUnitQuantity": 1,
                            "additionalFeeUnitAmount": 150.0,
                            "additionalFeeUnitQuantity": 1,
                            "taxInclusionFeeIndicator": false,
                            "globalTaxExclusionIndicator": true,
                            "feePayableTotalAmount": 0.0,
                            "feePayableTotalGrossAmount": 0.0,
                            "feePayableTotalDiscountAmount": 0.0,
                            "feePayableTotalTaxAmount": 0.0,
                            "ipRightCategoryCode": "P",
                            "ipRightCategory": "PATENTS",
                            "fileType": "P",
                            "fileTypeName": "Patents",
                            "applicationCategoryCode": "PT",
                            "applicationCategory": "Patents",
                            "documentOriginCode": "VC",
                            "documentOriginName": "St. Vincent & Grenadines",
                            "taxBag": [
                                {
                                    "taxId": "Tax4",
                                    "taxDescription": "GST",
                                    "taxAmount": 0.0,
                                    "taxMinimumAmount": 0.0,
                                    "taxPercentage": 5
                                },
                                {
                                    "taxId": "Tax2",
                                    "taxDescription": "Gift Tax",
                                    "taxAmount": 20.0,
                                    "taxMinimumAmount": 0.0,
                                    "taxPercentage": 0
                                }
                            ],
                            "discountBag": [
                                {
                                    "discountScheme": {
                                        "discountCategory": "DID01",
                                        "discountDescription": "SME",
                                        "documentCode": "SME"
                                    },
                                    "discountAmount": 10.0,
                                    "discountPercentage": null
                                },
                                {
                                    "discountScheme": {
                                        "discountCategory": "DID02",
                                        "discountDescription": "Individual",
                                        "documentCode": "NID"
                                    },
                                    "discountAmount": 0.0,
                                    "discountPercentage": "10"
                                }
                            ]
                        },
                        {
                            "feeId": "059",
                            "feeCategory": "registration fee",
                            "feeTypeCode": "ANU",
                            "feeDescription": "Patent Annuity (10-12)",
                            "basicFeeUnitAmount": 200.0,
                            "basicFeeUnitQuantity": 1,
                            "additionalFeeUnitAmount": 200.0,
                            "additionalFeeUnitQuantity": 1,
                            "taxInclusionFeeIndicator": false,
                            "globalTaxExclusionIndicator": false,
                            "feePayableTotalAmount": 0.0,
                            "feePayableTotalGrossAmount": 0.0,
                            "feePayableTotalDiscountAmount": 0.0,
                            "feePayableTotalTaxAmount": 0.0,
                            "ipRightCategoryCode": "P",
                            "ipRightCategory": "PATENTS",
                            "fileType": "P",
                            "fileTypeName": "Patents",
                            "applicationCategoryCode": "PT",
                            "applicationCategory": "Patents",
                            "documentOriginCode": "VC",
                            "documentOriginName": "St. Vincent & Grenadines",
                            "taxBag": [
                                {
                                    "taxId": "Tax2",
                                    "taxDescription": "Gift Tax",
                                    "taxAmount": 20.0,
                                    "taxMinimumAmount": 0.0,
                                    "taxPercentage": 0
                                }
                            ]
                        },
                        {
                            "feeId": "060",
                            "feeCategory": "registration fee",
                            "feeTypeCode": "ANU",
                            "feeDescription": "Patent Annuity (7-9)",
                            "basicFeeUnitAmount": 250.0,
                            "basicFeeUnitQuantity": 1,
                            "additionalFeeUnitAmount": 250.0,
                            "additionalFeeUnitQuantity": 1,
                            "taxInclusionFeeIndicator": false,
                            "globalTaxExclusionIndicator": true,
                            "feePayableTotalAmount": 0.0,
                            "feePayableTotalGrossAmount": 0.0,
                            "feePayableTotalDiscountAmount": 0.0,
                            "feePayableTotalTaxAmount": 0.0,
                            "ipRightCategoryCode": "P",
                            "ipRightCategory": "PATENTS",
                            "fileType": "P",
                            "fileTypeName": "Patents",
                            "applicationCategoryCode": "PT",
                            "applicationCategory": "Patents",
                            "documentOriginCode": "VC",
                            "documentOriginName": "St. Vincent & Grenadines",
                            "taxBag": [
                                {
                                    "taxId": "Tax4",
                                    "taxDescription": "GST",
                                    "taxAmount": 0.0,
                                    "taxMinimumAmount": 0.0,
                                    "taxPercentage": 5
                                },
                                {
                                    "taxId": "Tax2",
                                    "taxDescription": "Gift Tax",
                                    "taxAmount": 20.0,
                                    "taxMinimumAmount": 0.0,
                                    "taxPercentage": 0
                                }
                            ],
                            "discountBag": [
                                {
                                    "discountScheme": {
                                        "discountCategory": "DID02",
                                        "discountDescription": "Individual",
                                        "documentCode": "NID"
                                    },
                                    "discountAmount": 0.0,
                                    "discountPercentage": "5"
                                },
                                {
                                    "discountScheme": {
                                        "discountCategory": "DID01",
                                        "discountDescription": "SME",
                                        "documentCode": "SME"
                                    },
                                    "discountAmount": 0.0,
                                    "discountPercentage": "10"
                                }
                            ]
                        },
                        {
                            "feeId": "040",
                            "feeCategory": "registration fee",
                            "feeTypeCode": "DRW",
                            "feeDescription": "Patent-AppType_NoOfDrawingImages",
                            "basicFeeUnitAmount": 200.0,
                            "basicFeeUnitQuantity": 5,
                            "additionalFeeUnitAmount": 50.0,
                            "additionalFeeUnitQuantity": 1,
                            "taxInclusionFeeIndicator": false,
                            "globalTaxExclusionIndicator": false,
                            "feePayableTotalAmount": 0.0,
                            "feePayableTotalGrossAmount": 0.0,
                            "feePayableTotalDiscountAmount": 0.0,
                            "feePayableTotalTaxAmount": 0.0,
                            "ipRightCategoryCode": "P",
                            "ipRightCategory": "PATENTS",
                            "fileType": "P",
                            "fileTypeName": "Patents",
                            "applicationCategoryCode": "PT",
                            "applicationCategory": "Patents",
                            "applicationSubCategoryCode": "NP",
                            "applicationSubCategory": "National Patents",
                            "documentOriginCode": "VC",
                            "documentOriginName": "St. Vincent & Grenadines",
                            "discountBag": [
                                {
                                    "discountScheme": {
                                        "discountCategory": "DID02",
                                        "discountDescription": "Individual",
                                        "documentCode": "NID"
                                    },
                                    "discountAmount": 0.0,
                                    "discountPercentage": "5"
                                },
                                {
                                    "discountScheme": {
                                        "discountCategory": "DID01",
                                        "discountDescription": "SME",
                                        "documentCode": "SME"
                                    },
                                    "discountAmount": 0.0,
                                    "discountPercentage": "7"
                                }
                            ]
                        },
                        {
                            "feeId": "043",
                            "feeCategory": "registration fee",
                            "feeTypeCode": "PCL",
                            "feeDescription": "Patent-AppSubType_NP_NoOfPriorityClaims",
                            "basicFeeUnitAmount": 100.0,
                            "basicFeeUnitQuantity": 10,
                            "additionalFeeUnitAmount": 25.0,
                            "additionalFeeUnitQuantity": 2,
                            "taxInclusionFeeIndicator": false,
                            "globalTaxExclusionIndicator": false,
                            "feePayableTotalAmount": 0.0,
                            "feePayableTotalGrossAmount": 0.0,
                            "feePayableTotalDiscountAmount": 0.0,
                            "feePayableTotalTaxAmount": 0.0,
                            "ipRightCategoryCode": "P",
                            "ipRightCategory": "PATENTS",
                            "fileType": "P",
                            "fileTypeName": "Patents",
                            "applicationCategoryCode": "PT",
                            "applicationCategory": "Patents",
                            "applicationSubCategoryCode": "NP",
                            "applicationSubCategory": "National Patents",
                            "documentOriginCode": "VC",
                            "documentOriginName": "St. Vincent & Grenadines",
                            "taxBag": [
                                {
                                    "taxId": "Tax1",
                                    "taxDescription": "Corporate Tax",
                                    "taxAmount": 15.0,
                                    "taxMinimumAmount": 0.0,
                                    "taxPercentage": 0
                                }
                            ],
                            "discountBag": [
                                {
                                    "discountScheme": {
                                        "discountCategory": "DID01",
                                        "discountDescription": "SME",
                                        "documentCode": "SME"
                                    },
                                    "discountAmount": 5.0,
                                    "discountPercentage": null
                                },
                                {
                                    "discountScheme": {
                                        "discountCategory": "DID02",
                                        "discountDescription": "Individual",
                                        "documentCode": "NID"
                                    },
                                    "discountAmount": 7.0,
                                    "discountPercentage": null
                                }
                            ]
                        },
                        {
                            "feeId": "044",
                            "feeCategory": "registration fee",
                            "feeTypeCode": "CLM",
                            "feeDescription": "Patent-AppSubType_UM_NoOfClaims",
                            "basicFeeUnitAmount": 200.0,
                            "basicFeeUnitQuantity": 2,
                            "additionalFeeUnitAmount": 150.0,
                            "additionalFeeUnitQuantity": 1,
                            "taxInclusionFeeIndicator": false,
                            "globalTaxExclusionIndicator": false,
                            "feePayableTotalAmount": 0.0,
                            "feePayableTotalGrossAmount": 0.0,
                            "feePayableTotalDiscountAmount": 0.0,
                            "feePayableTotalTaxAmount": 0.0,
                            "ipRightCategoryCode": "P",
                            "ipRightCategory": "PATENTS",
                            "fileType": "P",
                            "fileTypeName": "Patents",
                            "applicationCategoryCode": "PT",
                            "applicationCategory": "Patents",
                            "applicationSubCategoryCode": "NP",
                            "applicationSubCategory": "National Patents",
                            "documentOriginCode": "VC",
                            "documentOriginName": "St. Vincent & Grenadines",
                            "taxBag": [
                                {
                                    "taxId": "Tax2",
                                    "taxDescription": "Gift Tax",
                                    "taxAmount": 20.0,
                                    "taxMinimumAmount": 0.0,
                                    "taxPercentage": 0
                                }
                            ],
                            "discountBag": [
                                {
                                    "discountScheme": {
                                        "discountCategory": "DID02",
                                        "discountDescription": "Individual",
                                        "documentCode": "NID"
                                    },
                                    "discountAmount": 0.0,
                                    "discountPercentage": "10"
                                },
                                {
                                    "discountScheme": {
                                        "discountCategory": "DID01",
                                        "discountDescription": "SME",
                                        "documentCode": "SME"
                                    },
                                    "discountAmount": 0.0,
                                    "discountPercentage": "5"
                                }
                            ]
                        },
                        {
                            "feeId": "047",
                            "feeCategory": "registration fee",
                            "feeTypeCode": "DPG",
                            "feeDescription": "Patent-AppSubType_NoOfDocumentPages",
                            "basicFeeUnitAmount": 100.0,
                            "basicFeeUnitQuantity": 2,
                            "additionalFeeUnitAmount": 150.0,
                            "additionalFeeUnitQuantity": 1,
                            "taxInclusionFeeIndicator": false,
                            "globalTaxExclusionIndicator": false,
                            "feePayableTotalAmount": 0.0,
                            "feePayableTotalGrossAmount": 0.0,
                            "feePayableTotalDiscountAmount": 0.0,
                            "feePayableTotalTaxAmount": 0.0,
                            "ipRightCategoryCode": "P",
                            "ipRightCategory": "PATENTS",
                            "fileType": "P",
                            "fileTypeName": "Patents",
                            "applicationCategoryCode": "PT",
                            "applicationCategory": "Patents",
                            "applicationSubCategoryCode": "NP",
                            "applicationSubCategory": "National Patents",
                            "documentOriginCode": "VC",
                            "documentOriginName": "St. Vincent & Grenadines",
                            "taxBag": [
                                {
                                    "taxId": "Tax2",
                                    "taxDescription": "Gift Tax",
                                    "taxAmount": 20.0,
                                    "taxMinimumAmount": 0.0,
                                    "taxPercentage": 0
                                }
                            ],
                            "discountBag": [
                                {
                                    "discountScheme": {
                                        "discountCategory": "DID02",
                                        "discountDescription": "Individual",
                                        "documentCode": "NID"
                                    },
                                    "discountAmount": 7.0,
                                    "discountPercentage": null
                                },
                                {
                                    "discountScheme": {
                                        "discountCategory": "DID01",
                                        "discountDescription": "SME",
                                        "documentCode": "SME"
                                    },
                                    "discountAmount": 10.0,
                                    "discountPercentage": null
                                }
                            ]
                        },
                        {
                            "feeId": "045",
                            "feeCategory": "registration fee",
                            "feeTypeCode": "CLM",
                            "feeDescription": "Patent-AppSubType_PCTP_NoOfClaims",
                            "basicFeeUnitAmount": 300.0,
                            "basicFeeUnitQuantity": 2,
                            "additionalFeeUnitAmount": 200.0,
                            "additionalFeeUnitQuantity": 1,
                            "taxInclusionFeeIndicator": false,
                            "globalTaxExclusionIndicator": true,
                            "feePayableTotalAmount": 0.0,
                            "feePayableTotalGrossAmount": 0.0,
                            "feePayableTotalDiscountAmount": 0.0,
                            "feePayableTotalTaxAmount": 0.0,
                            "ipRightCategoryCode": "P",
                            "ipRightCategory": "PATENTS",
                            "fileType": "P",
                            "fileTypeName": "Patents",
                            "applicationCategoryCode": "PT",
                            "applicationCategory": "Patents",
                            "applicationSubCategoryCode": "PP",
                            "applicationSubCategory": "PCT Patents",
                            "documentOriginCode": "VC",
                            "documentOriginName": "St. Vincent & Grenadines"
                        },
                        {
                            "feeId": "011",
                            "feeCategory": "registration fee",
                            "feeTypeCode": "DRW",
                            "feeDescription": "Patent-Special drawings",
                            "basicFeeUnitAmount": 0.0,
                            "basicFeeUnitQuantity": 4,
                            "additionalFeeUnitAmount": 2.0,
                            "additionalFeeUnitQuantity": 1,
                            "taxInclusionFeeIndicator": false,
                            "globalTaxExclusionIndicator": true,
                            "feePayableTotalAmount": 0.0,
                            "feePayableTotalGrossAmount": 0.0,
                            "feePayableTotalDiscountAmount": 0.0,
                            "feePayableTotalTaxAmount": 0.0,
                            "ipRightCategoryCode": "P",
                            "ipRightCategory": "PATENTS",
                            "fileType": "P",
                            "fileTypeName": "Patents",
                            "applicationCategoryCode": "PT",
                            "applicationCategory": "Patents",
                            "applicationSubCategoryCode": "UM",
                            "applicationSubCategory": "Utility Model",
                            "documentOriginCode": "VC",
                            "documentOriginName": "St. Vincent & Grenadines"
                        },
                        {
                            "feeId": "001",
                            "feeCategory": "registration fee",
                            "feeTypeCode": "REG",
                            "feeDescription": "Regular fees IP",
                            "basicFeeUnitAmount": 100.0,
                            "basicFeeUnitQuantity": 2,
                            "additionalFeeUnitAmount": 50.0,
                            "additionalFeeUnitQuantity": 1,
                            "taxInclusionFeeIndicator": false,
                            "globalTaxExclusionIndicator": true,
                            "feePayableTotalAmount": 0.0,
                            "feePayableTotalGrossAmount": 0.0,
                            "feePayableTotalDiscountAmount": 0.0,
                            "feePayableTotalTaxAmount": 0.0,
                            "ipRightCategoryCode": "T",
                            "ipRightCategory": "TRADEMARKS",
                            "documentOriginCode": "VC",
                            "documentOriginName": "St. Vincent & Grenadines",
                            "taxBag": [
                                {
                                    "taxId": "Tax4",
                                    "taxDescription": "GST",
                                    "taxAmount": 0.0,
                                    "taxMinimumAmount": 0.0,
                                    "taxPercentage": 5
                                }
                            ],
                            "discountBag": [
                                {
                                    "discountScheme": {
                                        "discountCategory": "DID01",
                                        "discountDescription": "SME",
                                        "documentCode": "SME"
                                    },
                                    "discountAmount": 0.0,
                                    "discountPercentage": "5"
                                },
                                {
                                    "discountScheme": {
                                        "discountCategory": "DID02",
                                        "discountDescription": "Individual",
                                        "documentCode": "NID"
                                    },
                                    "discountAmount": 0.0,
                                    "discountPercentage": "5"
                                }
                            ]
                        },
                        {
                            "feeId": "002",
                            "feeCategory": "registration fee",
                            "feeTypeCode": "NCL",
                            "feeDescription": "TM-Trademark Goods and Service (General)",
                            "basicFeeUnitAmount": 50.0,
                            "basicFeeUnitQuantity": 1,
                            "additionalFeeUnitAmount": 50.0,
                            "additionalFeeUnitQuantity": 1,
                            "taxInclusionFeeIndicator": false,
                            "globalTaxExclusionIndicator": false,
                            "feePayableTotalAmount": 0.0,
                            "feePayableTotalGrossAmount": 0.0,
                            "feePayableTotalDiscountAmount": 0.0,
                            "feePayableTotalTaxAmount": 0.0,
                            "ipRightCategoryCode": "T",
                            "ipRightCategory": "TRADEMARKS",
                            "documentOriginCode": "VC",
                            "documentOriginName": "St. Vincent & Grenadines",
                            "taxBag": [
                                {
                                    "taxId": "Tax4",
                                    "taxDescription": "GST",
                                    "taxAmount": 0.0,
                                    "taxMinimumAmount": 0.0,
                                    "taxPercentage": 5
                                },
                                {
                                    "taxId": "Tax2",
                                    "taxDescription": "Gift Tax",
                                    "taxAmount": 20.0,
                                    "taxMinimumAmount": 0.0,
                                    "taxPercentage": 0
                                }
                            ],
                            "discountBag": [
                                {
                                    "discountScheme": {
                                        "discountCategory": "DID02",
                                        "discountDescription": "Individual",
                                        "documentCode": "NID"
                                    },
                                    "discountAmount": 0.0,
                                    "discountPercentage": "5"
                                }
                            ]
                        },
                        {
                            "feeId": "003",
                            "feeCategory": "registration fee",
                            "feeTypeCode": "NCL",
                            "feeDescription": "TM-Specific Goods and Services (collective)",
                            "basicFeeUnitAmount": 200.0,
                            "basicFeeUnitQuantity": 3,
                            "additionalFeeUnitAmount": 60.0,
                            "additionalFeeUnitQuantity": 1,
                            "taxInclusionFeeIndicator": false,
                            "globalTaxExclusionIndicator": true,
                            "feePayableTotalAmount": 0.0,
                            "feePayableTotalGrossAmount": 0.0,
                            "feePayableTotalDiscountAmount": 0.0,
                            "feePayableTotalTaxAmount": 0.0,
                            "ipRightCategoryCode": "T",
                            "ipRightCategory": "TRADEMARKS",
                            "fileType": "M",
                            "fileTypeName": "Collective",
                            "applicationCategoryCode": "CM",
                            "applicationCategory": "Collective Mark",
                            "applicationSubCategoryCode": "CM",
                            "applicationSubCategory": "Collective",
                            "documentOriginCode": "VC",
                            "documentOriginName": "St. Vincent & Grenadines",
                            "taxBag": [
                                {
                                    "taxId": "Tax4",
                                    "taxDescription": "GST",
                                    "taxAmount": 0.0,
                                    "taxMinimumAmount": 0.0,
                                    "taxPercentage": 5
                                },
                                {
                                    "taxId": "Tax2",
                                    "taxDescription": "Gift Tax",
                                    "taxAmount": 20.0,
                                    "taxMinimumAmount": 0.0,
                                    "taxPercentage": 0
                                },
                                {
                                    "taxId": "VAT",
                                    "taxDescription": "Global VAT",
                                    "taxAmount": 0.0,
                                    "taxMinimumAmount": 0.0,
                                    "taxPercentage": 10
                                }
                            ],
                            "discountBag": [
                                {
                                    "discountScheme": {
                                        "discountCategory": "DID01",
                                        "discountDescription": "SME",
                                        "documentCode": "SME"
                                    },
                                    "discountAmount": 0.0,
                                    "discountPercentage": "5"
                                },
                                {
                                    "discountScheme": {
                                        "discountCategory": "DID02",
                                        "discountDescription": "Individual",
                                        "documentCode": "NID"
                                    },
                                    "discountAmount": 0.0,
                                    "discountPercentage": "5"
                                }
                            ]
                        },
                        {
                            "feeId": "051",
                            "feeCategory": "registration fee",
                            "feeTypeCode": "LGC",
                            "feeDescription": "TM-Color logo 2",
                            "basicFeeUnitAmount": 50.0,
                            "basicFeeUnitQuantity": 1,
                            "additionalFeeUnitAmount": 100.0,
                            "additionalFeeUnitQuantity": 1,
                            "taxInclusionFeeIndicator": false,
                            "globalTaxExclusionIndicator": false,
                            "feePayableTotalAmount": 0.0,
                            "feePayableTotalGrossAmount": 0.0,
                            "feePayableTotalDiscountAmount": 0.0,
                            "feePayableTotalTaxAmount": 0.0,
                            "ipRightCategoryCode": "T",
                            "ipRightCategory": "TRADEMARKS",
                            "fileType": "M",
                            "fileTypeName": "Collective",
                            "applicationCategoryCode": "CM",
                            "applicationCategory": "Collective Mark",
                            "applicationSubCategoryCode": "CM",
                            "applicationSubCategory": "Collective",
                            "documentOriginCode": "VC",
                            "documentOriginName": "St. Vincent & Grenadines",
                            "taxBag": [
                                {
                                    "taxId": "Tax4",
                                    "taxDescription": "GST",
                                    "taxAmount": 0.0,
                                    "taxMinimumAmount": 0.0,
                                    "taxPercentage": 5
                                }
                            ],
                            "discountBag": [
                                {
                                    "discountScheme": {
                                        "discountCategory": "DID01",
                                        "discountDescription": "SME",
                                        "documentCode": "SME"
                                    },
                                    "discountAmount": 0.0,
                                    "discountPercentage": "5"
                                },
                                {
                                    "discountScheme": {
                                        "discountCategory": "DID02",
                                        "discountDescription": "Individual",
                                        "documentCode": "NID"
                                    },
                                    "discountAmount": 0.0,
                                    "discountPercentage": "5"
                                }
                            ]
                        },
                        {
                            "feeId": "052",
                            "feeCategory": "registration fee",
                            "feeTypeCode": "PCL",
                            "feeDescription": "TM-Priority Claims",
                            "basicFeeUnitAmount": 500.0,
                            "basicFeeUnitQuantity": 2,
                            "additionalFeeUnitAmount": 100.0,
                            "additionalFeeUnitQuantity": 2,
                            "taxInclusionFeeIndicator": false,
                            "globalTaxExclusionIndicator": false,
                            "feePayableTotalAmount": 0.0,
                            "feePayableTotalGrossAmount": 0.0,
                            "feePayableTotalDiscountAmount": 0.0,
                            "feePayableTotalTaxAmount": 0.0,
                            "ipRightCategoryCode": "T",
                            "ipRightCategory": "TRADEMARKS",
                            "fileType": "M",
                            "fileTypeName": "Collective",
                            "applicationCategoryCode": "CM",
                            "applicationCategory": "Collective Mark",
                            "applicationSubCategoryCode": "CM",
                            "applicationSubCategory": "Collective",
                            "documentOriginCode": "VC",
                            "documentOriginName": "St. Vincent & Grenadines",
                            "taxBag": [
                                {
                                    "taxId": "Tax4",
                                    "taxDescription": "GST",
                                    "taxAmount": 0.0,
                                    "taxMinimumAmount": 0.0,
                                    "taxPercentage": 5
                                },
                                {
                                    "taxId": "Tax2",
                                    "taxDescription": "Gift Tax",
                                    "taxAmount": 20.0,
                                    "taxMinimumAmount": 0.0,
                                    "taxPercentage": 0
                                }
                            ],
                            "discountBag": [
                                {
                                    "discountScheme": {
                                        "discountCategory": "DID02",
                                        "discountDescription": "Individual",
                                        "documentCode": "NID"
                                    },
                                    "discountAmount": 0.0,
                                    "discountPercentage": "5"
                                },
                                {
                                    "discountScheme": {
                                        "discountCategory": "DID01",
                                        "discountDescription": "SME",
                                        "documentCode": "SME"
                                    },
                                    "discountAmount": 0.0,
                                    "discountPercentage": "5"
                                }
                            ]
                        },
                        {
                            "feeId": "003",
                            "feeCategory": "registration fee",
                            "feeTypeCode": "NCL",
                            "feeDescription": "TM-Specific Goods and Services (collective)",
                            "basicFeeUnitAmount": 200.0,
                            "basicFeeUnitQuantity": 3,
                            "additionalFeeUnitAmount": 60.0,
                            "additionalFeeUnitQuantity": 1,
                            "taxInclusionFeeIndicator": false,
                            "globalTaxExclusionIndicator": true,
                            "feePayableTotalAmount": 0.0,
                            "feePayableTotalGrossAmount": 0.0,
                            "feePayableTotalDiscountAmount": 0.0,
                            "feePayableTotalTaxAmount": 0.0,
                            "ipRightCategoryCode": "T",
                            "ipRightCategory": "TRADEMARKS",
                            "fileType": "T",
                            "fileTypeName": "Trademarks",
                            "applicationCategoryCode": "TM",
                            "applicationCategory": "Trademarks",
                            "documentOriginCode": "VC",
                            "documentOriginName": "St. Vincent & Grenadines",
                            "taxBag": [
                                {
                                    "taxId": "Tax4",
                                    "taxDescription": "GST",
                                    "taxAmount": 0.0,
                                    "taxMinimumAmount": 0.0,
                                    "taxPercentage": 5
                                },
                                {
                                    "taxId": "Tax2",
                                    "taxDescription": "Gift Tax",
                                    "taxAmount": 20.0,
                                    "taxMinimumAmount": 0.0,
                                    "taxPercentage": 0
                                },
                                {
                                    "taxId": "VAT",
                                    "taxDescription": "Global VAT",
                                    "taxAmount": 0.0,
                                    "taxMinimumAmount": 0.0,
                                    "taxPercentage": 10
                                }
                            ],
                            "discountBag": [
                                {
                                    "discountScheme": {
                                        "discountCategory": "DID01",
                                        "discountDescription": "SME",
                                        "documentCode": "SME"
                                    },
                                    "discountAmount": 0.0,
                                    "discountPercentage": "5"
                                },
                                {
                                    "discountScheme": {
                                        "discountCategory": "DID02",
                                        "discountDescription": "Individual",
                                        "documentCode": "NID"
                                    },
                                    "discountAmount": 0.0,
                                    "discountPercentage": "5"
                                }
                            ]
                        },
                        {
                            "feeId": "020",
                            "feeCategory": "registration fee",
                            "feeTypeCode": "REN",
                            "feeDescription": "UD-Renewal Fee for Nice Class (REN | RNL)",
                            "basicFeeUnitAmount": 50.0,
                            "basicFeeUnitQuantity": 1,
                            "additionalFeeUnitAmount": 10.0,
                            "additionalFeeUnitQuantity": 1,
                            "taxInclusionFeeIndicator": false,
                            "globalTaxExclusionIndicator": false,
                            "feePayableTotalAmount": 0.0,
                            "feePayableTotalGrossAmount": 0.0,
                            "feePayableTotalDiscountAmount": 0.0,
                            "feePayableTotalTaxAmount": 0.0,
                            "ipRightCategoryCode": "T",
                            "ipRightCategory": "TRADEMARKS",
                            "fileType": "T",
                            "fileTypeName": "Trademarks",
                            "applicationCategoryCode": "TM",
                            "applicationCategory": "Trademarks",
                            "documentOriginCode": "VC",
                            "documentOriginName": "St. Vincent & Grenadines",
                            "taxBag": [
                                {
                                    "taxId": "VAT",
                                    "taxDescription": "Global VAT",
                                    "taxAmount": 0.0,
                                    "taxMinimumAmount": 0.0,
                                    "taxPercentage": 10
                                },
                                {
                                    "taxId": "Tax2",
                                    "taxDescription": "Gift Tax",
                                    "taxAmount": 20.0,
                                    "taxMinimumAmount": 0.0,
                                    "taxPercentage": 0
                                },
                                {
                                    "taxId": "Tax4",
                                    "taxDescription": "GST",
                                    "taxAmount": 0.0,
                                    "taxMinimumAmount": 0.0,
                                    "taxPercentage": 5
                                }
                            ],
                            "discountBag": [
                                {
                                    "discountScheme": {
                                        "discountCategory": "DID01",
                                        "discountDescription": "SME",
                                        "documentCode": "SME"
                                    },
                                    "discountAmount": 0.0,
                                    "discountPercentage": "5"
                                }
                            ]
                        },
                        {
                            "feeId": "022",
                            "feeCategory": "registration fee",
                            "feeTypeCode": "REC",
                            "feeDescription": "UD-Renewal Fee Color Logo (REN | RNL)",
                            "basicFeeUnitAmount": 500.0,
                            "basicFeeUnitQuantity": 2,
                            "additionalFeeUnitAmount": 100.0,
                            "additionalFeeUnitQuantity": 1,
                            "taxInclusionFeeIndicator": false,
                            "globalTaxExclusionIndicator": false,
                            "feePayableTotalAmount": 0.0,
                            "feePayableTotalGrossAmount": 0.0,
                            "feePayableTotalDiscountAmount": 0.0,
                            "feePayableTotalTaxAmount": 0.0,
                            "ipRightCategoryCode": "T",
                            "ipRightCategory": "TRADEMARKS",
                            "fileType": "T",
                            "fileTypeName": "Trademarks",
                            "applicationCategoryCode": "TM",
                            "applicationCategory": "Trademarks",
                            "documentOriginCode": "VC",
                            "documentOriginName": "St. Vincent & Grenadines",
                            "taxBag": [
                                {
                                    "taxId": "Tax2",
                                    "taxDescription": "Gift Tax",
                                    "taxAmount": 20.0,
                                    "taxMinimumAmount": 0.0,
                                    "taxPercentage": 0
                                },
                                {
                                    "taxId": "VAT",
                                    "taxDescription": "Global VAT",
                                    "taxAmount": 0.0,
                                    "taxMinimumAmount": 0.0,
                                    "taxPercentage": 10
                                },
                                {
                                    "taxId": "Tax4",
                                    "taxDescription": "GST",
                                    "taxAmount": 0.0,
                                    "taxMinimumAmount": 0.0,
                                    "taxPercentage": 5
                                }
                            ],
                            "discountBag": [
                                {
                                    "discountScheme": {
                                        "discountCategory": "DID01",
                                        "discountDescription": "SME",
                                        "documentCode": "SME"
                                    },
                                    "discountAmount": 0.0,
                                    "discountPercentage": "5"
                                }
                            ]
                        },
                        {
                            "feeId": "036",
                            "feeCategory": "registration fee",
                            "feeTypeCode": "REI",
                            "feeDescription": "UD-Renewal Fee Number of Logo/Drawing/Unit ( REN | RNL | RDL | RED )",
                            "basicFeeUnitAmount": 100.0,
                            "basicFeeUnitQuantity": 1,
                            "additionalFeeUnitAmount": 10.0,
                            "additionalFeeUnitQuantity": 1,
                            "taxInclusionFeeIndicator": false,
                            "globalTaxExclusionIndicator": true,
                            "feePayableTotalAmount": 0.0,
                            "feePayableTotalGrossAmount": 0.0,
                            "feePayableTotalDiscountAmount": 0.0,
                            "feePayableTotalTaxAmount": 0.0,
                            "ipRightCategoryCode": "T",
                            "ipRightCategory": "TRADEMARKS",
                            "fileType": "T",
                            "fileTypeName": "Trademarks",
                            "applicationCategoryCode": "TM",
                            "applicationCategory": "Trademarks",
                            "documentOriginCode": "VC",
                            "documentOriginName": "St. Vincent & Grenadines",
                            "taxBag": [
                                {
                                    "taxId": "Tax2",
                                    "taxDescription": "Gift Tax",
                                    "taxAmount": 20.0,
                                    "taxMinimumAmount": 0.0,
                                    "taxPercentage": 0
                                },
                                {
                                    "taxId": "VAT",
                                    "taxDescription": "Global VAT",
                                    "taxAmount": 0.0,
                                    "taxMinimumAmount": 0.0,
                                    "taxPercentage": 10
                                },
                                {
                                    "taxId": "Tax4",
                                    "taxDescription": "GST",
                                    "taxAmount": 0.0,
                                    "taxMinimumAmount": 0.0,
                                    "taxPercentage": 5
                                }
                            ],
                            "discountBag": [
                                {
                                    "discountScheme": {
                                        "discountCategory": "DID01",
                                        "discountDescription": "SME",
                                        "documentCode": "SME"
                                    },
                                    "discountAmount": 0.0,
                                    "discountPercentage": "5"
                                }
                            ]
                        },
                        {
                            "feeId": "051",
                            "feeCategory": "registration fee",
                            "feeTypeCode": "LGC",
                            "feeDescription": "TM-Color logo 2",
                            "basicFeeUnitAmount": 50.0,
                            "basicFeeUnitQuantity": 1,
                            "additionalFeeUnitAmount": 100.0,
                            "additionalFeeUnitQuantity": 1,
                            "taxInclusionFeeIndicator": false,
                            "globalTaxExclusionIndicator": false,
                            "feePayableTotalAmount": 0.0,
                            "feePayableTotalGrossAmount": 0.0,
                            "feePayableTotalDiscountAmount": 0.0,
                            "feePayableTotalTaxAmount": 0.0,
                            "ipRightCategoryCode": "T",
                            "ipRightCategory": "TRADEMARKS",
                            "fileType": "T",
                            "fileTypeName": "Trademarks",
                            "applicationCategoryCode": "TM",
                            "applicationCategory": "Trademarks",
                            "documentOriginCode": "VC",
                            "documentOriginName": "St. Vincent & Grenadines",
                            "taxBag": [
                                {
                                    "taxId": "Tax4",
                                    "taxDescription": "GST",
                                    "taxAmount": 0.0,
                                    "taxMinimumAmount": 0.0,
                                    "taxPercentage": 5
                                }
                            ],
                            "discountBag": [
                                {
                                    "discountScheme": {
                                        "discountCategory": "DID01",
                                        "discountDescription": "SME",
                                        "documentCode": "SME"
                                    },
                                    "discountAmount": 0.0,
                                    "discountPercentage": "5"
                                },
                                {
                                    "discountScheme": {
                                        "discountCategory": "DID02",
                                        "discountDescription": "Individual",
                                        "documentCode": "NID"
                                    },
                                    "discountAmount": 0.0,
                                    "discountPercentage": "5"
                                }
                            ]
                        },
                        {
                            "feeId": "052",
                            "feeCategory": "registration fee",
                            "feeTypeCode": "PCL",
                            "feeDescription": "TM-Priority Claims",
                            "basicFeeUnitAmount": 500.0,
                            "basicFeeUnitQuantity": 2,
                            "additionalFeeUnitAmount": 100.0,
                            "additionalFeeUnitQuantity": 2,
                            "taxInclusionFeeIndicator": false,
                            "globalTaxExclusionIndicator": false,
                            "feePayableTotalAmount": 0.0,
                            "feePayableTotalGrossAmount": 0.0,
                            "feePayableTotalDiscountAmount": 0.0,
                            "feePayableTotalTaxAmount": 0.0,
                            "ipRightCategoryCode": "T",
                            "ipRightCategory": "TRADEMARKS",
                            "fileType": "T",
                            "fileTypeName": "Trademarks",
                            "applicationCategoryCode": "TM",
                            "applicationCategory": "Trademarks",
                            "documentOriginCode": "VC",
                            "documentOriginName": "St. Vincent & Grenadines",
                            "taxBag": [
                                {
                                    "taxId": "Tax4",
                                    "taxDescription": "GST",
                                    "taxAmount": 0.0,
                                    "taxMinimumAmount": 0.0,
                                    "taxPercentage": 5
                                },
                                {
                                    "taxId": "Tax2",
                                    "taxDescription": "Gift Tax",
                                    "taxAmount": 20.0,
                                    "taxMinimumAmount": 0.0,
                                    "taxPercentage": 0
                                }
                            ],
                            "discountBag": [
                                {
                                    "discountScheme": {
                                        "discountCategory": "DID02",
                                        "discountDescription": "Individual",
                                        "documentCode": "NID"
                                    },
                                    "discountAmount": 0.0,
                                    "discountPercentage": "5"
                                },
                                {
                                    "discountScheme": {
                                        "discountCategory": "DID01",
                                        "discountDescription": "SME",
                                        "documentCode": "SME"
                                    },
                                    "discountAmount": 0.0,
                                    "discountPercentage": "5"
                                }
                            ]
                        },
                        {
                            "feeId": "053",
                            "feeCategory": "registration fee",
                            "feeTypeCode": "NCL",
                            "feeDescription": "TM-Nice Class (Trademark - AppSubType)",
                            "basicFeeUnitAmount": 500.0,
                            "basicFeeUnitQuantity": 2,
                            "additionalFeeUnitAmount": 100.0,
                            "additionalFeeUnitQuantity": 2,
                            "taxInclusionFeeIndicator": false,
                            "globalTaxExclusionIndicator": false,
                            "feePayableTotalAmount": 0.0,
                            "feePayableTotalGrossAmount": 0.0,
                            "feePayableTotalDiscountAmount": 0.0,
                            "feePayableTotalTaxAmount": 0.0,
                            "ipRightCategoryCode": "T",
                            "ipRightCategory": "TRADEMARKS",
                            "fileType": "T",
                            "fileTypeName": "Trademarks",
                            "applicationCategoryCode": "TM",
                            "applicationCategory": "Trademarks",
                            "applicationSubCategoryCode": "ST",
                            "applicationSubCategory": "Superior Mark",
                            "documentOriginCode": "VC",
                            "documentOriginName": "St. Vincent & Grenadines",
                            "taxBag": [
                                {
                                    "taxId": "Tax2",
                                    "taxDescription": "Gift Tax",
                                    "taxAmount": 20.0,
                                    "taxMinimumAmount": 0.0,
                                    "taxPercentage": 0
                                }
                            ]
                        },
                        {
                            "feeId": "008",
                            "feeCategory": "registration fee",
                            "feeTypeCode": "LGC",
                            "feeDescription": "TM-Color logo",
                            "basicFeeUnitAmount": 20.0,
                            "basicFeeUnitQuantity": 1,
                            "additionalFeeUnitAmount": 5.0,
                            "additionalFeeUnitQuantity": 1,
                            "taxInclusionFeeIndicator": false,
                            "globalTaxExclusionIndicator": false,
                            "feePayableTotalAmount": 0.0,
                            "feePayableTotalGrossAmount": 0.0,
                            "feePayableTotalDiscountAmount": 0.0,
                            "feePayableTotalTaxAmount": 0.0,
                            "ipRightCategoryCode": "T",
                            "ipRightCategory": "TRADEMARKS",
                            "fileType": "T",
                            "fileTypeName": "Trademarks",
                            "applicationCategoryCode": "TM",
                            "applicationCategory": "Trademarks",
                            "applicationSubCategoryCode": "TM",
                            "applicationSubCategory": "National Mark",
                            "documentOriginCode": "VC",
                            "documentOriginName": "St. Vincent & Grenadines",
                            "taxBag": [
                                {
                                    "taxId": "Tax4",
                                    "taxDescription": "GST",
                                    "taxAmount": 0.0,
                                    "taxMinimumAmount": 0.0,
                                    "taxPercentage": 5
                                },
                                {
                                    "taxId": "Tax2",
                                    "taxDescription": "Gift Tax",
                                    "taxAmount": 20.0,
                                    "taxMinimumAmount": 0.0,
                                    "taxPercentage": 0
                                }
                            ]
                        },
                        {
                            "feeId": "009",
                            "feeCategory": "registration fee",
                            "feeTypeCode": "PCL",
                            "feeDescription": "TM-Collective Special claims",
                            "basicFeeUnitAmount": 20.0,
                            "basicFeeUnitQuantity": 1,
                            "additionalFeeUnitAmount": 20.0,
                            "additionalFeeUnitQuantity": 1,
                            "taxInclusionFeeIndicator": false,
                            "globalTaxExclusionIndicator": false,
                            "feePayableTotalAmount": 0.0,
                            "feePayableTotalGrossAmount": 0.0,
                            "feePayableTotalDiscountAmount": 0.0,
                            "feePayableTotalTaxAmount": 0.0,
                            "ipRightCategoryCode": "T",
                            "ipRightCategory": "TRADEMARKS",
                            "fileType": "T",
                            "fileTypeName": "Trademarks",
                            "applicationCategoryCode": "TM",
                            "applicationCategory": "Trademarks",
                            "applicationSubCategoryCode": "TM",
                            "applicationSubCategory": "National Mark",
                            "documentOriginCode": "VC",
                            "documentOriginName": "St. Vincent & Grenadines",
                            "taxBag": [
                                {
                                    "taxId": "Tax4",
                                    "taxDescription": "GST",
                                    "taxAmount": 0.0,
                                    "taxMinimumAmount": 0.0,
                                    "taxPercentage": 5
                                },
                                {
                                    "taxId": "Tax2",
                                    "taxDescription": "Gift Tax",
                                    "taxAmount": 20.0,
                                    "taxMinimumAmount": 0.0,
                                    "taxPercentage": 0
                                }
                            ],
                            "discountBag": [
                                {
                                    "discountScheme": {
                                        "discountCategory": "DID01",
                                        "discountDescription": "SME",
                                        "documentCode": "SME"
                                    },
                                    "discountAmount": 0.0,
                                    "discountPercentage": "5"
                                },
                                {
                                    "discountScheme": {
                                        "discountCategory": "DID02",
                                        "discountDescription": "Individual",
                                        "documentCode": "NID"
                                    },
                                    "discountAmount": 0.0,
                                    "discountPercentage": "5"
                                }
                            ]
                        },
                        {
                            "feeId": "001",
                            "feeCategory": "registration fee",
                            "feeTypeCode": "REG",
                            "feeDescription": "Regular fees IP",
                            "basicFeeUnitAmount": 100.0,
                            "basicFeeUnitQuantity": 2,
                            "additionalFeeUnitAmount": 50.0,
                            "additionalFeeUnitQuantity": 1,
                            "taxInclusionFeeIndicator": false,
                            "globalTaxExclusionIndicator": true,
                            "feePayableTotalAmount": 0.0,
                            "feePayableTotalGrossAmount": 0.0,
                            "feePayableTotalDiscountAmount": 0.0,
                            "feePayableTotalTaxAmount": 0.0,
                            "ipRightCategoryCode": "D",
                            "ipRightCategory": "DESIGNS",
                            "documentOriginCode": "TB",
                            "documentOriginName": "Test Back File",
                            "taxBag": [
                                {
                                    "taxId": "Tax4",
                                    "taxDescription": "GST",
                                    "taxAmount": 0.0,
                                    "taxMinimumAmount": 0.0,
                                    "taxPercentage": 5
                                }
                            ],
                            "discountBag": [
                                {
                                    "discountScheme": {
                                        "discountCategory": "DID01",
                                        "discountDescription": "SME",
                                        "documentCode": "SME"
                                    },
                                    "discountAmount": 0.0,
                                    "discountPercentage": "5"
                                },
                                {
                                    "discountScheme": {
                                        "discountCategory": "DID02",
                                        "discountDescription": "Individual",
                                        "documentCode": "NID"
                                    },
                                    "discountAmount": 0.0,
                                    "discountPercentage": "5"
                                }
                            ]
                        },
                        {
                            "feeId": "010",
                            "feeCategory": "registration fee",
                            "feeTypeCode": "CLM",
                            "feeDescription": "Patent-Regular",
                            "basicFeeUnitAmount": 100.0,
                            "basicFeeUnitQuantity": 10,
                            "additionalFeeUnitAmount": 50.0,
                            "additionalFeeUnitQuantity": 5,
                            "taxInclusionFeeIndicator": false,
                            "globalTaxExclusionIndicator": true,
                            "feePayableTotalAmount": 0.0,
                            "feePayableTotalGrossAmount": 0.0,
                            "feePayableTotalDiscountAmount": 0.0,
                            "feePayableTotalTaxAmount": 0.0,
                            "ipRightCategoryCode": "P",
                            "ipRightCategory": "PATENTS",
                            "fileType": "B",
                            "fileTypeName": "Patents Test",
                            "applicationCategoryCode": "PT2",
                            "applicationCategory": "Patents",
                            "documentOriginCode": "TB",
                            "documentOriginName": "Test Back File"
                        },
                        {
                            "feeId": "057",
                            "feeCategory": "registration fee",
                            "feeTypeCode": "ANU",
                            "feeDescription": "Patent-Annuity (1-3)",
                            "basicFeeUnitAmount": 100.0,
                            "basicFeeUnitQuantity": 1,
                            "additionalFeeUnitAmount": 100.0,
                            "additionalFeeUnitQuantity": 1,
                            "taxInclusionFeeIndicator": false,
                            "globalTaxExclusionIndicator": false,
                            "feePayableTotalAmount": 0.0,
                            "feePayableTotalGrossAmount": 0.0,
                            "feePayableTotalDiscountAmount": 0.0,
                            "feePayableTotalTaxAmount": 0.0,
                            "ipRightCategoryCode": "P",
                            "ipRightCategory": "PATENTS",
                            "fileType": "B",
                            "fileTypeName": "Patents Test",
                            "applicationCategoryCode": "PT2",
                            "applicationCategory": "Patents",
                            "documentOriginCode": "TB",
                            "documentOriginName": "Test Back File",
                            "taxBag": [
                                {
                                    "taxId": "Tax2",
                                    "taxDescription": "Gift Tax",
                                    "taxAmount": 20.0,
                                    "taxMinimumAmount": 0.0,
                                    "taxPercentage": 0
                                },
                                {
                                    "taxId": "Tax4",
                                    "taxDescription": "GST",
                                    "taxAmount": 0.0,
                                    "taxMinimumAmount": 0.0,
                                    "taxPercentage": 5
                                }
                            ],
                            "discountBag": [
                                {
                                    "discountScheme": {
                                        "discountCategory": "DID01",
                                        "discountDescription": "SME",
                                        "documentCode": "SME"
                                    },
                                    "discountAmount": 0.0,
                                    "discountPercentage": "5"
                                },
                                {
                                    "discountScheme": {
                                        "discountCategory": "DID02",
                                        "discountDescription": "Individual",
                                        "documentCode": "NID"
                                    },
                                    "discountAmount": 5.0,
                                    "discountPercentage": null
                                }
                            ]
                        },
                        {
                            "feeId": "058",
                            "feeCategory": "registration fee",
                            "feeTypeCode": "ANU",
                            "feeDescription": "Patent Annuity (4-6)",
                            "basicFeeUnitAmount": 150.0,
                            "basicFeeUnitQuantity": 1,
                            "additionalFeeUnitAmount": 150.0,
                            "additionalFeeUnitQuantity": 1,
                            "taxInclusionFeeIndicator": false,
                            "globalTaxExclusionIndicator": true,
                            "feePayableTotalAmount": 0.0,
                            "feePayableTotalGrossAmount": 0.0,
                            "feePayableTotalDiscountAmount": 0.0,
                            "feePayableTotalTaxAmount": 0.0,
                            "ipRightCategoryCode": "P",
                            "ipRightCategory": "PATENTS",
                            "fileType": "B",
                            "fileTypeName": "Patents Test",
                            "applicationCategoryCode": "PT2",
                            "applicationCategory": "Patents",
                            "documentOriginCode": "TB",
                            "documentOriginName": "Test Back File",
                            "taxBag": [
                                {
                                    "taxId": "Tax4",
                                    "taxDescription": "GST",
                                    "taxAmount": 0.0,
                                    "taxMinimumAmount": 0.0,
                                    "taxPercentage": 5
                                },
                                {
                                    "taxId": "Tax2",
                                    "taxDescription": "Gift Tax",
                                    "taxAmount": 20.0,
                                    "taxMinimumAmount": 0.0,
                                    "taxPercentage": 0
                                }
                            ],
                            "discountBag": [
                                {
                                    "discountScheme": {
                                        "discountCategory": "DID01",
                                        "discountDescription": "SME",
                                        "documentCode": "SME"
                                    },
                                    "discountAmount": 10.0,
                                    "discountPercentage": null
                                },
                                {
                                    "discountScheme": {
                                        "discountCategory": "DID02",
                                        "discountDescription": "Individual",
                                        "documentCode": "NID"
                                    },
                                    "discountAmount": 0.0,
                                    "discountPercentage": "10"
                                }
                            ]
                        },
                        {
                            "feeId": "059",
                            "feeCategory": "registration fee",
                            "feeTypeCode": "ANU",
                            "feeDescription": "Patent Annuity (10-12)",
                            "basicFeeUnitAmount": 200.0,
                            "basicFeeUnitQuantity": 1,
                            "additionalFeeUnitAmount": 200.0,
                            "additionalFeeUnitQuantity": 1,
                            "taxInclusionFeeIndicator": false,
                            "globalTaxExclusionIndicator": false,
                            "feePayableTotalAmount": 0.0,
                            "feePayableTotalGrossAmount": 0.0,
                            "feePayableTotalDiscountAmount": 0.0,
                            "feePayableTotalTaxAmount": 0.0,
                            "ipRightCategoryCode": "P",
                            "ipRightCategory": "PATENTS",
                            "fileType": "B",
                            "fileTypeName": "Patents Test",
                            "applicationCategoryCode": "PT2",
                            "applicationCategory": "Patents",
                            "documentOriginCode": "TB",
                            "documentOriginName": "Test Back File",
                            "taxBag": [
                                {
                                    "taxId": "Tax2",
                                    "taxDescription": "Gift Tax",
                                    "taxAmount": 20.0,
                                    "taxMinimumAmount": 0.0,
                                    "taxPercentage": 0
                                }
                            ]
                        },
                        {
                            "feeId": "060",
                            "feeCategory": "registration fee",
                            "feeTypeCode": "ANU",
                            "feeDescription": "Patent Annuity (7-9)",
                            "basicFeeUnitAmount": 250.0,
                            "basicFeeUnitQuantity": 1,
                            "additionalFeeUnitAmount": 250.0,
                            "additionalFeeUnitQuantity": 1,
                            "taxInclusionFeeIndicator": false,
                            "globalTaxExclusionIndicator": true,
                            "feePayableTotalAmount": 0.0,
                            "feePayableTotalGrossAmount": 0.0,
                            "feePayableTotalDiscountAmount": 0.0,
                            "feePayableTotalTaxAmount": 0.0,
                            "ipRightCategoryCode": "P",
                            "ipRightCategory": "PATENTS",
                            "fileType": "B",
                            "fileTypeName": "Patents Test",
                            "applicationCategoryCode": "PT2",
                            "applicationCategory": "Patents",
                            "documentOriginCode": "TB",
                            "documentOriginName": "Test Back File",
                            "taxBag": [
                                {
                                    "taxId": "Tax4",
                                    "taxDescription": "GST",
                                    "taxAmount": 0.0,
                                    "taxMinimumAmount": 0.0,
                                    "taxPercentage": 5
                                },
                                {
                                    "taxId": "Tax2",
                                    "taxDescription": "Gift Tax",
                                    "taxAmount": 20.0,
                                    "taxMinimumAmount": 0.0,
                                    "taxPercentage": 0
                                }
                            ],
                            "discountBag": [
                                {
                                    "discountScheme": {
                                        "discountCategory": "DID02",
                                        "discountDescription": "Individual",
                                        "documentCode": "NID"
                                    },
                                    "discountAmount": 0.0,
                                    "discountPercentage": "5"
                                },
                                {
                                    "discountScheme": {
                                        "discountCategory": "DID01",
                                        "discountDescription": "SME",
                                        "documentCode": "SME"
                                    },
                                    "discountAmount": 0.0,
                                    "discountPercentage": "10"
                                }
                            ]
                        },
                        {
                            "feeId": "057",
                            "feeCategory": "registration fee",
                            "feeTypeCode": "ANU",
                            "feeDescription": "Patent-Annuity (1-3)",
                            "basicFeeUnitAmount": 100.0,
                            "basicFeeUnitQuantity": 1,
                            "additionalFeeUnitAmount": 100.0,
                            "additionalFeeUnitQuantity": 1,
                            "taxInclusionFeeIndicator": false,
                            "globalTaxExclusionIndicator": false,
                            "feePayableTotalAmount": 0.0,
                            "feePayableTotalGrossAmount": 0.0,
                            "feePayableTotalDiscountAmount": 0.0,
                            "feePayableTotalTaxAmount": 0.0,
                            "ipRightCategoryCode": "P",
                            "ipRightCategory": "PATENTS",
                            "fileType": "E",
                            "fileTypeName": "Patents Test",
                            "applicationCategoryCode": "PT3",
                            "applicationCategory": "Patents",
                            "documentOriginCode": "TB",
                            "documentOriginName": "Test Back File",
                            "taxBag": [
                                {
                                    "taxId": "Tax2",
                                    "taxDescription": "Gift Tax",
                                    "taxAmount": 20.0,
                                    "taxMinimumAmount": 0.0,
                                    "taxPercentage": 0
                                },
                                {
                                    "taxId": "Tax4",
                                    "taxDescription": "GST",
                                    "taxAmount": 0.0,
                                    "taxMinimumAmount": 0.0,
                                    "taxPercentage": 5
                                }
                            ],
                            "discountBag": [
                                {
                                    "discountScheme": {
                                        "discountCategory": "DID01",
                                        "discountDescription": "SME",
                                        "documentCode": "SME"
                                    },
                                    "discountAmount": 0.0,
                                    "discountPercentage": "5"
                                },
                                {
                                    "discountScheme": {
                                        "discountCategory": "DID02",
                                        "discountDescription": "Individual",
                                        "documentCode": "NID"
                                    },
                                    "discountAmount": 5.0,
                                    "discountPercentage": null
                                }
                            ]
                        },
                        {
                            "feeId": "058",
                            "feeCategory": "registration fee",
                            "feeTypeCode": "ANU",
                            "feeDescription": "Patent Annuity (4-6)",
                            "basicFeeUnitAmount": 150.0,
                            "basicFeeUnitQuantity": 1,
                            "additionalFeeUnitAmount": 150.0,
                            "additionalFeeUnitQuantity": 1,
                            "taxInclusionFeeIndicator": false,
                            "globalTaxExclusionIndicator": true,
                            "feePayableTotalAmount": 0.0,
                            "feePayableTotalGrossAmount": 0.0,
                            "feePayableTotalDiscountAmount": 0.0,
                            "feePayableTotalTaxAmount": 0.0,
                            "ipRightCategoryCode": "P",
                            "ipRightCategory": "PATENTS",
                            "fileType": "E",
                            "fileTypeName": "Patents Test",
                            "applicationCategoryCode": "PT3",
                            "applicationCategory": "Patents",
                            "documentOriginCode": "TB",
                            "documentOriginName": "Test Back File",
                            "taxBag": [
                                {
                                    "taxId": "Tax4",
                                    "taxDescription": "GST",
                                    "taxAmount": 0.0,
                                    "taxMinimumAmount": 0.0,
                                    "taxPercentage": 5
                                },
                                {
                                    "taxId": "Tax2",
                                    "taxDescription": "Gift Tax",
                                    "taxAmount": 20.0,
                                    "taxMinimumAmount": 0.0,
                                    "taxPercentage": 0
                                }
                            ],
                            "discountBag": [
                                {
                                    "discountScheme": {
                                        "discountCategory": "DID01",
                                        "discountDescription": "SME",
                                        "documentCode": "SME"
                                    },
                                    "discountAmount": 10.0,
                                    "discountPercentage": null
                                },
                                {
                                    "discountScheme": {
                                        "discountCategory": "DID02",
                                        "discountDescription": "Individual",
                                        "documentCode": "NID"
                                    },
                                    "discountAmount": 0.0,
                                    "discountPercentage": "10"
                                }
                            ]
                        },
                        {
                            "feeId": "059",
                            "feeCategory": "registration fee",
                            "feeTypeCode": "ANU",
                            "feeDescription": "Patent Annuity (10-12)",
                            "basicFeeUnitAmount": 200.0,
                            "basicFeeUnitQuantity": 1,
                            "additionalFeeUnitAmount": 200.0,
                            "additionalFeeUnitQuantity": 1,
                            "taxInclusionFeeIndicator": false,
                            "globalTaxExclusionIndicator": false,
                            "feePayableTotalAmount": 0.0,
                            "feePayableTotalGrossAmount": 0.0,
                            "feePayableTotalDiscountAmount": 0.0,
                            "feePayableTotalTaxAmount": 0.0,
                            "ipRightCategoryCode": "P",
                            "ipRightCategory": "PATENTS",
                            "fileType": "E",
                            "fileTypeName": "Patents Test",
                            "applicationCategoryCode": "PT3",
                            "applicationCategory": "Patents",
                            "documentOriginCode": "TB",
                            "documentOriginName": "Test Back File",
                            "taxBag": [
                                {
                                    "taxId": "Tax2",
                                    "taxDescription": "Gift Tax",
                                    "taxAmount": 20.0,
                                    "taxMinimumAmount": 0.0,
                                    "taxPercentage": 0
                                }
                            ]
                        },
                        {
                            "feeId": "060",
                            "feeCategory": "registration fee",
                            "feeTypeCode": "ANU",
                            "feeDescription": "Patent Annuity (7-9)",
                            "basicFeeUnitAmount": 250.0,
                            "basicFeeUnitQuantity": 1,
                            "additionalFeeUnitAmount": 250.0,
                            "additionalFeeUnitQuantity": 1,
                            "taxInclusionFeeIndicator": false,
                            "globalTaxExclusionIndicator": true,
                            "feePayableTotalAmount": 0.0,
                            "feePayableTotalGrossAmount": 0.0,
                            "feePayableTotalDiscountAmount": 0.0,
                            "feePayableTotalTaxAmount": 0.0,
                            "ipRightCategoryCode": "P",
                            "ipRightCategory": "PATENTS",
                            "fileType": "E",
                            "fileTypeName": "Patents Test",
                            "applicationCategoryCode": "PT3",
                            "applicationCategory": "Patents",
                            "documentOriginCode": "TB",
                            "documentOriginName": "Test Back File",
                            "taxBag": [
                                {
                                    "taxId": "Tax4",
                                    "taxDescription": "GST",
                                    "taxAmount": 0.0,
                                    "taxMinimumAmount": 0.0,
                                    "taxPercentage": 5
                                },
                                {
                                    "taxId": "Tax2",
                                    "taxDescription": "Gift Tax",
                                    "taxAmount": 20.0,
                                    "taxMinimumAmount": 0.0,
                                    "taxPercentage": 0
                                }
                            ],
                            "discountBag": [
                                {
                                    "discountScheme": {
                                        "discountCategory": "DID02",
                                        "discountDescription": "Individual",
                                        "documentCode": "NID"
                                    },
                                    "discountAmount": 0.0,
                                    "discountPercentage": "5"
                                },
                                {
                                    "discountScheme": {
                                        "discountCategory": "DID01",
                                        "discountDescription": "SME",
                                        "documentCode": "SME"
                                    },
                                    "discountAmount": 0.0,
                                    "discountPercentage": "10"
                                }
                            ]
                        },
                        {
                            "feeId": "010",
                            "feeCategory": "registration fee",
                            "feeTypeCode": "CLM",
                            "feeDescription": "Patent-Regular",
                            "basicFeeUnitAmount": 100.0,
                            "basicFeeUnitQuantity": 10,
                            "additionalFeeUnitAmount": 50.0,
                            "additionalFeeUnitQuantity": 5,
                            "taxInclusionFeeIndicator": false,
                            "globalTaxExclusionIndicator": true,
                            "feePayableTotalAmount": 0.0,
                            "feePayableTotalGrossAmount": 0.0,
                            "feePayableTotalDiscountAmount": 0.0,
                            "feePayableTotalTaxAmount": 0.0,
                            "ipRightCategoryCode": "P",
                            "ipRightCategory": "PATENTS",
                            "fileType": "N",
                            "fileTypeName": "Patents VC",
                            "applicationCategoryCode": "PT1",
                            "applicationCategory": "Patents",
                            "documentOriginCode": "TB",
                            "documentOriginName": "Test Back File"
                        },
                        {
                            "feeId": "057",
                            "feeCategory": "registration fee",
                            "feeTypeCode": "ANU",
                            "feeDescription": "Patent-Annuity (1-3)",
                            "basicFeeUnitAmount": 100.0,
                            "basicFeeUnitQuantity": 1,
                            "additionalFeeUnitAmount": 100.0,
                            "additionalFeeUnitQuantity": 1,
                            "taxInclusionFeeIndicator": false,
                            "globalTaxExclusionIndicator": false,
                            "feePayableTotalAmount": 0.0,
                            "feePayableTotalGrossAmount": 0.0,
                            "feePayableTotalDiscountAmount": 0.0,
                            "feePayableTotalTaxAmount": 0.0,
                            "ipRightCategoryCode": "P",
                            "ipRightCategory": "PATENTS",
                            "fileType": "N",
                            "fileTypeName": "Patents VC",
                            "applicationCategoryCode": "PT1",
                            "applicationCategory": "Patents",
                            "documentOriginCode": "TB",
                            "documentOriginName": "Test Back File",
                            "taxBag": [
                                {
                                    "taxId": "Tax2",
                                    "taxDescription": "Gift Tax",
                                    "taxAmount": 20.0,
                                    "taxMinimumAmount": 0.0,
                                    "taxPercentage": 0
                                },
                                {
                                    "taxId": "Tax4",
                                    "taxDescription": "GST",
                                    "taxAmount": 0.0,
                                    "taxMinimumAmount": 0.0,
                                    "taxPercentage": 5
                                }
                            ],
                            "discountBag": [
                                {
                                    "discountScheme": {
                                        "discountCategory": "DID01",
                                        "discountDescription": "SME",
                                        "documentCode": "SME"
                                    },
                                    "discountAmount": 0.0,
                                    "discountPercentage": "5"
                                },
                                {
                                    "discountScheme": {
                                        "discountCategory": "DID02",
                                        "discountDescription": "Individual",
                                        "documentCode": "NID"
                                    },
                                    "discountAmount": 5.0,
                                    "discountPercentage": null
                                }
                            ]
                        },
                        {
                            "feeId": "058",
                            "feeCategory": "registration fee",
                            "feeTypeCode": "ANU",
                            "feeDescription": "Patent Annuity (4-6)",
                            "basicFeeUnitAmount": 150.0,
                            "basicFeeUnitQuantity": 1,
                            "additionalFeeUnitAmount": 150.0,
                            "additionalFeeUnitQuantity": 1,
                            "taxInclusionFeeIndicator": false,
                            "globalTaxExclusionIndicator": true,
                            "feePayableTotalAmount": 0.0,
                            "feePayableTotalGrossAmount": 0.0,
                            "feePayableTotalDiscountAmount": 0.0,
                            "feePayableTotalTaxAmount": 0.0,
                            "ipRightCategoryCode": "P",
                            "ipRightCategory": "PATENTS",
                            "fileType": "N",
                            "fileTypeName": "Patents VC",
                            "applicationCategoryCode": "PT1",
                            "applicationCategory": "Patents",
                            "documentOriginCode": "TB",
                            "documentOriginName": "Test Back File",
                            "taxBag": [
                                {
                                    "taxId": "Tax4",
                                    "taxDescription": "GST",
                                    "taxAmount": 0.0,
                                    "taxMinimumAmount": 0.0,
                                    "taxPercentage": 5
                                },
                                {
                                    "taxId": "Tax2",
                                    "taxDescription": "Gift Tax",
                                    "taxAmount": 20.0,
                                    "taxMinimumAmount": 0.0,
                                    "taxPercentage": 0
                                }
                            ],
                            "discountBag": [
                                {
                                    "discountScheme": {
                                        "discountCategory": "DID01",
                                        "discountDescription": "SME",
                                        "documentCode": "SME"
                                    },
                                    "discountAmount": 10.0,
                                    "discountPercentage": null
                                },
                                {
                                    "discountScheme": {
                                        "discountCategory": "DID02",
                                        "discountDescription": "Individual",
                                        "documentCode": "NID"
                                    },
                                    "discountAmount": 0.0,
                                    "discountPercentage": "10"
                                }
                            ]
                        },
                        {
                            "feeId": "059",
                            "feeCategory": "registration fee",
                            "feeTypeCode": "ANU",
                            "feeDescription": "Patent Annuity (10-12)",
                            "basicFeeUnitAmount": 200.0,
                            "basicFeeUnitQuantity": 1,
                            "additionalFeeUnitAmount": 200.0,
                            "additionalFeeUnitQuantity": 1,
                            "taxInclusionFeeIndicator": false,
                            "globalTaxExclusionIndicator": false,
                            "feePayableTotalAmount": 0.0,
                            "feePayableTotalGrossAmount": 0.0,
                            "feePayableTotalDiscountAmount": 0.0,
                            "feePayableTotalTaxAmount": 0.0,
                            "ipRightCategoryCode": "P",
                            "ipRightCategory": "PATENTS",
                            "fileType": "N",
                            "fileTypeName": "Patents VC",
                            "applicationCategoryCode": "PT1",
                            "applicationCategory": "Patents",
                            "documentOriginCode": "TB",
                            "documentOriginName": "Test Back File",
                            "taxBag": [
                                {
                                    "taxId": "Tax2",
                                    "taxDescription": "Gift Tax",
                                    "taxAmount": 20.0,
                                    "taxMinimumAmount": 0.0,
                                    "taxPercentage": 0
                                }
                            ]
                        },
                        {
                            "feeId": "060",
                            "feeCategory": "registration fee",
                            "feeTypeCode": "ANU",
                            "feeDescription": "Patent Annuity (7-9)",
                            "basicFeeUnitAmount": 250.0,
                            "basicFeeUnitQuantity": 1,
                            "additionalFeeUnitAmount": 250.0,
                            "additionalFeeUnitQuantity": 1,
                            "taxInclusionFeeIndicator": false,
                            "globalTaxExclusionIndicator": true,
                            "feePayableTotalAmount": 0.0,
                            "feePayableTotalGrossAmount": 0.0,
                            "feePayableTotalDiscountAmount": 0.0,
                            "feePayableTotalTaxAmount": 0.0,
                            "ipRightCategoryCode": "P",
                            "ipRightCategory": "PATENTS",
                            "fileType": "N",
                            "fileTypeName": "Patents VC",
                            "applicationCategoryCode": "PT1",
                            "applicationCategory": "Patents",
                            "documentOriginCode": "TB",
                            "documentOriginName": "Test Back File",
                            "taxBag": [
                                {
                                    "taxId": "Tax4",
                                    "taxDescription": "GST",
                                    "taxAmount": 0.0,
                                    "taxMinimumAmount": 0.0,
                                    "taxPercentage": 5
                                },
                                {
                                    "taxId": "Tax2",
                                    "taxDescription": "Gift Tax",
                                    "taxAmount": 20.0,
                                    "taxMinimumAmount": 0.0,
                                    "taxPercentage": 0
                                }
                            ],
                            "discountBag": [
                                {
                                    "discountScheme": {
                                        "discountCategory": "DID02",
                                        "discountDescription": "Individual",
                                        "documentCode": "NID"
                                    },
                                    "discountAmount": 0.0,
                                    "discountPercentage": "5"
                                },
                                {
                                    "discountScheme": {
                                        "discountCategory": "DID01",
                                        "discountDescription": "SME",
                                        "documentCode": "SME"
                                    },
                                    "discountAmount": 0.0,
                                    "discountPercentage": "10"
                                }
                            ]
                        },
                        {
                            "feeId": "057",
                            "feeCategory": "maintenance fee",
                            "feeTypeCode": "ANU",
                            "feeDescription": "Patent-Annuity (1-3)",
                            "basicFeeUnitAmount": 100.0,
                            "basicFeeUnitQuantity": 1,
                            "additionalFeeUnitAmount": 100.0,
                            "additionalFeeUnitQuantity": 1,
                            "taxInclusionFeeIndicator": false,
                            "globalTaxExclusionIndicator": false,
                            "feePayableTotalAmount": 0.0,
                            "feePayableTotalGrossAmount": 0.0,
                            "feePayableTotalDiscountAmount": 0.0,
                            "feePayableTotalTaxAmount": 0.0,
                            "userDocumentCode": "UDANU",
                            "userDocumentCodeName": "Annuity payment",
                            "userDocumentType": "PTA",
                            "userDocumentTypeName": "Payment of Patent Annuity",
                            "documentOriginCode": "V2",
                            "documentOriginName": "St. Vincent & Grenadines (Tax)",
                            "taxBag": [
                                {
                                    "taxId": "Tax2",
                                    "taxDescription": "Gift Tax",
                                    "taxAmount": 20.0,
                                    "taxMinimumAmount": 0.0,
                                    "taxPercentage": 0
                                },
                                {
                                    "taxId": "Tax4",
                                    "taxDescription": "GST",
                                    "taxAmount": 0.0,
                                    "taxMinimumAmount": 0.0,
                                    "taxPercentage": 5
                                }
                            ],
                            "discountBag": [
                                {
                                    "discountScheme": {
                                        "discountCategory": "DID01",
                                        "discountDescription": "SME",
                                        "documentCode": "SME"
                                    },
                                    "discountAmount": 0.0,
                                    "discountPercentage": "5"
                                },
                                {
                                    "discountScheme": {
                                        "discountCategory": "DID02",
                                        "discountDescription": "Individual",
                                        "documentCode": "NID"
                                    },
                                    "discountAmount": 5.0,
                                    "discountPercentage": null
                                }
                            ]
                        },
                        {
                            "feeId": "058",
                            "feeCategory": "maintenance fee",
                            "feeTypeCode": "ANU",
                            "feeDescription": "Patent Annuity (4-6)",
                            "basicFeeUnitAmount": 150.0,
                            "basicFeeUnitQuantity": 1,
                            "additionalFeeUnitAmount": 150.0,
                            "additionalFeeUnitQuantity": 1,
                            "taxInclusionFeeIndicator": false,
                            "globalTaxExclusionIndicator": true,
                            "feePayableTotalAmount": 0.0,
                            "feePayableTotalGrossAmount": 0.0,
                            "feePayableTotalDiscountAmount": 0.0,
                            "feePayableTotalTaxAmount": 0.0,
                            "userDocumentCode": "UDANU",
                            "userDocumentCodeName": "Annuity payment",
                            "userDocumentType": "PTA",
                            "userDocumentTypeName": "Payment of Patent Annuity",
                            "documentOriginCode": "V2",
                            "documentOriginName": "St. Vincent & Grenadines (Tax)",
                            "taxBag": [
                                {
                                    "taxId": "Tax4",
                                    "taxDescription": "GST",
                                    "taxAmount": 0.0,
                                    "taxMinimumAmount": 0.0,
                                    "taxPercentage": 5
                                },
                                {
                                    "taxId": "Tax2",
                                    "taxDescription": "Gift Tax",
                                    "taxAmount": 20.0,
                                    "taxMinimumAmount": 0.0,
                                    "taxPercentage": 0
                                }
                            ],
                            "discountBag": [
                                {
                                    "discountScheme": {
                                        "discountCategory": "DID01",
                                        "discountDescription": "SME",
                                        "documentCode": "SME"
                                    },
                                    "discountAmount": 10.0,
                                    "discountPercentage": null
                                },
                                {
                                    "discountScheme": {
                                        "discountCategory": "DID02",
                                        "discountDescription": "Individual",
                                        "documentCode": "NID"
                                    },
                                    "discountAmount": 0.0,
                                    "discountPercentage": "10"
                                }
                            ]
                        },
                        {
                            "feeId": "059",
                            "feeCategory": "maintenance fee",
                            "feeTypeCode": "ANU",
                            "feeDescription": "Patent Annuity (10-12)",
                            "basicFeeUnitAmount": 200.0,
                            "basicFeeUnitQuantity": 1,
                            "additionalFeeUnitAmount": 200.0,
                            "additionalFeeUnitQuantity": 1,
                            "taxInclusionFeeIndicator": false,
                            "globalTaxExclusionIndicator": false,
                            "feePayableTotalAmount": 0.0,
                            "feePayableTotalGrossAmount": 0.0,
                            "feePayableTotalDiscountAmount": 0.0,
                            "feePayableTotalTaxAmount": 0.0,
                            "userDocumentCode": "UDANU",
                            "userDocumentCodeName": "Annuity payment",
                            "userDocumentType": "PTA",
                            "userDocumentTypeName": "Payment of Patent Annuity",
                            "documentOriginCode": "V2",
                            "documentOriginName": "St. Vincent & Grenadines (Tax)",
                            "taxBag": [
                                {
                                    "taxId": "Tax2",
                                    "taxDescription": "Gift Tax",
                                    "taxAmount": 20.0,
                                    "taxMinimumAmount": 0.0,
                                    "taxPercentage": 0
                                }
                            ]
                        },
                        {
                            "feeId": "060",
                            "feeCategory": "maintenance fee",
                            "feeTypeCode": "ANU",
                            "feeDescription": "Patent Annuity (7-9)",
                            "basicFeeUnitAmount": 250.0,
                            "basicFeeUnitQuantity": 1,
                            "additionalFeeUnitAmount": 250.0,
                            "additionalFeeUnitQuantity": 1,
                            "taxInclusionFeeIndicator": false,
                            "globalTaxExclusionIndicator": true,
                            "feePayableTotalAmount": 0.0,
                            "feePayableTotalGrossAmount": 0.0,
                            "feePayableTotalDiscountAmount": 0.0,
                            "feePayableTotalTaxAmount": 0.0,
                            "userDocumentCode": "UDANU",
                            "userDocumentCodeName": "Annuity payment",
                            "userDocumentType": "PTA",
                            "userDocumentTypeName": "Payment of Patent Annuity",
                            "documentOriginCode": "V2",
                            "documentOriginName": "St. Vincent & Grenadines (Tax)",
                            "taxBag": [
                                {
                                    "taxId": "Tax4",
                                    "taxDescription": "GST",
                                    "taxAmount": 0.0,
                                    "taxMinimumAmount": 0.0,
                                    "taxPercentage": 5
                                },
                                {
                                    "taxId": "Tax2",
                                    "taxDescription": "Gift Tax",
                                    "taxAmount": 20.0,
                                    "taxMinimumAmount": 0.0,
                                    "taxPercentage": 0
                                }
                            ],
                            "discountBag": [
                                {
                                    "discountScheme": {
                                        "discountCategory": "DID02",
                                        "discountDescription": "Individual",
                                        "documentCode": "NID"
                                    },
                                    "discountAmount": 0.0,
                                    "discountPercentage": "5"
                                },
                                {
                                    "discountScheme": {
                                        "discountCategory": "DID01",
                                        "discountDescription": "SME",
                                        "documentCode": "SME"
                                    },
                                    "discountAmount": 0.0,
                                    "discountPercentage": "10"
                                }
                            ]
                        },
                        {
                            "feeId": "061",
                            "feeCategory": "maintenance fee",
                            "feeTypeCode": "PNT",
                            "feeDescription": "Penalty-Annuity 1-5",
                            "basicFeeUnitAmount": 5.0,
                            "basicFeeUnitQuantity": 1,
                            "additionalFeeUnitAmount": 5.0,
                            "additionalFeeUnitQuantity": 1,
                            "taxInclusionFeeIndicator": false,
                            "globalTaxExclusionIndicator": false,
                            "feePayableTotalAmount": 0.0,
                            "feePayableTotalGrossAmount": 0.0,
                            "feePayableTotalDiscountAmount": 0.0,
                            "feePayableTotalTaxAmount": 0.0,
                            "userDocumentCode": "UDANU",
                            "userDocumentCodeName": "Annuity payment",
                            "userDocumentType": "PTA",
                            "userDocumentTypeName": "Payment of Patent Annuity",
                            "documentOriginCode": "V2",
                            "documentOriginName": "St. Vincent & Grenadines (Tax)"
                        },
                        {
                            "feeId": "062",
                            "feeCategory": "maintenance fee",
                            "feeTypeCode": "PNT",
                            "feeDescription": "Penalty-Annuity 6-10",
                            "basicFeeUnitAmount": 10.0,
                            "basicFeeUnitQuantity": 1,
                            "additionalFeeUnitAmount": 10.0,
                            "additionalFeeUnitQuantity": 1,
                            "taxInclusionFeeIndicator": false,
                            "globalTaxExclusionIndicator": false,
                            "feePayableTotalAmount": 0.0,
                            "feePayableTotalGrossAmount": 0.0,
                            "feePayableTotalDiscountAmount": 0.0,
                            "feePayableTotalTaxAmount": 0.0,
                            "userDocumentCode": "UDANU",
                            "userDocumentCodeName": "Annuity payment",
                            "userDocumentType": "PTA",
                            "userDocumentTypeName": "Payment of Patent Annuity",
                            "documentOriginCode": "V2",
                            "documentOriginName": "St. Vincent & Grenadines (Tax)"
                        },
                        {
                            "feeId": "063",
                            "feeCategory": "maintenance fee",
                            "feeTypeCode": "PNT",
                            "feeDescription": "Penalty-Annuity 11-20",
                            "basicFeeUnitAmount": 20.0,
                            "basicFeeUnitQuantity": 1,
                            "additionalFeeUnitAmount": 20.0,
                            "additionalFeeUnitQuantity": 1,
                            "taxInclusionFeeIndicator": false,
                            "globalTaxExclusionIndicator": false,
                            "feePayableTotalAmount": 0.0,
                            "feePayableTotalGrossAmount": 0.0,
                            "feePayableTotalDiscountAmount": 0.0,
                            "feePayableTotalTaxAmount": 0.0,
                            "userDocumentCode": "UDANU",
                            "userDocumentCodeName": "Annuity payment",
                            "userDocumentType": "PTA",
                            "userDocumentTypeName": "Payment of Patent Annuity",
                            "documentOriginCode": "V2",
                            "documentOriginName": "St. Vincent & Grenadines (Tax)"
                        },
                        {
                            "feeId": "019",
                            "feeCategory": "maintenance fee",
                            "feeTypeCode": "REG",
                            "feeDescription": "UD-Regular Fee (POA | ABT | ROL)",
                            "basicFeeUnitAmount": 500.0,
                            "basicFeeUnitQuantity": 2,
                            "additionalFeeUnitAmount": 100.0,
                            "additionalFeeUnitQuantity": 1,
                            "taxInclusionFeeIndicator": false,
                            "globalTaxExclusionIndicator": false,
                            "feePayableTotalAmount": 0.0,
                            "feePayableTotalGrossAmount": 0.0,
                            "feePayableTotalDiscountAmount": 0.0,
                            "feePayableTotalTaxAmount": 0.0,
                            "userDocumentCode": "UDABT",
                            "userDocumentCodeName": "Amendment of abstract and/or title",
                            "userDocumentType": "ABT",
                            "userDocumentTypeName": "Amednment of Abstract and/or Title",
                            "documentOriginCode": "VC",
                            "documentOriginName": "St. Vincent & Grenadines",
                            "taxBag": [
                                {
                                    "taxId": "Tax4",
                                    "taxDescription": "GST",
                                    "taxAmount": 0.0,
                                    "taxMinimumAmount": 0.0,
                                    "taxPercentage": 5
                                },
                                {
                                    "taxId": "Tax2",
                                    "taxDescription": "Gift Tax",
                                    "taxAmount": 20.0,
                                    "taxMinimumAmount": 0.0,
                                    "taxPercentage": 0
                                },
                                {
                                    "taxId": "VAT",
                                    "taxDescription": "Global VAT",
                                    "taxAmount": 0.0,
                                    "taxMinimumAmount": 0.0,
                                    "taxPercentage": 10
                                }
                            ],
                            "discountBag": [
                                {
                                    "discountScheme": {
                                        "discountCategory": "DID01",
                                        "discountDescription": "SME",
                                        "documentCode": "SME"
                                    },
                                    "discountAmount": 0.0,
                                    "discountPercentage": "5"
                                },
                                {
                                    "discountScheme": {
                                        "discountCategory": "DID02",
                                        "discountDescription": "Individual",
                                        "documentCode": "NID"
                                    },
                                    "discountAmount": 0.0,
                                    "discountPercentage": "5"
                                }
                            ]
                        },
                        {
                            "feeId": "057",
                            "feeCategory": "maintenance fee",
                            "feeTypeCode": "ANU",
                            "feeDescription": "Patent-Annuity (1-3)",
                            "basicFeeUnitAmount": 100.0,
                            "basicFeeUnitQuantity": 1,
                            "additionalFeeUnitAmount": 100.0,
                            "additionalFeeUnitQuantity": 1,
                            "taxInclusionFeeIndicator": false,
                            "globalTaxExclusionIndicator": false,
                            "feePayableTotalAmount": 0.0,
                            "feePayableTotalGrossAmount": 0.0,
                            "feePayableTotalDiscountAmount": 0.0,
                            "feePayableTotalTaxAmount": 0.0,
                            "userDocumentCode": "UDANU",
                            "userDocumentCodeName": "Annuity payment",
                            "userDocumentType": "PTA",
                            "userDocumentTypeName": "Payment of Patent Annuity",
                            "documentOriginCode": "VC",
                            "documentOriginName": "St. Vincent & Grenadines",
                            "taxBag": [
                                {
                                    "taxId": "Tax2",
                                    "taxDescription": "Gift Tax",
                                    "taxAmount": 20.0,
                                    "taxMinimumAmount": 0.0,
                                    "taxPercentage": 0
                                },
                                {
                                    "taxId": "Tax4",
                                    "taxDescription": "GST",
                                    "taxAmount": 0.0,
                                    "taxMinimumAmount": 0.0,
                                    "taxPercentage": 5
                                }
                            ],
                            "discountBag": [
                                {
                                    "discountScheme": {
                                        "discountCategory": "DID01",
                                        "discountDescription": "SME",
                                        "documentCode": "SME"
                                    },
                                    "discountAmount": 0.0,
                                    "discountPercentage": "5"
                                },
                                {
                                    "discountScheme": {
                                        "discountCategory": "DID02",
                                        "discountDescription": "Individual",
                                        "documentCode": "NID"
                                    },
                                    "discountAmount": 5.0,
                                    "discountPercentage": null
                                }
                            ]
                        },
                        {
                            "feeId": "058",
                            "feeCategory": "maintenance fee",
                            "feeTypeCode": "ANU",
                            "feeDescription": "Patent Annuity (4-6)",
                            "basicFeeUnitAmount": 150.0,
                            "basicFeeUnitQuantity": 1,
                            "additionalFeeUnitAmount": 150.0,
                            "additionalFeeUnitQuantity": 1,
                            "taxInclusionFeeIndicator": false,
                            "globalTaxExclusionIndicator": true,
                            "feePayableTotalAmount": 0.0,
                            "feePayableTotalGrossAmount": 0.0,
                            "feePayableTotalDiscountAmount": 0.0,
                            "feePayableTotalTaxAmount": 0.0,
                            "userDocumentCode": "UDANU",
                            "userDocumentCodeName": "Annuity payment",
                            "userDocumentType": "PTA",
                            "userDocumentTypeName": "Payment of Patent Annuity",
                            "documentOriginCode": "VC",
                            "documentOriginName": "St. Vincent & Grenadines",
                            "taxBag": [
                                {
                                    "taxId": "Tax4",
                                    "taxDescription": "GST",
                                    "taxAmount": 0.0,
                                    "taxMinimumAmount": 0.0,
                                    "taxPercentage": 5
                                },
                                {
                                    "taxId": "Tax2",
                                    "taxDescription": "Gift Tax",
                                    "taxAmount": 20.0,
                                    "taxMinimumAmount": 0.0,
                                    "taxPercentage": 0
                                }
                            ],
                            "discountBag": [
                                {
                                    "discountScheme": {
                                        "discountCategory": "DID01",
                                        "discountDescription": "SME",
                                        "documentCode": "SME"
                                    },
                                    "discountAmount": 10.0,
                                    "discountPercentage": null
                                },
                                {
                                    "discountScheme": {
                                        "discountCategory": "DID02",
                                        "discountDescription": "Individual",
                                        "documentCode": "NID"
                                    },
                                    "discountAmount": 0.0,
                                    "discountPercentage": "10"
                                }
                            ]
                        },
                        {
                            "feeId": "059",
                            "feeCategory": "maintenance fee",
                            "feeTypeCode": "ANU",
                            "feeDescription": "Patent Annuity (10-12)",
                            "basicFeeUnitAmount": 200.0,
                            "basicFeeUnitQuantity": 1,
                            "additionalFeeUnitAmount": 200.0,
                            "additionalFeeUnitQuantity": 1,
                            "taxInclusionFeeIndicator": false,
                            "globalTaxExclusionIndicator": false,
                            "feePayableTotalAmount": 0.0,
                            "feePayableTotalGrossAmount": 0.0,
                            "feePayableTotalDiscountAmount": 0.0,
                            "feePayableTotalTaxAmount": 0.0,
                            "userDocumentCode": "UDANU",
                            "userDocumentCodeName": "Annuity payment",
                            "userDocumentType": "PTA",
                            "userDocumentTypeName": "Payment of Patent Annuity",
                            "documentOriginCode": "VC",
                            "documentOriginName": "St. Vincent & Grenadines",
                            "taxBag": [
                                {
                                    "taxId": "Tax2",
                                    "taxDescription": "Gift Tax",
                                    "taxAmount": 20.0,
                                    "taxMinimumAmount": 0.0,
                                    "taxPercentage": 0
                                }
                            ]
                        },
                        {
                            "feeId": "060",
                            "feeCategory": "maintenance fee",
                            "feeTypeCode": "ANU",
                            "feeDescription": "Patent Annuity (7-9)",
                            "basicFeeUnitAmount": 250.0,
                            "basicFeeUnitQuantity": 1,
                            "additionalFeeUnitAmount": 250.0,
                            "additionalFeeUnitQuantity": 1,
                            "taxInclusionFeeIndicator": false,
                            "globalTaxExclusionIndicator": true,
                            "feePayableTotalAmount": 0.0,
                            "feePayableTotalGrossAmount": 0.0,
                            "feePayableTotalDiscountAmount": 0.0,
                            "feePayableTotalTaxAmount": 0.0,
                            "userDocumentCode": "UDANU",
                            "userDocumentCodeName": "Annuity payment",
                            "userDocumentType": "PTA",
                            "userDocumentTypeName": "Payment of Patent Annuity",
                            "documentOriginCode": "VC",
                            "documentOriginName": "St. Vincent & Grenadines",
                            "taxBag": [
                                {
                                    "taxId": "Tax4",
                                    "taxDescription": "GST",
                                    "taxAmount": 0.0,
                                    "taxMinimumAmount": 0.0,
                                    "taxPercentage": 5
                                },
                                {
                                    "taxId": "Tax2",
                                    "taxDescription": "Gift Tax",
                                    "taxAmount": 20.0,
                                    "taxMinimumAmount": 0.0,
                                    "taxPercentage": 0
                                }
                            ],
                            "discountBag": [
                                {
                                    "discountScheme": {
                                        "discountCategory": "DID02",
                                        "discountDescription": "Individual",
                                        "documentCode": "NID"
                                    },
                                    "discountAmount": 0.0,
                                    "discountPercentage": "5"
                                },
                                {
                                    "discountScheme": {
                                        "discountCategory": "DID01",
                                        "discountDescription": "SME",
                                        "documentCode": "SME"
                                    },
                                    "discountAmount": 0.0,
                                    "discountPercentage": "10"
                                }
                            ]
                        },
                        {
                            "feeId": "061",
                            "feeCategory": "maintenance fee",
                            "feeTypeCode": "PNT",
                            "feeDescription": "Penalty-Annuity 1-5",
                            "basicFeeUnitAmount": 5.0,
                            "basicFeeUnitQuantity": 1,
                            "additionalFeeUnitAmount": 5.0,
                            "additionalFeeUnitQuantity": 1,
                            "taxInclusionFeeIndicator": false,
                            "globalTaxExclusionIndicator": false,
                            "feePayableTotalAmount": 0.0,
                            "feePayableTotalGrossAmount": 0.0,
                            "feePayableTotalDiscountAmount": 0.0,
                            "feePayableTotalTaxAmount": 0.0,
                            "userDocumentCode": "UDANU",
                            "userDocumentCodeName": "Annuity payment",
                            "userDocumentType": "PTA",
                            "userDocumentTypeName": "Payment of Patent Annuity",
                            "documentOriginCode": "VC",
                            "documentOriginName": "St. Vincent & Grenadines"
                        },
                        {
                            "feeId": "062",
                            "feeCategory": "maintenance fee",
                            "feeTypeCode": "PNT",
                            "feeDescription": "Penalty-Annuity 6-10",
                            "basicFeeUnitAmount": 10.0,
                            "basicFeeUnitQuantity": 1,
                            "additionalFeeUnitAmount": 10.0,
                            "additionalFeeUnitQuantity": 1,
                            "taxInclusionFeeIndicator": false,
                            "globalTaxExclusionIndicator": false,
                            "feePayableTotalAmount": 0.0,
                            "feePayableTotalGrossAmount": 0.0,
                            "feePayableTotalDiscountAmount": 0.0,
                            "feePayableTotalTaxAmount": 0.0,
                            "userDocumentCode": "UDANU",
                            "userDocumentCodeName": "Annuity payment",
                            "userDocumentType": "PTA",
                            "userDocumentTypeName": "Payment of Patent Annuity",
                            "documentOriginCode": "VC",
                            "documentOriginName": "St. Vincent & Grenadines"
                        },
                        {
                            "feeId": "063",
                            "feeCategory": "maintenance fee",
                            "feeTypeCode": "PNT",
                            "feeDescription": "Penalty-Annuity 11-20",
                            "basicFeeUnitAmount": 20.0,
                            "basicFeeUnitQuantity": 1,
                            "additionalFeeUnitAmount": 20.0,
                            "additionalFeeUnitQuantity": 1,
                            "taxInclusionFeeIndicator": false,
                            "globalTaxExclusionIndicator": false,
                            "feePayableTotalAmount": 0.0,
                            "feePayableTotalGrossAmount": 0.0,
                            "feePayableTotalDiscountAmount": 0.0,
                            "feePayableTotalTaxAmount": 0.0,
                            "userDocumentCode": "UDANU",
                            "userDocumentCodeName": "Annuity payment",
                            "userDocumentType": "PTA",
                            "userDocumentTypeName": "Payment of Patent Annuity",
                            "documentOriginCode": "VC",
                            "documentOriginName": "St. Vincent & Grenadines"
                        },
                        {
                            "feeId": "015",
                            "feeCategory": "maintenance fee",
                            "feeTypeCode": "CLM",
                            "feeDescription": "UD-Request for claims(CLM)",
                            "basicFeeUnitAmount": 100.0,
                            "basicFeeUnitQuantity": 1,
                            "additionalFeeUnitAmount": 50.0,
                            "additionalFeeUnitQuantity": 1,
                            "taxInclusionFeeIndicator": false,
                            "globalTaxExclusionIndicator": false,
                            "feePayableTotalAmount": 0.0,
                            "feePayableTotalGrossAmount": 0.0,
                            "feePayableTotalDiscountAmount": 0.0,
                            "feePayableTotalTaxAmount": 0.0,
                            "userDocumentCode": "UDCLM",
                            "userDocumentCodeName": "Amendment of patent or design claims",
                            "userDocumentType": "RCLM",
                            "userDocumentTypeName": "Request for Claim",
                            "documentOriginCode": "VC",
                            "documentOriginName": "St. Vincent & Grenadines",
                            "taxBag": [
                                {
                                    "taxId": "Tax4",
                                    "taxDescription": "GST",
                                    "taxAmount": 0.0,
                                    "taxMinimumAmount": 0.0,
                                    "taxPercentage": 5
                                },
                                {
                                    "taxId": "Tax2",
                                    "taxDescription": "Gift Tax",
                                    "taxAmount": 20.0,
                                    "taxMinimumAmount": 0.0,
                                    "taxPercentage": 0
                                }
                            ],
                            "discountBag": [
                                {
                                    "discountScheme": {
                                        "discountCategory": "DID02",
                                        "discountDescription": "Individual",
                                        "documentCode": "NID"
                                    },
                                    "discountAmount": 0.0,
                                    "discountPercentage": "5"
                                },
                                {
                                    "discountScheme": {
                                        "discountCategory": "DID01",
                                        "discountDescription": "SME",
                                        "documentCode": "SME"
                                    },
                                    "discountAmount": 0.0,
                                    "discountPercentage": "5"
                                }
                            ]
                        },
                        {
                            "feeId": "054",
                            "feeCategory": "maintenance fee",
                            "feeTypeCode": "NFL",
                            "feeDescription": "UD-Number of affected file (COR & PU2)",
                            "basicFeeUnitAmount": 200.0,
                            "basicFeeUnitQuantity": 2,
                            "additionalFeeUnitAmount": 125.0,
                            "additionalFeeUnitQuantity": 1,
                            "taxInclusionFeeIndicator": false,
                            "globalTaxExclusionIndicator": false,
                            "feePayableTotalAmount": 0.0,
                            "feePayableTotalGrossAmount": 0.0,
                            "feePayableTotalDiscountAmount": 0.0,
                            "feePayableTotalTaxAmount": 0.0,
                            "userDocumentCode": "UDCOR",
                            "userDocumentCodeName": "Change of owner and representative",
                            "userDocumentType": "COR",
                            "userDocumentTypeName": "Request for Merger/Assignment Single",
                            "documentOriginCode": "VC",
                            "documentOriginName": "St. Vincent & Grenadines",
                            "taxBag": [
                                {
                                    "taxId": "Tax2",
                                    "taxDescription": "Gift Tax",
                                    "taxAmount": 20.0,
                                    "taxMinimumAmount": 0.0,
                                    "taxPercentage": 0
                                }
                            ],
                            "discountBag": [
                                {
                                    "discountScheme": {
                                        "discountCategory": "DID02",
                                        "discountDescription": "Individual",
                                        "documentCode": "NID"
                                    },
                                    "discountAmount": 0.0,
                                    "discountPercentage": "5"
                                },
                                {
                                    "discountScheme": {
                                        "discountCategory": "DID01",
                                        "discountDescription": "SME",
                                        "documentCode": "SME"
                                    },
                                    "discountAmount": 0.0,
                                    "discountPercentage": "5"
                                }
                            ]
                        },
                        {
                            "feeId": "014",
                            "feeCategory": "maintenance fee",
                            "feeTypeCode": "NFL",
                            "feeDescription": "UD-Number of affected file(COW,GEN)",
                            "basicFeeUnitAmount": 500.0,
                            "basicFeeUnitQuantity": 2,
                            "additionalFeeUnitAmount": 100.0,
                            "additionalFeeUnitQuantity": 1,
                            "taxInclusionFeeIndicator": false,
                            "globalTaxExclusionIndicator": false,
                            "feePayableTotalAmount": 0.0,
                            "feePayableTotalGrossAmount": 0.0,
                            "feePayableTotalDiscountAmount": 0.0,
                            "feePayableTotalTaxAmount": 0.0,
                            "userDocumentCode": "UDCOW",
                            "userDocumentCodeName": "Change of Owner",
                            "userDocumentType": "CNA",
                            "userDocumentTypeName": "Change of Name and/or Address",
                            "documentOriginCode": "VC",
                            "documentOriginName": "St. Vincent & Grenadines",
                            "discountBag": [
                                {
                                    "discountScheme": {
                                        "discountCategory": "DID01",
                                        "discountDescription": "SME",
                                        "documentCode": "SME"
                                    },
                                    "discountAmount": 0.0,
                                    "discountPercentage": "5"
                                },
                                {
                                    "discountScheme": {
                                        "discountCategory": "DID02",
                                        "discountDescription": "Individual",
                                        "documentCode": "NID"
                                    },
                                    "discountAmount": 0.0,
                                    "discountPercentage": "5"
                                }
                            ]
                        },
                        {
                            "feeId": "014",
                            "feeCategory": "maintenance fee",
                            "feeTypeCode": "NFL",
                            "feeDescription": "UD-Number of affected file(COW,GEN)",
                            "basicFeeUnitAmount": 500.0,
                            "basicFeeUnitQuantity": 2,
                            "additionalFeeUnitAmount": 100.0,
                            "additionalFeeUnitQuantity": 1,
                            "taxInclusionFeeIndicator": false,
                            "globalTaxExclusionIndicator": false,
                            "feePayableTotalAmount": 0.0,
                            "feePayableTotalGrossAmount": 0.0,
                            "feePayableTotalDiscountAmount": 0.0,
                            "feePayableTotalTaxAmount": 0.0,
                            "userDocumentCode": "UDCOW",
                            "userDocumentCodeName": "Change of Owner",
                            "userDocumentType": "CON",
                            "userDocumentTypeName": "Change of Name",
                            "documentOriginCode": "VC",
                            "documentOriginName": "St. Vincent & Grenadines",
                            "discountBag": [
                                {
                                    "discountScheme": {
                                        "discountCategory": "DID01",
                                        "discountDescription": "SME",
                                        "documentCode": "SME"
                                    },
                                    "discountAmount": 0.0,
                                    "discountPercentage": "5"
                                },
                                {
                                    "discountScheme": {
                                        "discountCategory": "DID02",
                                        "discountDescription": "Individual",
                                        "documentCode": "NID"
                                    },
                                    "discountAmount": 0.0,
                                    "discountPercentage": "5"
                                }
                            ]
                        },
                        {
                            "feeId": "013",
                            "feeCategory": "maintenance fee",
                            "feeTypeCode": "NFL",
                            "feeDescription": "UD-Number of affected file (CRP)",
                            "basicFeeUnitAmount": 100.0,
                            "basicFeeUnitQuantity": 1,
                            "additionalFeeUnitAmount": 50.0,
                            "additionalFeeUnitQuantity": 1,
                            "taxInclusionFeeIndicator": false,
                            "globalTaxExclusionIndicator": false,
                            "feePayableTotalAmount": 0.0,
                            "feePayableTotalGrossAmount": 0.0,
                            "feePayableTotalDiscountAmount": 0.0,
                            "feePayableTotalTaxAmount": 0.0,
                            "userDocumentCode": "UDCRP",
                            "userDocumentCodeName": "Change of  Representative",
                            "userDocumentType": "AOA",
                            "userDocumentTypeName": "Appointment of an Attorney",
                            "documentOriginCode": "VC",
                            "documentOriginName": "St. Vincent & Grenadines",
                            "taxBag": [
                                {
                                    "taxId": "Tax2",
                                    "taxDescription": "Gift Tax",
                                    "taxAmount": 20.0,
                                    "taxMinimumAmount": 0.0,
                                    "taxPercentage": 0
                                }
                            ],
                            "discountBag": [
                                {
                                    "discountScheme": {
                                        "discountCategory": "DID02",
                                        "discountDescription": "Individual",
                                        "documentCode": "NID"
                                    },
                                    "discountAmount": 5.0,
                                    "discountPercentage": null
                                },
                                {
                                    "discountScheme": {
                                        "discountCategory": "DID01",
                                        "discountDescription": "SME",
                                        "documentCode": "SME"
                                    },
                                    "discountAmount": 0.0,
                                    "discountPercentage": "10"
                                }
                            ]
                        },
                        {
                            "feeId": "012",
                            "feeCategory": "maintenance fee",
                            "feeTypeCode": "DPG",
                            "feeDescription": "UD-Number of document page (DPG)",
                            "basicFeeUnitAmount": 25.0,
                            "basicFeeUnitQuantity": 5,
                            "additionalFeeUnitAmount": 5.0,
                            "additionalFeeUnitQuantity": 1,
                            "taxInclusionFeeIndicator": false,
                            "globalTaxExclusionIndicator": false,
                            "feePayableTotalAmount": 0.0,
                            "feePayableTotalGrossAmount": 0.0,
                            "feePayableTotalDiscountAmount": 0.0,
                            "feePayableTotalTaxAmount": 0.0,
                            "userDocumentCode": "UDDES",
                            "userDocumentCodeName": "Amendment of patent description page ",
                            "userDocumentType": "PTD",
                            "userDocumentTypeName": "Patent Description",
                            "documentOriginCode": "VC",
                            "documentOriginName": "St. Vincent & Grenadines",
                            "taxBag": [
                                {
                                    "taxId": "Tax4",
                                    "taxDescription": "GST",
                                    "taxAmount": 0.0,
                                    "taxMinimumAmount": 0.0,
                                    "taxPercentage": 5
                                },
                                {
                                    "taxId": "Tax2",
                                    "taxDescription": "Gift Tax",
                                    "taxAmount": 20.0,
                                    "taxMinimumAmount": 0.0,
                                    "taxPercentage": 0
                                }
                            ],
                            "discountBag": [
                                {
                                    "discountScheme": {
                                        "discountCategory": "DID02",
                                        "discountDescription": "Individual",
                                        "documentCode": "NID"
                                    },
                                    "discountAmount": 0.0,
                                    "discountPercentage": "5"
                                },
                                {
                                    "discountScheme": {
                                        "discountCategory": "DID01",
                                        "discountDescription": "SME",
                                        "documentCode": "SME"
                                    },
                                    "discountAmount": 0.0,
                                    "discountPercentage": "5"
                                }
                            ]
                        },
                        {
                            "feeId": "005",
                            "feeCategory": "maintenance fee",
                            "feeTypeCode": "DRW",
                            "feeDescription": "Design-Regular drawings FID",
                            "basicFeeUnitAmount": 50.0,
                            "basicFeeUnitQuantity": 4,
                            "additionalFeeUnitAmount": 10.0,
                            "additionalFeeUnitQuantity": 1,
                            "taxInclusionFeeIndicator": false,
                            "globalTaxExclusionIndicator": false,
                            "feePayableTotalAmount": 0.0,
                            "feePayableTotalGrossAmount": 0.0,
                            "feePayableTotalDiscountAmount": 0.0,
                            "feePayableTotalTaxAmount": 0.0,
                            "userDocumentCode": "UDDRW",
                            "userDocumentCodeName": "Amendment of patent or design drawings",
                            "userDocumentType": "ADD",
                            "userDocumentTypeName": "Amendement of Drawing",
                            "documentOriginCode": "VC",
                            "documentOriginName": "St. Vincent & Grenadines",
                            "taxBag": [
                                {
                                    "taxId": "Tax4",
                                    "taxDescription": "GST",
                                    "taxAmount": 0.0,
                                    "taxMinimumAmount": 0.0,
                                    "taxPercentage": 5
                                },
                                {
                                    "taxId": "Tax2",
                                    "taxDescription": "Gift Tax",
                                    "taxAmount": 20.0,
                                    "taxMinimumAmount": 0.0,
                                    "taxPercentage": 0
                                }
                            ],
                            "discountBag": [
                                {
                                    "discountScheme": {
                                        "discountCategory": "DID02",
                                        "discountDescription": "Individual",
                                        "documentCode": "NID"
                                    },
                                    "discountAmount": 0.0,
                                    "discountPercentage": "5"
                                },
                                {
                                    "discountScheme": {
                                        "discountCategory": "DID01",
                                        "discountDescription": "SME",
                                        "documentCode": "SME"
                                    },
                                    "discountAmount": 0.0,
                                    "discountPercentage": "5"
                                }
                            ]
                        },
                        {
                            "feeId": "004",
                            "feeCategory": "maintenance fee",
                            "feeTypeCode": "DSN",
                            "feeDescription": "Design-Special unit TID ID UDGEN UDDSN",
                            "basicFeeUnitAmount": 60.0,
                            "basicFeeUnitQuantity": 1,
                            "additionalFeeUnitAmount": 10.0,
                            "additionalFeeUnitQuantity": 1,
                            "taxInclusionFeeIndicator": false,
                            "globalTaxExclusionIndicator": false,
                            "feePayableTotalAmount": 0.0,
                            "feePayableTotalGrossAmount": 0.0,
                            "feePayableTotalDiscountAmount": 0.0,
                            "feePayableTotalTaxAmount": 0.0,
                            "userDocumentCode": "UDDSN",
                            "userDocumentCodeName": "Amendment of Design units",
                            "userDocumentType": "DSN",
                            "userDocumentTypeName": "Amendment of Design units",
                            "documentOriginCode": "VC",
                            "documentOriginName": "St. Vincent & Grenadines",
                            "taxBag": [
                                {
                                    "taxId": "Tax2",
                                    "taxDescription": "Gift Tax",
                                    "taxAmount": 20.0,
                                    "taxMinimumAmount": 0.0,
                                    "taxPercentage": 0
                                },
                                {
                                    "taxId": "Tax4",
                                    "taxDescription": "GST",
                                    "taxAmount": 0.0,
                                    "taxMinimumAmount": 0.0,
                                    "taxPercentage": 5
                                },
                                {
                                    "taxId": "VAT",
                                    "taxDescription": "Global VAT",
                                    "taxAmount": 0.0,
                                    "taxMinimumAmount": 0.0,
                                    "taxPercentage": 10
                                }
                            ],
                            "discountBag": [
                                {
                                    "discountScheme": {
                                        "discountCategory": "DID01",
                                        "discountDescription": "SME",
                                        "documentCode": "SME"
                                    },
                                    "discountAmount": 0.0,
                                    "discountPercentage": "5"
                                }
                            ]
                        },
                        {
                            "feeId": "024",
                            "feeCategory": "maintenance fee",
                            "feeTypeCode": "NFL",
                            "feeDescription": "UD-Number of affected file (DSN)",
                            "basicFeeUnitAmount": 50.0,
                            "basicFeeUnitQuantity": 1,
                            "additionalFeeUnitAmount": 10.0,
                            "additionalFeeUnitQuantity": 1,
                            "taxInclusionFeeIndicator": false,
                            "globalTaxExclusionIndicator": false,
                            "feePayableTotalAmount": 0.0,
                            "feePayableTotalGrossAmount": 0.0,
                            "feePayableTotalDiscountAmount": 0.0,
                            "feePayableTotalTaxAmount": 0.0,
                            "userDocumentCode": "UDDSN",
                            "userDocumentCodeName": "Amendment of Design units",
                            "userDocumentType": "DSN",
                            "userDocumentTypeName": "Amendment of Design units",
                            "documentOriginCode": "VC",
                            "documentOriginName": "St. Vincent & Grenadines",
                            "taxBag": [
                                {
                                    "taxId": "Tax4",
                                    "taxDescription": "GST",
                                    "taxAmount": 0.0,
                                    "taxMinimumAmount": 0.0,
                                    "taxPercentage": 5
                                },
                                {
                                    "taxId": "Tax2",
                                    "taxDescription": "Gift Tax",
                                    "taxAmount": 20.0,
                                    "taxMinimumAmount": 0.0,
                                    "taxPercentage": 0
                                },
                                {
                                    "taxId": "VAT",
                                    "taxDescription": "Global VAT",
                                    "taxAmount": 0.0,
                                    "taxMinimumAmount": 0.0,
                                    "taxPercentage": 10
                                }
                            ],
                            "discountBag": [
                                {
                                    "discountScheme": {
                                        "discountCategory": "DID02",
                                        "discountDescription": "Individual",
                                        "documentCode": "NID"
                                    },
                                    "discountAmount": 0.0,
                                    "discountPercentage": "5"
                                },
                                {
                                    "discountScheme": {
                                        "discountCategory": "DID01",
                                        "discountDescription": "SME",
                                        "documentCode": "SME"
                                    },
                                    "discountAmount": 0.0,
                                    "discountPercentage": "5"
                                }
                            ]
                        },
                        {
                            "feeId": "019",
                            "feeCategory": "maintenance fee",
                            "feeTypeCode": "REG",
                            "feeDescription": "UD-Regular Fee (POA | ABT | ROL)",
                            "basicFeeUnitAmount": 500.0,
                            "basicFeeUnitQuantity": 2,
                            "additionalFeeUnitAmount": 100.0,
                            "additionalFeeUnitQuantity": 1,
                            "taxInclusionFeeIndicator": false,
                            "globalTaxExclusionIndicator": false,
                            "feePayableTotalAmount": 0.0,
                            "feePayableTotalGrossAmount": 0.0,
                            "feePayableTotalDiscountAmount": 0.0,
                            "feePayableTotalTaxAmount": 0.0,
                            "userDocumentCode": "UDEXP",
                            "userDocumentCodeName": "Death/Withdrawal/Expiration of file",
                            "userDocumentType": "UDEX",
                            "userDocumentTypeName": "File Expiration",
                            "documentOriginCode": "VC",
                            "documentOriginName": "St. Vincent & Grenadines",
                            "taxBag": [
                                {
                                    "taxId": "Tax4",
                                    "taxDescription": "GST",
                                    "taxAmount": 0.0,
                                    "taxMinimumAmount": 0.0,
                                    "taxPercentage": 5
                                },
                                {
                                    "taxId": "Tax2",
                                    "taxDescription": "Gift Tax",
                                    "taxAmount": 20.0,
                                    "taxMinimumAmount": 0.0,
                                    "taxPercentage": 0
                                },
                                {
                                    "taxId": "VAT",
                                    "taxDescription": "Global VAT",
                                    "taxAmount": 0.0,
                                    "taxMinimumAmount": 0.0,
                                    "taxPercentage": 10
                                }
                            ],
                            "discountBag": [
                                {
                                    "discountScheme": {
                                        "discountCategory": "DID01",
                                        "discountDescription": "SME",
                                        "documentCode": "SME"
                                    },
                                    "discountAmount": 0.0,
                                    "discountPercentage": "5"
                                },
                                {
                                    "discountScheme": {
                                        "discountCategory": "DID02",
                                        "discountDescription": "Individual",
                                        "documentCode": "NID"
                                    },
                                    "discountAmount": 0.0,
                                    "discountPercentage": "5"
                                }
                            ]
                        },
                        {
                            "feeId": "004",
                            "feeCategory": "maintenance fee",
                            "feeTypeCode": "DSN",
                            "feeDescription": "Design-Special unit TID ID UDGEN UDDSN",
                            "basicFeeUnitAmount": 60.0,
                            "basicFeeUnitQuantity": 1,
                            "additionalFeeUnitAmount": 10.0,
                            "additionalFeeUnitQuantity": 1,
                            "taxInclusionFeeIndicator": false,
                            "globalTaxExclusionIndicator": false,
                            "feePayableTotalAmount": 0.0,
                            "feePayableTotalGrossAmount": 0.0,
                            "feePayableTotalDiscountAmount": 0.0,
                            "feePayableTotalTaxAmount": 0.0,
                            "userDocumentCode": "UDGEN",
                            "userDocumentCodeName": "Other post filing request with affected file",
                            "userDocumentType": "RAM",
                            "userDocumentTypeName": "Request for Amendment /correcton",
                            "documentOriginCode": "VC",
                            "documentOriginName": "St. Vincent & Grenadines",
                            "taxBag": [
                                {
                                    "taxId": "Tax2",
                                    "taxDescription": "Gift Tax",
                                    "taxAmount": 20.0,
                                    "taxMinimumAmount": 0.0,
                                    "taxPercentage": 0
                                },
                                {
                                    "taxId": "Tax4",
                                    "taxDescription": "GST",
                                    "taxAmount": 0.0,
                                    "taxMinimumAmount": 0.0,
                                    "taxPercentage": 5
                                },
                                {
                                    "taxId": "VAT",
                                    "taxDescription": "Global VAT",
                                    "taxAmount": 0.0,
                                    "taxMinimumAmount": 0.0,
                                    "taxPercentage": 10
                                }
                            ],
                            "discountBag": [
                                {
                                    "discountScheme": {
                                        "discountCategory": "DID01",
                                        "discountDescription": "SME",
                                        "documentCode": "SME"
                                    },
                                    "discountAmount": 0.0,
                                    "discountPercentage": "5"
                                }
                            ]
                        },
                        {
                            "feeId": "017",
                            "feeCategory": "maintenance fee",
                            "feeTypeCode": "NFL",
                            "feeDescription": "UD-Number of affected file (NCL)(UDGEN)",
                            "basicFeeUnitAmount": 200.0,
                            "basicFeeUnitQuantity": 2,
                            "additionalFeeUnitAmount": 50.0,
                            "additionalFeeUnitQuantity": 1,
                            "taxInclusionFeeIndicator": false,
                            "globalTaxExclusionIndicator": false,
                            "feePayableTotalAmount": 0.0,
                            "feePayableTotalGrossAmount": 0.0,
                            "feePayableTotalDiscountAmount": 0.0,
                            "feePayableTotalTaxAmount": 0.0,
                            "userDocumentCode": "UDGEN",
                            "userDocumentCodeName": "Other post filing request with affected file",
                            "userDocumentType": "RAM",
                            "userDocumentTypeName": "Request for Amendment /correcton",
                            "documentOriginCode": "VC",
                            "documentOriginName": "St. Vincent & Grenadines",
                            "taxBag": [
                                {
                                    "taxId": "Tax4",
                                    "taxDescription": "GST",
                                    "taxAmount": 0.0,
                                    "taxMinimumAmount": 0.0,
                                    "taxPercentage": 5
                                },
                                {
                                    "taxId": "Tax2",
                                    "taxDescription": "Gift Tax",
                                    "taxAmount": 20.0,
                                    "taxMinimumAmount": 0.0,
                                    "taxPercentage": 0
                                },
                                {
                                    "taxId": "VAT",
                                    "taxDescription": "Global VAT",
                                    "taxAmount": 0.0,
                                    "taxMinimumAmount": 0.0,
                                    "taxPercentage": 10
                                }
                            ],
                            "discountBag": [
                                {
                                    "discountScheme": {
                                        "discountCategory": "DID01",
                                        "discountDescription": "SME",
                                        "documentCode": "SME"
                                    },
                                    "discountAmount": 0.0,
                                    "discountPercentage": "5"
                                }
                            ]
                        },
                        {
                            "feeId": "056",
                            "feeCategory": "maintenance fee",
                            "feeTypeCode": "NCL",
                            "feeDescription": "UD-Addition of Nice (NCL)(UDGEN)",
                            "basicFeeUnitAmount": 700.0,
                            "basicFeeUnitQuantity": 4,
                            "additionalFeeUnitAmount": 200.0,
                            "additionalFeeUnitQuantity": 1,
                            "taxInclusionFeeIndicator": false,
                            "globalTaxExclusionIndicator": false,
                            "feePayableTotalAmount": 0.0,
                            "feePayableTotalGrossAmount": 0.0,
                            "feePayableTotalDiscountAmount": 0.0,
                            "feePayableTotalTaxAmount": 0.0,
                            "userDocumentCode": "UDGEN",
                            "userDocumentCodeName": "Other post filing request with affected file",
                            "userDocumentType": "RAM",
                            "userDocumentTypeName": "Request for Amendment /correcton",
                            "documentOriginCode": "VC",
                            "documentOriginName": "St. Vincent & Grenadines",
                            "taxBag": [
                                {
                                    "taxId": "Tax4",
                                    "taxDescription": "GST",
                                    "taxAmount": 0.0,
                                    "taxMinimumAmount": 0.0,
                                    "taxPercentage": 5
                                },
                                {
                                    "taxId": "Tax2",
                                    "taxDescription": "Gift Tax",
                                    "taxAmount": 20.0,
                                    "taxMinimumAmount": 0.0,
                                    "taxPercentage": 0
                                }
                            ],
                            "discountBag": [
                                {
                                    "discountScheme": {
                                        "discountCategory": "DID02",
                                        "discountDescription": "Individual",
                                        "documentCode": "NID"
                                    },
                                    "discountAmount": 0.0,
                                    "discountPercentage": "5"
                                },
                                {
                                    "discountScheme": {
                                        "discountCategory": "DID01",
                                        "discountDescription": "SME",
                                        "documentCode": "SME"
                                    },
                                    "discountAmount": 0.0,
                                    "discountPercentage": "5"
                                }
                            ]
                        },
                        {
                            "feeId": "014",
                            "feeCategory": "maintenance fee",
                            "feeTypeCode": "NFL",
                            "feeDescription": "UD-Number of affected file(COW,GEN)",
                            "basicFeeUnitAmount": 500.0,
                            "basicFeeUnitQuantity": 2,
                            "additionalFeeUnitAmount": 100.0,
                            "additionalFeeUnitQuantity": 1,
                            "taxInclusionFeeIndicator": false,
                            "globalTaxExclusionIndicator": false,
                            "feePayableTotalAmount": 0.0,
                            "feePayableTotalGrossAmount": 0.0,
                            "feePayableTotalDiscountAmount": 0.0,
                            "feePayableTotalTaxAmount": 0.0,
                            "userDocumentCode": "UDGEN",
                            "userDocumentCodeName": "Other post filing request with affected file",
                            "userDocumentType": "RCS",
                            "userDocumentTypeName": "Payment of Requested Fees",
                            "documentOriginCode": "VC",
                            "documentOriginName": "St. Vincent & Grenadines",
                            "discountBag": [
                                {
                                    "discountScheme": {
                                        "discountCategory": "DID01",
                                        "discountDescription": "SME",
                                        "documentCode": "SME"
                                    },
                                    "discountAmount": 0.0,
                                    "discountPercentage": "5"
                                },
                                {
                                    "discountScheme": {
                                        "discountCategory": "DID02",
                                        "discountDescription": "Individual",
                                        "documentCode": "NID"
                                    },
                                    "discountAmount": 0.0,
                                    "discountPercentage": "5"
                                }
                            ]
                        },
                        {
                            "feeId": "004",
                            "feeCategory": "maintenance fee",
                            "feeTypeCode": "DSN",
                            "feeDescription": "Design-Special unit TID ID UDGEN UDDSN",
                            "basicFeeUnitAmount": 60.0,
                            "basicFeeUnitQuantity": 1,
                            "additionalFeeUnitAmount": 10.0,
                            "additionalFeeUnitQuantity": 1,
                            "taxInclusionFeeIndicator": false,
                            "globalTaxExclusionIndicator": false,
                            "feePayableTotalAmount": 0.0,
                            "feePayableTotalGrossAmount": 0.0,
                            "feePayableTotalDiscountAmount": 0.0,
                            "feePayableTotalTaxAmount": 0.0,
                            "userDocumentCode": "UDGEN",
                            "userDocumentCodeName": "Other post filing request with affected file",
                            "userDocumentType": "TME",
                            "userDocumentTypeName": "Time Extension",
                            "documentOriginCode": "VC",
                            "documentOriginName": "St. Vincent & Grenadines",
                            "taxBag": [
                                {
                                    "taxId": "Tax2",
                                    "taxDescription": "Gift Tax",
                                    "taxAmount": 20.0,
                                    "taxMinimumAmount": 0.0,
                                    "taxPercentage": 0
                                },
                                {
                                    "taxId": "Tax4",
                                    "taxDescription": "GST",
                                    "taxAmount": 0.0,
                                    "taxMinimumAmount": 0.0,
                                    "taxPercentage": 5
                                },
                                {
                                    "taxId": "VAT",
                                    "taxDescription": "Global VAT",
                                    "taxAmount": 0.0,
                                    "taxMinimumAmount": 0.0,
                                    "taxPercentage": 10
                                }
                            ],
                            "discountBag": [
                                {
                                    "discountScheme": {
                                        "discountCategory": "DID01",
                                        "discountDescription": "SME",
                                        "documentCode": "SME"
                                    },
                                    "discountAmount": 0.0,
                                    "discountPercentage": "5"
                                }
                            ]
                        },
                        {
                            "feeId": "008",
                            "feeCategory": "maintenance fee",
                            "feeTypeCode": "LGC",
                            "feeDescription": "TM-Color logo",
                            "basicFeeUnitAmount": 20.0,
                            "basicFeeUnitQuantity": 1,
                            "additionalFeeUnitAmount": 5.0,
                            "additionalFeeUnitQuantity": 1,
                            "taxInclusionFeeIndicator": false,
                            "globalTaxExclusionIndicator": false,
                            "feePayableTotalAmount": 0.0,
                            "feePayableTotalGrossAmount": 0.0,
                            "feePayableTotalDiscountAmount": 0.0,
                            "feePayableTotalTaxAmount": 0.0,
                            "userDocumentCode": "UDLGO",
                            "userDocumentCodeName": "Change of Logo",
                            "userDocumentType": "LGO",
                            "userDocumentTypeName": "Change of Logo",
                            "documentOriginCode": "VC",
                            "documentOriginName": "St. Vincent & Grenadines",
                            "taxBag": [
                                {
                                    "taxId": "Tax4",
                                    "taxDescription": "GST",
                                    "taxAmount": 0.0,
                                    "taxMinimumAmount": 0.0,
                                    "taxPercentage": 5
                                },
                                {
                                    "taxId": "Tax2",
                                    "taxDescription": "Gift Tax",
                                    "taxAmount": 20.0,
                                    "taxMinimumAmount": 0.0,
                                    "taxPercentage": 0
                                }
                            ]
                        },
                        {
                            "feeId": "016",
                            "feeCategory": "maintenance fee",
                            "feeTypeCode": "LGO",
                            "feeDescription": "UD-Logo",
                            "basicFeeUnitAmount": 100.0,
                            "basicFeeUnitQuantity": 1,
                            "additionalFeeUnitAmount": 20.0,
                            "additionalFeeUnitQuantity": 1,
                            "taxInclusionFeeIndicator": false,
                            "globalTaxExclusionIndicator": true,
                            "feePayableTotalAmount": 0.0,
                            "feePayableTotalGrossAmount": 0.0,
                            "feePayableTotalDiscountAmount": 0.0,
                            "feePayableTotalTaxAmount": 0.0,
                            "userDocumentCode": "UDLGO",
                            "userDocumentCodeName": "Change of Logo",
                            "userDocumentType": "LGO",
                            "userDocumentTypeName": "Change of Logo",
                            "documentOriginCode": "VC",
                            "documentOriginName": "St. Vincent & Grenadines",
                            "taxBag": [
                                {
                                    "taxId": "Tax2",
                                    "taxDescription": "Gift Tax",
                                    "taxAmount": 20.0,
                                    "taxMinimumAmount": 0.0,
                                    "taxPercentage": 0
                                }
                            ]
                        },
                        {
                            "feeId": "019",
                            "feeCategory": "maintenance fee",
                            "feeTypeCode": "REG",
                            "feeDescription": "UD-Regular Fee (POA | ABT | ROL)",
                            "basicFeeUnitAmount": 500.0,
                            "basicFeeUnitQuantity": 2,
                            "additionalFeeUnitAmount": 100.0,
                            "additionalFeeUnitQuantity": 1,
                            "taxInclusionFeeIndicator": false,
                            "globalTaxExclusionIndicator": false,
                            "feePayableTotalAmount": 0.0,
                            "feePayableTotalGrossAmount": 0.0,
                            "feePayableTotalDiscountAmount": 0.0,
                            "feePayableTotalTaxAmount": 0.0,
                            "userDocumentCode": "UDLIC",
                            "userDocumentCodeName": "Recordal of License",
                            "userDocumentType": "ROL",
                            "userDocumentTypeName": "Recordal of a Licencee",
                            "documentOriginCode": "VC",
                            "documentOriginName": "St. Vincent & Grenadines",
                            "taxBag": [
                                {
                                    "taxId": "Tax4",
                                    "taxDescription": "GST",
                                    "taxAmount": 0.0,
                                    "taxMinimumAmount": 0.0,
                                    "taxPercentage": 5
                                },
                                {
                                    "taxId": "Tax2",
                                    "taxDescription": "Gift Tax",
                                    "taxAmount": 20.0,
                                    "taxMinimumAmount": 0.0,
                                    "taxPercentage": 0
                                },
                                {
                                    "taxId": "VAT",
                                    "taxDescription": "Global VAT",
                                    "taxAmount": 0.0,
                                    "taxMinimumAmount": 0.0,
                                    "taxPercentage": 10
                                }
                            ],
                            "discountBag": [
                                {
                                    "discountScheme": {
                                        "discountCategory": "DID01",
                                        "discountDescription": "SME",
                                        "documentCode": "SME"
                                    },
                                    "discountAmount": 0.0,
                                    "discountPercentage": "5"
                                },
                                {
                                    "discountScheme": {
                                        "discountCategory": "DID02",
                                        "discountDescription": "Individual",
                                        "documentCode": "NID"
                                    },
                                    "discountAmount": 0.0,
                                    "discountPercentage": "5"
                                }
                            ]
                        },
                        {
                            "feeId": "017",
                            "feeCategory": "maintenance fee",
                            "feeTypeCode": "NFL",
                            "feeDescription": "UD-Number of affected file (NCL)(UDGEN)",
                            "basicFeeUnitAmount": 200.0,
                            "basicFeeUnitQuantity": 2,
                            "additionalFeeUnitAmount": 50.0,
                            "additionalFeeUnitQuantity": 1,
                            "taxInclusionFeeIndicator": false,
                            "globalTaxExclusionIndicator": false,
                            "feePayableTotalAmount": 0.0,
                            "feePayableTotalGrossAmount": 0.0,
                            "feePayableTotalDiscountAmount": 0.0,
                            "feePayableTotalTaxAmount": 0.0,
                            "userDocumentCode": "UDNCL",
                            "userDocumentCodeName": "Change of Nice",
                            "userDocumentType": "NCL",
                            "userDocumentTypeName": "Change of Nice",
                            "documentOriginCode": "VC",
                            "documentOriginName": "St. Vincent & Grenadines",
                            "taxBag": [
                                {
                                    "taxId": "Tax4",
                                    "taxDescription": "GST",
                                    "taxAmount": 0.0,
                                    "taxMinimumAmount": 0.0,
                                    "taxPercentage": 5
                                },
                                {
                                    "taxId": "Tax2",
                                    "taxDescription": "Gift Tax",
                                    "taxAmount": 20.0,
                                    "taxMinimumAmount": 0.0,
                                    "taxPercentage": 0
                                },
                                {
                                    "taxId": "VAT",
                                    "taxDescription": "Global VAT",
                                    "taxAmount": 0.0,
                                    "taxMinimumAmount": 0.0,
                                    "taxPercentage": 10
                                }
                            ],
                            "discountBag": [
                                {
                                    "discountScheme": {
                                        "discountCategory": "DID01",
                                        "discountDescription": "SME",
                                        "documentCode": "SME"
                                    },
                                    "discountAmount": 0.0,
                                    "discountPercentage": "5"
                                }
                            ]
                        },
                        {
                            "feeId": "056",
                            "feeCategory": "maintenance fee",
                            "feeTypeCode": "NCL",
                            "feeDescription": "UD-Addition of Nice (NCL)(UDGEN)",
                            "basicFeeUnitAmount": 700.0,
                            "basicFeeUnitQuantity": 4,
                            "additionalFeeUnitAmount": 200.0,
                            "additionalFeeUnitQuantity": 1,
                            "taxInclusionFeeIndicator": false,
                            "globalTaxExclusionIndicator": false,
                            "feePayableTotalAmount": 0.0,
                            "feePayableTotalGrossAmount": 0.0,
                            "feePayableTotalDiscountAmount": 0.0,
                            "feePayableTotalTaxAmount": 0.0,
                            "userDocumentCode": "UDNCL",
                            "userDocumentCodeName": "Change of Nice",
                            "userDocumentType": "NCL",
                            "userDocumentTypeName": "Change of Nice",
                            "documentOriginCode": "VC",
                            "documentOriginName": "St. Vincent & Grenadines",
                            "taxBag": [
                                {
                                    "taxId": "Tax4",
                                    "taxDescription": "GST",
                                    "taxAmount": 0.0,
                                    "taxMinimumAmount": 0.0,
                                    "taxPercentage": 5
                                },
                                {
                                    "taxId": "Tax2",
                                    "taxDescription": "Gift Tax",
                                    "taxAmount": 20.0,
                                    "taxMinimumAmount": 0.0,
                                    "taxPercentage": 0
                                }
                            ],
                            "discountBag": [
                                {
                                    "discountScheme": {
                                        "discountCategory": "DID02",
                                        "discountDescription": "Individual",
                                        "documentCode": "NID"
                                    },
                                    "discountAmount": 0.0,
                                    "discountPercentage": "5"
                                },
                                {
                                    "discountScheme": {
                                        "discountCategory": "DID01",
                                        "discountDescription": "SME",
                                        "documentCode": "SME"
                                    },
                                    "discountAmount": 0.0,
                                    "discountPercentage": "5"
                                }
                            ]
                        },
                        {
                            "feeId": "019",
                            "feeCategory": "maintenance fee",
                            "feeTypeCode": "REG",
                            "feeDescription": "UD-Regular Fee (POA | ABT | ROL)",
                            "basicFeeUnitAmount": 500.0,
                            "basicFeeUnitQuantity": 2,
                            "additionalFeeUnitAmount": 100.0,
                            "additionalFeeUnitQuantity": 1,
                            "taxInclusionFeeIndicator": false,
                            "globalTaxExclusionIndicator": false,
                            "feePayableTotalAmount": 0.0,
                            "feePayableTotalGrossAmount": 0.0,
                            "feePayableTotalDiscountAmount": 0.0,
                            "feePayableTotalTaxAmount": 0.0,
                            "userDocumentCode": "UDPOA",
                            "userDocumentCodeName": "Power of attorney",
                            "userDocumentType": "POA",
                            "userDocumentTypeName": "Power of attorney",
                            "documentOriginCode": "VC",
                            "documentOriginName": "St. Vincent & Grenadines",
                            "taxBag": [
                                {
                                    "taxId": "Tax4",
                                    "taxDescription": "GST",
                                    "taxAmount": 0.0,
                                    "taxMinimumAmount": 0.0,
                                    "taxPercentage": 5
                                },
                                {
                                    "taxId": "Tax2",
                                    "taxDescription": "Gift Tax",
                                    "taxAmount": 20.0,
                                    "taxMinimumAmount": 0.0,
                                    "taxPercentage": 0
                                },
                                {
                                    "taxId": "VAT",
                                    "taxDescription": "Global VAT",
                                    "taxAmount": 0.0,
                                    "taxMinimumAmount": 0.0,
                                    "taxPercentage": 10
                                }
                            ],
                            "discountBag": [
                                {
                                    "discountScheme": {
                                        "discountCategory": "DID01",
                                        "discountDescription": "SME",
                                        "documentCode": "SME"
                                    },
                                    "discountAmount": 0.0,
                                    "discountPercentage": "5"
                                },
                                {
                                    "discountScheme": {
                                        "discountCategory": "DID02",
                                        "discountDescription": "Individual",
                                        "documentCode": "NID"
                                    },
                                    "discountAmount": 0.0,
                                    "discountPercentage": "5"
                                }
                            ]
                        },
                        {
                            "feeId": "054",
                            "feeCategory": "maintenance fee",
                            "feeTypeCode": "NFL",
                            "feeDescription": "UD-Number of affected file (COR & PU2)",
                            "basicFeeUnitAmount": 200.0,
                            "basicFeeUnitQuantity": 2,
                            "additionalFeeUnitAmount": 125.0,
                            "additionalFeeUnitQuantity": 1,
                            "taxInclusionFeeIndicator": false,
                            "globalTaxExclusionIndicator": false,
                            "feePayableTotalAmount": 0.0,
                            "feePayableTotalGrossAmount": 0.0,
                            "feePayableTotalDiscountAmount": 0.0,
                            "feePayableTotalTaxAmount": 0.0,
                            "userDocumentCode": "UDPUB",
                            "userDocumentCodeName": "Special Publication request",
                            "userDocumentType": "PU2",
                            "userDocumentTypeName": "Publication 2",
                            "documentOriginCode": "VC",
                            "documentOriginName": "St. Vincent & Grenadines",
                            "taxBag": [
                                {
                                    "taxId": "Tax2",
                                    "taxDescription": "Gift Tax",
                                    "taxAmount": 20.0,
                                    "taxMinimumAmount": 0.0,
                                    "taxPercentage": 0
                                }
                            ],
                            "discountBag": [
                                {
                                    "discountScheme": {
                                        "discountCategory": "DID02",
                                        "discountDescription": "Individual",
                                        "documentCode": "NID"
                                    },
                                    "discountAmount": 0.0,
                                    "discountPercentage": "5"
                                },
                                {
                                    "discountScheme": {
                                        "discountCategory": "DID01",
                                        "discountDescription": "SME",
                                        "documentCode": "SME"
                                    },
                                    "discountAmount": 0.0,
                                    "discountPercentage": "5"
                                }
                            ]
                        },
                        {
                            "feeId": "055",
                            "feeCategory": "maintenance fee",
                            "feeTypeCode": "NFL",
                            "feeDescription": "UD-Number of affected file (PUB)",
                            "basicFeeUnitAmount": 50.0,
                            "basicFeeUnitQuantity": 2,
                            "additionalFeeUnitAmount": 30.0,
                            "additionalFeeUnitQuantity": 1,
                            "taxInclusionFeeIndicator": false,
                            "globalTaxExclusionIndicator": false,
                            "feePayableTotalAmount": 0.0,
                            "feePayableTotalGrossAmount": 0.0,
                            "feePayableTotalDiscountAmount": 0.0,
                            "feePayableTotalTaxAmount": 0.0,
                            "userDocumentCode": "UDPUB",
                            "userDocumentCodeName": "Special Publication request",
                            "userDocumentType": "PUB",
                            "userDocumentTypeName": "Special Publication Request",
                            "documentOriginCode": "VC",
                            "documentOriginName": "St. Vincent & Grenadines"
                        },
                        {
                            "feeId": "018",
                            "feeCategory": "maintenance fee",
                            "feeTypeCode": "NFL",
                            "feeDescription": "UD-Number of affected file (RSP)",
                            "basicFeeUnitAmount": 100.0,
                            "basicFeeUnitQuantity": 1,
                            "additionalFeeUnitAmount": 50.0,
                            "additionalFeeUnitQuantity": 1,
                            "taxInclusionFeeIndicator": false,
                            "globalTaxExclusionIndicator": false,
                            "feePayableTotalAmount": 0.0,
                            "feePayableTotalGrossAmount": 0.0,
                            "feePayableTotalDiscountAmount": 0.0,
                            "feePayableTotalTaxAmount": 0.0,
                            "userDocumentCode": "UDRSP",
                            "userDocumentCodeName": "Response to User document or Office document",
                            "userDocumentType": "OPC",
                            "userDocumentTypeName": "Notification of Attendance UDRSP",
                            "documentOriginCode": "VC",
                            "documentOriginName": "St. Vincent & Grenadines"
                        },
                        {
                            "feeId": "018",
                            "feeCategory": "maintenance fee",
                            "feeTypeCode": "NFL",
                            "feeDescription": "UD-Number of affected file (RSP)",
                            "basicFeeUnitAmount": 100.0,
                            "basicFeeUnitQuantity": 1,
                            "additionalFeeUnitAmount": 50.0,
                            "additionalFeeUnitQuantity": 1,
                            "taxInclusionFeeIndicator": false,
                            "globalTaxExclusionIndicator": false,
                            "feePayableTotalAmount": 0.0,
                            "feePayableTotalGrossAmount": 0.0,
                            "feePayableTotalDiscountAmount": 0.0,
                            "feePayableTotalTaxAmount": 0.0,
                            "userDocumentCode": "UDRSP",
                            "userDocumentCodeName": "Response to User document or Office document",
                            "userDocumentType": "TRSP",
                            "userDocumentTypeName": "Test Response to office document",
                            "documentOriginCode": "VC",
                            "documentOriginName": "St. Vincent & Grenadines"
                        }
                    ]
                }
            ]
        }
    }

    getFeeServices() {
        return Promise.resolve(this.getData());
    }
};