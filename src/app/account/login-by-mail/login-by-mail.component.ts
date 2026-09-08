import { Component, NgZone, OnInit } from '@angular/core';
import { isAndroid, Page } from "@nativescript/core";
import { Frame } from '@nativescript/core';
import { GlobalService } from '../../shared/services/global.service';
import { RouterExtensions } from '@nativescript/angular';
import { LoginPayload } from '../../shared/models/login-payload';
import { LoginResponse } from '../../shared/models/login-response';
import { localize } from '@nativescript/localize';
import { AccountService } from '../../account/account.service';
import { environment } from '../../../../environments/environment';
import { FirebaseEventService } from '~/app/shared/services/firebase.event.service';
import { FingerprintAuth, BiometricIDAvailableResult } from "@nativescript/fingerprint-auth";
import { DashboardService } from '~/app/dashboard/dashboard.service';


@Component({
	moduleId: module.id,
	selector: 'login-by-mail',
	templateUrl: './login-by-mail.component.html',
	styleUrls: ['./login-by-mail.component.css']
})


export class LoginByMailComponent implements OnInit {

	loginPayload: LoginPayload = { password: "", usernameOrEmail: "", countryCode: "" };
	regex = environment.EMAIL_REGEX;
	idRegex = new RegExp('^[17][0-9]{9}$')

	submitted: boolean;
	isLoading: boolean;
	isChecked = false
	isAndroid: any;
	private fingerprintAuth: FingerprintAuth;
	showPassword = false;

	// Biometric state
	isBiometricAvailable = false;
	hasSavedCredentials = false;
	biometricType: string = 'touch'; // 'face' or 'touch'

	constructor(private page: Page, private accountService: AccountService, private globalService: GlobalService,
		private router: RouterExtensions, private firebaseEventService: FirebaseEventService, private dashboardService: DashboardService,
		private ngZone: NgZone) {
		page.actionBarHidden = true;
		this.isAndroid = isAndroid
		this.fingerprintAuth = new FingerprintAuth();

	}

	getCountryCode() {
		this.accountService.getCountryCode().subscribe((res: any) => {
			this.loginPayload.countryCode = res?.country || ''
		});
	}
	goBack() {

		Frame.topmost().goBack();

	}

	ngOnInit() {
		this.getCountryCode()
		this.firebaseEventService.logScreenViewedEvent(this.globalService.isLoggedIn, null, 'signin_email', null);
		this.checkBiometricStatus();
	}

	/**
	 * Check biometric hardware availability and whether saved credentials exist.
	 * This determines whether the biometric login button is shown.
	 */
	private async checkBiometricStatus() {
		try {
			const result: BiometricIDAvailableResult = await this.fingerprintAuth.available();
			const savedCreds = this.globalService.getLoginCredintials();
			console.log('🔐 [Biometric] Hardware available:', result.any, '| Face:', result.face, '| Touch:', result.touch);
			console.log('🔐 [Biometric] Saved credentials exist:', !!savedCreds, '| Raw value:', savedCreds ? 'YES (length=' + savedCreds.length + ')' : 'EMPTY/NULL');
			this.ngZone.run(() => {
				this.isBiometricAvailable = result.any;
				this.biometricType = result.face ? 'face' : 'touch';
				this.hasSavedCredentials = !!savedCreds;
				console.log('🔐 [Biometric] Button should show:', this.isBiometricAvailable && this.hasSavedCredentials);
			});
		} catch (e) {
			console.log('🔐 [Biometric] Availability check FAILED:', e);
			this.isBiometricAvailable = false;
		}
	}

	/**
	 * Biometric login flow:
	 * 1. Check saved credentials exist (from a previous successful normal login)
	 * 2. Check biometric hardware available
	 * 3. Check fingerprint database hasn't changed (security)
	 * 4. Prompt biometric scan
	 * 5. On success, retrieve saved credentials and auto-login
	 */
	async loginByFingerPrint() {
		// Gate: must have saved credentials from a previous normal login
		if (!this.hasSavedCredentials) {
			this.globalService.toast(localize('loginFirstToEnableBiometric'));
			return;
		}

		try {
			const available = await this.fingerprintAuth.available();
			if (!available.any) {
				this.globalService.toast(localize('fingerPrintNotAvailable'));
				return;
			}

			// Security: check if fingerprint DB changed since last enrollment
			// Wrapped in try-catch because didFingerprintDatabaseChange can throw on some Android devices
			try {
				const changed = await this.fingerprintAuth.didFingerprintDatabaseChange();
				if (changed) {
					this.ngZone.run(() => {
						this.globalService.clearLoginCredintials();
						this.hasSavedCredentials = false;
					});
					this.globalService.toast(localize('biometricChanged'));
					return;
				}
			} catch (dbChangeError) {
				console.log('🔐 [Biometric] didFingerprintDatabaseChange error (non-fatal, continuing):', dbChangeError);
				// Continue anyway — this check is a security enhancement, not mandatory
			}

			// Use verifyFingerprint (works on BOTH iOS and Android with passcode fallback)
			await this.fingerprintAuth.verifyFingerprint({
				title: localize('biometricLoginTitle'),
				message: localize('biometricLoginMessage'),
			});

			// Biometric verified — retrieve saved credentials and auto-login
			const saved = this.globalService.getLoginCredintials();
			if (saved) {
				this.ngZone.run(() => {
					this.loginPayload = JSON.parse(saved);
					this.isLoading = true;
					this.login(true);
				});
			}
		} catch (error) {
			console.log('🔐 [Biometric] Auth error - code:', error?.code, '| message:', error?.message, '| full:', JSON.stringify(error));
			// Don't show error for user/system cancellations
			// iOS: -3 = fallback pressed, 60 = user cancelled
			// Android: -1 = cancelled, 5 = system canceled/outside tap, 10 = user cancelled, 13 = user cancelled, undefined = plugin fallback error
			const cancelCodes = [-3, 60, -1, 5, 10, 13];

			if (error?.code === undefined || !cancelCodes.includes(error.code)) {
				this.globalService.toast(localize('biometricFailed'));
			}
		}
	}

	test() {
		let onlyNumbersExp = new RegExp('^[0-9]+$');
		let test = onlyNumbersExp.test(this.loginPayload.usernameOrEmail);
		return test;
	}
	login(isFormValid: boolean) {
		this.submitted = true;
		if (isFormValid) {
			// Check if this account has been locally deleted
			if (this.globalService.isAccountDeleted(this.loginPayload.usernameOrEmail)) {
				this.globalService.toast(localize('accountdeleted'));
				return;
			}
			this.isLoading = true;
			this.loginPayload.rememberme = this.globalService.getIsKeepLogged();

			this.accountService.login(this.loginPayload).subscribe(
				async response => {
					let result = response as LoginResponse
					if (result.success) {
						const accessToken = result.extraData?.access_token;

						// Secure login requires OTP when the token is not returned yet
						if (!accessToken) {
							this.accountService.setPendingLoginContext({
								usernameOrEmail: this.loginPayload.usernameOrEmail,
								password: this.loginPayload.password,
								countryCode: this.loginPayload.countryCode,
								saveBiometricCredentials: this.isBiometricAvailable
							});
							this.isLoading = false;
							this.ngZone.run(() => {
								this.router.navigate(
									['/otp-verification'],
									{
										queryParams: { usernameOrEmail: this.loginPayload.usernameOrEmail },
										clearHistory: false
									}
								);
							});
							return;
						}

						this.globalService.setToken(accessToken);
						this.globalService.setTokenExpiryDuration(result.extraData.expires_in);
						this.globalService.setTokenStartDate();
						this.globalService.setRefreshToken(result.extraData.refresh_token);
						if (this.globalService.getIsKeepLogged()) {
							this.globalService.setTenants(JSON.stringify(result.extraData.tenants))
						}
						this.globalService.isLoggedIn = true;
						this.globalService.setUserTenants(result.extraData.tenants);

						// Save credentials for biometric login on future visits
						if (this.isBiometricAvailable) {
							this.globalService.setLoginCredintials(JSON.stringify({
								usernameOrEmail: this.loginPayload.usernameOrEmail,
								password: this.loginPayload.password,
								countryCode: this.loginPayload.countryCode
							}));
							this.hasSavedCredentials = true;
							console.log('🔐 [Login] Saved biometric credentials for:', this.loginPayload.usernameOrEmail);
						} else {
							console.log('🔐 [Login] Biometric NOT available, credentials NOT saved');
						}

						// Fetch user profile before navigation
						await this.getUserProfile();
						// Log current tenant for debugging
						this.accountService.getCurrentTenant().subscribe(
							tenant => console.log('📍 [LoginByMail] Current Tenant:', JSON.stringify(tenant)),
							err => console.error('Failed to fetch current tenant:', err)
						);
						await this.getUserPrefrences(result);
						if (this.globalService.isEthrai) {
							await this.getUserStats();
							this.firebaseEventService.logLoginEvent(true, this.globalService.getUserStats(), 'signin_email', null)

						}
					} else {
						this.isLoading = false;
						this.globalService.toast(localize('EmailOrPasswordFailed'));
					}
				},
				error => {
					this.isLoading = false
					this.handleLoginError(error);
				}
			);
		}

	}

	private handleLoginError(error: any) {
		const err = error?.error;
		const code = err?.errorCode || '';
		console.log('Login error:', code || 'unknown');

		if (!err) {
			this.globalService.toast(localize('EmailOrPasswordFailed'));
		} else if (code.includes('EmailNotConfirmed')) {
			this.globalService.toast(localize('EmailNotConfirmed'));
		} else if (code.includes('WrongUsernameOrPassword') || code.includes('ProfileNotFound')) {
			this.globalService.toast(localize('EmailOrPasswordFailed'));
		} else if (code.includes('AccountLocked')) {
			this.globalService.toast(localize('AccountLocked'));
		} else if (code.includes('LoginWithIam')) {
			this.globalService.toast(localize('LoginWithIam'));
		} else if (code.includes('InvalidModel')) {
			this.globalService.toast(localize('InvalidModel'));
		} else {
			this.globalService.toast(localize('EmailOrPasswordFailed'));
		}
	}

	getUserPrefrences(result) {
		console.log('📍 htamta [getUserPrefrences] tenants:', JSON.stringify(result.extraData?.tenants));
		return this.accountService.getProfilePrefrences().toPromise().then(
			res => {
				this.isLoading = false

				if (res == null) {
					this.globalService.editPrefrences = true
				}
				if (result.extraData.tenants.length == 1) {
					this.globalService.setEthraiTenant(true)
				}
				console.log("this.globalService.editPrefrences", this.globalService.editPrefrences)
				this.ngZone.run(() => {
					if (result.extraData.tenants.length > 1) {
						this.router.navigate(['choose-account'], { clearHistory: true });
					} else if (result.extraData.tenants.length == 1 && this.globalService.editPrefrences) {
						this.globalService.isEthrai = true;
						this.router.navigate(['categories'], { clearHistory: true });
					} else if (result.extraData.tenants.length == 1 && !this.globalService.editPrefrences) {
						// this.globalService.isEthrai = true;
						this.router.navigate(['highlighted'], { clearHistory: true });
					} else {

						this.globalService.isEthrai = true;
						this.router.navigate(['categories'], { clearHistory: true });
					}
				});
			}
		).catch(error => {
			console.error('Error getting profile preferences:', error);
			this.isLoading = false;
			this.globalService.toast(localize('SomethingWentWrong'));
		});
	}
	onCheckChange(e) {
		this.globalService.setIsKeepLogged(e.value)
	}

	getUserStats() {
		return this.dashboardService.getUserStats().toPromise().then(
			res => {
				this.globalService.setUserStats(res);
				if (this.globalService.isEthrai) {
					this.firebaseEventService.logScreenViewedEvent(this.globalService.isLoggedIn, res, 'highlighted', this.globalService.getUserProfile());
				}
			}
		)
	}
	getUserProfile() {
		return this.accountService.getUserProfile().toPromise().then(
			async response => {
				let profile = response as any
				this.globalService.setUserProfile(profile);
			}
		).catch(error => {
			console.error('Error getting user profile:', error);
		});
	}
}