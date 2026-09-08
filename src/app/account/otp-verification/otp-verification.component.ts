import { AfterViewInit, ChangeDetectorRef, Component, ElementRef, NgZone, OnDestroy, OnInit, QueryList, ViewChildren } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { RouterExtensions } from '@nativescript/angular';
import { Frame, Page, TextField } from '@nativescript/core';
import { localize } from '@nativescript/localize';
import { LoginResponse } from '../../shared/models/login-response';
import { FirebaseEventService } from '../../shared/services/firebase.event.service';
import { GlobalService } from '../../shared/services/global.service';
import { DashboardService } from '../../dashboard/dashboard.service';
import { AccountService } from '../account.service';

@Component({
	moduleId: module.id,
	selector: 'otp-verification',
	templateUrl: './otp-verification.component.html',
	styleUrls: ['./otp-verification.component.css']
})
export class OtpVerificationComponent implements OnInit, AfterViewInit, OnDestroy {
	@ViewChildren('otpField') otpFields: QueryList<ElementRef>;

	usernameOrEmail = '';
	otpDigits: string[] = ['', '', '', '', '', ''];
	otpIndexes = [0, 1, 2, 3, 4, 5];
	isOtpComplete = false;
	isLoading = false;
	isResending = false;
	canResend = false;
	timerDisplay = '00:00:00';

	private timerSeconds = 0;
	private timerIntervalId: any;
	private isUpdatingFields = false;

	constructor(
		private page: Page,
		private route: ActivatedRoute,
		private accountService: AccountService,
		private globalService: GlobalService,
		private router: RouterExtensions,
		private firebaseEventService: FirebaseEventService,
		private dashboardService: DashboardService,
		private ngZone: NgZone,
		private cdr: ChangeDetectorRef
	) {
		page.actionBarHidden = true;
	}

	ngOnInit() {
		this.usernameOrEmail =
			this.route.snapshot.paramMap.get('usernameOrEmail') ||
			this.route.snapshot.queryParamMap.get('usernameOrEmail') ||
			this.accountService.getPendingLoginContext()?.usernameOrEmail ||
			'';

		if (!this.usernameOrEmail) {
			this.router.navigate(['/login-by-mail'], { clearHistory: true });
			return;
		}

		this.firebaseEventService.logScreenViewedEvent(this.globalService.isLoggedIn, null, 'otp_verification', null);
		this.loadResendTimer();
	}

	ngAfterViewInit() {
		setTimeout(() => this.focusField(0), 300);
	}

	ngOnDestroy() {
		this.clearTimer();
	}

	get otpCode(): string {
		return this.otpDigits.join('');
	}

	goBack() {
		this.accountService.clearPendingLoginContext();
		Frame.topmost().goBack();
	}

	onOtpChange(index: number, args: any) {
		if (this.isUpdatingFields) {
			return;
		}

		this.ngZone.run(() => {
			const textField = args?.object as TextField;
			const raw = (textField?.text ?? args?.value ?? '').toString();
			const digitsOnly = raw.replace(/\D/g, '');

			// Paste full code into one field
			if (digitsOnly.length > 1) {
				const chars = digitsOnly.slice(0, 6).split('');
				for (let i = 0; i < 6; i++) {
					this.otpDigits[i] = chars[i] || '';
				}
				this.syncOtpFields();
				this.refreshOtpComplete();
				this.focusField(Math.min(chars.length, 5));
				return;
			}

			const previous = this.otpDigits[index];
			const digit = digitsOnly.slice(-1);
			this.otpDigits[index] = digit;

			this.isUpdatingFields = true;
			if (textField && textField.text !== digit) {
				textField.text = digit;
			}
			this.isUpdatingFields = false;

			this.refreshOtpComplete();

			if (digit && index < 5) {
				this.focusField(index + 1);
			} else if (!digit && previous && index > 0) {
				// cleared current box — stay
			} else if (!digit && !previous && index > 0) {
				this.focusField(index - 1);
			}
		});
	}

	private refreshOtpComplete() {
		this.isOtpComplete = this.otpDigits.every(d => /^\d$/.test(d));
		this.cdr.detectChanges();
	}

	private getTextField(index: number): TextField | null {
		const item = this.otpFields?.toArray()?.[index] as any;
		if (!item) {
			return null;
		}
		return (item.nativeElement || item) as TextField;
	}

	private syncOtpFields() {
		this.isUpdatingFields = true;
		this.otpIndexes.forEach(i => {
			const field = this.getTextField(i);
			if (field) {
				field.text = this.otpDigits[i] || '';
			}
		});
		this.isUpdatingFields = false;
	}

	private focusField(index: number) {
		setTimeout(() => {
			const field = this.getTextField(index);
			if (field) {
				field.focus();
			}
		}, 40);
	}

	loadResendTimer() {
		this.accountService.getOtpResendTimer().subscribe(
			(res: any) => {
				const minutes = this.extractExpiryMinutes(res);
				this.startCountdown(Math.max(0, Math.round(minutes * 60)));
			},
			() => {
				this.startCountdown(5 * 60);
			}
		);
	}

	private extractExpiryMinutes(res: any): number {
		if (res == null) {
			return 5;
		}
		if (typeof res === 'number') {
			return res;
		}
		if (typeof res.expiryTimer === 'number') {
			return res.expiryTimer;
		}
		if (typeof res.extraData?.expiryTimer === 'number') {
			return res.extraData.expiryTimer;
		}
		if (typeof res.data?.expiryTimer === 'number') {
			return res.data.expiryTimer;
		}
		const parsed = Number(res.expiryTimer ?? res.extraData?.expiryTimer ?? res.data?.expiryTimer);
		return isNaN(parsed) ? 5 : parsed;
	}

	private startCountdown(totalSeconds: number) {
		this.clearTimer();
		this.timerSeconds = totalSeconds;
		this.canResend = totalSeconds <= 0;
		this.updateTimerDisplay();

		if (totalSeconds <= 0) {
			return;
		}

		this.timerIntervalId = setInterval(() => {
			this.ngZone.run(() => {
				this.timerSeconds -= 1;
				if (this.timerSeconds <= 0) {
					this.timerSeconds = 0;
					this.canResend = true;
					this.updateTimerDisplay();
					this.clearTimer();
					return;
				}
				this.canResend = false;
				this.updateTimerDisplay();
			});
		}, 1000);
	}

	private updateTimerDisplay() {
		const hours = Math.floor(this.timerSeconds / 3600);
		const minutes = Math.floor((this.timerSeconds % 3600) / 60);
		const seconds = this.timerSeconds % 60;
		this.timerDisplay =
			`${this.pad(hours)}:${this.pad(minutes)}:${this.pad(seconds)}`;
	}

	private pad(value: number): string {
		return value < 10 ? `0${value}` : `${value}`;
	}

	private clearTimer() {
		if (this.timerIntervalId) {
			clearInterval(this.timerIntervalId);
			this.timerIntervalId = null;
		}
	}

	verifyOtp() {
		if (!this.isOtpComplete || this.isLoading) {
			return;
		}

		this.isLoading = true;
		this.accountService.validateOtp(this.usernameOrEmail, this.otpCode).subscribe(
			async (response) => {
				const result = response as LoginResponse;
				if (result.success && result.extraData?.access_token) {
					await this.completeLogin(result);
				} else {
					this.isLoading = false;
					this.globalService.toast(localize('InvalidOTP'));
				}
			},
			(error) => {
				this.isLoading = false;
				this.handleAuthError(error);
			}
		);
	}

	resendOtp() {
		if (!this.canResend || this.isResending || this.isLoading) {
			return;
		}

		this.isResending = true;
		this.accountService.resendOtp(this.usernameOrEmail).subscribe(
			() => {
				this.isResending = false;
				this.otpDigits = ['', '', '', '', '', ''];
				this.isOtpComplete = false;
				this.syncOtpFields();
				this.globalService.toast(localize('OtpResent'));
				this.loadResendTimer();
				this.focusField(0);
				this.cdr.detectChanges();
			},
			(error) => {
				this.isResending = false;
				this.handleAuthError(error);
			}
		);
	}

	private async completeLogin(result: LoginResponse) {
		const extra = result.extraData || ({} as any);

		this.globalService.setToken(extra.access_token);
		if (extra.expires_in != null) {
			this.globalService.setTokenExpiryDuration(extra.expires_in);
		}
		this.globalService.setTokenStartDate();
		if (extra.refresh_token) {
			this.globalService.setRefreshToken(extra.refresh_token);
		}

		this.globalService.isLoggedIn = true;

		const pending = this.accountService.getPendingLoginContext();
		if (pending?.saveBiometricCredentials) {
			this.globalService.setLoginCredintials(JSON.stringify({
				usernameOrEmail: pending.usernameOrEmail,
				password: pending.password,
				countryCode: pending.countryCode
			}));
		}
		this.accountService.clearPendingLoginContext();

		await this.getUserProfile();

		// validateOtp may omit tenants — fall back to profile tenants
		const tenants = this.resolveTenants(extra.tenants);
		if (this.globalService.getIsKeepLogged()) {
			this.globalService.setTenants(JSON.stringify(tenants));
		}
		this.globalService.setUserTenants(tenants);

		this.accountService.getCurrentTenant().subscribe(
			tenant => console.log('📍 [OTP] Current Tenant:', JSON.stringify(tenant)),
			err => console.error('Failed to fetch current tenant:', err)
		);
		await this.getUserPrefrences(tenants);

		if (this.globalService.isEthrai) {
			await this.getUserStats();
			this.firebaseEventService.logLoginEvent(true, this.globalService.getUserStats(), 'signin_otp', null);
		}
	}

	/**
	 * Prefer tenants from OTP/login payload; otherwise map Profile/full tenants.
	 */
	private resolveTenants(extraTenants: any[] | undefined): any[] {
		if (Array.isArray(extraTenants) && extraTenants.length > 0) {
			return extraTenants;
		}

		const profile = this.globalService.getUserProfile() as any;
		const profileTenants = profile?.tenants;
		if (!Array.isArray(profileTenants) || profileTenants.length === 0) {
			return [];
		}

		// Profile shape uses tenantId; choose-account expects id + nameAr
		return profileTenants.map((t: any) => ({
			id: t.id || t.tenantId,
			tenantId: t.tenantId || t.id,
			nameAr: t.nameAr || t.name || 'إثرائي',
			nameEn: t.nameEn || t.name || 'Ethrai',
			domain: t.domain,
			email: t.email,
			roles: t.roles,
			permissions: t.permissions,
			userId: t.userId
		}));
	}

	private getUserPrefrences(tenants: any[]) {
		const tenantList = Array.isArray(tenants) ? tenants : [];

		return this.accountService.getProfilePrefrences().toPromise().then(
			res => {
				this.isLoading = false;

				if (res == null) {
					this.globalService.editPrefrences = true;
				}
				if (tenantList.length === 1) {
					this.globalService.setEthraiTenant(true);
				}

				this.ngZone.run(() => {
					if (tenantList.length > 1) {
						this.router.navigate(['choose-account'], { clearHistory: true });
					} else if (tenantList.length === 1 && this.globalService.editPrefrences) {
						this.globalService.isEthrai = true;
						this.router.navigate(['categories'], { clearHistory: true });
					} else if (tenantList.length === 1 && !this.globalService.editPrefrences) {
						this.globalService.isEthrai = true;
						this.router.navigate(['highlighted'], { clearHistory: true });
					} else {
						// No tenants in payload/profile — still enter the app as Ethrai
						this.globalService.isEthrai = true;
						this.globalService.setEthraiTenant(true);
						this.router.navigate(
							[this.globalService.editPrefrences ? 'categories' : 'highlighted'],
							{ clearHistory: true }
						);
					}
				});
			}
		).catch(error => {
			console.error('Error getting profile preferences:', error);
			this.isLoading = false;
			this.globalService.toast(localize('tryAgain'));
		});
	}

	private getUserStats() {
		return this.dashboardService.getUserStats().toPromise().then(
			res => {
				this.globalService.setUserStats(res);
				if (this.globalService.isEthrai) {
					this.firebaseEventService.logScreenViewedEvent(
						this.globalService.isLoggedIn,
						res,
						'highlighted',
						this.globalService.getUserProfile()
					);
				}
			}
		);
	}

	private getUserProfile() {
		return this.accountService.getUserProfile().toPromise().then(
			async response => {
				this.globalService.setUserProfile(response as any);
			}
		).catch(error => {
			console.error('Error getting user profile:', error);
		});
	}

	private handleAuthError(error: any) {
		const err = error?.error;
		const code = err?.errorCode || '';

		if (code.includes('InvalidOTP')) {
			this.globalService.toast(localize('InvalidOTP'));
		} else if (code.includes('ExpiryOTPCode')) {
			this.globalService.toast(localize('ExpiryOTPCode'));
		} else if (code.includes('AccountLocked')) {
			this.globalService.toast(localize('AccountLocked'));
		} else if (code.includes('WrongUsernameOrPassword') || code.includes('ProfileNotFound')) {
			this.globalService.toast(localize('EmailOrPasswordFailed'));
		} else if (code.includes('LoginWithIam')) {
			this.globalService.toast(localize('LoginWithIam'));
		} else if (code.includes('InvalidModel')) {
			this.globalService.toast(localize('InvalidModel'));
		} else {
			this.globalService.toast(localize('tryAgain'));
		}
	}
}
