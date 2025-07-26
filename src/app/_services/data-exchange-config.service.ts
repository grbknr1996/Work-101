import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { fetchAuthSession } from "aws-amplify/auth";
import { catchError, from, map, Observable, switchMap, throwError } from "rxjs";
import { environment } from "src/environments/environment";
import { AuthService } from "./auth.service";

@Injectable({
    providedIn: 'root',
})
export class DataExchangeConfigService {

    constructor(private http: HttpClient, private auth: AuthService) { }

    token: string;

    getDataExchangeData(requesterClientId: string, ipCategory: string, originatingOfficeCode: string): Observable<any> {
        // return this.auth.getEncodedTokens().pipe(
        //     switchMap(token => {
        //         console.info("Access Token: ", token);
        //         return this.http.get(`${environment.autoCompleteApi}distribution-exclusion?requesterClientId=${requesterClientId}&ipCategory=${ipCategory}&originatingOfficeCode=${originatingOfficeCode}`, {
        //             headers: { Authorization: `Bearer ${token.accessToken}` }
        //         });
        //     })
        // );
        // this.http.get(`${environment.autoCompleteApi}distribution-exclusion?Recipient_ClientID=${requesterClientId}&ipCategory=${ipCategory}&originatingOfficeCode=${originatingOfficeCode}`, {
        //     headers: { Authorization: `Bearer ${accessToken}` }
        // });
        return this.http.get('/assets/data/data-exchange.json');

    }

    postDataExchangeData(data: any): Observable<any> {
        console.log("Post Data: ", data);
        return this.http.post('/images/dog.jpg', data);
    }

    putDataExchangeData() {
        this.http.get('/images/dog.jpg', { responseType: 'arraybuffer' }).subscribe(buffer => {
            console.log('The image is ' + buffer.byteLength + ' bytes large');
        });
    }

}