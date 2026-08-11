import { Component, OnInit } from '@angular/core';
import { Application, Dialogs, isAndroid, Page } from '@nativescript/core';
import { UserProfile } from '../../shared/models/user-profile';
import { GlobalService } from '../../shared/services/global.service';
import { AccountService } from '../account.service';
import { Utils } from '@nativescript/core'
import { RouterExtensions } from '@nativescript/angular';
import { EnrolledCourse } from '../../shared/models/enrolled-course';
import { environment } from '../../../../environments/environment';
import { HttpService } from '../../shared/services/http.service';
import { Router } from '@angular/router';
import * as storeRating from 'nativescript-store-ratings';
import { DashboardService } from '../../dashboard/dashboard.service'
import * as share from '@nativescript/social-share'
import { FirebaseEventService } from '~/app/shared/services/firebase.event.service';



declare var android;
@Component({
	moduleId: module.id,
	selector: 'account-page',
	templateUrl: './account-page.component.html',
	styleUrls: ['./account-page.component.css']
})

export class AccountPageComponent implements OnInit {
	fullName: string;
	profile: UserProfile;
	isLoggedIn: boolean;
	learningSecondsCount: number;
	completedCourses: number;
	inProgressCourses: number;
	learningMinutesCount: any;
	bePartnerEn: any;
	api: string;
	isEthrai: any;
	twitterLink: any;
	faceBookLink: any;
	instagramLink: any;
	googleLink: any;
	bePart: any;
	training: any;

	interestsIDs: string[];
	userTags: any = [];
	currentTenantID: any;
	public email: string;
	isSaudi: boolean;
	clickedd = {}; s;
	clickedd1 = {}; b;
	elem;
	competences: any;
	// Intl removed - not available on iOS
	intl = { format: (n) => String(n) }; // Intl polyfill for iOS



	constructor(private page: Page, private globalService: GlobalService, private accountService: AccountService,
		private routerExtensions: RouterExtensions, private httpService: HttpService, private router: Router, private dashboardService: DashboardService,
		private firebaseEventService: FirebaseEventService) {
		//page.actionBarHidden = true;
		this.isEthrai = this.globalService.isEthrai
	}
	templateSelector(elem: any, index: number, elems: any): string {
		if (index == 0) {
			return !elem.expanded ? 'expanded' : 'default';
		}
		return elem.expanded ? 'expanded' : 'default';
	}

	clickme(elem) {
		this.clickedd = elem;
	}
	uclickme(elem) {
		this.clickedd = {};
	}
	clickme1(elem) {
		this.clickedd1 = elem;
	}
	uclickme1(elem) {
		this.clickedd1 = {};
	}


	ngOnInit() {
		this.isLoggedIn = this.globalService.isLoggedIn;
		this.api = environment.WEB_API
		if (this.isLoggedIn) {
			this.learningMinutesCount = 0;
			this.learningSecondsCount = 0;
			this.inProgressCourses = 0;
			this.completedCourses = 0;
			this.interestsIDs = this.globalService.getUserInterestsIDs();
			this.getUserInterests();
			this.getCompetences();
			this.fullName = this.globalService.getUserFullNameAr();
			this.profile = this.globalService.getUserProfile();
			// if(this.profile.photoUrl == "" || this.profile.photoUrl == null){
			// 	this.profile.photoUrl="~/images/avatar.png"
			// }
			this.isSaudi = this.globalService.isSaudi();
			if (this.globalService.isEthrai) {
				this.firebaseEventService.logScreenViewedEvent(this.globalService.isLoggedIn, this.globalService.getUserStats(), 'account', this.globalService.getUserProfile());
			}

		} else {
			this.firebaseEventService.logScreenViewedEvent(this.globalService.isLoggedIn, null, 'account', null);
		}
		this.getSocialLinks();
		this.getUserStatistics();
		this.accountService.BePartner().subscribe(
			res => {
				let htmlString = (res as any)[0].contentAr;
				this.bePart = htmlString.replace(/<[^>]+>/g, '').replace(/&nbsp;/g, '')
			},
		)

		this.isEthrai = this.globalService.isEthrai

		this.getUserCurrentTenant();

		this.dashboardService.getInstitutionalTraining().subscribe(
			res => {
				let trainingHTMLString = (res as any)[0].contentAr;
				this.training = trainingHTMLString.replace(/<[^>]+>/g, '').replace(/&nbsp;/g, '')
			},
		)
	}
	getCompetences() {
		this.accountService.getCompetences().subscribe(
			res => {
				this.competences = res as any
			}
		)
	}

	getUserInterests() {
		this.accountService.getAllTags().subscribe(
			response => {
				let allTags = response as any[]
				this.userTags = allTags.filter(tag => {
					if (this.interestsIDs?.includes(tag.id)) {
						return tag;
					}
				})
			})
	}

	getUserCurrentTenant() {
		this.email = this.globalService.getUserCurrentEmail();
		// this.accountService.getCurrentTenant().subscribe(
		// 	response=>{
		// 	   let tenant=response as any
		// 	   let currentTenantID = tenant.id;
		// 	   let currentTenant=this.profile.tenants.filter(t=>{t.tenantId==currentTenantID;return t});
		// 	   this.email=currentTenant[0].email;
		// 	   this.globalService.setCurrentTenant(currentTenant[0]);
		// 	})
	}





	getSocialLinks() {
		this.accountService.getEthraiSocialLinks().subscribe(
			response => {
				let links = response as any[];
				links.forEach(element => {
					if (element.nameEn == 'Twitter') {
						this.twitterLink = element.link
					} else if (element.nameEn == 'Facebook') {
						this.faceBookLink = element.link
					} else if (element.nameEn == 'Instagram') {
						this.instagramLink = element.link
					} else if (element.nameEn == 'Any') {
						this.googleLink = element.link
					}
				});
			},
			err => {
				this.globalService.toast('تعذر تحميل روابط التواصل الاجتماعي');
			}
		)
	}
	openURL(url) {
		if (url && url.length > 0) {
			Utils.openUrl(url);
		} else {
			this.globalService.toast('الرابط غير متوفر');
		}
	}

	navigateToProfileForm() {
		if (this.email) {
			this.router.navigate(['/profile-form', this.email]);
		} else {
			this.globalService.toast('Unable to load profile email');
		}
	}

	logOut() {
		Dialogs.confirm({
			title: "تسجيل الخروج",
			message: "هل أنت متأكد من تسجيل الخروج؟",
			okButtonText: "نعم",
			cancelButtonText: "لا"
		}).then(result => {
			if (result) {
				if (this.globalService.isEthrai) {
					this.firebaseEventService.logLogOutEvent(this.globalService.isLoggedIn, this.globalService.getUserStats(), 'account', this.globalService.getUserProfile())
				}
				this.globalService.isLoggedIn = false;
				this.globalService.setToken("");
				this.globalService.setIsKeepLogged(false)
				// Keep biometric credentials so the biometric login button
				// remains available after logout (credentials are only cleared
				// when the fingerprint database changes for security).
				this.httpService.apiURL = environment.API_URL;
				this.globalService.setUserProfile(null);
				this.routerExtensions.navigate(['/login'], { clearHistory: true });
			}
		});
	}
	removeAccount() {
		Dialogs.confirm({
			title: "حذف الحساب",
			message: "هل أنت متأكد من حذف حسابك؟ لا يمكن التراجع عن هذا الإجراء.",
			okButtonText: "حذف",
			cancelButtonText: "إلغاء"
		}).then(result => {
			if (result) {
				// Save the email as deleted locally
				if (this.email) {
					this.globalService.addDeletedAccount(this.email);
				}
				// Perform logout cleanup
				this.globalService.isLoggedIn = false;
				this.globalService.setToken("");
				this.globalService.setIsKeepLogged(false);
				this.globalService.clearLoginCredintials();
				this.httpService.apiURL = environment.API_URL;
				this.globalService.setUserProfile(null);
				this.globalService.toast("تم حذف الحساب بنجاح");
				this.routerExtensions.navigate(['/login'], { clearHistory: true });
			}
		});
	}
	getUserStatistics() {
		this.accountService.getStatistics().subscribe(
			response => {
				let courses = response as EnrolledCourse[]
				if (courses != null) {
					courses.forEach(course => {
						//	if(course.isEnrolled){
						this.learningSecondsCount += course.attendedSeconds
						//	}
						if (course.status == 'InProgress') {
							this.inProgressCourses += 1
						} else if (course.status == 'Success') {
							this.completedCourses += 1
						}
					});
					this.learningMinutesCount = (this.learningSecondsCount / 60).toFixed(0);
				}
			},
			err => {

			}
		)
	}
	gotoWebsite() {
		Utils.openUrl(this.api);
	}
	shareApp() {
		if (isAndroid) {
			share.shareUrl("https://play.google.com/store/apps/details?id=sa.ethrai", "");

		} else {
			share.shareUrl("https://apps.apple.com/us/app/ethrai/id1438205024", "");

		}
	}
	rateApp() {
		storeRating.initRating();
		// if(Application.android){
		// 	Dialogs.confirm({
		// 		title: "What do you think?",
		// 		message: "Rate Ethrai",
		// 		okButtonText: "Rate Now",
		// 		cancelButtonText: "No Thanks",
		// 	}).then(result => {
		// 		if (result == true) {
		// 			let appStore = "";
		// 			if (Application.android) {
		// 				let androidPackageName = Application.android.packageName;
		// 				console.log("Application.android.packageName",Application.android.packageName)
		// 				let uri = android.net.Uri.parse("market://details?id=" + androidPackageName);
		// 				let myAppLinkToMarket = new android.content.Intent(android.content.Intent.ACTION_VIEW, uri);
		// 				// Utils.openUrl(uri.toString());
		// 				// Launch the PlayStore
		// 				 Application.android.foregroundActivity.startActivity(myAppLinkToMarket);
		// 				 Utils.openUrl(appStore);
		// 			} 
		// 		} else if (result == false) {
		// 			// Decline
		// 		} else {
		// 			// ApplicationSettings.setNumber(this.configuration.id, 0);
		// 		}
		// 	});
		// }else{
		// 	storeRating.initRating();
		// }


	}
}