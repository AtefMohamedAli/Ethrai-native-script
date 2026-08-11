import { Component, ElementRef, OnInit, QueryList, ViewChild, ViewChildren } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { RouterExtensions } from '@nativescript/angular';
import { Frame } from '@nativescript/core';
import { Page } from '@nativescript/core';
import { ValueList } from 'nativescript-drop-down';
import { FirebaseEventService } from '~/app/shared/services/firebase.event.service';
import { Category } from '../../shared/models/category';
import { SearchFilter } from '../../shared/models/search-filter';
import { GlobalService } from '../../shared/services/global.service';
import { DashboardService } from '../dashboard.service';
import { Duration } from '../../../app/shared/models/duration'
@Component({
	moduleId: module.id,
	selector: 'filter',
	templateUrl: './filter.component.html',
	styleUrls: ['./filter.component.css']
})

export class FilterComponent implements OnInit {
	@ViewChildren('CB') priceCheckboxes: QueryList<ElementRef>;
	@ViewChildren('CB2') levelCheckboxes: QueryList<ElementRef>;
	@ViewChildren('CB3') ratingCheckboxes: QueryList<ElementRef>;
	// Intl removed - not available on iOS
	intl = { format: (n) => String(n) }; // Intl polyfill for iOS
	ratings = this.globalService.getRatingsFilter()
	priceCategory = [
		{ value: 'Free', text: "مجاني", isChecked: false },
		{ value: 'Paid', text: "مدفوع", isChecked: false },
	]
	durations
	// =[
	// 	{min:0,max:1,text:"0-1 ساعة",isChecked:false},
	// 	{min:1,max:3,text:"1-3 ساعة",isChecked:false},
	// 	{min:3,max:6,text:"3-6 ساعة",isChecked:false},
	// 	{min:6,max:17,text:"6-17 ساعة",isChecked:false},
	// 	{min:17,max:Number.MAX_SAFE_INTEGER,text:"17 ساعة فأكثر",isChecked:false},

	// ]

	productsType;
	categories: Category[];
	filter: SearchFilter;
	isBeginner: boolean = false;
	isIntermediate: boolean = false;
	isAdvanced: boolean = false;
	isFree: boolean = false;
	isPaid: boolean = false;
	filterType: string;
	sortBy: ValueList<string> = new ValueList<string>();
	selectedSort: number;
	showProductsTypes: boolean = true;

	constructor(private page: Page, private globalService: GlobalService, private router: RouterExtensions, private route: ActivatedRoute,
		private firebaseEventService: FirebaseEventService, private dashboardService: DashboardService) {
		//page.actionBarHidden = true;
		this.filterType = this.route.snapshot.paramMap.get("type");
		this.sortBy.push({ value: "latest", display: "الأحدث" });
		this.sortBy.push({ value: "earlier", display: "الأقدم" });

	}
	goBack() {

		Frame.topmost().goBack();

	}


	ngOnInit() {
		if (this.globalService.isEthrai || this.globalService.isEthrai) {
			this.productsType = [
				{ value: "trainingProgram", text: "البرامج التدريبية", nameEn: "trainingProgram", isChecked: false },
				{ value: "webinar", text: "المؤتمرات الإلكترونية", isChecked: false },
				{ value: "ke", text: "الإضاءات الإثرائية", isChecked: false },
				{ value: "coursePath", text: "مسارات التدريب", isChecked: false },
				// {value:"CASESESTUDY",text:"الحالات الدراسية",isChecked:false} hidden from production
			]
		} else {
			this.productsType = [
				{ value: "trainingProgram", text: "البرامج التدريبية", nameEn: "trainingProgram", isChecked: false },
				{ value: "coursePath", text: "مسارات التدريب", isChecked: false }
			]
		}
		if (this.filterType == 'searchFilter') {
			this.filter = this.globalService.getSearchFilter();
			if (this.globalService.isLoggedIn && this.globalService.isEthrai) {
				this.firebaseEventService.logScreenViewedEvent(this.globalService.isLoggedIn, this.globalService.getUserStats(), 'search_filter', this.globalService.getUserProfile());

			} else if (!this.globalService.isLoggedIn) {
				this.firebaseEventService.logScreenViewedEvent(this.globalService.isLoggedIn, null, 'search_filter', null);
			}
		} else if (this.filterType == 'myProductFilter') {
			this.filter = this.globalService.getMyProductsFilter();
			if (this.globalService.isLoggedIn && this.globalService.isEthrai) {
				this.firebaseEventService.logScreenViewedEvent(this.globalService.isLoggedIn, this.globalService.getUserStats(), 'my_products_filter', this.globalService.getUserProfile());

			} else if (!this.globalService.isLoggedIn) {
				this.firebaseEventService.logScreenViewedEvent(this.globalService.isLoggedIn, null, 'my_products_filter', null);
			}
		} else if (this.filterType == 'courseListFilter') {
			this.filter = this.globalService.getCourseListFilter();
			this.showProductsTypes = false;
			if (this.globalService.isLoggedIn && this.globalService.isEthrai) {
				this.firebaseEventService.logScreenViewedEvent(this.globalService.isLoggedIn, this.globalService.getUserStats(), 'course_list_filter', this.globalService.getUserProfile());

			} else if (!this.globalService.isLoggedIn) {
				this.firebaseEventService.logScreenViewedEvent(this.globalService.isLoggedIn, null, 'course_list_filter', null);
			}
		} else if (this.filterType == 'certsFilter') {
			this.filter = this.globalService.getCertsFilter();
			this.showProductsTypes = false;
			if (this.globalService.isLoggedIn && this.globalService.isEthrai) {
				this.firebaseEventService.logScreenViewedEvent(this.globalService.isLoggedIn, this.globalService.getUserStats(), 'certificates_filter', this.globalService.getUserProfile());

			} else if (!this.globalService.isLoggedIn) {
				this.firebaseEventService.logScreenViewedEvent(this.globalService.isLoggedIn, null, 'certificates_filter', null);
			}
		}

		if (this.filter != undefined) {

			this.selectedSort = this.sortBy.getIndex(this.filter.sortType);

			if (this.filter?.rating) {
				this.ratings = this.filter.rating
			}
			if (this.filter && this.filter.levels.includes('Beginner')) {
				this.isBeginner = true
			}
			if (this.filter && this.filter.levels.includes('Intermediate')) {
				this.isIntermediate = true
			}
			if (this.filter && this.filter.levels.includes('Advanced')) {
				this.isAdvanced = true
			}
			if (this.filter && this.filter.priceTypes) {
				this.priceCategory = this.filter.priceTypes
			}
			if (this.filter.durations) {
				this.durations = this.filter.durations
			}
			if (this.filter.productTypes) {
				this.productsType = this.filter.productTypes
			}

		} else {
			this.getDurations();
		}
	}
	getDurations() {
		this.dashboardService.getDurations().subscribe(
			res => {
				this.durations = (res as Duration[]).sort(this.sortByHoursAsc);
				this.durations.forEach(element => {
					element.isChecked = false;
				});
			}
		)
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

	onPriceCheckChange(e: any, item) {
		if (this.filter == undefined) {
			this.filter = new SearchFilter();
		}

		item.isChecked = !item.isChecked;

		if (!item.isChecked) {
			return;
		}

		// uncheck all other options
		this.priceCategory.forEach(element => {
			if (element.text !== item.text) {
				element.isChecked = false;
			}
		});

		// if(this.filter==undefined){
		// 	this.filter=new SearchFilter();
		// }

		// if(e.value &&!this.filter.priceTypes.includes(type)){
		// 	this.filter.priceTypes.push(type);
		// }else{
		// 	this.filter.priceTypes.splice(this.filter.levels.indexOf(type),1);
		// }
		// 	if(e.value){
		// 		for(let i=0;i<this.filter.priceTypes.length;i++){
		// 			if(this.filter.priceTypes[i].categoryId==item){
		// 				this.filter.priceTypes[i].isChecked=true
		// 				break;
		// 			}
		// 		}
		// 	}else{
		// 		for(let i=0;i<this.filter.priceTypes.length;i++){
		// 			if(this.filter.priceTypes[i].categoryId==item){
		// 				this.filter.priceTypes[i].isChecked=false
		// 				break;
		// 			}
		// 	}
		// }
	}
	onRatingChange(e, item) {
		if (this.filter == undefined) {
			this.filter = new SearchFilter();
		}

		item.isChecked = !item.isChecked;

		if (!item.isChecked) {
			return;
		}

		// uncheck all other options
		this.ratings.forEach(element => {
			if (element.text !== item.text) {
				element.isChecked = false;
			}
		});

	}
	onLevelCheckChange(e: any, level: string) {
		if (this.filter == undefined) {
			this.filter = new SearchFilter();
		}
		console.log(e.value, this.filter.levels.includes(level))
		if (e.value && !this.filter.levels.includes(level)) {
			this.filter.levels.push(level);
		} else if (!e.value && this.filter.levels.includes(level)) {
			this.filter.levels.splice(this.filter.levels.indexOf(level), 1);
		}
	}

	/*isChecked(categoryId):boolean{
		let checked;
		if(this.filter?.categoryIDs.includes(categoryId)){
			checked= true
		}else{
			checked= false
		}
		return checked;
	}*/
	showResults() {
		if (this.filter) {
			this.filter.rating = this.ratings;
			this.filter.priceTypes = this.priceCategory;
			this.filter.durations = this.durations;
			this.filter.productTypes = this.productsType;
		}
		if (this.filterType == 'searchFilter') {
			this.globalService.setSearchFilter(this.filter);
			this.router.navigate(['/search-result']);
		} else if (this.filterType == 'myProductFilter') {
			this.globalService.setMyProductsFilter(this.filter);
			this.router.navigate(['/my-products']);
		} else if (this.filterType == 'courseListFilter') {
			let params = this.globalService.getCategoryParams()
			this.globalService.setCourseListFilter(this.filter);
			this.router.navigate(['/training-course', params.categoryId, params.categoryName]);
		} else if (this.filterType == 'certsFilter') {
			this.globalService.setCertsFilter(this.filter);
			this.router.navigate(['/certificates']);
		}
	}
	reset() {
		if (this.filter && this.filterType == 'searchFilter') {
			this.globalService.setSearchFilter(undefined);
		}
		else if (this.filter && this.filterType == 'myProductFilter') {
			this.globalService.setMyProductsFilter(undefined);
		} else if (this.filter && this.filterType == 'courseListFilter') {
			this.globalService.setCourseListFilter(undefined);
		} else if (this.filter && this.filterType == 'certsFilter') {
			this.globalService.setCertsFilter(undefined);
		}
		this.isBeginner = false;
		this.isAdvanced = false;
		this.isIntermediate = false;
		this.selectedSort = null;

		this.ratings.forEach(check => {
			check.isChecked = false;
		});
		this.priceCategory.forEach(check => {
			check.isChecked = false;
		});
		this.durations.forEach(check => {
			check.isChecked = false;
		});
		this.productsType.forEach(check => {
			check.isChecked = false;
		});
		this.filter = undefined;
	}
	onSortChange(e) {
		if (this.filter == undefined) {
			this.filter = new SearchFilter();
			this.filter.sortType = this.sortBy.getValue(e.newIndex)
		} else {
			this.filter.sortType = this.sortBy.getValue(e.newIndex)
		}
	}
	onPeriodChange(e, item) {
		if (this.filter == undefined) {
			this.filter = new SearchFilter();
		}

		item.isChecked = !item.isChecked;

		if (!item.isChecked) {
			return;
		}

		// uncheck all other options
		this.durations.forEach(element => {
			if (element.nameAr !== item.nameAr) {
				element.isChecked = false;
			}
		});

	}
	onProductTypeChange(e, item) {
		if (this.filter == undefined) {
			this.filter = new SearchFilter();
		}

		item.isChecked = !item.isChecked;

		if (!item.isChecked) {
			return;
		}

		// uncheck all other options
		this.productsType.forEach(element => {
			if (element.text !== item.text) {
				element.isChecked = false;
			}
		});

	}
}