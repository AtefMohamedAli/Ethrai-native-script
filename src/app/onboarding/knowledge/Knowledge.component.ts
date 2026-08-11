import { Component, OnInit } from '@angular/core';
import { RouterExtensions } from '@nativescript/angular';
import { Page } from "@nativescript/core";
import { Frame } from '@nativescript/core';
import { localize } from '@nativescript/localize';
import { FirebaseEventService } from '~/app/shared/services/firebase.event.service';
import { AccountService } from '../../account/account.service';
import { GlobalService } from '../../shared/services/global.service';
@Component({
	moduleId: module.id,
	selector: 'Knowledge',
	templateUrl: './Knowledge.component.html',
	styleUrls: ['./Knowledge.component.css']
})

export class KnowledgeComponent implements OnInit {
	selectedLevels: any[] = [];

	constructor(private page: Page, private globalService: GlobalService, private accountService: AccountService, private router: RouterExtensions,
		private firebaseEventService: FirebaseEventService) {
		page.actionBarHidden = true;

	}
	goBack() {

		Frame.topmost().goBack();

	}
	ngOnInit() {
		if (this.globalService.isEthrai) {
			this.firebaseEventService.logScreenViewedEvent(this.globalService.isLoggedIn, this.globalService.getUserStats(), 'onboarding_3', this.globalService.getUserProfile());
		}
	}

	addDuration(level) {
		if (this.selectedLevels?.includes(level)) {
			let levelIndex = this.selectedLevels.indexOf(level);
			this.selectedLevels.splice(levelIndex, 1);
		} else {
			if (this.selectedLevels) {
				this.selectedLevels.push(level);
			} else {
				this.selectedLevels = new Array();
				this.selectedLevels.push(level);
			}
		}
	}
	save() {
		if (this.selectedLevels.length == 0) {
			this.globalService.toast(localize('noselect'));
		}
		else {
			let payload = {
				userProfileId: this.globalService.getUserProfile().id,
				courseDurationIds: this.globalService.getSelectedDurations(),
				courseLevels: this.selectedLevels.includes('all') ? ['All'] : this.selectedLevels
			}
			this.accountService.setProfilePrefrences(payload).subscribe(
				res => {
					if ((res as any).success) {
						this.router.navigate(['register-confirm'])
					}

				},
				err => {
					console.log("///////////////////", err)
					this.globalService.toast(localize('tryAgain'))

				}
			)
		}
	}

}