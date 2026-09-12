import { Injectable } from '@angular/core';
import { LoginPayload } from '../shared/models/login-payload';
import { HttpService } from '../shared/services/http.service';
import { SignUpPayload } from '../shared/models/signUp-payload';
import { Utils } from '@nativescript/core';
import { forkJoin, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { buildSecureDataPayload, buildSecureLoginPayload } from '../shared/utils/aes-crypto.util';

export interface PendingLoginContext {
    usernameOrEmail: string;
    password: string;
    countryCode?: string;
    saveBiometricCredentials?: boolean;
}

@Injectable({
    providedIn: 'root',
})
export class AccountService {

    /** Temporary credentials held between secure login and OTP validation. */
    private pendingLoginContext: PendingLoginContext | null = null;

    constructor(private httpService: HttpService) {
    }

    setPendingLoginContext(context: PendingLoginContext | null) {
        this.pendingLoginContext = context;
    }

    getPendingLoginContext(): PendingLoginContext | null {
        return this.pendingLoginContext;
    }

    clearPendingLoginContext() {
        this.pendingLoginContext = null;
    }

    /**
     * Secure login: AES-encrypt credentials and POST to Account/login/secure.
     * Success without access_token means OTP verification is required.
     */
    login(body: LoginPayload) {
        const payload = buildSecureLoginPayload({
            usernameOrEmail: body.usernameOrEmail,
            password: body.password,
            countryCode: body.countryCode,
            rememberme: body.rememberme
        });
        return this.httpService.postRequest('Account/login/secure', payload);
    }

    validateOtp(emailOrNationalId: string, code: string) {
        return this.httpService.postRequest('Account/validateOtp', {
            emailOrNationalId,
            code
        });
    }

    resendOtp(emailOrNationalId: string) {
        return this.httpService.postRequest('Account/resendOtp', {
            emailOrNationalId
        });
    }

    getOtpResendTimer() {
        return this.httpService.getRequest('Account/hideresendotpbutton');
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
       // const payload = buildSecureDataPayload(body);
        return this.httpService.postRequestParsed('Account/forgotpassword', body);
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
        const payload = buildSecureDataPayload(body);
        return this.httpService.postAuthRequestParsed('Account/changepassword/secure', payload);
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
