import { Injectable } from '@angular/core';
import { LoginPayload } from '../shared/models/login-payload';
import { HttpService } from '../shared/services/http.service';
import { SignUpPayload } from '../shared/models/signUp-payload';
// import { InAppBrowser } from 'nativescript-inappbrowser';
import { Utils } from '@nativescript/core';
import { forkJoin, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';



@Injectable({
    providedIn: 'root',
})
export class AccountService {


    constructor(private httpService: HttpService) {

    }

    login(body: LoginPayload) {
        return this.httpService.postRequest('Account/login/mobile', body);
    }

    refreshToken(token: string) {
        return this.httpService.postAuthRequest('Account/token/refresh/' + token, {});
    }

    register(body: SignUpPayload) {
        return this.httpService.postRequest('Account/register', body);

    }

    getAllNationalities() {
        return this.httpService.getRequest('Lookups/nationalities');
    }
    getAllTags() {
        return this.httpService.getRequest('Lookups/tags');
    }

    forgetPassword(body) {
        return this.httpService.postRequest('Account/forgotpassword', body);
    }
    getCountryCode() {
        return this.httpService.get('https://api.country.is/')
    }
    getUserProfile() {
        return forkJoin({
            profile: this.httpService.getAuthRequest('Profile/full'),
            certificates: this.httpService.getAuthRequest('UserData/certs').pipe(
                catchError(() => of([]))
            )
        }).pipe(
            map(({ profile, certificates }) => {
                const userProfile = (profile as any) || {};
                userProfile.certificates = Array.isArray(certificates) ? certificates : [];
                return userProfile;
            })
        );
    }
    getCurrentTenant() {
        return this.httpService.getRequest('Tenants/current');
    }
    updateProfile(body) {
        return this.httpService.postAuthRequest('Profile/full', body);
    }
    getEthraiSocialLinks() {
        return this.httpService.getAuthRequest('Lookups/sociallinks');
    }
    getStatistics() {
        return this.httpService.getAuthRequest('UserData/courses/enrolled');
    }
    BePartner() {
        return this.httpService.getAuthRequest('lookups/pageParts/Partner')
    }
    aboutEthrai() {
        return this.httpService.getAuthRequest('');
    }
    changePassword(body) {
        return this.httpService.postAuthRequest('Account/changepassword', body);
    }
    getProfilePrefrences() {
        return this.httpService.getAuthRequest('Profile/preferences');
    }
    setProfilePrefrences(body) {
        return this.httpService.postAuthRequest('Profile/preferences/false', body)
    }
    getDurations() {
        return this.httpService.getAuthRequest('Courses/durations');
    }
    getGenders() {
        return this.httpService.getAuthRequest('Lookups/genders')
    }
    getPhoneCodes() {
        return this.httpService.getAuthRequest('Lookups/nationalities')
    }
    resendConfirmMail(payload) {
        return this.httpService.postAuthRequest('Account/email/confirm/resend', payload)
    }
    getCompetences() {
        return this.httpService.getAuthRequest('UserData/userSkills')

    }
    uploadProfileImage(payload) {
        return this.httpService.postAuthRequest('Media/base64', payload)
    }

    handleIamChecking(data) {
        return this.httpService.postRequest('Account/HandleIamChecking', { dataEncoded: data })
    }
    async openIamWindow(url: string) {
        
            Utils.openUrl(url);
            
    }
}
