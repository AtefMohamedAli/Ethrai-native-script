import { Component, NgZone } from '@angular/core'
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { RouterExtensions } from '@nativescript/angular';
import { AndroidActivityBackPressedEventData, AndroidApplication, isAndroid, Application } from '@nativescript/core';

import { firebase } from '@nativescript/firebase-core';

import { handleOpenURL, AppURL } from 'nativescript-appurl';
import { filter } from 'rxjs/operators';
import { GlobalService } from './shared/services/global.service';
import { AccountService } from './account/account.service';
import { LoginResponse } from './shared/models/login-response';
import { FirebaseEventService } from './shared/services/firebase.event.service';
import { DashboardService } from './dashboard/dashboard.service';


@Component({
  selector: 'ns-app',
  templateUrl: './app.component.html',
})
export class AppComponent {
  previousUrl: string;
  constructor(private route: Router, private accountService: AccountService, private firebaseEventService: FirebaseEventService
    , private globalService: GlobalService, private routerExt: RouterExtensions
    , private dashboardService: DashboardService, private ngZone: NgZone) {

  }

  ngOnInit() {
    this.initializeDeepLinking();
    this.initializeFirebase();
    this.handleBackButton();
  }
  private initializeDeepLinking() {
    handleOpenURL((appURL: AppURL) => {
      console.log('Received deep link:', appURL.toString());

      this.ngZone.run(() => {
        try {
          const path = appURL.path;
          //const fullPath = new URL(appURL.toString()).pathname; // "/iamchecking"
          console.log('fullPath', path);

          if (path.includes("checkout-details/success")) {
            this.routerExt.navigate(['payment-success'])
          } else if (path.includes("checkout-details/fail")) {
            this.routerExt.navigate(['payment-failed'])
          } else if (path.includes("iamchecking")) {
            console.log('IIIIIIIIIIIIIIIIIIIIIIIIIIIiiiii')
            //const url = new URL(appURL.toString());
            // const encryptedData = url.searchParams.get("d");

            // if (encryptedData) {
            //   this.handleIamLogin(encryptedData);
            // } else {
            //   console.error("Missing data for IAM login.");
            //   this.routerExt.navigate(['/login']);
            // }
            this.handleIamCheckingUrl(appURL);
          }
        } catch (error) {
          console.error('Error handling deep link:', error);
        }
      });
    });
  }

  private handleIamCheckingUrl(appURL: AppURL) {
    const queryPart = appURL.toString().split('?')[1];
    const encryptedData = queryPart.split('=')[1];
    if (!encryptedData) {
      console.error('Missing encrypted data in IAM checking URL');
      this.routerExt.navigate(['/login'], { clearHistory: true });
      return;
    }
    console.log('Parsed encryptedData:', encryptedData);
    this.handleIamLogin(encryptedData);
  }

  private parseUrlParams(url: string): Map<string, string> {
    const params = new Map<string, string>();
    const queryString = url.split('?')[1];
    if (queryString) {
      queryString.split('&').forEach(pair => {
        const [key, value] = pair.split('=');
        if (key && value) {
          params.set(key, decodeURIComponent(value));
        }
      });
    }
    return params;
  }

  private initializeFirebase() {
    try {
      const app = firebase();
      console.log("firebase initialized");
    } catch (error) {
      console.log(`firebase init error: ${error}`);
    }
  }

  handleIamLogin(data: string) {
    this.accountService.handleIamChecking(data).subscribe({
      next: (response: any) => {
        if (response) {
          const parsed = typeof response === 'string' ? JSON.parse(response) : response;
          this.handleResposeLogin(parsed)
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

  async handleResposeLogin(response) {
    let result = response as LoginResponse
    if (result.success) {
      this.globalService.setToken(result.extraData.access_token);
      this.globalService.setTokenExpiryDuration(result.extraData.expires_in);
      this.globalService.setTokenStartDate();
      this.globalService.setRefreshToken(result.extraData.refresh_token);
      if (this.globalService.getIsKeepLogged()) {
        this.globalService.setTenants(JSON.stringify(result.extraData.tenants))
      }
      this.globalService.isLoggedIn = true;
      this.globalService.setUserTenants(result.extraData.tenants);
      await this.getUserPrefrences(result);
      if (this.globalService.isEthrai) {
        await this.getUserStats();
        this.firebaseEventService.logLoginEvent(true, this.globalService.getUserStats(), 'signin_email', null)

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

  getUserPrefrences(result: LoginResponse) {

    this.ngZone.run(() => {
      try {
        const preferences = this.accountService.getProfilePrefrences().toPromise();

        this.globalService.editPrefrences = preferences == null;

        if (result.extraData?.tenants?.length === 1) {
          this.globalService.setEthraiTenant(true);
        }

        console.log("Edit preferences:", this.globalService.editPrefrences);

        if (result.extraData?.tenants?.length > 1) {
          this.routerExt.navigate(['choose-account']);
        } else if (this.globalService.editPrefrences) {
          this.globalService.isEthrai = true;
          this.routerExt.navigate(['categories']);
        } else {
          this.globalService.isEthrai = true;
          this.routerExt.navigate(['highlighted']);
        }
      } catch (error) {
        console.error('Failed to get user preferences:', error);
        this.routerExt.navigate(['/login'], { clearHistory: true });
      }
    });
  }

  handleBackButton() {
    if (isAndroid) {
      Application.android.on(AndroidApplication.activityBackPressedEvent, (data: AndroidActivityBackPressedEventData) => {
        this.previousUrl = this.globalService.previousURL;
        // console.log("previousUrl",this.previousUrl)
        if (this.route.url == "/payment-failed") {
          data.cancel = true;
          this.routerExt.navigate(['/shopping-cart']);
        } else if (this.route.url == "/shopping-cart" && this.previousUrl == "/payment-failed") {
          data.cancel = true; // prevents default back button behavior
          this.routerExt.navigate(['/highlighted']);
        } else if (this.route.url.includes("/payment-success")) {
          data.cancel = true;
          this.routerExt.navigate(['/my-products']);
        } else if (this.route.url.includes("/course-details") && this.previousUrl?.includes("/payment-success")) {
          data.cancel = true;
          this.routerExt.navigate(['/my-products']);
        } else {
          // Allow default back button behavior
          data.cancel = false;
        }
      });
    }
  }
}