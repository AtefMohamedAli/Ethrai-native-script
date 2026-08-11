import { Component, NgZone, OnInit } from '@angular/core';
import { AbstractControl, FormControl, FormGroup, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { RouterExtensions } from '@nativescript/angular';
import { Frame, Page } from '@nativescript/core';
import { localize } from '@nativescript/localize';
import { LoadEventData } from '@nativescript/core';
import { GlobalService } from '../../shared/services/global.service';
import { environment } from '../../../../environments/environment';
import { SettingsService } from '../settings.service';
import { FirebaseEventService } from '~/app/shared/services/firebase.event.service';

@Component({
	moduleId: module.id,
	selector: 'Corporate-training',
	templateUrl: './Corporate-training.component.html',
	styleUrls: ['./Corporate-training.component.css']
})

export class CorporateTrainingComponent implements OnInit {
	info: any = [];
	payload = {
		"areaCode": "",
		"companyName": "",
		"companySize": "",
		"email": "",
		"fullContactName": "",
		"howManyEmployeesNeedTraining": "",
		"jobTitle": "",
		"phoneNumber": "",
		"recaptcha": "",
		"type": ""
	}
	regex = environment.EMAIL_REGEX;
	contactForm: FormGroup;
	webView: any;
	webViewSource: string;
	rechaptcha: any;
	isLoading: boolean;
	requestSuccess: boolean;
	constructor(private page: Page, private settingsService: SettingsService, private routerExtensions: RouterExtensions, private globalService: GlobalService,
		private firebaseEventService: FirebaseEventService, private ngZone: NgZone) {
		//page.actionBarHidden = true;
	}
	getText(html): string {
		return html?.replace(/<[^>]+>/g, '').replace(/&nbsp;/g, '');
	}
	goBack() {
		Frame.topmost().goBack();
	}
	ngOnInit() {
		if (this.globalService.isLoggedIn && this.globalService.isEthrai) {
			this.firebaseEventService.logScreenViewedEvent(this.globalService.isLoggedIn, this.globalService.getUserStats(), 'corporate_training', this.globalService.getUserProfile());

		} else if (!this.globalService.isLoggedIn) {
			this.firebaseEventService.logScreenViewedEvent(this.globalService.isLoggedIn, null, 'corporate_training', null);

		}
		this.settingsService.getTrainingInfo().subscribe(
			res => {
				this.info = res as any
			}
		)
		this.webViewSource = environment.WEB_API + 'reCAPTCHA.htm';
		this.contactForm = new FormGroup({
			email: new FormControl('', [Validators.pattern(this.regex), Validators.required]),
			areaCode: new FormControl('00966', [Validators.required, Validators.pattern('^[0-9]*$')]),
			companySize: new FormControl('', []),
			fullContactName: new FormControl('', [Validators.required, this.noWhitespace()]),
			howManyEmployeesNeedTraining: new FormControl('', []),
			jobTitle: new FormControl('', [Validators.required, this.noWhitespace()]),
			// recaptcha:new FormControl('',[Validators.required]),
			type: new FormControl('', []),
			companyName: new FormControl('', []),
			phoneNumber: new FormControl('', [Validators.pattern('^[0-9]*$'), Validators.required, Validators.minLength(6), Validators.maxLength(10)])

		})
	}
	noWhitespace(): ValidatorFn {
		return (control: AbstractControl): ValidationErrors | null => {
			if (typeof control.value === 'string' && control.value.trim().length === 0 && control.value.length > 0) {
				return { whitespace: true };
			}
			return null;
		};
	}

	private trimFormValues(): void {
		Object.keys(this.contactForm.controls).forEach(key => {
			const control = this.contactForm.get(key);
			if (control && typeof control.value === 'string') {
				control.setValue(control.value.trim(), { emitEvent: false });
			}
		});
	}

	submit() {
		this.trimFormValues();
		this.contactForm.markAllAsTouched();
		console.log(this.contactForm.valid, this.contactForm.value)
		if (this.contactForm.valid) {
			if (!this.rechaptcha || this.rechaptcha.length === 0) {
				this.globalService.toast(localize('PleaseCompleteTheCaptcha') || 'الرجاء التحقق من أنك لست روبوت');
				return;
			}
			this.payload = this.contactForm.value;
			this.payload.recaptcha = this.rechaptcha;
			console.log(this.payload)
			this.isLoading = true
			this.settingsService.submitTrainigContactForm(this.payload).subscribe(
				res => {
					this.isLoading = false
					if ((res as any)) {
						if (this.globalService.isEthrai || !this.globalService.isLoggedIn) {
							this.firebaseEventService.logSubmitFormEvent('corporate_training', 'form_submissions')
						}
						this.globalService.toast(localize('OperationSuccessful'))
						this.requestSuccess = true;
					}
				},
				err => {
					this.isLoading = false
					this.globalService.toast(localize('tryAgain'))

				}
			)
		} else {
			this.globalService.toast(localize('PleaseFillAllRequiredFields') || 'الرجاء تعبئة جميع الحقول المطلوبة');
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
	isNotValid(controlName: string) {
		return !this.contactForm.get(controlName)?.valid && (this.contactForm.get(controlName)?.dirty || this.contactForm.get(controlName)?.touched) ? true : false
	}
	showForm() {
		this.contactForm.reset();
		this.contactForm.get('areaCode').setValue('00966');
		this.requestSuccess = false
	}
}