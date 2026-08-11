import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
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
}