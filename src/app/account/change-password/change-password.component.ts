import { Component, OnInit } from '@angular/core';
import { Page } from "@nativescript/core";
import { Frame } from '@nativescript/core';
import { GlobalService } from '~/app/shared/services/global.service';
import { environment } from '../../../../environments/environment';
import { AccountService } from '../account.service';
import { localize } from '@nativescript/localize';
import { RouterExtensions } from '@nativescript/angular';
import { FirebaseEventService } from '~/app/shared/services/firebase.event.service';

@Component({
	moduleId: module.id,
	selector: 'change-password',
	templateUrl: './change-password.component.html',
	styleUrls: ['./change-password.component.css']
})

export class ChangePasswordComponent implements OnInit {

	passwordRegex = environment.PASSWORD_REGEX;
	newPassword: string;
	oldPassword: string;
	userId: any;
	confirmPassword: string;
	submitted: boolean;

	constructor(private page: Page, private globalService: GlobalService, private accountService: AccountService, private routerExtensions: RouterExtensions,
		private firebaseEventService: FirebaseEventService) {
		page.actionBarHidden = true;

	}
	goBack() {

		this.routerExtensions.back();

	}
	ngOnInit() {
		if (this.globalService.isEthrai) {
			this.firebaseEventService.logScreenViewedEvent(this.globalService.isLoggedIn, this.globalService.getUserStats(), 'new_password', this.globalService.getUserProfile());
		}
		this.newPassword = "";
		this.oldPassword = "";
		this.confirmPassword = "";
		this.userId = this.globalService.getUserProfile().id;
	}

	changePassword(isVaild: boolean) {
		this.submitted = true;
		if (isVaild) {

			let body = {
				"userId": this.userId,
				"oldPassword": this.oldPassword,
				"newPassword": this.newPassword
			}
			this.accountService.changePassword(body).subscribe(
				response => {
					if ((response as any).success) {
						if (this.globalService.isEthrai) {
							this.firebaseEventService.logPasswordUpdateEvent(true, this.globalService.getUserStats(), 'ar/password_update', this.globalService.getUserProfile())
						}
						this.globalService.toast(localize('SuccessfulChangePassword'))
						this.globalService.setToken("");
						this.globalService.setIsKeepLogged(false);
						this.routerExtensions.navigate(["/login"], { clearHistory: true });
					}
				},
				err => {
					console.log(err)
					this.globalService.toast(localize('CheckInfo'))

				}
			)
		}
	}
}