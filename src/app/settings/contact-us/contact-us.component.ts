import { Component, NgZone, OnInit } from '@angular/core';
import { Page, Frame } from '@nativescript/core';
import { SettingsService } from '../settings.service';
import { environment } from '../../../../environments/environment';
import { localize } from '@nativescript/localize';
import { GlobalService } from '../../shared/services/global.service';
import { AbstractControl, FormControl, FormGroup, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { SelectedIndexChangedEventData, ValueList } from 'nativescript-drop-down';
import { LoadEventData } from '@nativescript/core';
import { DashboardService } from '~/app/dashboard/dashboard.service';
import { distinctUntilChanged } from 'rxjs/operators';
import { RouterExtensions } from '@nativescript/angular';
import { FirebaseEventService } from '~/app/shared/services/firebase.event.service';
import { ProductsSearchOptions } from '~/app/shared/models/products-search-options';

@Component({
	moduleId: module.id,
	selector: 'contact-us',
	templateUrl: './contact-us.component.html',
	styleUrls: ['./contact-us.component.css']
})

export class ContactUsComponent implements OnInit {
	info: any = {};
	regex = environment.EMAIL_REGEX;
	isLoading: boolean;
	isEthrai: any;
	isLoggedIn: boolean;
	contactForm: FormGroup;
	emailRegex = environment.EMAIL_REGEX;
	issuesSource: ValueList<string> = new ValueList<string>();
	issueType: string;
	webView: any;
	rechaptcha: any;
	showRadioButtons: boolean;
	productTypes: { value: string; display: string; isChecked: boolean; hasCertificate: boolean }[];
	selectedProductType: any = 'None';
	productId: string;
	customProductTypes: { value: string; display: string; isChecked: boolean; hasCertificate: boolean; }[];
	products: any;
	showProductsDropdown: boolean;
	productsSource: ValueList<string> = new ValueList<string>();
	title: string;
	title1: any;
	webViewSource: string;
	isSubmitting: boolean;
	requestSuccess: boolean;
	constructor(private page: Page, private settingsService: SettingsService, private globalService: GlobalService, private dashboardService: DashboardService,
		private router: RouterExtensions, private firebaseEventService: FirebaseEventService, private ngZone: NgZone) {
		//page.actionBarHidden = true;
		let mail = this.globalService.getUserCurrentEmail() ? this.globalService.getUserCurrentEmail() : '';
		let fullName = this.globalService.getUserProfile()?.fullNameAr ? this.globalService.getUserProfile()?.fullNameAr : '';
		let identityOrIqamaNumber = this.globalService.getUserProfile()?.nationalId ? this.globalService.getUserProfile()?.nationalId : '';
		let mobile = this.globalService.getUserProfile()?.mobile ? this.globalService.getUserProfile()?.mobile : '';
		this.contactForm = new FormGroup({
			email: new FormControl(mail, [Validators.pattern(this.emailRegex), Validators.required]),
			fullName: new FormControl(fullName, []),
			topic: new FormControl('', []),
			identityOrIqamaNumber: new FormControl(identityOrIqamaNumber, []),
			issueType: new FormControl('', [Validators.required]),
			messageContent: new FormControl('', [Validators.required]),
			mobile: new FormControl(mobile, [Validators.required, Validators.minLength(8), Validators.maxLength(10)])
		})
	}
	goBack() {

		Frame.topmost().goBack();

	}
	ngOnInit() {
		if (this.globalService.isLoggedIn && this.globalService.isEthrai) {
			this.firebaseEventService.logScreenViewedEvent(this.globalService.isLoggedIn, this.globalService.getUserStats(), 'contact_us', this.globalService.getUserProfile());

		} else if (!this.globalService.isLoggedIn) {
			this.firebaseEventService.logScreenViewedEvent(this.globalService.isLoggedIn, null, 'contact_us', null);

		}
		this.getContactInfos();
		this.contactForm.controls.identityOrIqamaNumber.valueChanges.pipe(distinctUntilChanged()).subscribe(
			(change) => {
				if (this.contactForm?.get('identityOrIqamaNumber').value == '') {
					this.contactForm?.get('identityOrIqamaNumber').setValidators(null);
					this.contactForm?.get('identityOrIqamaNumber').updateValueAndValidity();

				} else {
					this.contactForm?.get('identityOrIqamaNumber').setValidators([Validators.maxLength(10), Validators.minLength(10), this.nationalIDValidator()])
					this.contactForm?.get('identityOrIqamaNumber').updateValueAndValidity();
				}
			}
		)
		this.isLoggedIn = this.globalService.isLoggedIn;
		if (this.isLoggedIn) {
			this.isEthrai = this.globalService.isEthrai
		}
		this.webViewSource = environment.WEB_API + 'reCAPTCHA.htm'
		// this.getTicketIssues();
		this.issuesSource.push({ value: 'RegistrationProblem', display: 'مشكلة فى التسجيل الجديد' })
		this.issuesSource.push({ value: 'LoginProblem', display: 'مشكلة فى تسجيل الدخول' })
		this.issuesSource.push({ value: 'ForgotEmail', display: 'نسيت البريد الالكترونى' })
		this.issuesSource.push({ value: 'DownloadCertificateProblem', display: 'مشكلة فى تحميل الشهادة' })
		this.issuesSource.push({ value: 'TraineeprogramsProblem', display: 'مشكلة فى المنتجات التدريبية' })
		this.issuesSource.push({ value: 'AccountapprovalProblem', display: 'مشكلة فى تفعيل الحساب' })
		this.issuesSource.push({ value: 'Payment', display: 'مشكلة فى المدفوعات' })
		this.issuesSource.push({ value: 'Others', display: 'أخرى' })

		this.productTypes = [
			{ value: "Course", display: localize('trainingProgram'), isChecked: false, hasCertificate: true },
			{ value: "Webinar", display: localize('OnlineConference'), isChecked: false, hasCertificate: true },
			{ value: "Ke", display: localize('ke'), isChecked: false, hasCertificate: false },
			{ value: "TrainingPath", display: localize('TrainingPath'), isChecked: false, hasCertificate: false }
		]
	}
	getTicketIssues() {
		this.settingsService.getTicketsIssues().subscribe(
			res => {
				// this.issues=res as any
			}
		)
	}

	nationalIDValidator(): ValidatorFn {
		return (control: AbstractControl): ValidationErrors | null => {
			return (control?.value && control?.value[0] == '1' || control?.value && control?.value[0] == '2' || control?.value && control?.value[0] == '7') ? null : { value: control?.value }
		};

	}

	saudiPhoneValidator(): ValidatorFn {
		return (control: AbstractControl): ValidationErrors | null => {
			return (control?.value && control?.value[0] == '5') ? null : { value: control.value }
		};

	}
	getContactInfos() {
		this.isLoading = true
		this.settingsService.getContactInfos().subscribe(
			res => {
				this.isLoading = false;
				this.info = res as any
			}
		)
	}
	isNotValid(controlName: string) {
		return !this.contactForm?.get(controlName)?.valid && (this.contactForm?.get(controlName)?.dirty || this.contactForm?.get(controlName)?.touched) ? true : false
	}

	submit() {
		this.contactForm.markAllAsTouched();
		console.log(this.contactForm.value, this.contactForm.valid)
		if (this.contactForm.valid) {
			if (!this.rechaptcha || this.rechaptcha.length === 0) {
				this.globalService.toast(localize('PleaseCompleteTheCaptcha') || 'الرجاء التحقق من أنك لست روبوت');
				return;
			}
			this.sendTicket();
		}

	}
	getText(html): string {
		return html?.replace(/<[^>]+>/g, '').replace(/&nbsp;/g, '');
	}
	sendTicket() {
		let payload = this.contactForm.value;
		payload.productType = this.selectedProductType;
		payload.productId = this.productId;
		payload.recaptcha = this.rechaptcha;
		payload.issueType = this.issueType;
		// payload.clientType="mobile"
		this.isSubmitting = true;
		this.settingsService.postTicket(payload).subscribe(
			res => {
				this.isSubmitting = false;
				this.isLoading = false;
				if ((res as any).success) {
					if (this.globalService.isEthrai || !this.globalService.isLoggedIn) {
						this.firebaseEventService.logSubmitFormEvent('corporate_training', 'form_submissions')
					}
					this.globalService.toast(localize('Success'))
					// this.router.navigate(['account'])
					// this.contactForm.reset();
					this.showRadioButtons = false
					this.requestSuccess = true;
				}
			},
			err => {
				this.isLoading = false;
				console.log(err);
				this.globalService.toast(localize('Wrong'))
			}
		)
	}
	async onIssueChange(e: SelectedIndexChangedEventData) {
		this.issueType = this.issuesSource.getValue(e.newIndex)
		if (this.issueType == 'DownloadCertificateProblem' || this.issueType == 'TraineeprogramsProblem') {
			await this.getProducts();
			this.showRadioButtons = true;
			if (this.issueType == 'DownloadCertificateProblem') {
				this.customProductTypes = this.productTypes.filter(type => type.hasCertificate);
				this.title1 = localize('CertificateRelatedTo')
			} else {
				this.customProductTypes = this.productTypes;
				this.title1 = localize('ProblemRelatedTo')
			}
			this.contactForm.addControl('productId', new FormControl('', [Validators.required]))
			this.contactForm.addControl('productType', new FormControl(' ', [Validators.required]))
		} else {
			this.contactForm?.removeControl('productType')
			this.contactForm?.removeControl('productId')
			this.showRadioButtons = false;
		}
	}
	getProducts() {
		let options = new ProductsSearchOptions();
		options.pageIndex = 0;
		options.pageSize = 100000;
		options.minHours = 0;
		options.maxHours = 100000;
		options.levels = []
		return this.dashboardService.searchProducts(options).toPromise().then(
			res => {
				this.products = res as any;
			}
		);
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
	onProductTypeChange(item) {
		item.isChecked = !item.isChecked;
		this.selectedProductType = item.value
		this.showProductsDropdown = true;
		this.productsSource = new ValueList<string>();
		if (item.value == 'Course') {
			this.title = localize('ChooseCourse')
			this.products?.courses.forEach(element => {
				this.productsSource.push({ value: element.id, display: element.nameAr })
			});
		} else if (item.value == 'Webinar') {
			this.title = localize('ChooseWebinar')
			this.products?.webinars.forEach(element => {
				this.productsSource.push({ value: element.id, display: element.nameAr })
			});
		} else if (item.value == 'Ke') {
			this.title = localize('ChooseKe')
			this.products?.kes.forEach(element => {
				this.productsSource.push({ value: element.id, display: element.nameAr })
			});
		} else if (item.value == 'TrainingPath') {
			this.title = localize('ChoosePath')
			this.products?.coursePaths.forEach(element => {
				this.productsSource.push({ value: element.id, display: element.nameAr })
			});
		}

		if (!item.isChecked) {
			return;
		}

		// uncheck all other options
		this.productTypes.forEach(element => {
			if (element.display !== item.display) {
				element.isChecked = false;
			}
		});

	}
	onProductChange(e: SelectedIndexChangedEventData) {
		this.productId = this.productsSource.getValue(e.newIndex)
	}
	showForm() {
		this.contactForm.reset();
		this.requestSuccess = false
	}
}