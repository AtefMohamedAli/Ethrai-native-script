import { Component, ElementRef, OnInit, ViewChild, NgZone } from '@angular/core';
import { DateTimePicker } from '@nativescript/datetimepicker';
import { RouterExtensions } from '@nativescript/angular';
import { knownFolders, Observable, Page } from "@nativescript/core";
import { Frame } from '@nativescript/core';
import { localize } from '@nativescript/localize';
import { environment } from '../../../../environments/environment';
import { SelectedIndexChangedEventData, ValueItem, ValueList } from 'nativescript-drop-down';
import { AccountService } from '../../account/account.service';
import { Nationalities } from '../../shared/models/lookups/nationalties';
import { SignUpPayload } from '../../shared/models/signUp-payload';
import { AbstractControl, FormBuilder, FormControl, FormGroup, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { LoadEventData } from '@nativescript/core';
import { WebViewSource } from './web-view-source';
import { GlobalService } from '~/app/shared/services/global.service';
import { FirebaseEventService } from '../../shared/services/firebase.event.service';



@Component({
	moduleId: module.id,
	selector: 'register',
	templateUrl: './register.component.html',
	styleUrls: ['./register.component.css']
})


export class RegisterComponent implements OnInit {
	minDate: Date = new Date(1975, 0, 29);
	maxDate: Date = new Date(2045, 4, 12);
	birthdate: any;
	selectedBirthdateDisplay: string = '';
	// public selectedIndex = 1;
	public items: Array<string>;
	NationalitiesSource: ValueList<string> = new ValueList<string>();
	codesSource: ValueList<string> = new ValueList<string>();
	genderSource: ValueList<string> = new ValueList<string>();
	hijriMonthSource: ValueList<string> = new ValueList<string>();
	signUpPayload: SignUpPayload = new SignUpPayload();
	emailRegex = environment.EMAIL_REGEX;
	passwordRegex = environment.PASSWORD_REGEX;
	birthDateRegex = environment.BIRTHDATE_REGEX;
	arabicNameRegex = /^[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\s]+$/;
	englishNameRegex = /^[a-zA-Z\s]+$/;
	@ViewChild('agree') agreeCheckBox: ElementRef;
	@ViewChild('resident') residentCheckBox: ElementRef;
	///@ViewChild('webViewExt') webView:ElementRef
	registerationForm: FormGroup;
	sectorsSource: ValueList<number> = new ValueList<number>();
	sectorID: number;
	nationalityID: string;
	nationalities: Nationalities[];
	isSaudi: boolean = true;
	//@ViewChild('webViewExt') webViewExt:WebViewExt
	nationalitySelectedIndex: number;
	rechaptcha: any;
	webViewSource: string;
	muqeem: any;
	genderId: any;
	webView: any;
	isLoading: boolean;
	phoneCodes: any[];
	years;
	days;
	selectedCodeIndex: number;
	countryCode: string;
	mobileHint: string = '5XXXXXXXX';
	dayHijri: string;
	monthHijri: string;
	yearHijri: string;

	showPassword = false;
	showConfirmPassword = false;

	togglePassword() {
		this.showPassword = !this.showPassword;
	}

	toggleConfirmPassword() {
		this.showConfirmPassword = !this.showConfirmPassword;
	}
	openDatePicker() {
		const options: any = {
			date: this.birthdate || new Date(1990, 0, 1),
			minDate: new Date(1940, 0, 1),
			maxDate: new Date(2020, 11, 31),
			okButtonText: localize('ok') || 'تم',
			cancelButtonText: localize('cancel') || 'إلغاء',
			title: localize('birthDate') || 'تاريخ الميلاد',
			locale: 'ar'
		};

		DateTimePicker.pickDate(options).then((selectedDate: Date) => {
			if (selectedDate) {
				this.ngZone.run(() => {
					this.birthdate = selectedDate;
					const day = selectedDate.getDate().toString().padStart(2, '0');
					const month = (selectedDate.getMonth() + 1).toString().padStart(2, '0');
					const year = selectedDate.getFullYear();
					this.selectedBirthdateDisplay = `${day}/${month}/${year}`;
					this.registerationForm.get('birthdate')?.setValue(selectedDate);
					console.log('Birthdate selected:', this.selectedBirthdateDisplay);
				});
			}
		});
	}

	constructor(private page: Page, private accountService: AccountService, private router: RouterExtensions, private globalService: GlobalService,
		private firebaseEventService: FirebaseEventService, private ngZone: NgZone) {
		page.actionBarHidden = true;
		//  this.getHijriYears();

	}
	goBack() {
		// Frame.topmost().goBack();
		this.router.back();
	}

	nationalIDValidator(): ValidatorFn {
		return (control: AbstractControl): ValidationErrors | null => {
			return (control.value[0] == '1' || control.value[0] == '2' || control.value[0] == '7') ? null : { value: control.value }
		};

	}
	eqamaValidator(): ValidatorFn {
		return (control: AbstractControl): ValidationErrors | null => {
			return (control.value[0] == '2') ? null : { value: control.value }
		};
	}
	saudiPhoneValidator(): ValidatorFn {
		return (control: AbstractControl): ValidationErrors | null => {
			return (control.value[0] == '5') ? null : { value: control.value }
		};

	}
	ngOnInit() {
		this.getPhoneCodes();
		this.getHijriMonths();
		this.days = Array.from({ length: 30 }, (_, i) => i + 1)
		this.years = Array.from({ length: 101 }, (_, i) => i + 1340)
		this.nationalityID = this.globalService.saudiNationalityID;
		this.registerationForm = new FormGroup({
			email: new FormControl('', [Validators.pattern(this.emailRegex), Validators.required]),
			confirmEmail: new FormControl('', [Validators.required]),
			nationalId: new FormControl('', [Validators.required, Validators.maxLength(10), Validators.minLength(10), this.nationalIDValidator()]),
			nationalityId: new FormControl('', [Validators.required]),
			sectorId: new FormControl('', [Validators.required]),
			// birthdateHijri:new FormControl('',[Validators.required]),
			dayHijri: new FormControl('', [Validators.required]),
			monthHijri: new FormControl('', [Validators.required]),
			yearHijri: new FormControl('', [Validators.required]),
			password: new FormControl('', [Validators.required, Validators.pattern(this.passwordRegex)]),
			confirmPassword: new FormControl('', [Validators.required]),
			countryCode: new FormControl('', [Validators.required]),
			mobile: new FormControl('', [Validators.pattern('^[0-9]*$'), Validators.required, Validators.minLength(9), Validators.maxLength(9), this.saudiPhoneValidator()])

		})

		this.getAllNationalties();
		this.getSectors();
		this.getGenders();
		if (this.globalService.isLoggedIn) {
			this.firebaseEventService.logScreenViewedEvent(this.globalService.isLoggedIn, this.globalService.getUserStats(), 'join_ethrai', this.globalService.getUserProfile());
			this.firebaseEventService.logRegisterationBeginEvent(this.globalService.isLoggedIn, this.globalService.getUserStats(), 'join_ethrai', this.globalService.getUserProfile());

		} else {
			this.firebaseEventService.logScreenViewedEvent(this.globalService.isLoggedIn, null, 'join_ethrai', null);
			this.firebaseEventService.logRegisterationBeginEvent(this.globalService.isLoggedIn, null, 'join_ethrai', null);

		}

		// Initialize reCAPTCHA WebView source
		this.webViewSource = environment.WEB_API + 'reCAPTCHA.htm';

	}
	getPhoneCodes() {
		this.accountService.getPhoneCodes().subscribe(
			res => {
				this.phoneCodes = res as any[];
				this.phoneCodes.forEach(element => {
					this.codesSource.push({ value: element.phoneCode, display: element.phoneCode })
				});
				this.selectedCodeIndex = this.codesSource.getIndex('00966')
				this.countryCode = this.codesSource.getValue(this.selectedCodeIndex)
			},
			err => {

			}
		)
	}
	getGenders() {
		this.accountService.getGenders().subscribe(
			res => {
				let genders = res as any[];
				genders.forEach(gender => {
					this.genderSource.push({ value: gender.id, display: gender.nameAr })
				})
			},
			err => {

			}
		)
	}
	isResident(isChecked) {
		this.muqeem = isChecked
		if (isChecked) {
			this.registerationForm.get('mobile').setValidators([Validators.pattern('^[0-9]*$'), Validators.required, Validators.minLength(9), Validators.maxLength(9), this.saudiPhoneValidator()])
			this.registerationForm.get('mobile').updateValueAndValidity();
			this.registerationForm.addControl('residenceNumber', new FormControl('', [Validators.required, Validators.maxLength(10), Validators.minLength(10), this.eqamaValidator()]));
			this.registerationForm.addControl('kafilNumber', new FormControl('', [Validators.required, Validators.maxLength(10), Validators.minLength(10), this.nationalIDValidator()]));
			this.registerationForm.addControl('sectorId', new FormControl('', [Validators.required]));
			this.registerationForm.removeControl('firstNameAr');
			this.registerationForm.removeControl('firstNameEn');
			this.registerationForm.removeControl('fatherNameAr');
			this.registerationForm.removeControl('fatherNameEn');
			this.registerationForm.removeControl('familyNameAr');
			this.registerationForm.removeControl('familyNameEn');
			this.registerationForm.removeControl('genderId')
		} else {
			this.registerationForm.get('mobile').setValidators([Validators.pattern('^[0-9]*$'), Validators.required, Validators.minLength(6), Validators.maxLength(10)])
			this.registerationForm.get('mobile').updateValueAndValidity();
			this.registerationForm.removeControl('residenceNumber');
			this.registerationForm.removeControl('kafilNumber')
			this.registerationForm.removeControl('sectorId')
			this.registerationForm.addControl('firstNameAr', new FormControl('', [Validators.required, Validators.pattern(this.arabicNameRegex)]));
			this.registerationForm.addControl('firstNameEn', new FormControl('', [Validators.required, Validators.pattern(this.englishNameRegex)]));
			this.registerationForm.addControl('fatherNameAr', new FormControl('', [Validators.required, Validators.pattern(this.arabicNameRegex)]));
			this.registerationForm.addControl('fatherNameEn', new FormControl('', [Validators.required, Validators.pattern(this.englishNameRegex)]));
			this.registerationForm.addControl('familyNameAr', new FormControl('', [Validators.required, Validators.pattern(this.arabicNameRegex)]));
			this.registerationForm.addControl('familyNameEn', new FormControl('', [Validators.required, Validators.pattern(this.englishNameRegex)]));
			this.registerationForm.addControl('genderId', new FormControl('', [Validators.required]));
		}
	}
	/**
	 * Trims whitespace from all string form controls to prevent spaces-only submissions.
	 */
	private trimFormValues(): void {
		Object.keys(this.registerationForm.controls).forEach(key => {
			const control = this.registerationForm.get(key);
			if (control && typeof control.value === 'string') {
				control.setValue(control.value.trim(), { emitEvent: false });
			}
		});
	}

	/**
	 * Returns the first field-specific validation error toast message,
	 * or null if all fields are valid.
	 */
	private getFirstValidationError(): string | null {
		const form = this.registerationForm;

		// Email format
		if (form.get('email')?.invalid) {
			return localize('InvalidEmailFormat') || 'صيغة البريد الإلكتروني غير صحيحة';
		}

		// Email confirmation match
		if (form.get('confirmEmail')?.value !== form.get('email')?.value) {
			return localize('EmailsDoNotMatch') || 'البريد الإلكتروني وتأكيده غير متطابقين';
		}

		// Password strength
		if (form.get('password')?.invalid) {
			return localize('InvalidPassword') || 'يجب أن تحتوي كلمة المرور على 8 أحرف على الأقل بحرف كبير وحرف صغير ورقم واحد على الأقل';
		}

		// Password confirmation match
		if (form.get('confirmPassword')?.value !== form.get('password')?.value) {
			return localize('PasswordsDoNotMatch') || 'كلمة المرور وتأكيدها غير متطابقتين';
		}

		// National ID (Saudi only)
		if (form.get('nationalId') && form.get('nationalId')?.invalid) {
			return localize('InvalidNationalId') || 'رقم الهوية الوطنية يجب أن يتألف من 10 أرقام ويبدأ بالرقم 1 أو 2 أو 7';
		}

		// Residence number (residents)
		if (form.get('residenceNumber') && form.get('residenceNumber')?.invalid) {
			return localize('ResidenceMustBeTen') || 'رقم الإقامة يجب أن يتألف من 10 أرقام ويبدأ بالرقم 2';
		}

		// Kafil number (residents)
		if (form.get('kafilNumber') && form.get('kafilNumber')?.invalid) {
			return localize('ResidenceOrNatID') || 'رقم الإقامة أو الهوية يجب أن يتألف من 10 أرقام ويبدأ بالرقم 2 أو 1 أو 7';
		}

		// Mobile number
		if (form.get('mobile')?.invalid) {
			if (this.isSaudi || this.muqeem) {
				return localize('InvalidSaudiMobile') || 'رقم الجوال يجب أن يتألف من 9 أرقام ويبدأ ب5';
			}
			return localize('InvalidMobileNumber') || 'رقم الجوال غير صحيح';
		}

		// Hijri birthdate (Saudi)
		if (this.isSaudi) {
			if (form.get('dayHijri')?.invalid || form.get('monthHijri')?.invalid || form.get('yearHijri')?.invalid) {
				return localize('PleaseSelectBirthdate') || 'الرجاء تحديد تاريخ الميلاد';
			}
		}

		// Gregorian birthdate (non-Saudi)
		if (form.get('birthdate') && form.get('birthdate')?.invalid) {
			return localize('PleaseSelectBirthdate') || 'الرجاء تحديد تاريخ الميلاد';
		}

		// Sector (Saudi or resident)
		if (form.get('sectorId') && form.get('sectorId')?.invalid) {
			return localize('PleaseFillAllRequiredFields') || 'الرجاء تعبئة جميع الحقول المطلوبة';
		}

		// Non-Saudi name fields — check language-specific validation
		const arabicNameFields = ['firstNameAr', 'fatherNameAr', 'familyNameAr'];
		const englishNameFields = ['firstNameEn', 'fatherNameEn', 'familyNameEn'];
		for (const field of arabicNameFields) {
			if (form.get(field) && form.get(field)?.invalid) {
				if (form.get(field)?.errors?.pattern) {
					return localize('ArabicNameRequired') || 'يجب أن يكون الاسم باللغة العربية فقط';
				}
				return localize('PleaseFillAllRequiredFields') || 'الرجاء تعبئة جميع الحقول المطلوبة';
			}
		}
		for (const field of englishNameFields) {
			if (form.get(field) && form.get(field)?.invalid) {
				if (form.get(field)?.errors?.pattern) {
					return localize('EnglishNameRequired') || 'يجب أن يكون الاسم باللغة الإنجليزية فقط';
				}
				return localize('PleaseFillAllRequiredFields') || 'الرجاء تعبئة جميع الحقول المطلوبة';
			}
		}

		// Gender (non-Saudi)
		if (form.get('genderId') && form.get('genderId')?.invalid) {
			return localize('PleaseFillAllRequiredFields') || 'الرجاء تعبئة جميع الحقول المطلوبة';
		}

		// Nationality
		if (form.get('nationalityId')?.invalid) {
			return localize('PleaseFillAllRequiredFields') || 'الرجاء تعبئة جميع الحقول المطلوبة';
		}

		return null;
	}

	register() {
		// Prevent double-tap
		if (this.isLoading) {
			console.log('Register: blocked by isLoading');
			return;
		}

		this.trimFormValues();
		this.registerationForm.markAllAsTouched();

		// 1. Check terms agreement first
		const isAgreed = this.agreeCheckBox?.nativeElement?.checked;
		if (!isAgreed) {
			console.log('Register: terms not agreed, checked=', isAgreed);
			this.globalService.toast(localize('YouMustAgreeToTheTermsAndConditions') || 'يجب الموافقة على الشروط والأحكام');
			return;
		}

		// 2. Check captcha
		if (!this.rechaptcha || this.rechaptcha.length === 0) {
			console.log('Register: captcha not completed, rechaptcha=', this.rechaptcha);
			this.globalService.toast(localize('PleaseCompleteTheCaptcha') || 'الرجاء التحقق من أنك لست روبوت');
			return;
		}

		// 3. Field-specific validation
		const validationError = this.getFirstValidationError();
		if (validationError) {
			console.log('Register: validation error=', validationError);
			this.globalService.toast(validationError);
			return;
		}

		// 4. Final form validity check (catch-all)
		if (!this.registerationForm.valid) {
			console.log('Register: form invalid');
			this.globalService.toast(localize('PleaseFillAllRequiredFields') || 'الرجاء تعبئة جميع الحقول المطلوبة');
			return;
		}

		this.isLoading = true;
		this.signUpPayload = this.registerationForm.value;
		this.signUpPayload.nationalityId = this.nationalityID;
		this.signUpPayload.sectorId = this.sectorID;
		this.signUpPayload.confirmPassword = this.signUpPayload.password;
		this.signUpPayload.recaptcha = this.rechaptcha;
		this.signUpPayload.genderId = this.genderId;
		this.signUpPayload.countryCode = this.countryCode;
		if (this.isSaudi) {
			this.signUpPayload.birthdateHijri = this.yearHijri + '-' + this.monthHijri + '-' + this.dayHijri;
		} else {
			const bd = this.registerationForm.get('birthdate')?.value;
			if (bd instanceof Date) {
				const y = bd.getFullYear();
				const m = (bd.getMonth() + 1).toString().padStart(2, '0');
				const d = bd.getDate().toString().padStart(2, '0');
				this.signUpPayload.birthdate = `${y}-${m}-${d}`;
			}
		}

		console.log("===== REGISTER PAYLOAD =====");
		console.log(JSON.stringify(this.signUpPayload, null, 2));
		console.log("============================");

		this.accountService.register(this.signUpPayload).subscribe(
			response => {
				this.isLoading = false;
				let result = response as any;
				if (result.success) {
					this.globalService.toast(localize('OperationSuccessful') || 'تم إنشاء الحساب بنجاح');
					this.firebaseEventService.logSignUpEvent(false, null, "join_ethrai", null);
					this.router.navigate(['/regiser-confirm', this.registerationForm.get('email').value]);
				} else {
					// Server returned success: false — show server message or localized error code
					const errorMsg = (result.errorCode ? localize(result.errorCode) : null)
						|| result.message
						|| localize('OperationFailed')
						|| 'عذراً، فشلت العملية';
					this.globalService.toast(errorMsg);
				}
			},
			error => {
				this.isLoading = false;
				// Build error message with fallback chain
				const errorCode = error.error?.errorCode;
				const localizedError = errorCode ? localize(errorCode) : null;
				const errorMsg = (localizedError && localizedError !== errorCode ? localizedError : null)
					|| error.error?.message
					|| localize('RegistrationError')
					|| 'حدث خطأ أثناء التسجيل، يرجى المحاولة مرة أخرى';
				this.globalService.toast(errorMsg);
				console.log("Register error:", error);
			});
	}

	getAllNationalties() {
		this.accountService.getAllNationalities().subscribe(
			response => {
				this.nationalities = response as Nationalities[];
				this.nationalities.forEach(nationality => {
					this.NationalitiesSource.push({ value: nationality.id, display: nationality.nameAr })
				});
				this.nationalitySelectedIndex = this.NationalitiesSource.getIndex(this.globalService.saudiNationalityID)
			},
			error => {

			}
		)
	}

	getSectors() {
		this.sectorsSource.push({ value: 1, display: localize('SectorPrivate') });
		this.sectorsSource.push({ value: 2, display: localize('SectorPublic') });
		this.sectorsSource.push({ value: 0, display: localize('SectorUnemployed') });
	}

	onNationalityChange(event: SelectedIndexChangedEventData) {

		this.nationalityID = this.NationalitiesSource.getValue(event.newIndex);

		// Auto-select phone code based on nationality
		if (this.nationalities) {
			const selectedNationality = this.nationalities.find(n => n.id === this.nationalityID);
			if (selectedNationality && selectedNationality.phoneCode) {
				const codeIndex = this.codesSource.getIndex(selectedNationality.phoneCode);
				if (codeIndex >= 0) {
					this.selectedCodeIndex = codeIndex;
					this.countryCode = this.codesSource.getValue(codeIndex);
				}
			}
		}

		if (this.nationalityID != this.globalService.saudiNationalityID) {
			this.isSaudi = false;
			this.mobileHint = 'XXXXXXXXX';
			this.registerationForm.removeControl('nationalId');
			this.registerationForm.removeControl('sectorId');
			this.registerationForm.removeControl('mobile');
			this.registerationForm.removeControl('dayHijri');
			this.registerationForm.removeControl('yearHijri');
			this.registerationForm.removeControl('monthHijri');
			this.registerationForm.addControl('mobile', new FormControl('', [Validators.pattern('^[0-9]*$'), Validators.required, Validators.minLength(6), Validators.maxLength(10)]))
			this.registerationForm.addControl('firstNameAr', new FormControl('', [Validators.required, Validators.pattern(this.arabicNameRegex)]));
			this.registerationForm.addControl('firstNameEn', new FormControl('', [Validators.required, Validators.pattern(this.englishNameRegex)]));
			this.registerationForm.addControl('fatherNameAr', new FormControl('', [Validators.required, Validators.pattern(this.arabicNameRegex)]));
			this.registerationForm.addControl('fatherNameEn', new FormControl('', [Validators.required, Validators.pattern(this.englishNameRegex)]));
			this.registerationForm.addControl('familyNameAr', new FormControl('', [Validators.required, Validators.pattern(this.arabicNameRegex)]));
			this.registerationForm.addControl('familyNameEn', new FormControl('', [Validators.required, Validators.pattern(this.englishNameRegex)]));
			this.registerationForm.addControl('genderId', new FormControl('', [Validators.required]));
			this.registerationForm.addControl('birthdate', new FormControl('', [Validators.required]));
		} else {
			this.isSaudi = true;
			this.mobileHint = '5XXXXXXXX';
			if (this.muqeem) {
				this.muqeem = false;
				this.registerationForm.removeControl('residenceNumber')
				this.registerationForm.removeControl('kafilNumber')
				this.registerationForm.removeControl('birthdate')

			}
			// birthdate:new FormControl('',[Validators.required]),
			// this.registerationForm.addControl('birthdateHijri',new FormControl('',[Validators.required]));
			this.registerationForm.addControl('dayHijri', new FormControl('', [Validators.required]));
			this.registerationForm.addControl('yearHijri', new FormControl('', [Validators.required]));
			this.registerationForm.addControl('monthHijri', new FormControl('', [Validators.required]));
			this.registerationForm.addControl('nationalId', new FormControl('', [Validators.required, Validators.maxLength(10), Validators.minLength(10), this.nationalIDValidator()]));
			this.registerationForm.addControl('sectorId', new FormControl('', [Validators.required]));
			this.registerationForm.addControl('mobile', new FormControl('', [Validators.pattern('^[0-9]*$'), Validators.required, Validators.minLength(9), Validators.maxLength(9), this.saudiPhoneValidator()]));
		}

	}
	onDayHijriChange(event: SelectedIndexChangedEventData) {
		this.dayHijri = this.days[event.newIndex]
	}
	onMonthHijriChange(event: SelectedIndexChangedEventData) {
		this.monthHijri = this.hijriMonthSource.getValue(event.newIndex)
	}
	onYearHijriChange(event: SelectedIndexChangedEventData) {
		this.yearHijri = this.years[event.newIndex]
	}
	onCodeChange(event: SelectedIndexChangedEventData) {
		this.countryCode = this.codesSource.getValue(event.newIndex);
		// Reset mobile field when country code changes (non-Saudi only)
		if (!this.isSaudi && !this.muqeem) {
			const mobileControl = this.registerationForm.get('mobile');
			if (mobileControl) {
				mobileControl.setValue('');
				mobileControl.markAsUntouched();
			}
			this.mobileHint = 'XXXXXXXXX';
		}
	}
	onSectorChange(event: SelectedIndexChangedEventData) {
		this.sectorID = this.sectorsSource.getValue(event.newIndex);

	}
	onGenderChange(event) {
		this.genderId = this.genderSource.getValue(event.newIndex);
	}
	isNotValid(controlName: string) {
		return !this.registerationForm.get(controlName)?.valid && (this.registerationForm.get(controlName)?.dirty || this.registerationForm.get(controlName)?.touched) ? true : false
	}

	isMismatched(confirmedControlName: string, controlName: string) {
		return this.registerationForm.get(confirmedControlName).dirty &&
			(this.registerationForm.get(confirmedControlName).value != this.registerationForm.get(controlName).value)
	}

	isAllMatched() {
		return (this.registerationForm.get('password').value == this.registerationForm.get('confirmPassword').value)
			&&
			(this.registerationForm.get('email').value == this.registerationForm.get('confirmEmail').value)
	}
	onloadFinished(args: LoadEventData) {
		let webview = args.object as any;
		console.log("WebView loaded");
		this.webView = webview;

		// Inject the bridge shim
		this.injectBridgeShim(webview);
	}

	injectBridgeShim(webview: any) {
		const script = `
			if (!window.nsWebViewBridge) {
				window.nsWebViewBridge = {
					emit: function(name, data) {
						var url = 'https://ethrai.sa/ns-bridge/' + name + '?data=' + encodeURIComponent(data);
						console.log('Emitting via navigation:', url);
						window.location.href = url;
					},
					on: function(name, callback) {
						// Mock implementation
						console.log('Registered listener for:', name);
					}
				};
				console.log('nsWebViewBridge shim injected');
			}
		`;

		if (webview.android) {
			webview.android.getSettings().setJavaScriptEnabled(true);
			webview.android.evaluateJavascript(script, null);
		} else if (webview.ios) {
			webview.ios.evaluateJavaScriptCompletionHandler(script, (result, error) => {
				if (error) {
					console.error('Bridge shim injection error:', error);
				} else {
					console.log('Bridge shim injected on iOS');
				}
			});
		}
	}

	onLoadStarted(args: any) {
		const url = args.url;
		console.log("Navigation detected:", url);
		// Check for our custom bridge URL pattern
		if (url && (url.indexOf('ns-bridge/captcha') > -1 || url.indexOf('ns-bridge://captcha') > -1)) {
			// Handle both https://ethrai.sa/ns-bridge/captcha and ns-bridge://captcha
			if (url.indexOf('data=') > -1) {
				const params = new URLSearchParams(url.split('?')[1]);
				const token = params.get('data');
				console.log("Captcha token received:", token ? token.substring(0, 20) + '...' : 'null');

				this.ngZone.run(() => {
					this.rechaptcha = token;
					console.log("Token saved in NgZone");
				});

				// Stop the navigation
				args.object.stopLoading();
			}
		}
	}
	async setWebViewSrc(): Promise<string> {
		let f = knownFolders.documents();
		let folder = f.getFolder("app");
		let file = folder.getFile('captcha.html');
		let source = new WebViewSource();

		await file.writeText(source.getHtmlString()).then(() => {
		}).catch((err) => {
			console.log(err);
		});
		return file.path;

	}
	onConsole(e: any) {
		//   console.log("consolle",e.data);
	}
	getHijriMonths() {
		this.hijriMonthSource.push({ display: "محرَم", value: "01" })
		this.hijriMonthSource.push({ display: "صفر", value: "02" })
		this.hijriMonthSource.push({ display: "ربيع الأول", value: "03" })
		this.hijriMonthSource.push({ display: "ربيع الآخر", value: "04" })
		this.hijriMonthSource.push({ display: "جمادى الأولى", value: "05" })
		this.hijriMonthSource.push({ display: "جمادى الآخرة", value: "06" })
		this.hijriMonthSource.push({ display: "رجب", value: "07" })
		this.hijriMonthSource.push({ display: "شعبان", value: "08" })
		this.hijriMonthSource.push({ display: "رمضان", value: "09" })
		this.hijriMonthSource.push({ display: "شوال", value: "10" })
		this.hijriMonthSource.push({ display: "ذو القعدة", value: "11" })
		this.hijriMonthSource.push({ display: "ذو الحجة", value: "12" })
	}

	getHijriDays() {
		let days: ValueItem<string>[] = []
		for (let i = 1; i <= 30; i++) {
			days.push({ display: i.toString(), value: i.toString() })
		}
		return days;
	}
	getHijriYears() {
		for (let i = 1340; i <= 1440; i++) {
			this.years.push({ display: i.toString(), value: i.toString() })
		}
	}
	async getHijri(): Promise<ValueItem<string>[]> {
		let days: ValueItem<string>[] = []
		for (let i = 1; i <= 30; i++) {
			days.push({ display: i.toString(), value: i.toString() })
		}
		return new Promise((resolve) => {
			resolve(days);
		});
	}
}