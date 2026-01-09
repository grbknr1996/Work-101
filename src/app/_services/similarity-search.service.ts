import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { env } from 'process';
import { catchError, map, Observable, of } from 'rxjs';
import { environment } from 'src/environments/environment';

export interface TrademarkData {
    id: string;
    markName: string;
    regNumber: string;
    applicant: string;
    classes: string;
    status: string;
    examiner: string;
    applicationDate: string;
}

@Injectable({
    providedIn: 'root',
})
export class TrademarkSimilaritySearchService {
    private baseUrl = 'http://localhost:8000';

    constructor(private http: HttpClient) {}

    private handleError(operation = 'operation', fallback: any = []) {
        return (error: any) => {
            console.error(`${operation} failed:`, error);
            return of(fallback);
        };
    }

    searchTrademarks(query: string, searchModes: string[] = ['Exact']): Observable<any[]> {
        console.log("the response data is",searchModes);
        
        if (!query || !query.trim()) {
            return of([]); // no query -> empty result
        }

        //const url = `${this.baseUrl}/search/registry`;
        const url = `${environment.similaritySearch}/search/registry`;
        
        const body = {
            query: query.trim(),
            search_modes: Array.isArray(searchModes[0]) ? searchModes[0] : searchModes
        };

        const headers = new HttpHeaders({ 'Content-Type': 'application/json' });

        return this.http.post<any[]>(url, body, { headers }).pipe(
            map((items: any[]) => {
                if (!Array.isArray(items)) return [];
                return items.map((item, index) => ({ //using index as fallback id, will be removed when backend is fixed
                    docId: item.docId ?? (item.id ?? `IDX-${index + 1}`),
                    markName: item.company_name ?? item.company_name ?? 'NA',
                    regNumber: item.regNumber ?? item.registrationNumber ?? 'TM-2025-104582',
                    classes: Array.isArray(item.classes) ? item.classes : (item.classes ? [String(item.classes)] : ['29', '30']),
                    status: item.status ?? 'Registered',
                    applicantName: item.applicantName ?? item.applicant ?? 'PT Rabbag Indo Kuliner',
                    filingDate: item.filingDate ?? item.applicationDate ?? '2025.11.28',
                    filiningNumber: item.filiningNumber ?? item.filingNumber ?? 'ID20230512911',
                    logoUrl: item.logoUrl ?? item.imageUrl ?? 'https://asean-ipregister.wipo.net/wopublish-search/service/images/0aLPP2osudojqiPv847dDQdmRZXEBvfWYW-dfzRPQNCTMZZoFCmN98PjasDK0jTrXyTBEQv1gvLrt5zpyig6WHPWvvb9pWm_R4XGcngbc0E?noLogo=true&disclaimer=Machine',
                    goodsAndServices: item.goodsAndServices ?? 'NA',
                    _raw: item
                }));
            }),
            catchError(this.handleError('searchTrademarks', []))
        );
    }

    /**
     * Search trademarks by uploading an image (logo search)
     * @param imageFile - The image file to upload
     * @returns Observable with search results and updated logoUrl from backend
     */
    searchByImage(imageFile: File): Observable<any[]> {
        if (!imageFile) {
            console.warn('No image file provided');
            return of([]);
        }

        //const url = `${this.baseUrl}/search/image`;
        const url = `${environment.similaritySearch}/search/image`;
        
        const formData = new FormData();
        formData.append('file', imageFile, imageFile.name);

        return this.http.post<any[]>(url, formData).pipe(
        map((results: any[]) => {
            if (!Array.isArray(results)) return [];

            return results.map((item, index) => {
                const rawPath = item.image_url ?? item.imagePath ?? 'NA';
                return {
                    filename: item.filename ?? 'NA',
                    docId: `IDX-${index + 1}`,
                    markName: item.filename ? item.filename.split('.')[0] : 'Maison Gourmet',
                    regNumber: 'TM-2025-104582',
                    classes: '29, 30',
                    status: 'Registered',
                    applicantName: 'PT Rabbag Indo Kuliner',
                    filingDate: '2025.11.28',
                    filingNumber: 'ID20230512911',
                    logoUrl: rawPath,
                    matchType: 'Image Match',
                    score: item.similarity_score ?? null,
                    _raw: item
                };
            });
        }),
            catchError(this.handleError('searchByImage', []))
        );
    }

    searchByDescription(description: string): Observable<any[]> {
        if (!description || !description.trim()) return of([]);
        const url = `${environment.similaritySearch}/search/text-to-image`;
        const body = { description: description.trim() };
        const headers = new HttpHeaders({ 'Content-Type': 'application/json' });

        return this.http.post<any[]>(url, body, { headers }).pipe(
            map((results: any[]) => this.mapImageResults(results)),
            catchError(this.handleError('searchByDescription', []))
        );
    }

    private mapImageResults(results: any[]): any[] {
        if (!Array.isArray(results)) return [];
        return results.map((item, index) => {
            const rawPath = item.image_url ?? item.imagePath ?? 'NA';
            return {
                filename: item.filename ?? 'NA',
                docId: `IDX-${index + 1}`,
                markName: item.filename ? item.filename.split('.')[0] : 'Maison Gourmet',
                regNumber: 'TM-2025-104582',
                classes: '29, 30',
                status: 'Registered',
                applicantName: 'PT Rabbag Indo Kuliner',
                filingDate: '2025.11.28',
                filingNumber: 'ID20230512911',
                logoUrl: rawPath,
                matchType: 'Image Match',
                score: item.similarity_score ?? null,
                _raw: item
            };
        });
    }

    analyze(payload: { query_content: string; result_image_path?: string; mode: 'image' | 'text' }): Observable<string> {
        if (!payload || !payload.query_content) {
            return of('');
        }
        console.log('Analyze payload:', payload);


        const url = `${environment.similaritySearch}/analyze`;
        const headers = new HttpHeaders({ 'Content-Type': 'application/json' });

        return this.http.post<any>(url, payload, { headers }).pipe(
            map(res => {
                if (!res) return '';
                if (typeof res === 'string') return res;
                return res.analys ?? res.analysis ?? res.result ?? '';
            }),
            catchError(this.handleError('analyze', ''))
        );
    }

    getTrademarks(): Observable<any> {
        return of([
            {
                "docId": "TM268532639717",
                "markName": "APPLE",
                "regNumber": "TM-2025-104582",
                "classes": ["30"],
                "status": "Registered",
                "applicantName": "Ahlai Tahir Saleh Bin",
                "filingDate": "2025.11.28",
                "filiningNumber": "TH20255624897",
                "logoUrl": "https://asean-ipregister.wipo.net/wopublish-search/service/images/0aLPP2osudojqiPv847dDQdmRZXEBvfWYW-dfzRPQNCTMZZoFCmN98PjasDK0jTrXyTBEQv1gvLrt5zpyig6WHPWvvb9pWm_R4XGcngbc0E?noLogo=true&disclaimer=Machine",
                "goodsAndServices": "Class 9: includes mainly apparatus and instruments for scientific or research purposes, audiovisual and information technology equipment, as well as safety and life-saving equipment."
            },
            {
                "docId": "TM2025062447",
                "markName": "APPLE",
                "regNumber": "TM-2025-874522",
                "classes": ["9"],
                "status": "Registered",
                "applicantName": "WANGA HOSPITALITY SDN BHD",
                "filingDate": "2025.11.26",
                "filiningNumber": "TH2025062447",
                "logoUrl": "https://asean-ipregister.wipo.net/wopublish-search/service/images/0aLPP2osudojqiPv847dDQdmRZXEBvfWYW-dfzRPQNCTMZZoFCmN98PjasDK0jTrXyTBEQv1gvLrt5zpyig6WHPWvvb9pWm_R4XGcngbc0E?noLogo=true&disclaimer=Machine"

            },
            {
                "docId": "ID20230512796",
                "markName": "ROKEZ",
                "regNumber": "TM-2025-553920",
                "classes": ["30"],
                "status": "Refused",
                "applicantName": "Dan DM Agustin",
                "filingDate": "2025.11.25",
                "filiningNumber": "ID20230512796",
                "logoUrl": "https://asean-ipregister.wipo.net/wopublish-search/service/images/0aLPP2osudojqiPv847dDQdmRZXEBvfWYW-dfzRPQNCTMZZoFCmN98PjasDK0jTrXyTBEQv1gvLrt5zpyig6WHPWvvb9pWm_R4XGcngbc0E?noLogo=true&disclaimer=Machine"
            },
            {
                "docId": "ID20230517774",
                "markName": "COPICO",
                "regNumber": "TM-2025-125874",
                "classes": ["30"],
                "status": "Refused",
                "applicantName": "QKY JRM Tbk",
                "filingDate": "2025.11.21",
                "filiningNumber": "ID20230517774",
                "logoUrl": "https://asean-ipregister.wipo.net/wopublish-search/service/images/0aLPP2osudojqiPv847dDQdmRZXEBvfWYW-dfzRPQNCTMZZoFCmN98PjasDK0jTrXyTBEQv1gvLrt5zpyig6WHPWvvb9pWm_R4XGcngbc0E?noLogo=true&disclaimer=Machine"
            },
            {
                "docId": "ID20230512605",
                "markName": "Craft Mix",
                "regNumber": "TM-2025-965441",
                "classes": ["30"],
                "status": "Registered",
                "applicantName": "PT Rabbag Indo Kuliner",
                "filingDate": "2025.11.18",
                "filiningNumber": "ID20230512896",
                "logoUrl": "https://asean-ipregister.wipo.net/wopublish-search/service/images/0aLPP2osudojqiPv847dDQdmRZXEBvfWYW-dfzRPQNCTMZZoFCmN98PjasDK0jTrXyTBEQv1gvLrt5zpyig6WHPWvvb9pWm_R4XGcngbc0E?noLogo=true&disclaimer=Machine"
            },
            {
                "docId": "ID20230512911",
                "markName": "Maison Gourmet",
                "regNumber": "TM-2025-774201",
                "classes": ["30"],
                "status": "Under Review",
                "applicantName": "PT Rabbag Indo Kuliner",
                "filingDate": "2025.11.18",
                "filiningNumber": "ID20230512911",
                "logoUrl": "https://asean-ipregister.wipo.net/wopublish-search/service/images/0aLPP2osudojqiPv847dDQdmRZXEBvfWYW-dfzRPQNCTMZZoFCmN98PjasDK0jTrXyTBEQv1gvLrt5zpyig6WHPWvvb9pWm_R4XGcngbc0E?noLogo=true&disclaimer=Machine"
            },
            {
                "docId": "ID20230512870",
                "markName": "CLING APPLE FANTASY dan Lukisan",
                "regNumber": "TM-2025-774022",
                "classes": ["30"],
                "status": "Pending",
                "applicantName": "PT SKAMP Maju Utama",
                "filingDate": "2025.11.18",
                "filiningNumber": "ID20230512870",
                "logoUrl": "https://asean-ipregister.wipo.net/wopublish-search/service/images/0aLPP2osudojqiPv847dDQdmRZXEBvfWYW-dfzRPQNCTMZZoFCmN98PjasDK0jTrXyTBEQv1gvLrt5zpyig6WHPWvvb9pWm_R4XGcngbc0E?noLogo=true&disclaimer=Machine"
            },
            {
                "docId": "ID20230512895",
                "markName": "Craft Dairy",
                "regNumber": "TM-2025-559812",
                "classes": ["30"],
                "status": "Refused",
                "applicantName": "PT Rabbag Indo Kuliner",
                "filingDate": "2025.11.18",
                "filiningNumber": "ID20230512895",
                "logoUrl": "https://asean-ipregister.wipo.net/wopublish-search/service/images/0aLPP2osudojqiPv847dDQdmRZXEBvfWYW-dfzRPQNCTMZZoFCmN98PjasDK0jTrXyTBEQv1gvLrt5zpyig6WHPWvvb9pWm_R4XGcngbc0E?noLogo=true&disclaimer=Machine"
            },
            {
                "docId": "ID20230512804",
                "markName": "SIDA MULUK",
                "regNumber": "TM-2025-774966",
                "classes": ["30"],
                "status": "Pending",
                "applicantName": "DHS SUSANTO",
                "filingDate": "2025.11.18",
                "filiningNumber": "ID20230512804",
                "logoUrl": "https://asean-ipregister.wipo.net/wopublish-search/service/images/0aLPP2osudojqiPv847dDQdmRZXEBvfWYW-dfzRPQNCTMZZoFCmN98PjasDK0jTrXyTBEQv1gvLrt5zpyig6WHPWvvb9pWm_R4XGcngbc0E?noLogo=true&disclaimer=Machine"
            },
            {
                "docId": "ID20230512969",
                "markName": "UNIBIS WAJEN GANDUM",
                "regNumber": "TM-2025-660201",
                "classes": ["30"],
                "status": "Under Review",
                "applicantName": "PT UNIVERSAL INDOFOOD PRODUCT",
                "filingDate": "2025.11.18",
                "filiningNumber": "ID20230512969",
                "logoUrl": "https://asean-ipregister.wipo.net/wopublish-search/service/images/0aLPP2osudojqiPv847dDQdmRZXEBvfWYW-dfzRPQNCTMZZoFCmN98PjasDK0jTrXyTBEQv1gvLrt5zpyig6WHPWvvb9pWm_R4XGcngbc0E?noLogo=true&disclaimer=Machine"
            },
            {
                "docId": "ID20230512801",
                "markName": "Craft Baker",
                "regNumber": "TM-2025-441256",
                "classes": ["30"],
                "status": "Registered",
                "applicantName": "PT Rabbag Indo Kuliner",
                "filingDate": "2025.11.17",
                "filiningNumber": "ID20230512801",
                "logoUrl": "https://asean-ipregister.wipo.net/wopublish-search/service/images/0aLPP2osudojqiPv847dDQdmRZXEBvfWYW-dfzRPQNCTMZZoFCmN98PjasDK0jTrXyTBEQv1gvLrt5zpyig6WHPWvvb9pWm_R4XGcngbc0E?noLogo=true&disclaimer=Machine"
            },
            {
                "docId": "ID20230512847",
                "markName": "NutriJell Go!",
                "regNumber": "TM-2025-889502",
                "classes": ["30"],
                "status": "Pending",
                "applicantName": "PT Forisa Nusapersada",
                "filingDate": "2025.11.17",
                "filiningNumber": "ID20230512847",
                "logoUrl": "https://asean-ipregister.wipo.net/wopublish-search/service/images/0aLPP2osudojqiPv847dDQdmRZXEBvfWYW-dfzRPQNCTMZZoFCmN98PjasDK0jTrXyTBEQv1gvLrt5zpyig6WHPWvvb9pWm_R4XGcngbc0E?noLogo=true&disclaimer=Machine"
            },
            {
                "docId": "ID20230512784",
                "markName": "OVENBI",
                "regNumber": "TM-2025-774220",
                "classes": ["30"],
                "status": "Refused",
                "applicantName": "Iza Agustyarko",
                "filingDate": "2025.11.14",
                "filiningNumber": "ID20230512784",
                "logoUrl": "https://asean-ipregister.wipo.net/wopublish-search/service/images/0aLPP2osudojqiPv847dDQdmRZXEBvfWYW-dfzRPQNCTMZZoFCmN98PjasDK0jTrXyTBEQv1gvLrt5zpyig6WHPWvvb9pWm_R4XGcngbc0E?noLogo=true&disclaimer=Machine"
            },
            {
                "docId": "ID20230512813",
                "markName": "CLING APPLE FRESH",
                "regNumber": "TM-2025-884410",
                "classes": ["30"],
                "status": "Refused",
                "applicantName": "PT SKAMP Maju Utama",
                "filingDate": "2025.11.14",
                "filiningNumber": "ID20230512813",
                "logoUrl": "https://asean-ipregister.wipo.net/wopublish-search/service/images/0aLPP2osudojqiPv847dDQdmRZXEBvfWYW-dfzRPQNCTMZZoFCmN98PjasDK0jTrXyTBEQv1gvLrt5zpyig6WHPWvvb9pWm_R4XGcngbc0E?noLogo=true&disclaimer=Machine"
            },
            {
                "docId": "ID20230512828",
                "markName": "Top Ice Mocca Freezy",
                "regNumber": "TM-2025-110023",
                "classes": ["30"],
                "status": "Registered",
                "applicantName": "PT Forisa Nusapersada",
                "filingDate": "2025.11.11",
                "filiningNumber": "ID20230512828",
                "logoUrl": "https://asean-ipregister.wipo.net/wopublish-search/service/images/0aLPP2osudojqiPv847dDQdmRZXEBvfWYW-dfzRPQNCTMZZoFCmN98PjasDK0jTrXyTBEQv1gvLrt5zpyig6WHPWvvb9pWm_R4XGcngbc0E?noLogo=true&disclaimer=Machine"
            },
            {
                "docId": "ID20230512831",
                "markName": "Top Ice Mocca Freezy",
                "regNumber": "TM-2025-440122",
                "classes": ["30"],
                "status": "Refused",
                "applicantName": "PT Forisa Nusapersada",
                "filingDate": "2025.11.11",
                "filiningNumber": "ID20230512831",
                "logoUrl": "https://asean-ipregister.wipo.net/wopublish-search/service/images/0aLPP2osudojqiPv847dDQdmRZXEBvfWYW-dfzRPQNCTMZZoFCmN98PjasDK0jTrXyTBEQv1gvLrt5zpyig6WHPWvvb9pWm_R4XGcngbc0E?noLogo=true&disclaimer=Machine"
            },
            {
                "docId": "PH202500251532",
                "markName": "GINA",
                "regNumber": "TM-2025-990510",
                "classes": ["30", "32", "29"],
                "status": "Registered",
                "applicantName": "CEMNACO, INC",
                "filingDate": "2025.11.11",
                "filiningNumber": "PH202500251532",
                "logoUrl": "https://asean-ipregister.wipo.net/wopublish-search/service/images/0aLPP2osudojqiPv847dDQdmRZXEBvfWYW-dfzRPQNCTMZZoFCmN98PjasDK0jTrXyTBEQv1gvLrt5zpyig6WHPWvvb9pWm_R4XGcngbc0E?noLogo=true&disclaimer=Machine"
            },
            {
                "docId": "ID20230512870X",
                "markName": "Nutripancake",
                "regNumber": "TM-2025-778452",
                "classes": ["30"],
                "status": "Pending",
                "applicantName": "PT Forisa Nusapersada",
                "filingDate": "2025.11.11",
                "filiningNumber": "ID20230512870",
                "logoUrl": "https://asean-ipregister.wipo.net/wopublish-search/service/images/0aLPP2osudojqiPv847dDQdmRZXEBvfWYW-dfzRPQNCTMZZoFCmN98PjasDK0jTrXyTBEQv1gvLrt5zpyig6WHPWvvb9pWm_R4XGcngbc0E?noLogo=true&disclaimer=Machine"
            },
            {
                "docId": "ID20230512812",
                "markName": "Top Ice Vanilla Latte",
                "regNumber": "TM-2025-220041",
                "classes": ["30"],
                "status": "Under Review",
                "applicantName": "PT Forisa Nusapersada",
                "filingDate": "2025.11.11",
                "filiningNumber": "ID20230512812",
                "logoUrl": "https://asean-ipregister.wipo.net/wopublish-search/service/images/0aLPP2osudojqiPv847dDQdmRZXEBvfWYW-dfzRPQNCTMZZoFCmN98PjasDK0jTrXyTBEQv1gvLrt5zpyig6WHPWvvb9pWm_R4XGcngbc0E?noLogo=true&disclaimer=Machine"
            },
            {
                "docId": "ID20230512812B",
                "markName": "Top Ice Kopi Gula Aren",
                "regNumber": "TM-2025-550338",
                "classes": ["30"],
                "status": "Registered",
                "applicantName": "PT Forisa Nusapersada",
                "filingDate": "2025.11.12",
                "filiningNumber": "ID20230512812",
                "logoUrl": "https://asean-ipregister.wipo.net/wopublish-search/service/images/0aLPP2osudojqiPv847dDQdmRZXEBvfWYW-dfzRPQNCTMZZoFCmN98PjasDK0jTrXyTBEQv1gvLrt5zpyig6WHPWvvb9pWm_R4XGcngbc0E?noLogo=true&disclaimer=Machine"
            },
            {
                "docId": "ID20230512809",
                "markName": "NJ",
                "regNumber": "TM-2025-771233",
                "classes": ["30"],
                "status": "Refused",
                "applicantName": "PT Forisa Nusapersada",
                "filingDate": "2025.11.11",
                "filiningNumber": "ID20230512809",
                "logoUrl": "https://asean-ipregister.wipo.net/wopublish-search/service/images/0aLPP2osudojqiPv847dDQdmRZXEBvfWYW-dfzRPQNCTMZZoFCmN98PjasDK0jTrXyTBEQv1gvLrt5zpyig6WHPWvvb9pWm_R4XGcngbc0E?noLogo=true&disclaimer=Machine"
            },
            {
                "docId": "ID20230512833",
                "markName": "Nutricake Pancake",
                "regNumber": "TM-2025-991204",
                "classes": ["30"],
                "status": "Pending",
                "applicantName": "PT Forisa Nusapersada",
                "filingDate": "2025.11.11",
                "filiningNumber": "ID20230512833",
                "logoUrl": "https://asean-ipregister.wipo.net/wopublish-search/service/images/0aLPP2osudojqiPv847dDQdmRZXEBvfWYW-dfzRPQNCTMZZoFCmN98PjasDK0jTrXyTBEQv1gvLrt5zpyig6WHPWvvb9pWm_R4XGcngbc0E?noLogo=true&disclaimer=Machine"
            },
            {
                "docId": "ID20230512821",
                "markName": "Jelly NJ",
                "regNumber": "TM-2025-880412",
                "classes": ["30"],
                "status": "Refused",
                "applicantName": "PT Forisa Nusapersada",
                "filingDate": "2025.11.11",
                "filiningNumber": "ID20230512821",
                "logoUrl": "https://asean-ipregister.wipo.net/wopublish-search/service/images/0aLPP2osudojqiPv847dDQdmRZXEBvfWYW-dfzRPQNCTMZZoFCmN98PjasDK0jTrXyTBEQv1gvLrt5zpyig6WHPWvvb9pWm_R4XGcngbc0E?noLogo=true&disclaimer=Machine"
            },
            {
                "docId": "ID20230512818",
                "markName": "Top Ice Mocca Freeze",
                "regNumber": "TM-2025-550876",
                "classes": ["30"],
                "status": "Under Review",
                "applicantName": "PT Forisa Nusapersada",
                "filingDate": "2025.11.11",
                "filiningNumber": "ID20230512818",
                "logoUrl": "https://asean-ipregister.wipo.net/wopublish-search/service/images/0aLPP2osudojqiPv847dDQdmRZXEBvfWYW-dfzRPQNCTMZZoFCmN98PjasDK0jTrXyTBEQv1gvLrt5zpyig6WHPWvvb9pWm_R4XGcngbc0E?noLogo=true&disclaimer=Machine"
            },
            {
                "docId": "ID20230512807",
                "markName": "NutriJoy",
                "regNumber": "TM-2025-556799",
                "classes": ["30"],
                "status": "Registered",
                "applicantName": "PT Forisa Nusapersada",
                "filingDate": "2025.11.10",
                "filiningNumber": "ID20230512807",
                "logoUrl": "https://asean-ipregister.wipo.net/wopublish-search/service/images/0aLPP2osudojqiPv847dDQdmRZXEBvfWYW-dfzRPQNCTMZZoFCmN98PjasDK0jTrXyTBEQv1gvLrt5zpyig6WHPWvvb9pWm_R4XGcngbc0E?noLogo=true&disclaimer=Machine"
            },
            {
                "docId": "ID20230512964",
                "markName": "Fit Crunch",
                "regNumber": "TM-2025-119452",
                "classes": ["30"],
                "status": "Refused",
                "applicantName": "PT Forisa Nusapersada",
                "filingDate": "2025.11.10",
                "filiningNumber": "ID20230512964",
                "logoUrl": "https://asean-ipregister.wipo.net/wopublish-search/service/images/0aLPP2osudojqiPv847dDQdmRZXEBvfWYW-dfzRPQNCTMZZoFCmN98PjasDK0jTrXyTBEQv1gvLrt5zpyig6WHPWvvb9pWm_R4XGcngbc0E?noLogo=true&disclaimer=Machine"
            },
            {
                "docId": "ID20230512966",
                "markName": "Candy Blow",
                "regNumber": "TM-2025-337004",
                "classes": ["30"],
                "status": "Refused",
                "applicantName": "PT Forisa Nusapersada",
                "filingDate": "2025.11.10",
                "filiningNumber": "ID20230512966",
                "logoUrl": "https://asean-ipregister.wipo.net/wopublish-search/service/images/0aLPP2osudojqiPv847dDQdmRZXEBvfWYW-dfzRPQNCTMZZoFCmN98PjasDK0jTrXyTBEQv1gvLrt5zpyig6WHPWvvb9pWm_R4XGcngbc0E?noLogo=true&disclaimer=Machine"
            },
            {
                "docId": "ID20230512955",
                "markName": "Pop Ice Cube",
                "regNumber": "TM-2025-990042",
                "classes": ["30"],
                "status": "Under Review",
                "applicantName": "PT Forisa Nusapersada",
                "filingDate": "2025.11.10",
                "filiningNumber": "ID20230512955",
                "logoUrl": "https://asean-ipregister.wipo.net/wopublish-search/service/images/0aLPP2osudojqiPv847dDQdmRZXEBvfWYW-dfzRPQNCTMZZoFCmN98PjasDK0jTrXyTBEQv1gvLrt5zpyig6WHPWvvb9pWm_R4XGcngbc0E?noLogo=true&disclaimer=Machine"
            }
        ])
    }
}
