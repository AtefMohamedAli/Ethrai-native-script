import { Component, OnInit } from '@angular/core';
import { ModalDialogParams } from '@nativescript/angular';
import { registerElement } from '@nativescript/angular';
import { GlobalService } from '~/app/shared/services/global.service';
import { DashboardService } from '../dashboard.service';
import { localize } from '@nativescript/localize';
import { Page } from '@nativescript/core';
import { FirebaseEventService } from '~/app/shared/services/firebase.event.service';
import { firstValueFrom } from 'rxjs';

registerElement('StarRating', () => require('@triniwiz/nativescript-star-ratings').StarRating);
@Component({
	moduleId: module.id,
	selector: 'course-rating-modal',
	templateUrl: './course-rating-modal.component.html',
	styleUrls: ['./course-rating-modal.component.css']
})

export class CourseRatingModalComponent implements OnInit {
	description;
	score = 5
	courseId: any;
	enrollmentId: any;
	isSubmitting = false;

	constructor(private page: Page, private globalService: GlobalService, private dashboardService: DashboardService, private params: ModalDialogParams,
		private firebaseEventService: FirebaseEventService) {
		this.enrollmentId = params.context.enrollmentId;
		this.courseId = params.context.courseId;

	}

	ngOnInit() { }
	setScore(args: any) {
		this.score = Number(args.object.get('value'));
	}
	private closeWithSuccess(success: boolean, extraData: any = null): void {
		this.params.closeCallback([{ success, extraData }]);
	}

	private isAlreadySavedError(err: any): boolean {
		return err?.error?.errorCode === 'AlreadySaved' || err?.errorCode === 'AlreadySaved';
	}

	async save() {
		if (this.isSubmitting) return;
		if (this.score == 0 || (this.description == '' || !this.description)) {
			this.globalService.toast(localize('novalue'))
			return;
		}

		this.isSubmitting = true;
		try {
			if (this.globalService.isEthrai) {
				this.firebaseEventService.logRatingSubmitEvent('course_page', this.description)
			}
			const product = {
				productId: this.courseId,
				description: this.description,
				rating: this.score,
				enrollmentId: this.enrollmentId,
			};
			const res: any = await firstValueFrom(this.dashboardService.addRatingToCourse(product));
			if (res?.success) {
				this.globalService.toast(localize('succRate'));
				this.closeWithSuccess(true, res.extraData);
				return;
			}
			this.globalService.toast(localize('tryAgain'));
			this.closeWithSuccess(false);
		} catch (err) {
			console.log(err);
			if (this.isAlreadySavedError(err)) {
				this.globalService.toast(localize('alreadyRated'));
				this.closeWithSuccess(true);
				return;
			}
			this.globalService.toast(localize('tryAgain'));
			this.closeWithSuccess(false);
		} finally {
			this.isSubmitting = false;
		}
	}
	closeKeyboard(args) {
		var myTextField = args.object;
		myTextField.dismissSoftInput();

	}
}
