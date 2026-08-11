import { Component, OnInit } from '@angular/core';
import { RouterExtensions } from '@nativescript/angular';
import { Page } from "@nativescript/core";
import { Frame } from '@nativescript/core';
import { localize } from '@nativescript/localize';
import { FirebaseEventService } from '~/app/shared/services/firebase.event.service';
import { GlobalService } from '~/app/shared/services/global.service';
import { AccountService } from '../../account/account.service';
@Component({
	moduleId: module.id,
	selector: 'duration',
	templateUrl: './duration.component.html',
	styleUrls: ['./duration.component.css']
})

export class DurationComponent implements OnInit {
	durations: any[];
	selectedDurations: any = [];

	constructor(private page: Page, private accountService: AccountService, private router: RouterExtensions, private globalService: GlobalService,
		private firebaseEventService: FirebaseEventService) {
		page.actionBarHidden = true;

	}
	goBack() {

		Frame.topmost().goBack();

	}

	ngOnInit() {
		this.firebaseEventService.logScreenViewedEvent(this.globalService.isLoggedIn, this.globalService.getUserStats(), 'onboarding_2', this.globalService.getUserProfile());
		this.accountService.getDurations().subscribe(
			res => {
				this.durations = (res as any[]).sort(this.sortByHoursAsc)
			}
		)
	}

	addDuration(durationID) {
		if (this.selectedDurations?.includes(durationID)) {
			let durationIndex = this.selectedDurations.indexOf(durationID);
			this.selectedDurations.splice(durationIndex, 1);
		} else {
			if (this.selectedDurations) {
				this.selectedDurations.push(durationID);
			} else {
				this.selectedDurations = new Array();
				this.selectedDurations.push(durationID);
			}
		}
	}
	save() {
		if (this.selectedDurations.length == 0) {
			this.globalService.toast(localize('noselect'));
		}
		else {
			if (this.selectedDurations.includes('all')) {
				let selectedDurations = [];
				this.durations.forEach(element => {
					selectedDurations.push(element.id)
				});
				this.globalService.setSelectedDurations(selectedDurations);
			} else {
				this.globalService.setSelectedDurations(this.selectedDurations);

			}
			this.router.navigate(['knowledge'])
		}
	}

	sortByHoursAsc(a, b) {
		let aDate = a.min
		let bDate = b.min
		if (aDate < bDate) {
			return -1;
		}
		if (aDate > bDate) {
			return 1;
		}
		return 0;
	}
}