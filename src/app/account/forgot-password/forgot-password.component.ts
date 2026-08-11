import { Component, OnInit } from '@angular/core';
import { RouterExtensions } from '@nativescript/angular';
import { Page } from "@nativescript/core";
import { localize } from '@nativescript/localize';
import { FirebaseEventService } from '~/app/shared/services/firebase.event.service';
import { GlobalService } from '~/app/shared/services/global.service';
import { environment } from '../../../../environments/environment';
import { AccountService } from '../account.service';
@Component({
	moduleId: module.id,
	selector: 'forgot-password',
	templateUrl: './forgot-password.component.html',
	styleUrls: ['./forgot-password.component.css']
})

export class ForgotPasswordComponent implements OnInit {

	email: string;
	regex = environment.EMAIL_REGEX;
	idRegex = new RegExp('^[17][0-9]{9}$')
	sending: boolean;

	constructor(private page: Page, private accountService: AccountService, private globalService: GlobalService,
		private firebaseEventService: FirebaseEventService, private routerExtensions: RouterExtensions) {
		page.actionBarHidden = true;

	}
	goBack() {
		this.routerExtensions.back();
	}

	ngOnInit() {
		this.firebaseEventService.logScreenViewedEvent(this.globalService.isLoggedIn, null, 'forget_password', null);

	}

	SendInstructions(isFormValid: boolean) {
		if (isFormValid) {
			this.sending = true;
			this.accountService.forgetPassword({ emailOrID: this.email }).subscribe(
				response => {
					this.sending = false;
					this.globalService.toast(localize('CheckMail'))
				},
				error => {
					this.sending = false;
					let err = (error as any).error;
					if (err?.errorCode?.includes("ProfileNotFound")) {
						// Show same generic message for security — don't reveal if email exists
						this.globalService.toast(localize('CheckMail'))
					} else {
						this.globalService.toast(localize('tryAgain'))
					}
				}
			)
		}

	}
	test() {
		let onlyNumbersExp = new RegExp('^[0-9]+$');
		let test = onlyNumbersExp.test(this.email);
		return test;
	}
}