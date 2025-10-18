import { Injectable, signal } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { DocumentOrigins, Fee, FeeConditions } from '../schemas/fee-schema';
import { catchError, Observable, of, switchMap, throwError } from 'rxjs';
import { AuthService } from './auth.service';
import { environment } from 'src/environments/environment';
import { ToastService } from './toast.service';
import { getAuthHeaders, handleError } from '../utils';
import { MechanicsService } from './mechanics.service';

@Injectable({ providedIn: 'root' })
export class FeeService {

    selectedItems = signal<string | any[] | Record<string, any> | null>(null);

    setSelectedItems(items: string | any[] | Record<string, any>) {
        this.selectedItems.set(items);
    }

    clearItems() {
        this.selectedItems.set(null);
    }

    constructor(
        private http: HttpClient,
        private authService: AuthService,
        private toastService: ToastService,
        private ms: MechanicsService
    ) { }

    /**
     * Get Fees Conditions
     * Based on the API endpoint: {{baseUrl}}/services/fees/v1/conditions/all/application
     */
    getFeesConditions(documentOriginCode?: string, ipRightCategoryCode?: string): Observable<FeeConditions> {

        let endpointUrl = environment.feesConditionsUrl;

        if (documentOriginCode && ipRightCategoryCode) {
            endpointUrl = endpointUrl + `?documentOriginCode=${documentOriginCode}&ipRightCategoryCode=${ipRightCategoryCode}`;
        } else if (documentOriginCode) {
            endpointUrl = endpointUrl + `?documentOriginCode=${documentOriginCode}`;
        } else if (ipRightCategoryCode) {
            endpointUrl = endpointUrl + `?ipRightCategoryCode=${ipRightCategoryCode}`;
        }

        return getAuthHeaders(this.authService).pipe(
            switchMap((headers) =>
                this.http.get<FeeConditions>(endpointUrl, {
                    headers: headers,
                })
            ),
            catchError((error) => handleError(error, 'Loading Fees Conditions', this.toastService, this.ms))
        );
    }

    getDocumentOrigins(): Observable<DocumentOrigins[]> {
        return getAuthHeaders(this.authService).pipe(
            switchMap((headers) =>
                this.http.get<DocumentOrigins[]>(`${environment.documentOriginsUrl}`, {
                    headers: headers
                })
            ),
            catchError((error) => handleError(error, 'Loading Fees Conditions', this.toastService, this.ms))
        );
    }

    getAPIData(dataType): FeeConditions | DocumentOrigins[] {
        if (dataType == "feeConditions") {
            return {
                "currencyCode": "USD",
                "feePayableTotalAmount": 0.0,
                "feePayableTotalGrossAmount": 0.0,
                "feePayableTotalDiscountAmount": 0.0,
                "feePayableTotalTaxAmount": 0.0,
                "feeCalculationDate": "2025-10-13T07:33:08.072Z",
                "requestBag": [
                    {
                        "documentOriginCode": "VC",
                        "responseFeeCount": 87,
                        "feeBag": [
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
                                "applicationCategoryCode": "ID",
                                "applicationCategory": "Industrial Design",
                                "documentOriginCode": "VC",
                                "documentOriginName": "St. Vincent & Grenadines",
                                "taxBag": [
                                    {
                                        "taxId": "Tax2",
                                        "taxDescription": "Gift Tax",
                                        "taxAmount": 0.0,
                                        "taxMinimumAmount": 0.0,
                                        "taxPercentage": 0
                                    },
                                    {
                                        "taxId": "Tax4",
                                        "taxDescription": "GST",
                                        "taxAmount": 0.0,
                                        "taxMinimumAmount": 0.0,
                                        "taxPercentage": 0
                                    },
                                    {
                                        "taxId": "VAT",
                                        "taxDescription": "VAT",
                                        "taxAmount": 0.0,
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
                                    }
                                ]
                            },
                            {
                                "feeId": "023",
                                "feeCategory": "registration fee",
                                "feeTypeCode": "RED",
                                "feeDescription": "UD-Renewal fee for Design Unit (RED| RDL)",
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
                                        "taxDescription": "VAT",
                                        "taxAmount": 0.0,
                                        "taxMinimumAmount": 0.0,
                                        "taxPercentage": 0
                                    },
                                    {
                                        "taxId": "Tax2",
                                        "taxDescription": "Gift Tax",
                                        "taxAmount": 0.0,
                                        "taxMinimumAmount": 0.0,
                                        "taxPercentage": 0
                                    },
                                    {
                                        "taxId": "Tax4",
                                        "taxDescription": "GST",
                                        "taxAmount": 0.0,
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
                                        "taxAmount": 0.0,
                                        "taxMinimumAmount": 0.0,
                                        "taxPercentage": 0
                                    },
                                    {
                                        "taxId": "VAT",
                                        "taxDescription": "VAT",
                                        "taxAmount": 0.0,
                                        "taxMinimumAmount": 0.0,
                                        "taxPercentage": 0
                                    },
                                    {
                                        "taxId": "Tax4",
                                        "taxDescription": "GST",
                                        "taxAmount": 0.0,
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
                                    }
                                ]
                            },
                            {
                                "feeId": "023",
                                "feeCategory": "registration fee",
                                "feeTypeCode": "RED",
                                "feeDescription": "UD-Renewal fee for Design Unit (RED| RDL)",
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
                                "applicationSubCategoryCode": "ID",
                                "applicationSubCategory": "Industrial Design",
                                "documentOriginCode": "VC",
                                "documentOriginName": "St. Vincent & Grenadines",
                                "taxBag": [
                                    {
                                        "taxId": "VAT",
                                        "taxDescription": "VAT",
                                        "taxAmount": 0.0,
                                        "taxMinimumAmount": 0.0,
                                        "taxPercentage": 0
                                    },
                                    {
                                        "taxId": "Tax2",
                                        "taxDescription": "Gift Tax",
                                        "taxAmount": 0.0,
                                        "taxMinimumAmount": 0.0,
                                        "taxPercentage": 0
                                    },
                                    {
                                        "taxId": "Tax4",
                                        "taxDescription": "GST",
                                        "taxAmount": 0.0,
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
                                        "taxPercentage": 0
                                    },
                                    {
                                        "taxId": "Tax2",
                                        "taxDescription": "Gift Tax",
                                        "taxAmount": 0.0,
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
                                "additionalFeeUnitAmount": 30.0,
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
                                        "taxAmount": 0.0,
                                        "taxMinimumAmount": 0.0,
                                        "taxPercentage": 0
                                    },
                                    {
                                        "taxId": "Tax4",
                                        "taxDescription": "GST",
                                        "taxAmount": 0.0,
                                        "taxMinimumAmount": 0.0,
                                        "taxPercentage": 0
                                    },
                                    {
                                        "taxId": "VAT",
                                        "taxDescription": "VAT",
                                        "taxAmount": 0.0,
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
                                        "taxAmount": 0.0,
                                        "taxMinimumAmount": 0.0,
                                        "taxPercentage": 0
                                    },
                                    {
                                        "taxId": "VAT",
                                        "taxDescription": "VAT",
                                        "taxAmount": 0.0,
                                        "taxMinimumAmount": 0.0,
                                        "taxPercentage": 0
                                    },
                                    {
                                        "taxId": "Tax4",
                                        "taxDescription": "GST",
                                        "taxAmount": 0.0,
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
                                        "taxPercentage": 0
                                    },
                                    {
                                        "taxId": "Tax2",
                                        "taxDescription": "Gift Tax",
                                        "taxAmount": 0.0,
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
                                "feeDescription": "UD-Renewal fee for Design Unit (RED| RDL)",
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
                                        "taxDescription": "VAT",
                                        "taxAmount": 0.0,
                                        "taxMinimumAmount": 0.0,
                                        "taxPercentage": 0
                                    },
                                    {
                                        "taxId": "Tax2",
                                        "taxDescription": "Gift Tax",
                                        "taxAmount": 0.0,
                                        "taxMinimumAmount": 0.0,
                                        "taxPercentage": 0
                                    },
                                    {
                                        "taxId": "Tax4",
                                        "taxDescription": "GST",
                                        "taxAmount": 0.0,
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
                                        "taxPercentage": 0
                                    },
                                    {
                                        "taxId": "Tax2",
                                        "taxDescription": "Gift Tax",
                                        "taxAmount": 0.0,
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
                                "applicablePeriod": "1-3",
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
                                        "taxAmount": 0.0,
                                        "taxMinimumAmount": 0.0,
                                        "taxPercentage": 0
                                    },
                                    {
                                        "taxId": "Tax4",
                                        "taxDescription": "GST",
                                        "taxAmount": 0.0,
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
                                "applicablePeriod": "4-6",
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
                                        "taxPercentage": 0
                                    },
                                    {
                                        "taxId": "Tax2",
                                        "taxDescription": "Gift Tax",
                                        "taxAmount": 0.0,
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
                                "applicablePeriod": "10-20",
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
                                        "taxAmount": 0.0,
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
                                "applicablePeriod": "7-9",
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
                                        "taxPercentage": 0
                                    },
                                    {
                                        "taxId": "Tax2",
                                        "taxDescription": "Gift Tax",
                                        "taxAmount": 0.0,
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
                                "taxBag": [
                                    {
                                        "taxId": "Tax2",
                                        "taxDescription": "Gift Tax",
                                        "taxAmount": 0.0,
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
                                "applicationSubCategoryCode": "FA",
                                "applicationSubCategory": "Foreign-PA",
                                "documentOriginCode": "VC",
                                "documentOriginName": "St. Vincent & Grenadines",
                                "taxBag": [
                                    {
                                        "taxId": "Tax2",
                                        "taxDescription": "Gift Tax",
                                        "taxAmount": 0.0,
                                        "taxMinimumAmount": 0.0,
                                        "taxPercentage": 0
                                    }
                                ]
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
                                        "taxAmount": 0.0,
                                        "taxMinimumAmount": 0.0,
                                        "taxPercentage": 0
                                    }
                                ]
                            },
                            {
                                "feeId": "070",
                                "feeCategory": "registration fee",
                                "feeTypeCode": "ANU",
                                "feeDescription": "Annuity (11-15)",
                                "applicablePeriod": "11-15",
                                "basicFeeUnitAmount": 320.0,
                                "basicFeeUnitQuantity": 1,
                                "additionalFeeUnitAmount": 320.0,
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
                                "documentOriginName": "St. Vincent & Grenadines"
                            },
                            {
                                "feeId": "071",
                                "feeCategory": "registration fee",
                                "feeTypeCode": "ANU",
                                "feeDescription": "Annuity (16-20)",
                                "applicablePeriod": "16-20",
                                "basicFeeUnitAmount": 350.0,
                                "basicFeeUnitQuantity": 1,
                                "additionalFeeUnitAmount": 350.0,
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
                                "documentOriginName": "St. Vincent & Grenadines"
                            },
                            {
                                "feeId": "072",
                                "feeCategory": "registration fee",
                                "feeTypeCode": "ANU",
                                "feeDescription": "Annuity (4-10)",
                                "applicablePeriod": "4-10",
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
                                "applicationSubCategoryCode": "NP",
                                "applicationSubCategory": "National Patents",
                                "documentOriginCode": "VC",
                                "documentOriginName": "St. Vincent & Grenadines"
                            },
                            {
                                "feeId": "073",
                                "feeCategory": "registration fee",
                                "feeTypeCode": "ANU",
                                "feeDescription": "Annuity (1-3)",
                                "applicablePeriod": "3",
                                "basicFeeUnitAmount": 400.0,
                                "basicFeeUnitQuantity": 1,
                                "additionalFeeUnitAmount": 300.0,
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
                                "documentOriginName": "St. Vincent & Grenadines"
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
                                "documentOriginName": "St. Vincent & Grenadines"
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
                                        "taxPercentage": 0
                                    },
                                    {
                                        "taxId": "Tax2",
                                        "taxDescription": "Gift Tax",
                                        "taxAmount": 0.0,
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
                                "fileType": "M",
                                "fileTypeName": "Collective",
                                "applicationCategoryCode": "CM",
                                "applicationCategory": "Collective Mark",
                                "documentOriginCode": "VC",
                                "documentOriginName": "St. Vincent & Grenadines",
                                "taxBag": [
                                    {
                                        "taxId": "VAT",
                                        "taxDescription": "VAT",
                                        "taxAmount": 0.0,
                                        "taxMinimumAmount": 0.0,
                                        "taxPercentage": 0
                                    },
                                    {
                                        "taxId": "Tax2",
                                        "taxDescription": "Gift Tax",
                                        "taxAmount": 0.0,
                                        "taxMinimumAmount": 0.0,
                                        "taxPercentage": 0
                                    },
                                    {
                                        "taxId": "Tax4",
                                        "taxDescription": "GST",
                                        "taxAmount": 0.0,
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
                                "fileType": "M",
                                "fileTypeName": "Collective",
                                "applicationCategoryCode": "CM",
                                "applicationCategory": "Collective Mark",
                                "documentOriginCode": "VC",
                                "documentOriginName": "St. Vincent & Grenadines",
                                "taxBag": [
                                    {
                                        "taxId": "Tax2",
                                        "taxDescription": "Gift Tax",
                                        "taxAmount": 0.0,
                                        "taxMinimumAmount": 0.0,
                                        "taxPercentage": 0
                                    },
                                    {
                                        "taxId": "VAT",
                                        "taxDescription": "VAT",
                                        "taxAmount": 0.0,
                                        "taxMinimumAmount": 0.0,
                                        "taxPercentage": 0
                                    },
                                    {
                                        "taxId": "Tax4",
                                        "taxDescription": "GST",
                                        "taxAmount": 0.0,
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
                                "fileType": "M",
                                "fileTypeName": "Collective",
                                "applicationCategoryCode": "CM",
                                "applicationCategory": "Collective Mark",
                                "documentOriginCode": "VC",
                                "documentOriginName": "St. Vincent & Grenadines",
                                "taxBag": [
                                    {
                                        "taxId": "Tax2",
                                        "taxDescription": "Gift Tax",
                                        "taxAmount": 0.0,
                                        "taxMinimumAmount": 0.0,
                                        "taxPercentage": 0
                                    },
                                    {
                                        "taxId": "VAT",
                                        "taxDescription": "VAT",
                                        "taxAmount": 0.0,
                                        "taxMinimumAmount": 0.0,
                                        "taxPercentage": 0
                                    },
                                    {
                                        "taxId": "Tax4",
                                        "taxDescription": "GST",
                                        "taxAmount": 0.0,
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
                                    }
                                ]
                            },
                            {
                                "feeId": "003",
                                "feeCategory": "registration fee",
                                "feeTypeCode": "NCL",
                                "feeDescription": "TM-Specific Goods and Services (Collective | GEN)",
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
                                        "taxPercentage": 0
                                    },
                                    {
                                        "taxId": "Tax2",
                                        "taxDescription": "Gift Tax",
                                        "taxAmount": 0.0,
                                        "taxMinimumAmount": 0.0,
                                        "taxPercentage": 0
                                    },
                                    {
                                        "taxId": "VAT",
                                        "taxDescription": "VAT",
                                        "taxAmount": 0.0,
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
                                        "taxPercentage": 0
                                    },
                                    {
                                        "taxId": "Tax2",
                                        "taxDescription": "Gift Tax",
                                        "taxAmount": 0.0,
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
                                "feeDescription": "TM-Specific Goods and Services (Collective | GEN)",
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
                                        "taxPercentage": 0
                                    },
                                    {
                                        "taxId": "Tax2",
                                        "taxDescription": "Gift Tax",
                                        "taxAmount": 0.0,
                                        "taxMinimumAmount": 0.0,
                                        "taxPercentage": 0
                                    },
                                    {
                                        "taxId": "VAT",
                                        "taxDescription": "VAT",
                                        "taxAmount": 0.0,
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
                                        "taxDescription": "VAT",
                                        "taxAmount": 0.0,
                                        "taxMinimumAmount": 0.0,
                                        "taxPercentage": 0
                                    },
                                    {
                                        "taxId": "Tax2",
                                        "taxDescription": "Gift Tax",
                                        "taxAmount": 0.0,
                                        "taxMinimumAmount": 0.0,
                                        "taxPercentage": 0
                                    },
                                    {
                                        "taxId": "Tax4",
                                        "taxDescription": "GST",
                                        "taxAmount": 0.0,
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
                                        "taxAmount": 0.0,
                                        "taxMinimumAmount": 0.0,
                                        "taxPercentage": 0
                                    },
                                    {
                                        "taxId": "VAT",
                                        "taxDescription": "VAT",
                                        "taxAmount": 0.0,
                                        "taxMinimumAmount": 0.0,
                                        "taxPercentage": 0
                                    },
                                    {
                                        "taxId": "Tax4",
                                        "taxDescription": "GST",
                                        "taxAmount": 0.0,
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
                                        "taxAmount": 0.0,
                                        "taxMinimumAmount": 0.0,
                                        "taxPercentage": 0
                                    },
                                    {
                                        "taxId": "VAT",
                                        "taxDescription": "VAT",
                                        "taxAmount": 0.0,
                                        "taxMinimumAmount": 0.0,
                                        "taxPercentage": 0
                                    },
                                    {
                                        "taxId": "Tax4",
                                        "taxDescription": "GST",
                                        "taxAmount": 0.0,
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
                                        "taxPercentage": 0
                                    },
                                    {
                                        "taxId": "Tax2",
                                        "taxDescription": "Gift Tax",
                                        "taxAmount": 0.0,
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
                                        "taxAmount": 0.0,
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
                                        "taxPercentage": 0
                                    },
                                    {
                                        "taxId": "Tax2",
                                        "taxDescription": "Gift Tax",
                                        "taxAmount": 0.0,
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
                                        "taxPercentage": 0
                                    },
                                    {
                                        "taxId": "Tax2",
                                        "taxDescription": "Gift Tax",
                                        "taxAmount": 0.0,
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
                                "feeId": "019",
                                "feeCategory": "maintenance fee",
                                "feeTypeCode": "REG",
                                "feeDescription": "UD-Regular Fee (POA | ABT | ROL| DOC | EXP)",
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
                                        "taxPercentage": 0
                                    },
                                    {
                                        "taxId": "Tax2",
                                        "taxDescription": "Gift Tax",
                                        "taxAmount": 0.0,
                                        "taxMinimumAmount": 0.0,
                                        "taxPercentage": 0
                                    },
                                    {
                                        "taxId": "VAT",
                                        "taxDescription": "VAT",
                                        "taxAmount": 0.0,
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
                                "feeId": "057",
                                "feeCategory": "maintenance fee",
                                "feeTypeCode": "ANU",
                                "feeDescription": "Patent-Annuity (1-3)",
                                "applicablePeriod": "1-3",
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
                                        "taxAmount": 0.0,
                                        "taxMinimumAmount": 0.0,
                                        "taxPercentage": 0
                                    },
                                    {
                                        "taxId": "Tax4",
                                        "taxDescription": "GST",
                                        "taxAmount": 0.0,
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
                                "applicablePeriod": "4-6",
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
                                        "taxPercentage": 0
                                    },
                                    {
                                        "taxId": "Tax2",
                                        "taxDescription": "Gift Tax",
                                        "taxAmount": 0.0,
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
                                "applicablePeriod": "10-20",
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
                                        "taxAmount": 0.0,
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
                                "applicablePeriod": "7-9",
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
                                        "taxPercentage": 0
                                    },
                                    {
                                        "taxId": "Tax2",
                                        "taxDescription": "Gift Tax",
                                        "taxAmount": 0.0,
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
                                "applicablePeriod": "1-5",
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
                                "applicablePeriod": "6-10",
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
                                "applicablePeriod": "11-20",
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
                                        "taxAmount": 0.0,
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
                                "taxBag": [
                                    {
                                        "taxId": "Tax4",
                                        "taxDescription": "GST",
                                        "taxAmount": 0.0,
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
                                "taxBag": [
                                    {
                                        "taxId": "Tax4",
                                        "taxDescription": "GST",
                                        "taxAmount": 0.0,
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
                                "feeId": "013",
                                "feeCategory": "maintenance fee",
                                "feeTypeCode": "NFL",
                                "feeDescription": "UD-Number of affected file (CRP )",
                                "basicFeeUnitAmount": 100.0,
                                "basicFeeUnitQuantity": 1,
                                "additionalFeeUnitAmount": 50.0,
                                "additionalFeeUnitQuantity": 1,
                                "taxInclusionFeeIndicator": false,
                                "globalTaxExclusionIndicator": true,
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
                                        "taxId": "Tax4",
                                        "taxDescription": "GST",
                                        "taxAmount": 0.0,
                                        "taxMinimumAmount": 0.0,
                                        "taxPercentage": 0
                                    },
                                    {
                                        "taxId": "Tax2",
                                        "taxDescription": "Gift Tax",
                                        "taxAmount": 0.0,
                                        "taxMinimumAmount": 0.0,
                                        "taxPercentage": 0
                                    },
                                    {
                                        "taxId": "VAT",
                                        "taxDescription": "VAT",
                                        "taxAmount": 0.0,
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
                                    },
                                    {
                                        "discountScheme": {
                                            "discountCategory": "DID03",
                                            "discountDescription": "IDCard",
                                            "documentCode": "IDC"
                                        },
                                        "discountAmount": 15.0,
                                        "discountPercentage": null
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
                                        "taxPercentage": 0
                                    },
                                    {
                                        "taxId": "Tax2",
                                        "taxDescription": "Gift Tax",
                                        "taxAmount": 0.0,
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
                                "feeDescription": "UD-Regular Fee (POA | ABT | ROL| DOC | EXP)",
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
                                "userDocumentCode": "UDDOC",
                                "userDocumentCodeName": "Without Affected file",
                                "userDocumentType": "PAC",
                                "userDocumentTypeName": "Pre Application Search",
                                "documentOriginCode": "VC",
                                "documentOriginName": "St. Vincent & Grenadines",
                                "taxBag": [
                                    {
                                        "taxId": "Tax4",
                                        "taxDescription": "GST",
                                        "taxAmount": 0.0,
                                        "taxMinimumAmount": 0.0,
                                        "taxPercentage": 0
                                    },
                                    {
                                        "taxId": "Tax2",
                                        "taxDescription": "Gift Tax",
                                        "taxAmount": 0.0,
                                        "taxMinimumAmount": 0.0,
                                        "taxPercentage": 0
                                    },
                                    {
                                        "taxId": "VAT",
                                        "taxDescription": "VAT",
                                        "taxAmount": 0.0,
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
                                        "taxPercentage": 0
                                    },
                                    {
                                        "taxId": "Tax2",
                                        "taxDescription": "Gift Tax",
                                        "taxAmount": 0.0,
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
                                        "taxAmount": 0.0,
                                        "taxMinimumAmount": 0.0,
                                        "taxPercentage": 0
                                    },
                                    {
                                        "taxId": "Tax4",
                                        "taxDescription": "GST",
                                        "taxAmount": 0.0,
                                        "taxMinimumAmount": 0.0,
                                        "taxPercentage": 0
                                    },
                                    {
                                        "taxId": "VAT",
                                        "taxDescription": "VAT",
                                        "taxAmount": 0.0,
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
                                        "taxPercentage": 0
                                    },
                                    {
                                        "taxId": "Tax2",
                                        "taxDescription": "Gift Tax",
                                        "taxAmount": 0.0,
                                        "taxMinimumAmount": 0.0,
                                        "taxPercentage": 0
                                    },
                                    {
                                        "taxId": "VAT",
                                        "taxDescription": "VAT",
                                        "taxAmount": 0.0,
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
                                "feeDescription": "UD-Regular Fee (POA | ABT | ROL| DOC | EXP)",
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
                                        "taxPercentage": 0
                                    },
                                    {
                                        "taxId": "Tax2",
                                        "taxDescription": "Gift Tax",
                                        "taxAmount": 0.0,
                                        "taxMinimumAmount": 0.0,
                                        "taxPercentage": 0
                                    },
                                    {
                                        "taxId": "VAT",
                                        "taxDescription": "VAT",
                                        "taxAmount": 0.0,
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
                                "feeCategory": "maintenance fee",
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
                                "userDocumentCode": "UDGEN",
                                "userDocumentCodeName": "Other post filing request with affected file",
                                "userDocumentType": "RAM",
                                "userDocumentTypeName": "Request for Amendment /correcton",
                                "documentOriginCode": "VC",
                                "documentOriginName": "St. Vincent & Grenadines"
                            },
                            {
                                "feeId": "003",
                                "feeCategory": "maintenance fee",
                                "feeTypeCode": "NCL",
                                "feeDescription": "TM-Specific Goods and Services (Collective | GEN)",
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
                                        "taxPercentage": 0
                                    },
                                    {
                                        "taxId": "Tax2",
                                        "taxDescription": "Gift Tax",
                                        "taxAmount": 0.0,
                                        "taxMinimumAmount": 0.0,
                                        "taxPercentage": 0
                                    },
                                    {
                                        "taxId": "VAT",
                                        "taxDescription": "VAT",
                                        "taxAmount": 0.0,
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
                                        "taxAmount": 0.0,
                                        "taxMinimumAmount": 0.0,
                                        "taxPercentage": 0
                                    },
                                    {
                                        "taxId": "Tax4",
                                        "taxDescription": "GST",
                                        "taxAmount": 0.0,
                                        "taxMinimumAmount": 0.0,
                                        "taxPercentage": 0
                                    },
                                    {
                                        "taxId": "VAT",
                                        "taxDescription": "VAT",
                                        "taxAmount": 0.0,
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
                                    }
                                ]
                            },
                            {
                                "feeId": "017",
                                "feeCategory": "maintenance fee",
                                "feeTypeCode": "NFL",
                                "feeDescription": "UD-Number of affected file (NCL| GEN)",
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
                                        "taxPercentage": 0
                                    },
                                    {
                                        "taxId": "Tax2",
                                        "taxDescription": "Gift Tax",
                                        "taxAmount": 0.0,
                                        "taxMinimumAmount": 0.0,
                                        "taxPercentage": 0
                                    },
                                    {
                                        "taxId": "VAT",
                                        "taxDescription": "VAT",
                                        "taxAmount": 0.0,
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
                                "taxBag": [
                                    {
                                        "taxId": "Tax4",
                                        "taxDescription": "GST",
                                        "taxAmount": 0.0,
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
                                        "taxAmount": 0.0,
                                        "taxMinimumAmount": 0.0,
                                        "taxPercentage": 0
                                    },
                                    {
                                        "taxId": "Tax4",
                                        "taxDescription": "GST",
                                        "taxAmount": 0.0,
                                        "taxMinimumAmount": 0.0,
                                        "taxPercentage": 0
                                    },
                                    {
                                        "taxId": "VAT",
                                        "taxDescription": "VAT",
                                        "taxAmount": 0.0,
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
                                    }
                                ]
                            },
                            {
                                "feeId": "008",
                                "feeCategory": "maintenance fee",
                                "feeTypeCode": "LGC",
                                "feeDescription": "TM-Color logo",
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
                                        "taxPercentage": 0
                                    },
                                    {
                                        "taxId": "Tax2",
                                        "taxDescription": "Gift Tax",
                                        "taxAmount": 0.0,
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
                                "basicFeeUnitAmount": 50.0,
                                "basicFeeUnitQuantity": 1,
                                "additionalFeeUnitAmount": 10.0,
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
                                        "taxAmount": 0.0,
                                        "taxMinimumAmount": 0.0,
                                        "taxPercentage": 0
                                    }
                                ]
                            },
                            {
                                "feeId": "019",
                                "feeCategory": "maintenance fee",
                                "feeTypeCode": "REG",
                                "feeDescription": "UD-Regular Fee (POA | ABT | ROL| DOC | EXP)",
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
                                        "taxPercentage": 0
                                    },
                                    {
                                        "taxId": "Tax2",
                                        "taxDescription": "Gift Tax",
                                        "taxAmount": 0.0,
                                        "taxMinimumAmount": 0.0,
                                        "taxPercentage": 0
                                    },
                                    {
                                        "taxId": "VAT",
                                        "taxDescription": "VAT",
                                        "taxAmount": 0.0,
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
                                "feeId": "064",
                                "feeCategory": "maintenance fee",
                                "feeTypeCode": "NFL",
                                "feeDescription": "UD-Change of Name and Address of Stakeholders",
                                "basicFeeUnitAmount": 300.0,
                                "basicFeeUnitQuantity": 1,
                                "additionalFeeUnitAmount": 100.0,
                                "additionalFeeUnitQuantity": 1,
                                "taxInclusionFeeIndicator": false,
                                "globalTaxExclusionIndicator": false,
                                "feePayableTotalAmount": 0.0,
                                "feePayableTotalGrossAmount": 0.0,
                                "feePayableTotalDiscountAmount": 0.0,
                                "feePayableTotalTaxAmount": 0.0,
                                "userDocumentCode": "UDNAS",
                                "userDocumentCodeName": "Change of name and/or address of stakeholders",
                                "userDocumentType": "NAS",
                                "userDocumentTypeName": "Test Change of name and address of stakeholders",
                                "documentOriginCode": "VC",
                                "documentOriginName": "St. Vincent & Grenadines",
                                "taxBag": [
                                    {
                                        "taxId": "VAT",
                                        "taxDescription": "VAT",
                                        "taxAmount": 0.0,
                                        "taxMinimumAmount": 0.0,
                                        "taxPercentage": 0
                                    },
                                    {
                                        "taxId": "Tax2",
                                        "taxDescription": "Gift Tax",
                                        "taxAmount": 0.0,
                                        "taxMinimumAmount": 0.0,
                                        "taxPercentage": 0
                                    },
                                    {
                                        "taxId": "Tax4",
                                        "taxDescription": "GST",
                                        "taxAmount": 0.0,
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
                                        "discountPercentage": "12"
                                    }
                                ]
                            },
                            {
                                "feeId": "017",
                                "feeCategory": "maintenance fee",
                                "feeTypeCode": "NFL",
                                "feeDescription": "UD-Number of affected file (NCL| GEN)",
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
                                        "taxPercentage": 0
                                    },
                                    {
                                        "taxId": "Tax2",
                                        "taxDescription": "Gift Tax",
                                        "taxAmount": 0.0,
                                        "taxMinimumAmount": 0.0,
                                        "taxPercentage": 0
                                    },
                                    {
                                        "taxId": "VAT",
                                        "taxDescription": "VAT",
                                        "taxAmount": 0.0,
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
                                    }
                                ]
                            },
                            {
                                "feeId": "056",
                                "feeCategory": "maintenance fee",
                                "feeTypeCode": "NCL",
                                "feeDescription": "UD-Addition of Nice (NCL)",
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
                                        "taxPercentage": 0
                                    },
                                    {
                                        "taxId": "Tax2",
                                        "taxDescription": "Gift Tax",
                                        "taxAmount": 0.0,
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
                                "userDocumentCode": "UDOPP",
                                "userDocumentCodeName": "Opposition",
                                "userDocumentType": "NOP",
                                "userDocumentTypeName": "Notice of Opposition",
                                "documentOriginCode": "VC",
                                "documentOriginName": "St. Vincent & Grenadines",
                                "taxBag": [
                                    {
                                        "taxId": "Tax2",
                                        "taxDescription": "Gift Tax",
                                        "taxAmount": 0.0,
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
                                "feeDescription": "UD-Regular Fee (POA | ABT | ROL| DOC | EXP)",
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
                                        "taxPercentage": 0
                                    },
                                    {
                                        "taxId": "Tax2",
                                        "taxDescription": "Gift Tax",
                                        "taxAmount": 0.0,
                                        "taxMinimumAmount": 0.0,
                                        "taxPercentage": 0
                                    },
                                    {
                                        "taxId": "VAT",
                                        "taxDescription": "VAT",
                                        "taxAmount": 0.0,
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
                                "feeId": "018",
                                "feeCategory": "maintenance fee",
                                "feeTypeCode": "NFL",
                                "feeDescription": "UD-Number of affected file (RSP | POC)",
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
                                "userDocumentCode": "UDPOC",
                                "userDocumentCodeName": "Recordal of priority document",
                                "userDocumentType": "PO",
                                "userDocumentTypeName": "Test priority document",
                                "documentOriginCode": "VC",
                                "documentOriginName": "St. Vincent & Grenadines",
                                "taxBag": [
                                    {
                                        "taxId": "Tax4",
                                        "taxDescription": "GST",
                                        "taxAmount": 0.0,
                                        "taxMinimumAmount": 0.0,
                                        "taxPercentage": 0
                                    },
                                    {
                                        "taxId": "Tax2",
                                        "taxDescription": "Gift Tax",
                                        "taxAmount": 0.0,
                                        "taxMinimumAmount": 0.0,
                                        "taxPercentage": 0
                                    },
                                    {
                                        "taxId": "VAT",
                                        "taxDescription": "VAT",
                                        "taxAmount": 0.0,
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
                                        "discountPercentage": "10"
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
                                        "taxAmount": 0.0,
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
                                "basicFeeUnitAmount": 200.0,
                                "basicFeeUnitQuantity": 1,
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
                                "userDocumentType": "PUB",
                                "userDocumentTypeName": "Special Publication Request",
                                "documentOriginCode": "VC",
                                "documentOriginName": "St. Vincent & Grenadines",
                                "taxBag": [
                                    {
                                        "taxId": "Tax4",
                                        "taxDescription": "GST",
                                        "taxAmount": 0.0,
                                        "taxMinimumAmount": 0.0,
                                        "taxPercentage": 0
                                    },
                                    {
                                        "taxId": "Tax2",
                                        "taxDescription": "Gift Tax",
                                        "taxAmount": 0.0,
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
                                "feeId": "018",
                                "feeCategory": "maintenance fee",
                                "feeTypeCode": "NFL",
                                "feeDescription": "UD-Number of affected file (RSP | POC)",
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
                                "documentOriginName": "St. Vincent & Grenadines",
                                "taxBag": [
                                    {
                                        "taxId": "Tax4",
                                        "taxDescription": "GST",
                                        "taxAmount": 0.0,
                                        "taxMinimumAmount": 0.0,
                                        "taxPercentage": 0
                                    },
                                    {
                                        "taxId": "Tax2",
                                        "taxDescription": "Gift Tax",
                                        "taxAmount": 0.0,
                                        "taxMinimumAmount": 0.0,
                                        "taxPercentage": 0
                                    },
                                    {
                                        "taxId": "VAT",
                                        "taxDescription": "VAT",
                                        "taxAmount": 0.0,
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
                                        "discountPercentage": "10"
                                    }
                                ]
                            },
                            {
                                "feeId": "018",
                                "feeCategory": "maintenance fee",
                                "feeTypeCode": "NFL",
                                "feeDescription": "UD-Number of affected file (RSP | POC)",
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
                                "documentOriginName": "St. Vincent & Grenadines",
                                "taxBag": [
                                    {
                                        "taxId": "Tax4",
                                        "taxDescription": "GST",
                                        "taxAmount": 0.0,
                                        "taxMinimumAmount": 0.0,
                                        "taxPercentage": 0
                                    },
                                    {
                                        "taxId": "Tax2",
                                        "taxDescription": "Gift Tax",
                                        "taxAmount": 0.0,
                                        "taxMinimumAmount": 0.0,
                                        "taxPercentage": 0
                                    },
                                    {
                                        "taxId": "VAT",
                                        "taxDescription": "VAT",
                                        "taxAmount": 0.0,
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
                                        "discountPercentage": "10"
                                    }
                                ]
                            }
                        ]
                    }
                ]
            }
        }
        else if (dataType === "location") {
            return [
                {
                    "documentOriginCode": "VC",
                    "documentOriginName": "St. Vincent & Grenadines",
                    "efilingIndicator": false,
                    "backfileIndicator": false,
                    "allowReceptionIndicator": false
                },
                {
                    "documentOriginCode": "BF",
                    "documentOriginName": "Back-File",
                    "efilingIndicator": false,
                    "backfileIndicator": false,
                    "allowReceptionIndicator": false
                },
                {
                    "documentOriginCode": "TB",
                    "documentOriginName": "Test Back File",
                    "efilingIndicator": false,
                    "backfileIndicator": false,
                    "allowReceptionIndicator": false
                },
                {
                    "documentOriginCode": "B1",
                    "documentOriginName": "Back-File 1",
                    "efilingIndicator": false,
                    "backfileIndicator": true,
                    "allowReceptionIndicator": false
                },
                {
                    "documentOriginCode": "V2",
                    "documentOriginName": "St. Vincent & Grenadines (Tax)",
                    "efilingIndicator": false,
                    "backfileIndicator": false,
                    "allowReceptionIndicator": false
                },
                {
                    "documentOriginCode": "E",
                    "documentOriginName": "Efiling",
                    "efilingIndicator": true,
                    "backfileIndicator": false,
                    "allowReceptionIndicator": false
                },
                {
                    "documentOriginCode": "V3",
                    "documentOriginName": "VC New",
                    "efilingIndicator": false,
                    "backfileIndicator": false,
                    "allowReceptionIndicator": false
                }
            ]
        }

    }
};