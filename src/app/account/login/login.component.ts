import { Component, ElementRef, NgZone, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { AndroidApplication, Application, isAndroid, LoadEventData, Page, WebView } from "@nativescript/core";
import { LoginResponse } from '~/app/shared/models/login-response';
import { GlobalService } from '~/app/shared/services/global.service';
import { localize } from '@nativescript/localize'
import { RouterExtensions } from '@nativescript/angular';
import { AccountService } from '../account.service';
import { FirebaseEventService } from '../../shared/services/firebase.event.service';
import { DashboardService } from '~/app/dashboard/dashboard.service';

@Component({
    moduleId: module.id,
    selector: 'login',
    templateUrl: './login.component.html',
    styleUrls: ['./login.component.css']
})

export class LoginComponent implements OnInit, OnDestroy {
    isAndroid: boolean;
    @ViewChild('webView', { static: false }) webViewRef: ElementRef;
    showNafathWebView = false;
    constructor(private page: Page, private globalService: GlobalService,
        private firebaseEventService: FirebaseEventService,
        private accountService: AccountService,
        private routerExt: RouterExtensions, private dashboardService: DashboardService
        , private ngZone: NgZone,
    ) {
        page.actionBarHidden = true;
        this.isAndroid = isAndroid
    }
    ngOnDestroy(): void {
        if (isAndroid) {
            Application.android.off(AndroidApplication.activityBackPressedEvent, this.onBackButton);
        }
    }

    onBackButton = (args) => {
        if (this.showNafathWebView) {
            args.cancel = true;
            this.cancelNafathLogin();
        }
        else {
            args.cancel = true
        }
    }

    ngOnInit() {
        if (isAndroid) {
            Application.android.off(AndroidApplication.activityBackPressedEvent, this.onBackButton);
        }
        this.showNafathWebView = false;
        this.getUserCurrentTenant()
        this.firebaseEventService.logScreenViewedEvent(this.globalService.isLoggedIn, null, 'login', null);

    }
    getUserCurrentTenant() {
        this.accountService.getCurrentTenant().subscribe(
            response => {
                let tenant = response as any
                this.globalService.setCurrentTenant(tenant);
            })
    }

    startNafathLogin() {
        this.showNafathWebView = true;
    }

    onWebViewLoaded(args) {
        const webView: WebView = args.object;

        const iamURL = 'https://iam.ipa.edu.sa/auth/login?returnUrl=';
        const returnUrl = this.globalService.getCurrentTenant()?.currentUrl + '/api/Account/IamChecking?pId=';
        const provideID = this.globalService.getCurrentTenant()?.provideID;
        const finalURLToNav = iamURL + returnUrl + provideID;
        console.log('finalURLToNav', finalURLToNav);
        webView.src = finalURLToNav
        // webView.src = "https://ethrai.sa/iamchecking?d=sCpKgSosVJwB1jOlJNGxBtul1Viq3YTcI1hVkPDGBnE8sO1C0B7d6oauclYsAg0lHWeDBJeJUZpY%2biz4tO6%2b5LUpqXPrKm5Bu%2bJ5FXhzbWcj4g6B96qyVRaGGvcGFi6nzDl9yloPDQIaEuXOXlfpnELoWhykiljtKLBcBmDXYCKrbPAOL1QdCkgUM9wqPObj9wa%2bX7DpvuAg41n%2bVx3V9jFukYh7mnfuLWS06LefJVXv38wTIrb2uZWovf4wwmckpLLqlJVwybWhpykQAXI2028Zi5UIHSwjbH7DVTFvFC6m3gaTwjUkDK4S8iBofaq%2bxYFtofkEAYA2oFZt1lHE4nomjDNJCz%2f9MIenp7TRkZZlSRJcPDspgN1WNL9nh6r2m7K9v9wX5o2Dk%2fUaANLAQABmieWqDU2ZDMdZGxxlLPRBk0GS1tLbbbF4E9xLjtEPmvUYRxWOkIyzj6KzwelcZPKjwkB%2f6xh8SqZoBW%2bujsT2bgzIv7KsbknWALDfmHjfxBdEoZUIY1ziJI0%2bdmwWZgAbWB4xqrx2z7yneacP2ehOVOcK5frizpcnEWbS3sqalFGNksKa0Mnv17gpRuzGkfpH3NqUs13ZMPSECEjVXsv05U%2fvcDu4K%2bgEFVyT0r7ZYbb0Jztfl51%2blVxyBVHDGGqc32N2atZV5JhQjrcHwIr4taYMqX21srdY%2bYiQGaFWaz1YkPlehFck2YLRCKA28FyL0H0NkVC4jMcmcJxaeGT1WiWcDEGyBXt7%2b29Aqvzl8Js9zpjvLAfXUymjXE8WbPEUNvVVq5pmlVQbMueYk%2fMiom52SalrGctrKYyGOdB5D1OuPaTk0vCFDHJKWcr7%2fThvG2MRkq3PEICryouqUUYTZuoUvVcCqWvwDOlM74MhN1Xn4Osyvol3TClQcSIH4SGSMbc1qUEAimkCTndZ7OYOSwluOot4uyq5eE0mli4UlUxK5e0WNHao5%2bskA3hLHczX0S8WUGHgQesn1PGwvJWpkM4%2b8U4kVVB7WOgB80WA4kdsKZGauXdQbv4l3PYnhHUB7BTCbd7zXcsxEYTo9nsf14bjV7%2f8nm3PzebhXwRF%2flD0RDcTqRBtR5WJ5PCoxQ%3d%3d";
        const settings = webView.android.getSettings();
        settings.setDomStorageEnabled(true);
        settings.setUseWideViewPort(true);
        settings.setLoadWithOverviewMode(true);
        settings.setMixedContentMode(0);

        settings.setJavaScriptEnabled(true);
        webView.on(WebView.loadStartedEvent, (event: LoadEventData) => {
            console.log('URL', event.url)
            this.handleUrlChange(event.url);
        });
    }

    handleUrlChange(url: string) {
        if (url.includes('iamchecking')) {
            const encryptedData = this.extractEncryptedData(url);
            console.log('ENCRYPTED DATA:', encryptedData);

            this.showNafathWebView = false;
            this.handleIamLogin(encryptedData);
        }
    }

    extractEncryptedData(url: string): string {
        const queryPart = url.split('?')[1];
        const encryptedData = queryPart.split('=')[1];
        if (!encryptedData) {
            console.error('Missing encrypted data in IAM checking URL');
        }
        return encryptedData || '';
    }

    handleIamLogin(data: string) {
        this.accountService.handleIamChecking(data).subscribe({
            next: (response: any) => {
                if (response) {
                    const parsed = typeof response === 'string' ? JSON.parse(response) : response;
                    this.handleResposeLogin(parsed);
                } else {
                    console.log("Token not found in response");
                    this.routerExt.navigate(['/login'], { clearHistory: true });
                }
            },
            error: (err) => {
                console.error('IAM login failed:', err);
                this.routerExt.navigate(['/login'], { clearHistory: true });
            }
        });
    }

    async handleResposeLogin(response: LoginResponse) {
        if (response.success) {
            this.globalService.setToken(response.extraData.access_token);
            this.globalService.setTokenExpiryDuration(response.extraData.expires_in);
            this.globalService.setTokenStartDate();
            this.globalService.setRefreshToken(response.extraData.refresh_token);

            if (this.globalService.getIsKeepLogged()) {
                this.globalService.setTenants(JSON.stringify(response.extraData.tenants));
            }

            this.globalService.isLoggedIn = true;
            this.globalService.setUserTenants(response.extraData.tenants);

            await this.getUserPrefrences(response);

            if (this.globalService.isEthrai) {
                await this.getUserStats();
                this.firebaseEventService.logLoginEvent(
                    true,
                    this.globalService.getUserStats(),
                    'signin_nafath',
                    null
                );
            }
        }
    }

    async getUserStats() {
        try {
            const stats = await this.dashboardService.getUserStats().toPromise();
            this.globalService.setUserStats(stats);

            if (this.globalService.isEthrai) {
                this.firebaseEventService.logScreenViewedEvent(
                    this.globalService.isLoggedIn,
                    stats,
                    'highlighted',
                    this.globalService.getUserProfile()
                );
            }
        } catch (error) {
            console.error('Failed to get user stats:', error);
        }
    }

    async getUserPrefrences(result: LoginResponse) {
        try {
            const preferences = await this.accountService.getProfilePrefrences().toPromise();
            this.globalService.editPrefrences = preferences == null;

            if (result.extraData?.tenants?.length === 1) {
                this.globalService.setEthraiTenant(true);
            }

            console.log("Edit preferences:", this.globalService.editPrefrences);

            this.ngZone.run(() => {
                if (result.extraData?.tenants?.length > 1) {
                    this.routerExt.navigate(['choose-account'], { clearHistory: true });
                } else if (this.globalService.editPrefrences) {
                    this.globalService.isEthrai = true;
                    this.routerExt.navigate(['categories'], { clearHistory: true });
                } else {
                    this.globalService.isEthrai = true;
                    this.routerExt.navigate(['highlighted'], { clearHistory: true });
                }
            });
        } catch (error) {
            console.error('Failed to get user preferences:', error);
            this.routerExt.navigate(['/login'], { clearHistory: true });
        }
    }



    cancelNafathLogin() {
        this.showNafathWebView = false;
    }
    // goToNafath() {
    // 	const iamURL = 'https://iam.ipa.edu.sa/auth/login?returnUrl=';
    // 	const returnUrl = this.globalService.getCurrentTenant().currentUrl + '/api/Account/IamChecking?pId=';
    // 	const provideID = this.globalService.getCurrentTenant().provideID;
    // 	const finalURLToNav = iamURL + returnUrl + provideID;
    // 	console.log('finalURLToNav', finalURLToNav);
    // 	this.accountService.openIamWindow("https://ethrai.sa/iamchecking?d=sCpKgSosVJwB1jOlJNGxBtul1Viq3YTcI1hVkPDGBnE8sO1C0B7d6oauclYsAg0lHWeDBJeJUZpY%2biz4tO6%2b5LUpqXPrKm5Bu%2bJ5FXhzbWcj4g6B96qyVRaGGvcGFi6nzDl9yloPDQIaEuXOXlfpnELoWhykiljtKLBcBmDXYCKrbPAOL1QdCkgUM9wqPObj9wa%2bX7DpvuAg41n%2bVx3V9jFukYh7mnfuLWS06LefJVXv38wTIrb2uZWovf4wwmckpLLqlJVwybWhpykQAXI2028Zi5UIHSwjbH7DVTFvFC6m3gaTwjUkDK4S8iBofaq%2bxYFtofkEAYA2oFZt1lHE4nomjDNJCz%2f9MIenp7TRkZZlSRJcPDspgN1WNL9nh6r2m7K9v9wX5o2Dk%2fUaANLAQABmieWqDU2ZDMdZGxxlLPRBk0GS1tLbbbF4E9xLjtEPmvUYRxWOkIyzj6KzwelcZPKjwkB%2f6xh8SqZoBW%2bujsT2bgzIv7KsbknWALDfmHjfxBdEoZUIY1ziJI0%2bdmwWZgAbWB4xqrx2z7yneacP2ehOVOcK5frizpcnEWbS3sqalFGNksKa0Mnv17gpRuzGkfpH3NqUs13ZMPSECEjVXsv05U%2fvcDu4K%2bgEFVyT0r7ZYbb0Jztfl51%2blVxyBVHDGGqc32N2atZV5JhQjrcHwIr4taYMqX21srdY%2bYiQGaFWaz1YkPlehFck2YLRCKA28FyL0H0NkVC4jMcmcJxaeGT1WiWcDEGyBXt7%2b29Aqvzl8Js9zpjvLAfXUymjXE8WbPEUNvVVq5pmlVQbMueYk%2fMiom52SalrGctrKYyGOdB5D1OuPaTk0vCFDHJKWcr7%2fThvG2MRkq3PEICryouqUUYTZuoUvVcCqWvwDOlM74MhN1Xn4Osyvol3TClQcSIH4SGSMbc1qUEAimkCTndZ7OYOSwluOot4uyq5eE0mli4UlUxK5e0WNHao5%2bskA3hLHczX0S8WUGHgQesn1PGwvJWpkM4%2b8U4kVVB7WOgB80WA4kdsKZGauXdQbv4l3PYnhHUB7BTCbd7zXcsxEYTo9nsf14bjV7%2f8nm3PzebhXwRF%2flD0RDcTqRBtR5WJ5PCoxQ%3d%3d");
    // }

}