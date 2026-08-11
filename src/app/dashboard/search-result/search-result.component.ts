import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { RouterExtensions } from '@nativescript/angular';
import { isAndroid, isIOS, Screen } from '@nativescript/core';
import { Frame } from '@nativescript/core';
import { Page } from '@nativescript/core';
import { LoadOnDemandListViewEventData, RadListView } from 'nativescript-ui-listview';
import { WebinarBriefDetail } from '~/app/shared/models/webinar-brief-detail';
import { FirebaseEventService } from '~/app/shared/services/firebase.event.service';
import { ProductBriefDetail } from '../../shared/models/product-brief-detail';
import { ProductsDetail } from '../../shared/models/products-detail';
import { ProductsSearchOptions } from '../../shared/models/products-search-options';
import { SearchFilter } from '../../shared/models/search-filter';
import { GlobalService } from '../../shared/services/global.service';
import { DashboardService } from '../dashboard.service';

@Component({
	moduleId: module.id,
	selector: 'search-result',
	templateUrl: './search-result.component.html',
	styleUrls: ['./search-result.component.css']
})

export class SearchResultComponent implements OnInit {
	private coursesObservableArray = [];
	private allProducts = []; // Full unfiltered results from API
	keyWord: string;
	isCoursesLoading: boolean;
	isSourceHasElements: boolean = true;
	resultCount: number;
	filter: SearchFilter;
	screenHeight: number;
	totalProductCount: number;

	constructor(private page: Page, private router: Router, private dashboardService: DashboardService, private globalService: GlobalService,
		private firebaseEventService: FirebaseEventService) {
		let data = this.router.getCurrentNavigation().extras.state;
		if (data?.keyword) {
			this.keyWord = data?.keyword;
			this.globalService.setSearchFilter(undefined);
		} else {
			this.keyWord = this.globalService.getSearchedKeyWord();
		}
		this.screenHeight = Screen.mainScreen.heightDIPs;
	}
	goBack() {
		Frame.topmost().goBack();
	}
	ngOnInit() {
		this.coursesObservableArray = [];
		this.allProducts = [];
		this.filter = this.globalService.getSearchFilter();

		// Only fetch from API if we don't have cached results for this keyword
		this.fetchAllProducts();

		if (this.globalService.isLoggedIn && this.globalService.isEthrai) {
			this.firebaseEventService.logScreenViewedEvent(this.globalService.isLoggedIn, this.globalService.getUserStats(), 'search_result', this.globalService.getUserProfile());
		} else if (!this.globalService.isLoggedIn) {
			this.firebaseEventService.logScreenViewedEvent(this.globalService.isLoggedIn, null, 'search_result', null);
		}
	}
	get dataItems() {
		return this.coursesObservableArray;
	}

	/**
	 * Fetch ALL products from API using keyword only (no filter params).
	 * Filters are applied locally after fetching.
	 */
	fetchAllProducts() {
		this.isCoursesLoading = true;
		const options = new ProductsSearchOptions();
		options.keyword = this.keyWord;
		options.pageSize = 200;
		options.pageIndex = 0;
		options.levels = [];
		options.minHours = 0;
		options.maxHours = 10000;
		options.minRating = 0;
		options.pricingType = 'All';
		options.publishDateSortingType = 'Desc';
		options.pricingSortingType = 'None';

		return this.dashboardService.searchProducts(options).toPromise().then(
			response => {
				this.isCoursesLoading = false;
				let products = response as ProductsDetail;
				let courses = (products.courses || []).filter(c => { if (c.isPublished) { c.type = "course"; return true } return false });
				let paths = (products.coursePaths || []).filter(c => { if (c.isPublished) { c.type = "path"; return true } return false });
				let webinars = (products.webinars || []).filter(c => { if (c.isPublished) { c.type = "webinar"; return true } return false });
				let kes = (products.kes || []).filter(c => { if (c.isPublished) { c.type = "ke"; return true } return false });

				// Merge all product types into one flat list
				this.allProducts = [...courses, ...webinars, ...paths, ...kes];

				// Apply local filters
				this.applyFilters();
			}
		)
	}

	/**
	 * Apply all filters locally on the cached allProducts array.
	 * Called after API fetch AND when returning from filter screen.
	 */
	applyFilters() {
		let filtered = [...this.allProducts];

		if (this.filter) {
			// 1. Filter by product type
			let productType = this.filter.productTypes?.some(item => item.isChecked)
				? this.filter.productTypes.find(x => x.isChecked).value
				: undefined;

			if (productType) {
				if (productType == 'trainingProgram') {
					filtered = filtered.filter(item => item.type === 'course');
				} else if (productType == 'webinar') {
					filtered = filtered.filter(item => item.type === 'webinar');
				} else if (productType == 'coursePath') {
					filtered = filtered.filter(item => item.type === 'path');
				} else if (productType == 'ke') {
					filtered = filtered.filter(item => item.type === 'ke');
				}
			}

			// 2. Filter by price (Free/Paid)
			let priceCategory = this.filter.priceTypes?.some(item => item.isChecked)
				? this.filter.priceTypes.find(x => x.isChecked).value
				: undefined;

			if (priceCategory === 'Free') {
				filtered = filtered.filter(item => !item.price || item.price === 0);
			} else if (priceCategory === 'Paid') {
				filtered = filtered.filter(item => item.price && item.price > 0);
			}

			// 3. Filter by rating
			let selectedRating = this.filter.rating?.some(item => item.isChecked)
				? this.filter.rating.find(x => x.isChecked).rate
				: 0;

			if (selectedRating > 0) {
				filtered = filtered.filter(item => (item.rating || 0) >= selectedRating);
			}

			// 4. Filter by duration (hours)
			let duration = this.filter.durations?.some(item => item.isChecked)
				? this.filter.durations.find(x => x.isChecked)
				: undefined;

			if (duration) {
				let minHours = duration.min || 0;
				let maxHours = duration.max || 10000;
				filtered = filtered.filter(item => {
					let hours = (item.numberOfSeconds || 0) / 3600;
					return hours >= minHours && hours <= maxHours;
				});
			}

			// 5. Filter by level
			if (this.filter.levels && this.filter.levels.length > 0) {
				filtered = filtered.filter(item =>
					!item.courseLevel || this.filter.levels.includes(item.courseLevel)
				);
			}

			// 6. Sort
			if (this.filter.sortType === 'earlier') {
				filtered.sort((a, b) => new Date(a.publishDate).getTime() - new Date(b.publishDate).getTime());
			} else if (this.filter.sortType === 'latest') {
				filtered.sort((a, b) => new Date(b.publishDate).getTime() - new Date(a.publishDate).getTime());
			}
		}

		// Update display
		this.coursesObservableArray = filtered;
		this.totalProductCount = filtered.length;
		if (this.totalProductCount < 4) {
			this.screenHeight = .8 * Screen.mainScreen.heightDIPs;
		} else {
			this.screenHeight = Screen.mainScreen.heightDIPs;
		}
	}

	addFilter() {
		if (this.keyWord) {
			this.globalService.setSearchedKeyWord(this.keyWord);
		}
		this.router.navigate(['filter', 'searchFilter']);
	}
}