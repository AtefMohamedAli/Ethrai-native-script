import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { isAndroid, Page } from '@nativescript/core';
import { Frame } from '@nativescript/core';
import { LoadOnDemandListViewEventData, RadListView } from 'nativescript-ui-listview';
import { ProductsDetail } from '../../shared/models/products-detail';
import { ProductsSearchOptions } from '../../shared/models/products-search-options';
import { GlobalService } from '../../shared/services/global.service';
import { DashboardService } from '../dashboard.service';
import { localize } from '@nativescript/localize';
import { FirebaseEventService } from '~/app/shared/services/firebase.event.service';
import { RouterExtensions } from '@nativescript/angular';

@Component({
	moduleId: module.id,
	selector: 'training-program-card',
	templateUrl: './training-program-card.component.html',
	styleUrls: ['./training-program-card.component.css']
})

export class TraingProgramCardComponent implements OnInit {
	@Input() course: any;
	@Input() showType: boolean
	@Input() screenName: string;
	@Output() favRemoved = new EventEmitter<boolean>();
	Math
	isAndroid: any;
	// Intl removed - not available on iOS
	intl = { format: (n) => String(n) }; // Intl polyfill for iOS
	rating: number;
	constructor(private page: Page, private route: ActivatedRoute, private dashboardService: DashboardService, private globalService: GlobalService,
		private firebaseEventService: FirebaseEventService, private router: RouterExtensions) {
		this.Math = Math
		this.isAndroid = isAndroid
	}
	goBack() {

		Frame.topmost().goBack();

	}
	ngOnInit() {
		this.course?.rating ? this.rating = Math.round(this.course?.rating) : this.rating = 5;

	}
	setFavorite(id, type, isFav: boolean) {
		console.log("isFavisFav", isFav, id, type)
		if (this.globalService.isLoggedIn) {
			let payload = {
				"productId": id,
				"type": type
			}
			console.log("fav payload", payload)
			if (!isFav) {
				this.dashboardService.setFavoriteProducts(payload).subscribe(
					res => {
						if ((res as any).success) {
							this.course.isFavorite = true;
							this.globalService.toast(localize('FavAdded'))
						}
					},
					err => {

					}
				)
			} else {
				this.dashboardService.removeFavoriteProducts(payload).subscribe(
					res => {
						this.course.isFavorite = false;
						if ((res as any).success) {
							this.globalService.toast(localize('FavRemoved'))
							this.favRemoved.emit(true)
						}
					},
					err => {

					}
				)
			}


		} else {
			this.globalService.toast(localize('LogNeededFav'))
		}

	}
	goToCoursePage(id, course) {
		if (this.globalService.isEthrai || !this.globalService.isLoggedIn) {
			this.firebaseEventService.logCourseClickedEvent(this.globalService.isLoggedIn, this.globalService.getUserStats(),
				this.screenName, this.globalService.getUserProfile(), course)
		}
		this.router.router.routeReuseStrategy.shouldReuseRoute = function () { return false };
		this.router.navigate(['/course-details', id]);
	}
	getCourseProgressPercent(watchedSeconds: number, TotalSeconds: number) {
		const percent = (watchedSeconds / TotalSeconds) * 100;
		return this.intl.format(Number(percent.toFixed(1))) + '%';
	}
	getRatingArray(): number[] {
		const rounded = Math.round(this.course?.rating || 0);
		return Array.from({ length: rounded });
	}

}