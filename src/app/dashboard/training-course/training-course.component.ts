import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Page, isAndroid, Screen } from '@nativescript/core';
import { Frame } from '@nativescript/core';
import { LoadOnDemandListViewEventData, RadListView } from 'nativescript-ui-listview';
import { GlobalService } from '~/app/shared/services/global.service';
import { ProductsDetail } from '../../shared/models/products-detail';
import { ProductsSearchOptions } from '../../shared/models/products-search-options';
import { DashboardService } from '../dashboard.service';
import { localize } from '@nativescript/localize';
import { FirebaseEventService } from '~/app/shared/services/firebase.event.service';
import { RouterExtensions } from '@nativescript/angular';
@Component({
	moduleId: module.id,
	selector: 'training-course',
	templateUrl: './training-course.component.html',
	styleUrls: ['./training-course.component.css']
})

export class TraingCourseComponent implements OnInit {
	isLoading: boolean;
	categoryId: string;
	categoryNameAr: any;
	pageIndex: any = 0;
	pageSize: number = 10;
	coursesObservableArray: any = [];
	courses: any;
	isSourceHasElements: boolean;
	highlighted: any;
	isHighlightedLoading: boolean;
	Math
	screenHeight = Screen.mainScreen.heightDIPs
	isAndroid: boolean;
	options: any = new ProductsSearchOptions();
	// Intl removed - not available on iOS
	intl = { format: (n) => String(n) }; // Intl polyfill for iOS
	constructor(private page: Page, private route: ActivatedRoute, private dashboardService: DashboardService, private globalService: GlobalService, private firebaseEventService: FirebaseEventService,
		private router: RouterExtensions) {
		//page.actionBarHidden = true;
		this.categoryId = this.route.snapshot.paramMap.get("id");
		this.categoryNameAr = this.route.snapshot.paramMap.get("categoryNameAr");
		this.Math = Math
		this.isAndroid = isAndroid
	}
	goBack() {

		Frame.topmost().goBack();

	}
	ngOnInit() {
		this.coursesObservableArray.push.apply(this.coursesObservableArray, {})
		let filter = this.globalService.getCourseListFilter();
		if (filter) {
			let selectedRating: number = filter?.rating?.some(item => item.isChecked) ? filter.rating.find(x => x.isChecked).rate : 0
			let priceCategory: string = filter?.priceTypes?.some(item => item.isChecked) ? filter.priceTypes.find(x => x.isChecked).value : 'All'
			let duration = filter.durations?.some(item => item.isChecked) ? filter.durations.find(x => x.isChecked) : undefined
			let minDuration = duration?.min ? duration?.min : 0;
			let maxDuration = duration?.max ? duration?.max : 10000;
			this.options.maxHours = maxDuration
			this.options.minHours = minDuration
			this.options.minRating = selectedRating;
			this.options.pricingType = priceCategory;
			filter.levels.length > 0 ? this.options.levels = filter.levels : this.options.levels = [];
			this.options.categoryId = this.categoryId;
			this.options.pageSize = this.pageSize;
			this.options.publishDateSortingType = filter?.sortType == 'earlier' ? 'Asc' : 'Desc'
			this.options.pricingSortingType = 'None'
		} else {
			this.options.pageSize = this.pageSize;
			this.options.categoryId = this.categoryId;
			this.options.levels = [];
			this.options.minHours = 0;
			this.options.maxHours = 10000;
			this.options.minRating = 0;
		}
		// if(isAndroid){
		this.getCourses();
		// }
		this.getHighlightedCourses();

		if (this.globalService.isLoggedIn && this.globalService.isEthrai) {
			this.firebaseEventService.logScreenViewedEvent(this.globalService.isLoggedIn, this.globalService.getUserStats(), 'list_of_training_programs', this.globalService.getUserProfile());
		} else if (!this.globalService.isLoggedIn) {
			this.firebaseEventService.logScreenViewedEvent(this.globalService.isLoggedIn, null, 'list_of_training_programs', null);
		}

	}
	getHighlightedCourses() {
		this.isHighlightedLoading = true;
		this.dashboardService.getHighligtedProducts(this.categoryId, 5).subscribe(
			res => {
				this.isHighlightedLoading = false;
				this.highlighted = (res as any).courses
			}
		)
	}
	get dataItems() {
		return this.coursesObservableArray;
	}
	public addMoreCourses(listView: RadListView) {
		++this.pageIndex;
		this.getCourses();
		if (listView) {
			// Call the optimized function for on-demand loading finished.
			// (with 0 because the ObservableArray has already
			// notified about the inserted items)
			listView.notifyAppendItemsOnDemandFinished(0, !this.isSourceHasElements);
		}

	}

	public async onLoadMoreItemsRequested(args) {
		//const that = new WeakRef(this);
		//const listView: RadListView = args.object;
		await this.getCourses();
		// if (this.courses.length > 0) {
		// 	// setTimeout(function () {
		// 	// 	that.get().addMoreCourses(listView);
		// 	// }, 0);
		// 	listView.notifyAppendItemsOnDemandFinished(0, !this.isSourceHasElements);
		// 	args.returnValue = true;
		// } else {
		// 	args.returnValue = false;
		// 	listView.notifyAppendItemsOnDemandFinished(0, true);
		// }
	}
	/*templateSelector(item: any, index: number, items: any): string {
		console.log("item=={} ",item=={} )
		return item=={} ? "header" : "default";
	  }*/
	getCourses() {
		this.isLoading = true;
		this.options.pageIndex = this.pageIndex;
		console.log(this.options)
		return this.dashboardService.searchProducts(this.options).toPromise().then(
			response => {

				this.isLoading = false;
				let products = response as ProductsDetail;
				this.courses = products.courses.filter(course => course.isPublished);
				this.coursesObservableArray.push.apply(this.coursesObservableArray, this.courses);
				this.courses.length > 0 ? this.isSourceHasElements = true : this.isSourceHasElements = false;
				if (products.totalCourses < 4) {
					this.screenHeight = .8 * this.screenHeight
				}
				++this.pageIndex;
			},
			error => {

			}
		)
	}
	setFavoriteH(id, type, isFav: boolean, i) {
		if (this.globalService.isLoggedIn) {
			let payload = {
				"productId": id,
				"type": type
			}
			if (!isFav) {
				this.dashboardService.setFavoriteProducts(payload).subscribe(
					res => {
						if ((res as any).success) {
							this.highlighted[i].isFavorite = true;
							this.globalService.toast(localize('FavAdded'))

						}
					},
					err => {

					}
				)
			} else {
				this.dashboardService.removeFavoriteProducts(payload).subscribe(
					res => {
						this.highlighted[i].isFavorite = false;
						if ((res as any).success) {
							this.globalService.toast(localize('FavRemoved'))
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
	setFavoriteC(id, type, isFav: boolean, i) {
		if (this.globalService.isLoggedIn) {
			let payload = {
				"productId": id,
				"type": type
			}
			if (!isFav) {
				this.dashboardService.setFavoriteProducts(payload).subscribe(
					res => {
						if ((res as any).success) {
							this.coursesObservableArray[i].isFavorite = true;
							this.globalService.toast(localize('FavAdded'))

						}
					},
					err => {

					}
				)
			} else {
				this.dashboardService.removeFavoriteProducts(payload).subscribe(
					res => {
						this.coursesObservableArray[i].isFavorite = false;
						if ((res as any).success) {
							this.globalService.toast(localize('FavRemoved'))

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
				"list_of_training_programs", this.globalService.getUserProfile(), course)
		}
		this.router.router.routeReuseStrategy.shouldReuseRoute = function () { return false };
		this.router.navigate(['/course-details', id]);
	}

	addFilter() {
		this.globalService.setCategoryParams({ categoryId: this.categoryId, categoryName: this.categoryNameAr })
		this.router.navigate(['filter', 'courseListFilter']);
	}
}