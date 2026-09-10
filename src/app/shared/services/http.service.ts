import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../../../environments/environment';
import { GlobalService } from './global.service';

@Injectable({
    providedIn: 'root',
})
export class HttpService {

    public apiURL: string;

    constructor(private http: HttpClient, private globalService: GlobalService) {
        this.apiURL = environment.API_URL;
    }
    get(url) {
        return this.http.get(
            url
        );
    }
    getRequest(url) {
        return this.http.get(
            this.apiURL + url

        );
    }
    httpOptions = {
        headers: new HttpHeaders({
            'Content-Type': 'application/json',
            Authorization: 'my-auth-token'
        })
    };

    postRequest(url, body) {
        return this.http.post(
            this.apiURL + url,
            body,
            {
                headers: new HttpHeaders({
                    'Content-Type': 'application/json',
                })
            }
        );
    }

    /**
     * POST without auth, reading body as text then JSON-parsing.
     * Needed when backend returns JSON with a non-json Content-Type (body becomes null otherwise).
     */
    postRequestParsed(url, body): Observable<any> {
        return this.http.post(
            this.apiURL + url,
            body,
            {
                headers: new HttpHeaders({
                    'Content-Type': 'application/json',
                }),
                responseType: 'text',
                observe: 'body'
            }
        ).pipe(map(text => this.parseJsonBody(text)));
    }

    postAuthRequest(url, body) {
        return this.http.post(
            this.apiURL + url,
            body,
            {
                headers: new HttpHeaders({
                    'Content-Type': 'application/json',
                    Authorization: "Bearer " + this.globalService.getToken()
                })
            }
        );
    }

    /**
     * Authenticated POST with text→JSON parsing (same Content-Type issue as postRequestParsed).
     */
    postAuthRequestParsed(url, body): Observable<any> {
        return this.http.post(
            this.apiURL + url,
            body,
            {
                headers: new HttpHeaders({
                    'Content-Type': 'application/json',
                    Authorization: "Bearer " + this.globalService.getToken()
                }),
                responseType: 'text',
                observe: 'body'
            }
        ).pipe(map(text => this.parseJsonBody(text)));
    }

    postAuthMultipart(url, body) {
        return this.http.post(
            this.apiURL + url,
            body,
            {
                headers: new HttpHeaders({
                    Authorization: "Bearer " + this.globalService.getToken()
                })
            }
        );
    }

    getAuthRequest(url) {
        return this.http.get(
            this.apiURL + url,
            {
                headers: new HttpHeaders({
                    Authorization: "Bearer " + this.globalService.getToken()
                })
            }
        );
    }

    private parseJsonBody(text: any): any {
        if (text == null || text === '') {
            return { success: true };
        }
        if (typeof text !== 'string') {
            return text;
        }
        try {
            return JSON.parse(text);
        } catch {
            return { success: true, raw: text };
        }
    }
}
