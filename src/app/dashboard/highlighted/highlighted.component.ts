import { Component, OnDestroy, OnInit } from '@angular/core';
import { Frame, ImageSource, Page, Screen, Utils, isAndroid, isIOS } from "@nativescript/core";
import { localize } from '@nativescript/localize';
import { GlobalService } from '../../shared/services/global.service';
import { DashboardService } from '../dashboard.service'
import { ProductsDetail } from '../../shared/models/products-detail'
import { ProductBriefDetail } from '../../shared/models/product-brief-detail';
import { Categories } from '../../shared/models/lookups/categories'
import { AccountService } from '../../account/account.service';
import { SettingsService } from '../../settings/settings.service';
import { NotificationSearchOption } from '../../shared/models/notification-search-option';
import { NotificationsWithCount } from '../../shared/models/notifications-with-count';
import { UserProfile } from '../../shared/models/user-profile';
import { environment } from '../../../../environments/environment';
import { EnrolledWebinar } from '~/app/shared/models/enrolled-webinar';
import { PaymentService } from '~/app/payment/payment.service';
import { RouterExtensions } from '@nativescript/angular';
import { FirebaseEventService } from '~/app/shared/services/firebase.event.service';
import { registerElement } from '@nativescript/angular';
import { AnimatedCircle } from '@nativescript/animated-circle';
registerElement('AnimatedCircle', () => AnimatedCircle);


@Component({
	moduleId: module.id,
	selector: 'highlighted',
	templateUrl: './highlighted.component.html',
	styleUrls: ['./highlighted.component.css']
})

export class HighlightedComponent implements OnInit, OnDestroy {
	fullName: string;
	firstNameAr: string;

	upcomingCourses: ProductBriefDetail[];
	categories: Categories[];
	recommendedCourses: ProductBriefDetail[];
	isHighlightedLoading: boolean;
	isCategoriesLoading: boolean;
	isUpcomingLoading: boolean;
	isInteractiveExercisesLoading: boolean;
	isTrainingGameLoading: boolean;
	isCasesStudyLoading: boolean;
	isLoggedIn: boolean;
	casesStudy: any[];
	trainingGame: any[];
	interactiveExercises: any[];
	bePartnerEn: any;
	api: string;
	isEthrai: any;
	isLastViewedLoading: boolean;
	isHighlyRatedLoading: boolean;
	lastViewedCourses: any;
	highlyRatedCourses: any;
	suggestedWebinard: any;
	isSuggestedWebinarsLoading: any;
	bepart: any;
	training: any;
	isAndroid: boolean;
	Math: Math;
	upcomingWebinars: EnrolledWebinar[];
	isIOS: boolean;
	bannerImages: any[] = [];
	bannerIndex: number = 0;
	sliderTimer: ReturnType<typeof setInterval>;
	activeSlideIndex: number = 0;
	sliderHeight = 180;
	sliderSlides: { image: string; title?: string; subTitle?: string; id?: string; displayHeight?: number }[] = [];
	trainingSources: any[] = [];
	isTrainingSourcesLoading: boolean;
	DigitalLibrary: any[] = []
	private readonly sliderSideMargin = 32; // margin 16 left + 16 right
	private readonly sliderMinHeight = 140;
	private readonly sliderMaxHeight = 320;
	constructor(private page: Page, private accountService: AccountService, public globalService: GlobalService, private dashboardService: DashboardService,
		private paymentService: PaymentService, private router: RouterExtensions, private firebaseEventService: FirebaseEventService,
		private settingsService: SettingsService) {
		page.actionBarHidden = true;
		page.backgroundColor = '#F8F5F4';
		this.isAndroid = isAndroid;
		this.isIOS = isIOS
		this.Math = Math
		// Intl removed - not available on iOS
	}
	ngOnDestroy(): void {
		if (this.sliderTimer) {
			clearInterval(this.sliderTimer);
		}
	}
	get currentSlide() {
		if (!this.sliderSlides?.length) {
			return null;
		}
		return this.sliderSlides[this.activeSlideIndex] || this.sliderSlides[0];
	}
	setSlideIndex(index: number) {
		if (!this.sliderSlides?.length) {
			return;
		}
		this.activeSlideIndex = index;
		this.updateSliderHeightForCurrentSlide();
	}
	nextSlide() {
		if (!this.sliderSlides?.length) {
			return;
		}
		this.activeSlideIndex = (this.activeSlideIndex + 1) % this.sliderSlides.length;
		this.updateSliderHeightForCurrentSlide();
	}
	prevSlide() {
		if (!this.sliderSlides?.length) {
			return;
		}
		this.activeSlideIndex = (this.activeSlideIndex - 1 + this.sliderSlides.length) % this.sliderSlides.length;
		this.updateSliderHeightForCurrentSlide();
	}
	onSliderSwipe(args: any) {
		if (args && (args.direction === 1 || args.direction === 4)) {
			this.prevSlide();
		} else if (args && (args.direction === 2 || args.direction === 8)) {
			this.nextSlide();
		}
	}
	private updateSliderHeightForCurrentSlide() {
		const slide = this.currentSlide;
		if (!slide?.image) {
			return;
		}
		if (slide.displayHeight) {
			this.sliderHeight = slide.displayHeight;
			return;
		}

		ImageSource.fromUrl(slide.image)
			.then(source => {
				if (!source?.width || !source?.height) {
					return;
				}
				const availableWidth = Screen.mainScreen.widthDIPs - this.sliderSideMargin;
				let height = availableWidth * (source.height / source.width);
				height = Math.max(this.sliderMinHeight, Math.min(this.sliderMaxHeight, Math.round(height)));
				slide.displayHeight = height;
				if (this.currentSlide?.image === slide.image) {
					this.sliderHeight = height;
				}
			})
			.catch(() => {
				// keep current/default height if image metadata fails
			});
	}
	goBack() {

		Frame.topmost().goBack();

	}
	goToLibrary(type) {
		if (type == 'TrainingSources') this.router.navigate(['/interactive-training-list']);
		else this.router.navigate(['/DigitalLibrary', type]);
	}
	async ngOnInit() {
		//{name:'الحالات الدراسية',Type:'CASESESTUDY',image:'~/images/cases_study.png'}, hidden from production
		this.DigitalLibrary.push({ name: 'ألعاب تدربية', Type: 'TRAININGGAME', image: '~/images/games.png' }, { name: 'تمارين تفاعلية', Type: 'INTERACTIVEEX', image: '~/images/exersise.png' }, { name: 'تدريب تفاعلي', Type: 'TrainingSources', image: '~/images/inertactive.png' })
		this.getBannerImages();
		this.isLoggedIn = this.globalService.isLoggedIn
		this.isEthrai = this.globalService.isEthrai
		console.log('🔍 [HighlightedComponent] isLoggedIn:', this.isLoggedIn, '| isEthrai:', this.isEthrai)
		this.api = environment.WEB_API
		if (this.isLoggedIn) {
			await this.getUserProfile();
			this.getRecommendedProducts();
			this.getLastViewed();
			this.page.actionBarHidden = false;
			this.getUnreadNotificationsCount();
			if (this.isEthrai) {
				this.getShopCart();
			}

		} else {
			this.firebaseEventService.logScreenViewedEvent(this.isLoggedIn, null, 'highlighted', null);
		}

		this.getHighlyRated();

		if (this.isEthrai || !this.isLoggedIn) {
			this.getSuggestedWebinars();
		}

		this.getUpcomingEvents();
		this.getAllCategories();
		/*this.getAllInteractiveExercises()
		this.getAllEducationalGames()
		this.getallCasesStudy()
		this.getTrainingSources()*/


		this.accountService.BePartner().subscribe(
			res => {
				let htmlString = (res as any)[0].contentAr;
				this.bepart = htmlString?.replace(/<[^>]+>/g, '').replace(/&nbsp;/g, '')

			},
		)

		this.dashboardService.getInstitutionalTraining().subscribe(
			res => {
				let trainingHTMLString = (res as any)[0].contentAr;
				this.training = trainingHTMLString.replace(/<[^>]+>/g, '').replace(/&nbsp;/g, '')
			},

		)


		// if (isIOS) {

		// 	this.page.actionBarHidden = true;
		// }
	}
	getBannerImages() {
		this.dashboardService.getBannerImages().subscribe(
			res => {
				const banners = (res as any[]) || [];
				this.bannerImages = banners;
				this.sliderSlides = banners
					.filter(banner => !!banner?.imageUrl)
					.sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
					.map(banner => ({
						image: banner.imageUrl,
						title: banner.title,
						subTitle: banner.subTitle,
						id: banner.id
					}));
				this.activeSlideIndex = 0;
				this.bannerIndex = 0;
				this.updateSliderHeightForCurrentSlide();

				if (this.sliderTimer) {
					clearInterval(this.sliderTimer);
					this.sliderTimer = null;
				}
				if (this.sliderSlides.length > 1) {
					this.sliderTimer = setInterval(() => {
						this.nextSlide();
					}, 4500);
				}
			},
			err => {
				console.log('getBannerImages error', err);
				this.sliderSlides = [];
			}
		);
	}
	getSuggestedWebinars() {
		this.isSuggestedWebinarsLoading = true;
		this.dashboardService.getLatestWebinars(5).subscribe(
			res => {
				this.isSuggestedWebinarsLoading = false;
				this.suggestedWebinard = (res as any).webinars.filter(webinar => webinar.isPublished);
				if (this.suggestedWebinard.length) {
					this.firebaseEventService.logCourseImpressionsEvent('highlighted', this.suggestedWebinard, "e-conference")
				}

				this.upcomingWebinars = this.suggestedWebinard.filter(webinar => {
					let endtDate = Date.parse(webinar.srartDate);
					let now = Date.parse(new Date()?.toString());
					if (now < endtDate) {
						return webinar;
					}

				})
				//console.log(this.suggestedWebinard[0],'lll')
			}
		)
	}
	getLastViewed() {
		this.isLastViewedLoading = true
		this.dashboardService.getLastViewedCourses(5).subscribe(
			res => {
				this.isLastViewedLoading = false
				this.lastViewedCourses = (res as any).courses//.filter(c=>c.isPublished)
				if (this.lastViewedCourses?.length && (this.isEthrai || !this.isLoggedIn)) {
					this.firebaseEventService.logCourseImpressionsEvent('highlighted', this.lastViewedCourses, "training")
				}

			}
		)
	}
	getHighlyRated() {
		this.isHighlyRatedLoading = true
		this.dashboardService.getHighlyRatedCourses(5).subscribe(
			res => {
				this.isHighlyRatedLoading = false
				this.highlyRatedCourses = (res as any).courses.filter(c => c.isPublished);
				if (this.highlyRatedCourses?.length && (this.isEthrai || !this.isLoggedIn)) {
					this.firebaseEventService.logCourseImpressionsEvent('highlighted', this.highlyRatedCourses, "training")
				}
			},
			err => {
				this.isHighlyRatedLoading = false
			}
		)
	}

	getUpcomingEvents() {
		this.isUpcomingLoading = true;
		this.dashboardService.getUpcomingEvents(5).subscribe(
			response => {
				this.isUpcomingLoading = false;
				let events = response as ProductsDetail
				this.upcomingCourses = events.courses.filter(course => course.isPublished);
				if (this.upcomingCourses.length && (this.isEthrai || !this.isLoggedIn)) {
					this.firebaseEventService.logCourseImpressionsEvent('highlighted', this.upcomingCourses, "training");
				}
			},
			err => {
				console.log(err)
			}
		)
	}

	getAllCategories() {
		this.isCategoriesLoading = true;
		this.dashboardService.getCategories().subscribe(
			response => {
				this.isCategoriesLoading = false;
				this.categories = (response as Categories[]).slice(0, 10);
				this.globalService.setCategories(response as Categories[]);
			},
			err => {

			}
		)
	}

	getRecommendedProducts() {
		this.isHighlightedLoading = true;
		this.dashboardService.getHighlightedCoursesByTags(5).subscribe(
			response => {
				this.isHighlightedLoading = false;
				this.recommendedCourses = (response as ProductBriefDetail[])//.filter(course=>course.isPublished);
				if (this.recommendedCourses.length && (this.isEthrai || !this.isLoggedIn)) {
					this.firebaseEventService.logCourseImpressionsEvent('highlighted', this.recommendedCourses, "training")
				}

			},
			err => {

			}
		)
	}

	getUserProfile() {
		return this.accountService.getUserProfile().toPromise().then(
			async response => {
				let profile = response as UserProfile
				this.globalService.setUserProfile(profile);
				this.fullName = this.globalService.getUserFullNameAr();
				this.firstNameAr = this.globalService.getUserFirstNameAr();
				this.globalService.setUserType(profile.type);
				if (this.globalService.getUserStats() && this.globalService.isEthrai) {
					this.firebaseEventService.logScreenViewedEvent(this.globalService.isLoggedIn, this.globalService.getUserStats(), 'highlighted', this.globalService.getUserProfile());
				} else if (this.globalService.isEthrai && !this.globalService.getUserStats()) {
					await this.getUserStats();
				}
			}
		).catch(error => {
			console.error('Error getting user profile:', error);
		});
	}
	gotoWebsite() {
		Utils.openUrl(this.api);
	}
	setFavoriteSW(id, type, isFav: boolean, i) {
		//console.log(id,type,isFav)
		console.log("isFavisFav", isFav, id, type)
		if (this.globalService.isLoggedIn) {
			let payload = {
				"productId": id,
				"type": 'Webinar'
			}
			console.log("fav payload", payload)
			if (!isFav) {
				this.dashboardService.setFavoriteProducts(payload).subscribe(
					res => {
						//console.log("faavvvvvvvvvvvvlllllvv",res)

						if ((res as any).success) {
							this.suggestedWebinard[i].isFavorite = true;
							this.globalService.toast(localize('FavAdded'))
						}
					},
					err => {

					}
				)
			} else {
				this.dashboardService.removeFavoriteProducts(payload).subscribe(
					res => {
						// console.log("faavvvvvvvvvvvvlllllvv",res)
						this.suggestedWebinard[i].isFavorite = false;
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
	setFavoriteLVC(id, type, isFav: boolean, i) {
		/*console.log(this.lastViewedCourses[i])
		console.log("isFavisFav",isFav,id,type)*/
		if (this.globalService.isLoggedIn) {
			let payload = {
				"productId": id,
				"type": 'Course'
			}
			//console.log("fav payload",payload)
			if (!isFav) {
				this.dashboardService.setFavoriteProducts(payload).subscribe(
					res => {
						// console.log("faavvvvvvvvvvvvlllllvv",res)

						if ((res as any).success) {
							this.lastViewedCourses[i].isFavorite = true;
							this.globalService.toast(localize('FavAdded'))
								;
						}
					},
					err => {

					}
				)
			} else {
				this.dashboardService.removeFavoriteProducts(payload).subscribe(
					res => {
						// console.log("faavvvvvvvvvvvvlllllvv",res)
						this.lastViewedCourses[i].isFavorite = false;
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
	setFavoriteHRC(id, type, isFav: boolean, i) {
		if (this.globalService.isLoggedIn) {
			let payload = {
				"productId": id,
				"type": 'Course'
			}
			if (!isFav) {
				this.dashboardService.setFavoriteProducts(payload).subscribe(
					res => {
						if ((res as any).success) {
							this.highlyRatedCourses[i].isFavorite = true;
							this.globalService.toast(localize('FavAdded'))

						}
					},
					err => {

					}
				)
			} else {
				this.dashboardService.removeFavoriteProducts(payload).subscribe(
					res => {
						this.highlyRatedCourses[i].isFavorite = false;
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
	setFavoriteRC(id, type, isFav: boolean, i) {
		if (this.globalService.isLoggedIn) {
			let payload = {
				"productId": id,
				"type": 'Course'
			}
			if (!isFav) {
				this.dashboardService.setFavoriteProducts(payload).subscribe(
					res => {
						if ((res as any).success) {
							this.recommendedCourses[i].isFavorite = true;
							this.globalService.toast(localize('FavAdded'))

						}
					},
					err => {

					}
				)
			} else {
				this.dashboardService.removeFavoriteProducts(payload).subscribe(
					res => {
						this.recommendedCourses[i].isFavorite = false;
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
	setFavoriteUC(id, type, isFav: boolean, i) {
		if (this.globalService.isLoggedIn) {
			let payload = {
				"productId": id,
				"type": 'Course'
			}
			if (!isFav) {
				this.dashboardService.setFavoriteProducts(payload).subscribe(
					res => {
						if ((res as any).success) {
							this.upcomingCourses[i].isFavorite = true;
							this.globalService.toast(localize('FavAdded'))

						}
					},
					err => {

					}
				)
			} else {
				this.dashboardService.removeFavoriteProducts(payload).subscribe(
					res => {
						this.upcomingCourses[i].isFavorite = false;
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

	getShopCart() {
		this.paymentService.getShopCart().toPromise().then(
			res => {
				let products = res as any[];
				this.globalService.shoppinCartItemsCount = products.length;
			},
			err => {
				console.log(err)
			}
		)
	}
	getUnreadNotificationsCount() {
		const profile = this.globalService.getUserProfile();
		if (!profile) return;
		const nowDate = new Date();
		const options = new NotificationSearchOption();
		options.pageIndex = 0;
		options.pageSize = 1;
		options.userProfielId = profile.id;
		options.type = 'System';
		options.status = 'UnRead';
		options.afterDate = new Date(nowDate.setMonth(nowDate.getMonth() - 1)).toLocaleDateString();
		this.settingsService.getNotification(options).subscribe(
			response => {
				const result = response as NotificationsWithCount;
				this.globalService.unreadNotificationsCount = result.totalCount || 0;
			},
			err => {
				console.error('Error fetching unread notifications count:', err);
			}
		);
	}
	goToCoursePage(id, course) {
		if (this.globalService.isEthrai || !this.globalService.isLoggedIn) {
			this.firebaseEventService.logCourseClickedEvent(this.globalService.isLoggedIn, this.globalService.getUserStats(),
				"highlighted", this.globalService.getUserProfile(), course)
		}
		this.router.router.routeReuseStrategy.shouldReuseRoute = function () { return false };
		this.router.navigate(['/course-details', id]);
	}
	goToWebinarsPage(id, webinars) {
		if (this.globalService.isEthrai || !this.globalService.isLoggedIn) {
			this.firebaseEventService.logKeWebinarsClickedEvent(this.globalService.isLoggedIn, this.globalService.getUserStats(),
				"highlighted", this.globalService.getUserProfile(), webinars, id, null)
		}
		this.router.navigate(['/webinar-details', id]);
	}
	getUserStats() {
		return this.dashboardService.getUserStats().toPromise().then(
			res => {
				this.globalService.setUserStats(res);
				if (this.globalService.isEthrai) {
					this.firebaseEventService.logScreenViewedEvent(this.globalService.isLoggedIn, res, 'highlighted', this.globalService.getUserProfile());
				}
			}
		).catch(error => {
			console.error('Error getting user stats:', error);
		});
	}
	getCourseProgressPercent(watchedSeconds: number, TotalSeconds: number) {
		const percent = (watchedSeconds / TotalSeconds) * 100;
		return Number(percent.toFixed(1)) + '%';
	}
	/*getallCasesStudy(){
		this.isCasesStudyLoading=true
	  this.dashboardService.getAllCasesStudy(5).subscribe(
		res=>{

			this.casesStudy=(res as any);
			}
	).add(()=>{
		this.isCasesStudyLoading=false})
	}
	getAllEducationalGames(){
		this.isTrainingGameLoading=true
	  this.dashboardService.getAllEducationalGames(5).subscribe(
		res=>{

			this.trainingGame=(res as any);
			}
	).add(()=>{
		this.isTrainingGameLoading=false})
	}
	getAllInteractiveExercises(){
		this.isInteractiveExercisesLoading=true
	  this.dashboardService.getAllInteractiveExercises(5).subscribe(
		res=>{

			this.interactiveExercises=(res as any);
			}
	).add(()=>{
		this.isInteractiveExercisesLoading=false})
	}
	getTrainingSources(){
		this.isTrainingSourcesLoading=true
		let payload={}//{eGword:null,pageSize:5,pageIndex:0,isDraft:null}
	  this.dashboardService.SearchInteractiveTraining(payload).subscribe(
		res=>{
			console.log(res)
			this.trainingSources=(res as any);
			}
	).add(()=>{
		this.isTrainingSourcesLoading=false})
	}*/
}