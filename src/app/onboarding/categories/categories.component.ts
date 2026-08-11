import { Component, OnInit } from '@angular/core';
import { RouterExtensions } from '@nativescript/angular';
import { Page } from "@nativescript/core";
import { Frame } from '@nativescript/core';
import { UserProfile } from '../../shared/models/user-profile';
import { AccountService } from '../../account/account.service';
import { GlobalService } from '../../shared/services/global.service';
import { localize } from '@nativescript/localize';
import { FirebaseEventService } from '~/app/shared/services/firebase.event.service';
import { DashboardService } from '~/app/dashboard/dashboard.service';
@Component({
	moduleId: module.id,
	selector: 'categories',
	templateUrl: './categories.component.html',
	styleUrls: ['./categories.component.css']
})

export class CategoriesComponent implements OnInit {
	tags: any[];
	selectedInterests: string[];
	profile: UserProfile;
	isTagsUpdated: boolean = false;

	constructor(private page: Page, private accountService: AccountService, private router: RouterExtensions, private globalService: GlobalService,
		private firebaseEventService: FirebaseEventService, private dashboardService: DashboardService) {
		page.actionBarHidden = true;

	}
	goBack() {

		Frame.topmost().goBack();

	}

	ngOnInit() {
		this.getTags();
		this.getUserProfile();
	}

	getTags() {
		this.accountService.getAllTags().subscribe(
			response => {
				this.tags = response as any[]
			})
	}
	addTag(tagID) {
		this.isTagsUpdated = true
		if (this.selectedInterests?.includes(tagID)) {
			let tagIndex = this.selectedInterests.indexOf(tagID);
			this.selectedInterests.splice(tagIndex, 1);
		} else {
			if (this.selectedInterests) {
				this.selectedInterests.push(tagID);
			} else {
				this.selectedInterests = new Array();
				this.selectedInterests.push(tagID);
			}
		}
	}

	getUserProfile() {
		this.accountService.getUserProfile().subscribe(
			response => {
				this.profile = response as UserProfile
				this.selectedInterests = this.profile.interestsIds
				this.globalService.setUserProfile(this.profile);
				this.getUserStats();
				// this.fullName=this.globalService.getUserFullNameAr();
			}
		)
	}
	getUserStats() {
		this.dashboardService.getUserStats().subscribe(
			res => {
				this.globalService.setUserStats(res);
				if (this.globalService.isEthrai) {
					this.firebaseEventService.logScreenViewedEvent(this.globalService.isLoggedIn, res, 'onboarding_1', this.globalService.getUserProfile());
				}
			}
		)
	}
	saveTags() {
		if (this.selectedInterests.length == 0) {
			this.globalService.toast(localize('noselect'));
		}
		else {
			if (this.isTagsUpdated) {
				this.profile.interestsIds = this.selectedInterests;
				this.accountService.updateProfile(this.profile).subscribe(
					response => {
						if ((response as any).success) {
							this.router.navigate(['/duration'])
						}
					},
					err => {
						this.globalService.toast(localize('tryAgain'))
					}
				)
			} else {
				this.router.navigate(['/duration'])
			}
		}
	}
}