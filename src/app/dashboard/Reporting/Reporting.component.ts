import { Component, Input, NgZone, OnInit } from '@angular/core';
import { RouterExtensions } from '@nativescript/angular';
import { Frame, Page } from '@nativescript/core';
import { GlobalService } from '~/app/shared/services/global.service';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { environment } from '../../../../environments/environment';
//import * as countryData from "country-data";
import { SelectedIndexChangedEventData, ValueList } from 'nativescript-drop-down';
import { AccountService } from '~/app/account/account.service';
import { LoadEventData } from '@nativescript/core';
import { ActivatedRoute } from '@angular/router';
import { localize } from '@nativescript/localize';
import { SettingsService } from '~/app/settings/settings.service';


@Component({
	moduleId: module.id,
	selector: 'Reporting',
	templateUrl: './Reporting.component.html',
	styleUrls: ['./Reporting.component.css']
})

export class ReportingComponent implements OnInit {
	reportingForm: FormGroup
	emailRegex = environment.EMAIL_REGEX;
	reportingData = {
		mobile: "",
		countryCode: "",
		messageContent: "",
		email: "",
		fullName: "",
		recaptcha: "",
		issueType: "Others",
		productId: "d6637a49-f7a3-4b8a-b460-93f84672a102",
		productType: "InteractiveExercises"
	}
	codesSource: ValueList<string> = new ValueList<string>();
	selectedCodeIndex: number;
	rechaptcha: any;
	webViewSource: string;
	webView: any;
	isSubmitting: boolean;
	productId: string;
	Type: string;
	codeCountry: string;

	constructor(private page: Page, private accountService: AccountService, private globalService: GlobalService, private settingsService: SettingsService,
		private router: RouterExtensions, private activatedRoute: ActivatedRoute, private ngZone: NgZone) {
		this.productId = this.activatedRoute.snapshot.paramMap.get("detailsId");
		this.Type = this.activatedRoute.snapshot.paramMap.get("type");
		let mail = this.globalService.getUserCurrentEmail() ? this.globalService.getUserCurrentEmail() : '';
		let fullName = this.globalService.getUserProfile()?.fullNameAr ? this.globalService.getUserProfile()?.fullNameAr : '';
		let mobile = this.globalService.getUserProfile()?.mobile ? this.globalService.getUserProfile()?.mobile : '';
		this.codeCountry = this.globalService.getUserProfile()?.countryCode ? this.globalService.getUserProfile()?.countryCode : ''
		this.reportingForm = new FormGroup({
			email: new FormControl(mail, [Validators.pattern(this.emailRegex), Validators.required]),
			fullName: new FormControl(fullName),
			messageContent: new FormControl('', [Validators.required]),
			mobile: new FormControl(mobile, [Validators.required, Validators.minLength(8), Validators.maxLength(10)]),
			countryCode: new FormControl()

		})
	}

	ngOnInit() {
		this.getPhoneCodes()
		this.webViewSource = environment.WEB_API + 'reCAPTCHA.htm'

	}
	goBack() {

		this.router.back();

	}
	getPhoneCodes() {
		this.accountService.getPhoneCodes().subscribe(
			res => {
				let phoneCodes = res as any[];
				phoneCodes.forEach(element => {
					this.codesSource.push({ value: element.phoneCode, display: element.phoneCode })
				});
				this.selectedCodeIndex = this.codesSource.getIndex(this.codeCountry)

			},
			err => {

			}
		)
	}
	onCodeChange(event: SelectedIndexChangedEventData) {
		this.codeCountry = this.codesSource.getValue(event.newIndex);

	}
	isNotValid(controlName: string) {
		return !this.reportingForm?.get(controlName)?.valid && (this.reportingForm?.get(controlName)?.dirty || this.reportingForm?.get(controlName)?.touched) ? true : false
	}

	submit() {
		this.reportingForm.markAllAsTouched();
		//console.log(this.reportingForm.value,this.reportingForm.valid)
		if (this.reportingForm.valid) {
			if (!this.rechaptcha || this.rechaptcha.length === 0) {
				this.globalService.toast(localize('PleaseCompleteTheCaptcha') || 'الرجاء التحقق من أنك لست روبوت');
				return;
			}
			this.sendTicket();
		}

	}
	onloadFinished(args: LoadEventData) {
		let webview = args.object as any;
		this.webView = webview;
		this.injectBridgeShim(webview);
	}

	injectBridgeShim(webview: any) {
		const script = `
			if (!window.nsWebViewBridge) {
				window.nsWebViewBridge = {
					emit: function(name, data) {
						var url = 'https://ethrai.sa/ns-bridge/' + name + '?data=' + encodeURIComponent(data);
						window.location.href = url;
					},
					on: function(name, callback) {}
				};
			}
		`;
		if (webview.android) {
			webview.android.getSettings().setJavaScriptEnabled(true);
			webview.android.evaluateJavascript(script, null);
		} else if (webview.ios) {
			webview.ios.evaluateJavaScriptCompletionHandler(script, null);
		}
	}

	onLoadStarted(args: any) {
		const url = args.url;
		if (url && (url.indexOf('ns-bridge/captcha') > -1 || url.indexOf('ns-bridge://captcha') > -1)) {
			if (url.indexOf('data=') > -1) {
				const params = new URLSearchParams(url.split('?')[1]);
				const token = params.get('data');
				this.ngZone.run(() => {
					this.rechaptcha = token;
				});
				args.object.stopLoading();
			}
		}
	}
	sendTicket() {
		this.isSubmitting = true
		this.reportingData = JSON.parse(JSON.stringify(this.reportingForm.getRawValue()))
		this.reportingData.productId = this.productId;
		this.reportingData.productType = this.Type
		this.reportingData.countryCode = this.codeCountry
		this.reportingData.recaptcha = this.rechaptcha
		this.reportingData.issueType = "Others"
		//console.log(this.reportingData,'reportingData')
		this.settingsService.postTicket(this.reportingData).subscribe(
			res => {
				this.isSubmitting = false;
				if ((res as any).success) {

					this.globalService.toast(localize('OperationSuccessful'))
					// this.router.navigate(['account'])
					// this.contactForm.reset();
					this.router.back();


				}
			},
			err => {
				this.isSubmitting = false;

				console.log(err);
				this.globalService.toast(localize('Wrong'))
			}
		)
	}
}