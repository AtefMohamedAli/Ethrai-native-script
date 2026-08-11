import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Frame, ImageSource, isAndroid, isIOS, knownFolders, path } from '@nativescript/core';
import { Page } from '@nativescript/core';
import { DashboardService } from '../dashboard.service';
import { CourseDetails } from '../../shared/models/course-details';
import { Category } from '../../shared/models/category';
import { ProductsSearchOptions } from '../../shared/models/products-search-options';
import { ProductsDetail } from '../../shared/models/products-detail';
import { OnlineClass } from '../../shared/models/online-class';
import { WebinarBriefDetail } from '../../shared/models/webinar-brief-detail';
import { GlobalService } from '~/app/shared/services/global.service';
import { localize } from '@nativescript/localize';
import { FirebaseEventService } from '~/app/shared/services/firebase.event.service';
import { RouterExtensions } from '@nativescript/angular';

@Component({
	moduleId: module.id,
	selector: 'category',
	templateUrl: './category.component.html',
	styleUrls: ['./category.component.css']
})

export class CategoryComponent implements OnInit {
	categoryNameAr: string;
	categoryId: string;
	courses = [];
	subCategories: Category[];
	isCoursesLoading: boolean;
	onlineClasses: any = [];
	coursePaths: any = [];
	isLoading: boolean;
	isLoadingClasses: boolean;
	webinars: WebinarBriefDetail[] = [];
	imagesSrc: string[] = [];
	kes: any;
	listLoaded: boolean;
	renderViewTimeout: ReturnType<typeof setTimeout>;
	isEthrai: any;
	highlighted: any;
	isHighlitedLoading: boolean;
	Math: Math;
	isloggedIn: boolean;
	isIOS: boolean;
	isAndroid: boolean;
	// Intl removed - not available on iOS
	intl = { format: (n) => String(n) }; // Intl polyfill for iOS
	interactiveExercises: any[];
	casesStudy: any[];
	trainingGame: any[];
	isTrainingGameLoading: boolean;
	isInteractiveExercisesLoading: boolean;
	isCasesStudyLoading: boolean;
	constructor(private page: Page, private route: ActivatedRoute, private dashboardService: DashboardService, private globalService: GlobalService,
		private firebaseEventService: FirebaseEventService, private router: RouterExtensions) {
		//	page.actionBarHidden = true;
		this.Math = Math
		this.categoryId = this.route.snapshot.paramMap.get("id");
		this.categoryNameAr = this.route.snapshot.paramMap.get("categoryNameAr");
		this.isAndroid = isAndroid;
		this.isIOS = isIOS
	}

	goBack() {

		Frame.topmost().goBack();

	}
	ngOnInit() {
		//		this.getAllCoursesByCategory();
		this.isEthrai = this.globalService.isEthrai;
		this.isloggedIn = this.globalService.isLoggedIn;
		this.getCoursesAndCoursePaths();
		this.getSubCategories();
		this.getHighligtedCourses();
		//	this.getOnlineClasses();
		this.getResources('العاب تدريبية');
		this.getResources('تمارين تفاعلية')
		this.getResources('حالات دراسية')
		if (this.globalService.isLoggedIn && this.globalService.isEthrai) {
			this.firebaseEventService.logScreenViewedEvent(this.globalService.isLoggedIn, this.globalService.getUserStats(), 'main_product_category', this.globalService.getUserProfile());
		} else if (!this.globalService.isLoggedIn) {
			this.firebaseEventService.logScreenViewedEvent(this.globalService.isLoggedIn, null, 'main_product_category', null);
		}
	}
	getHighligtedCourses() {
		this.isHighlitedLoading = true;
		this.dashboardService.getMostEnrolledCoursePerCategory(this.categoryId, 5).subscribe(
			res => {
				this.isHighlitedLoading = false;
				this.highlighted = (res as any[])?.filter(c => c.isPublished);
				if (this.highlighted.length && (this.isEthrai || !this.isloggedIn)) {
					this.firebaseEventService.logCourseImpressionsEvent('main_product_category', this.highlighted, 'training')
				}
			}
		)
	}

	ngAfterContentInit(): void {
		// a little delay so the spinner has time to show up
		this.renderViewTimeout = setTimeout(() => {
			this.listLoaded = true;
		}, 300);
	}

	getAllCoursesByCategory() {
		if (this.categoryId) {
			this.isCoursesLoading = true;
			this.dashboardService.getAllCoursesByCategory(this.categoryId).subscribe(
				response => {
					this.isCoursesLoading = false;
					this.courses = response as CourseDetails[];
				},
				error => {
				}
			)

		}
	}
	getSubCategories() {
		if (this.categoryId) {
			this.dashboardService.getSubCategories(this.categoryId).subscribe(
				response => {
					this.subCategories = response as Category[];

				},
				error => {
				}
			)

		}
	}
	goToWebinarsPage(id, webinars) {
		if (this.globalService.isEthrai || !this.globalService.isLoggedIn) {
			this.firebaseEventService.logKeWebinarsClickedEvent(this.globalService.isLoggedIn, this.globalService.getUserStats(),
				"main_product_category", this.globalService.getUserProfile(), webinars, id, null)
		}
		this.router.navigate(['/webinar-details', id]);
	}
	goToKePage(id, ke) {
		if (this.globalService.isEthrai || !this.globalService.isLoggedIn) {
			this.firebaseEventService.logKeWebinarsClickedEvent(this.globalService.isLoggedIn, this.globalService.getUserStats(),
				"main_product_category", this.globalService.getUserProfile(), ke, id, 'knowledge enrichment')
		}
		this.router.navigate(['/ke-details', id]);
	}
	getCoursesAndCoursePaths() {
		this.isLoading = true;
		let options = new ProductsSearchOptions();
		options.pageIndex = 0;
		options.pageSize = 5;
		options.levels = [];
		options.minHours = 0;
		options.maxHours = 10000;
		options.minRating = 0;
		options.categoryId = this.categoryId;
		this.dashboardService.searchProducts(options).subscribe(
			response => {

				this.isLoading = false;
				let products = response as any;
				this.coursePaths = products.coursePaths.filter(path => path.isPublished);
				this.courses = products.courses.filter(course => course.isPublished);
				this.webinars = products.webinars.filter(web => web.isPublished);
				this.kes = products.kes.filter(ke => ke.isPublished);
				if (this.courses.length && (this.isEthrai || !this.isloggedIn)) {
					this.firebaseEventService.logCourseImpressionsEvent('main_product_category', this.courses, 'training');
				}
				if (this.webinars.length && (this.isEthrai || !this.isloggedIn)) {
					this.firebaseEventService.logCourseImpressionsEvent('main_product_category', this.webinars, 'e-conference')
				}
				if (this.kes.length && (this.isEthrai || !this.isloggedIn)) {
					this.firebaseEventService.logCourseImpressionsEvent('main_product_category', this.kes, 'knowledge enrichment')
				}

			},
			error => {

			}
		)
	}
	getOnlineClasses() {
		this.isLoadingClasses = true;
		this.dashboardService.getOnlineClasses().subscribe(
			response => {
				this.isLoadingClasses = false;
				let classes = response as OnlineClass[];
				if (classes != null) {
					this.onlineClasses = classes.filter(value => value.categoryIds.some(value => value === this.categoryId));
				}
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
							this.courses[i].isFavorite = true;
							this.globalService.toast(localize('FavAdded'))
						}
					},
					err => {

					}
				)
			} else {
				this.dashboardService.removeFavoriteProducts(payload).subscribe(
					res => {
						this.courses[i].isFavorite = false;
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
	setFavoriteCP(id, type, isFav: boolean, i) {
		if (this.globalService.isLoggedIn) {
			let payload = {
				"productId": id,
				"type": type
			}
			if (!isFav) {
				this.dashboardService.setFavoriteProducts(payload).subscribe(
					res => {
						if ((res as any).success) {
							this.coursePaths[i].isFavorite = true;
							this.globalService.toast(localize('FavAdded'))
						}
					},
					err => {

					}
				)
			} else {
				this.dashboardService.removeFavoriteProducts(payload).subscribe(
					res => {
						this.coursePaths[i].isFavorite = false;
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
	setFavoriteW(id, type, isFav: boolean, i) {
		if (this.globalService.isLoggedIn) {
			let payload = {
				"productId": id,
				"type": type
			}
			if (!isFav) {
				this.dashboardService.setFavoriteProducts(payload).subscribe(
					res => {
						if ((res as any).success) {
							this.webinars[i].isFavorite = true;
							this.globalService.toast(localize('FavAdded'))

						}
					},
					err => {

					}
				)
			} else {
				this.dashboardService.removeFavoriteProducts(payload).subscribe(
					res => {
						this.webinars[i].isFavorite = false;
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
	setFavoriteK(id, type, isFav: boolean, i) {
		if (this.globalService.isLoggedIn) {
			let payload = {
				"productId": id,
				"type": type
			}
			if (!isFav) {
				this.dashboardService.setFavoriteProducts(payload).subscribe(
					res => {
						if ((res as any).success) {
							this.kes[i].isFavorite = true;
							this.globalService.toast(localize('FavAdded'))

						}
					},
					err => {

					}
				)
			} else {
				this.dashboardService.removeFavoriteProducts(payload).subscribe(
					res => {
						this.kes[i].isFavorite = false;
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
				"main_product_category", this.globalService.getUserProfile(), course)
		}
		this.router.router.routeReuseStrategy.shouldReuseRoute = function () { return false };
		this.router.navigate(['/course-details', id]);
	}
	ngOnDestroy() {
		clearTimeout(this.renderViewTimeout);
	}
	getCourseProgressPercent(watchedSeconds: number, TotalSeconds: number) {
		const percent = (watchedSeconds / TotalSeconds) * 100;
		return this.intl.format(Number(percent.toFixed(1))) + '%';
	}
	getResources(type) {
		if (type == 'العاب تدريبية') this.isTrainingGameLoading = true;
		if (type == 'تمارين تفاعلية') this.isInteractiveExercisesLoading = true;
		if (type == 'حالات دراسية') this.isCasesStudyLoading = true;
		this.dashboardService.SearchDigitalLibrary(type, this.categoryId).subscribe(
			(response: any[]) => {
				if (type == 'العاب تدريبية') { this.trainingGame = response?.slice(0, 5); this.isTrainingGameLoading = false };
				if (type == 'تمارين تفاعلية') { this.interactiveExercises = response?.slice(0, 5); this.isInteractiveExercisesLoading = false };
				if (type == 'حالات دراسية') { this.casesStudy = response?.slice(0, 5); this.isCasesStudyLoading = false };
			},
			err => {

			}
		)
	}
}