import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, RouterStateSnapshot, UrlTree } from '@angular/router';
import { RouterExtensions } from '@nativescript/angular';
import { ApplicationSettings } from '@nativescript/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { AccountService } from '../../account/account.service';
import { LoginResponse } from '../models/login-response';
import { GlobalService } from './global.service';
import { HttpService } from './http.service';

@Injectable({
    providedIn: "root"
})
export class AuthGuard implements CanActivate {
    expiryDuration: number;
    startDateInSeconds: number;
    currentDateInSeconds: number;
    success: boolean = false;


    constructor(private accountService: AccountService, private httpService: HttpService, private globalService: GlobalService, private routerExtensions: RouterExtensions) {
    }

    canActivate() {
        this.expiryDuration = this.globalService.getTokenExpiryDuration();
        this.startDateInSeconds = this.globalService.getTokenStartDate();
        this.currentDateInSeconds = new Date().getTime() / 1000;
        if (this.globalService.getIsKeepLogged()) {
            if (this.expiryDuration + this.startDateInSeconds > this.currentDateInSeconds) {
                this.globalService.isLoggedIn = true;
                if (this.globalService.getEthraiTenant()) {
                    this.globalService.isEthrai = true;
                } else {
                    this.globalService.isEthrai = false;
                    this.httpService.apiURL = "https://" + this.globalService.getTenantDomain() + ".ethrai.sa/api/";
                }
                // Fetch user profile at app launch for keep-logged-in users
                this.fetchUserProfile();
                return true;

            } else {
                this.routerExtensions.navigate(["/splash"]);
                return false;
                //     console.log("check refresh token///////////////////////////");
                //   if(ApplicationSettings.hasKey('refreshToken')){
                //     console.log("refresh token exists///////////////////////////");

                //      this.refreshToken();

                //     if(this.success){
                //         console.log("refresh token succeed///////////////////////////");
                //         if(this.globalService.getEthraiTenant()){
                //             this.globalService.isEthrai=true;
                //         }else{
                //             this.httpService.apiURL="https://"+this.globalService.getTenantDomain()+".ethrai.sa/api/";
                //             this.globalService.isEthrai=false;
                //         }
                //         return true;
                //     }
                //   }

            }
        } else {
            console.log("don't keep me");
            this.globalService.setToken("")
            this.globalService.isLoggedIn = false;
            this.globalService.setIsKeepLogged(false)
            this.httpService.apiURL = environment.API_URL;
            this.globalService.setUserProfile(null);
            this.routerExtensions.navigate(["/splash"]);
            return false
        }
    }

    refreshToken() {
        return this.accountService.refreshToken(this.globalService.getRefreshToken()).toPromise().then(
            response => {
                let result = response as LoginResponse
                this.success = result.success;
                if (result.success) {
                    this.globalService.setToken(result.extraData.access_token);
                    this.globalService.setTokenExpiryDuration(result.extraData.expires_in);
                    this.globalService.setTokenStartDate();
                    this.globalService.setRefreshToken(result.extraData.refresh_token);
                    return true;
                } else {
                    return false;
                }
            },
            error => {
                return false;
            }
        )
    }

    fetchUserProfile() {
        this.accountService.getUserProfile().subscribe(
            response => {
                this.globalService.setUserProfile(response as any);
            },
            error => {
                console.error('Failed to fetch user profile at launch:', error);
            }
        );
        // Also fetch current tenant for debugging
        this.fetchCurrentTenant();
    }

    fetchCurrentTenant() {
        this.accountService.getCurrentTenant().subscribe(
            response => {
                console.log('📍 [AuthGuard] Current Tenant:', JSON.stringify(response));
            },
            error => {
                console.error('Failed to fetch current tenant at launch:', error);
            }
        );
    }
}