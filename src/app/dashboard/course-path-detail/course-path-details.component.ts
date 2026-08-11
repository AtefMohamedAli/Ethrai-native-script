import { Component, NgZone, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Connectivity, Frame, isAndroid, isIOS, Utils } from '@nativescript/core';
import { Page } from '@nativescript/core';
import { WebinarBriefDetail } from '../../shared/models/webinar-brief-detail';
import { DashboardService } from '../dashboard.service';
import * as share from '@nativescript/social-share'
import { localize } from '@nativescript/localize';
import { LoadEventData } from '@nativescript/core';
import { GlobalService } from '../../shared/services/global.service';
import { concatMap, tap } from 'rxjs/operators';
import { PaymentService } from '~/app/payment/payment.service';
// import { InAppPurchaseManager, InAppPurchaseResultCode, InAppPurchaseStateUpdateListener,
//     InAppOrderResult,InAppPurchaseTransactionState, InAppProduct ,InAppListProductsResult,
//     InAppPurchaseType,InAppOrderConfirmResult } from 'nativescript-in-app-purchase'
import { FirebaseEventService } from '~/app/shared/services/firebase.event.service';
@Component({
	moduleId: module.id,
	selector: 'course-path-detail',
	templateUrl: './course-path-details.component.html',
	styleUrls: ['./course-path-details.component.css']
})

export class CoursePathDetails implements OnInit {

	isLoading: boolean;
	webinars: WebinarBriefDetail[];
	clickedd = {};
	clickedd1 = {};
	clickedd2 = {};
	coursePath: any = {};
	durationMinutes: number;
	durationHours: number;
	feedbacks: any = [];
	Math: Math;
	pathId: string;
	skillsIDs: any;
	similarPaths: any[];
	isAlreadyEnrolled: any;
	isEthrai: any;
	showAddToMyProductsButton: boolean;
	paymentNoComplete: any;
	paymentCompleted: any;
	isAlreadyInCart: any;
	showCartButton: boolean;
	showWaitPaymentButton: boolean;
	showAppleBuyButton: boolean;
	isAndroid
	showCertificate: boolean;
	//private inAppPurchaseManager: InAppPurchaseManager;
	item
	isIOS: any;
	isQueryProduct: boolean;
	shoppingCartItemsCount: number;
	showProcessingButton: boolean;
	// Intl removed - not available on iOS
	intl = { format: (n) => String(n) }; // Intl polyfill for iOS
	publishDate: string;
	constructor(private page: Page, private router: Router, private dashboardService: DashboardService, private route: ActivatedRoute, private globalService: GlobalService,
		private paymentService: PaymentService, private zone: NgZone, private firebaseEventService: FirebaseEventService) {
		page.actionBarHidden = true;
		this.pathId = this.route.snapshot.paramMap.get("pathId");
		this.Math = Math
		this.isAndroid = isAndroid
		this.isIOS = isIOS
	}
	clickme(item) {
		this.clickedd = item;
	}
	uclickme(item) {
		this.clickedd = {};
	}
	clickme1(item) {
		this.clickedd1 = item;
	}
	uclickme1(item) {
		this.clickedd1 = {};
	}
	clickme2(item) {
		this.clickedd2 = item;
	}
	uclickme2(item) {
		this.clickedd2 = {};
	}
	onError(event: ErrorEvent) {
		console.dir(event)
	}
	goBack() {
		Frame.topmost().goBack();
	}
	ngOnInit() {
		if (this.globalService.isEthrai) {
			this.firebaseEventService.logScreenViewedEvent(this.globalService.isLoggedIn, this.globalService.getUserStats(), 'training_path-page', this.globalService.getUserProfile());
		}
		this.isEthrai = this.globalService.isEthrai;
		this.getAllPathData().subscribe(res => {
			this.handlePathSubscription();
		})
		if (isIOS) {
			//this.getInAppPurchaseManager();
		}
		// this.getCoursePath();
		this.getFeedBacks();
		this.getSimilarPaths();
	}
	getAllPathData() {

		if (this.isEthrai) {
			return this.dashboardService.getCoursePath(this.pathId)
				.pipe(
					tap(res => { this.isLoading = false, this.handleCourseDetails(res) }),
					concatMap((res) => this.dashboardService.getInvoicedProducts()),
					tap(res => this.handleInvoicedProducts(res)),
				)
		} else {
			return this.dashboardService.getCoursePath(this.pathId)
				.pipe(
					tap(res => { this.isLoading = false, this.handleCourseDetails(res) }),

				)

		}
	}
	handleCourseDetails(res) {
		this.coursePath = (res as any);
		this.isAlreadyEnrolled = this.coursePath.isAlreadyEnrolled;
	}
	getCoursePath() {
		this.isLoading = true;
		this.dashboardService.getCoursePath(this.pathId).subscribe(
			response => {
				this.isLoading = false;
				this.coursePath = (response as any);
				const d = new Date(this.coursePath?.publishedDate);
				this.publishDate = d.getFullYear() + '/' + (d.getMonth() + 1) + '/' + d.getDate();
				this.isAlreadyEnrolled = this.coursePath.isAlreadyEnrolled;
				if (!this.isEthrai && !this.isAlreadyEnrolled) {
					this.showAddToMyProductsButton = true
				}
			},
			error => {
				console.log("", error)
			}
		)
	}
	handlePathSubscription() {
		if (!this.isAlreadyEnrolled) {
			if (!this.isEthrai || (this.isEthrai && !this.coursePath?.price)) {
				//allow enroll in coursePath
				this.showAddToMyProductsButton = true
			}
			if (this.isEthrai && this.coursePath?.price) {
				if (this.paymentNoComplete) {
					if (isAndroid) {
						this.paymentService.getShopCart().subscribe(
							res => {
								let products = res as any
								this.isAlreadyInCart = products.some(product => product.productId === this.coursePath.id);
								console.log("this.isAlreadyInCart ", this.isAlreadyInCart);
								if (!this.isAlreadyInCart) {
									this.showCartButton = true;
								}
							},
							err => {

							}
						)
					} else {
						let requests = this.globalService.getInAppFailedRequests()
						if (requests) {
							let reqArray: any[] = JSON.parse(requests);
							let currRequest = reqArray.find(req => req.productId == this.pathId)
							if (currRequest) {
								this.showProcessingButton = true;
								//this.buyProducts(currRequest);
							}

						} else {
							this.showAppleBuyButton = true;
						}
					}
					console.log("99999", this.paymentNoComplete)

				} else if (this.paymentCompleted) {
					this.showAddToMyProductsButton = true
				} else { //PmtUpdated , PmtNew
					this.showWaitPaymentButton = true
					//waiting for payment
				}
			}
			console.log('//////////////////', this.showCartButton, this.showWaitPaymentButton, this.showAddToMyProductsButton)
		} else {
			if (this.coursePath.certificateUrl) {
				this.showCertificate = true
			}
		}
	}

	getFeedBacks() {
		this.dashboardService.getcoursePathFeedBacks(this.pathId, 0, 6).subscribe(
			res => {
				this.feedbacks = res as any
			},
			err => {

			}
		)
	}

	shareCoursePath() {
		// share.shareUrl(this.webinar.webinar.shortWebinarUrl,"");
	}

	downloadFile(url) {
		Utils.openUrl(url);
	}

	downloadCertificate() {
		const certCode = this.coursePath.code;
		if (certCode) {
			this.dashboardService.getCertificateMediaUrl(3, certCode).subscribe(
				res => {
					let url = (res as any).url || (res as any).certificateUrl || (res as any).data || (res as any).extraData || res;
					if (typeof url === 'string') {
						if (!url.startsWith('http')) {
							url = 'https://' + url;
						}
						Utils.openUrl(url);
					} else {
						console.log('Error in OpenURL: response is not a valid string URL. Response was:', JSON.stringify(res));
						this.globalService.toast(localize('tryAgain'));
					}
				},
				err => {
					this.globalService.toast(localize('tryAgain'));
					console.log('Path certificate error:', err);
				}
			);
		}
	}

	enrollToPath() {
		this.dashboardService.enrollToPath(this.pathId).subscribe(
			res => {
				if ((res as any).success) {
					this.globalService.toast(localize('EnrollSuccess'))
					this.showAddToMyProductsButton = false;
					this.showCartButton = false;
					this.showAppleBuyButton = false;
					this.isAlreadyInCart = false;
				}
			},
			err => {
				this.globalService.toast(localize('tryAgain'))
				console.log("ggy", err)
			}
		)
	}
	getSimilarPaths() {
		this.dashboardService.getSimilarPaths(5, this.pathId).subscribe(
			res => {
				this.similarPaths = (res as any[]).filter(path => path.isPublished)
			}
		)
	}
	goToPath(id) {
		this.router.routeReuseStrategy.shouldReuseRoute = function () { return false }
		this.router.onSameUrlNavigation = 'reload'
		this.router.navigate(['/course-path-details', id])
	}
	handleInvoicedProducts(res) {
		let invoicedProducts = res as any
		this.paymentNoComplete = !invoicedProducts.some(m => (m.productId === this.coursePath.id && m.productType === "CoursePath"))
			|| invoicedProducts.some(m => ((m.productId === this.coursePath.id && m.productType === "CoursePath"))
				&& !["PmtCompleted", "PmtUpdated", "PmtNew"].includes(m.status))

		this.paymentCompleted = invoicedProducts.some(m => m.productId === this.coursePath.id && m.productType === "CoursePath" && m.status === "PmtCompleted");
		console.log(this.paymentNoComplete, this.paymentCompleted)
	}
	addToShoppingCart() {
		// console.log("tappppped");
		let product = {
			productId: this.coursePath.id,
			amount: this.coursePath.price,
			productType: 'CoursePath'
		}
		this.paymentService.addToShopCart(product).then(
			res => {
				if ((res as any).success) {
					this.isAlreadyInCart = true;
					this.showCartButton = false;
					this.globalService.shoppinCartItemsCount += 1;
				}
			},
			err => {
				this.showCartButton = true;
				console.log(err);
				this.globalService.toast(localize('tryAgain'))
			}
		);
		// this.router.navigate(['shopping-cart',this.courseId,this.course.course?.pricing.price,'Course']);
	}
	goToShoppingCart() {
		this.router.navigate(['shopping-cart']);
	}

	// getInAppPurchaseManager(){
	// 	const purchaseStateUpdateListener: InAppPurchaseStateUpdateListener = {
	// 		onUpdate: (purchaseTransactionState: InAppPurchaseTransactionState): void => {
	// 			if (purchaseTransactionState.resultCode === InAppPurchaseResultCode.Purchased) {
	// 				// Item has been purchased, sync local items list ...
	// 				console.log("PURCHASE SUCCESS")
	// 				this.confirmOrder(purchaseTransactionState)
	// 			}
	// 			if (purchaseTransactionState.resultCode === InAppPurchaseResultCode.Failed) {
	// 				// Item has been purchased, sync local items list ...
	// 				console.log("PURCHASE FAIL")
	// 			}
	// 			if (purchaseTransactionState.resultCode === InAppPurchaseResultCode.Purchasing) {
	// 				// Item has been purchased, sync local items list ...
	// 				console.log("PURCHASE INPROGRESS")
	// 			}
	// 		},
	// 		onUpdateHistory: (purchaseTransactionState: InAppPurchaseTransactionState): void => {
	// 			if (purchaseTransactionState.resultCode === InAppPurchaseResultCode.Restored) {
	// 				// Item has been  restored, sync local items list ...
	// 				console.log("PURCHASE RESTORED")
	// 			}
	// 		}
	// 		}
	// 		InAppPurchaseManager.bootStrapInstance(purchaseStateUpdateListener).then(inAppPurchaseManager => {
	// 			this.inAppPurchaseManager = inAppPurchaseManager
	// 		})
	// 	}
	// 	queryProducts() {
	// 		this.paymentService.getSiteMaintenanceState().subscribe(
	// 			res=>{
	// 				if(res){
	// 					this.globalService.toast(localize('underMaintenance'))
	// 				}else{
	// 					this.paymentService.getSiteMaintenanceState().subscribe(
	// 						res=>{
	// 							if(res){
	// 								this.globalService.toast(localize('underMaintenance'))
	// 							}else{
	// 								const myProductIds = [this.coursePath.appleProductId] //['sa.ethrai_mobile.app.tire2']
	// 								const myProductType = InAppPurchaseType.InAppPurchase 
	// 								this.isQueryProduct=true;

	// 								this.inAppPurchaseManager.list(myProductIds, myProductType)
	// 									.then((result: InAppListProductsResult) => {
	// 										this.isQueryProduct=false;
	// 										const product: InAppProduct = result.products[0]
	// 										console.log("APPLE PRODUCT",product, product?.productId)
	// 										if(product){
	// 											// get the products ...
	// 											this.inAppPurchaseManager.order(product).then(
	// 												(result: InAppOrderResult) => {
	// 												console.log(result)
	// 												if (result.success) {

	// 												}
	// 											},
	// 											err=>{console.log(err)}
	// 											)

	// 										}else{
	// 											this.globalService.toast(localize('tryAgain'))
	// 										}
	// 										}
	// 									,err=>{
	// 										this.isQueryProduct=false;

	// 										console.log(err)
	// 									}

	// 									)
	// 								}
	// 					})
	// 				}
	// 			})
	// 	}
	// 	confirmOrder(purchaseTransactionState: InAppPurchaseTransactionState) {
	// 		const isConsumable = (productId: string): boolean => { 
	// 			/* determine if is consumable and can be purchased more then once */
	// 			return true }

	// 		// only purchased products can be confirmed
	// 		if (purchaseTransactionState.resultCode === InAppPurchaseResultCode.Purchased) {
	// 			const consumable: boolean = isConsumable(purchaseTransactionState.productIdentifier)
	// 			this.inAppPurchaseManager.orderConfirm(purchaseTransactionState, consumable)
	// 				.then((result: InAppOrderConfirmResult) => {
	// 					if (result.success) {
	// 						let payload=
	// 							{
	// 								productId: this.pathId,
	// 								productType: "CoursePath",
	// 								appleProductId: this.coursePath.appleProductId,
	// 								transactionReceipt:this.inAppPurchaseManager.getStoreReceipt()
	// 							}
	// 						this.buyProducts(payload)
	// 					}
	// 				})

	// 		}
	// 	}

	// 	buyProducts(payload){
	// 		const type = Connectivity.getConnectionType();
	// 		if(type == Connectivity.connectionType.none){
	// 			this.globalService.toast(localize('proceessing'));
	// 			this.globalService.setInAppFailedRequests(payload);
	// 			this.zone.run(()=>{
	// 				this.showAppleBuyButton=false;
	// 				this.showProcessingButton=true;
	// 			})
	// 		}else{
	// 			this.paymentService.getSiteMaintenanceState().subscribe(
	// 				res=>{
	// 					if(res){
	// 						this.globalService.toast(localize('processingLater'));
	// 						this.globalService.setInAppFailedRequests(payload);
	// 						this.zone.run(()=>{
	// 							this.showAppleBuyButton=false;
	// 							this.showProcessingButton=true;
	// 						})
	// 					}else{
	// 						this.paymentService.postAppleOrder(payload).subscribe(
	// 							res=>{
	// 								console.log("postUserOrders result",res)
	// 								// this.isLoading=false;
	// 								let response= res as any
	// 								if(response.success){
	// 									this.zone.run(()=>this.showAppleBuyButton=false)
	// 									this.globalService.toast(localize('EnrollSuccess'));
	// 									this.globalService.editInAppFailedRequests(payload);
	// 								}
	// 							},
	// 							err=>{
	// 								this.globalService.toast(localize('proceessing'));
	// 								this.globalService.setInAppFailedRequests(payload);
	// 								this.zone.run(()=>{
	// 									this.showAppleBuyButton=false;
	// 									this.showProcessingButton=true;
	// 								})

	// 							}
	// 						)
	// 					}
	// 				})
	// 			}
	// 	   }
	// 	// 		   }
	// 	// 	   )
	// 	//    }
	goToCoursePage(id, course) {
		if (this.globalService.isEthrai || !this.globalService.isLoggedIn) {

			this.firebaseEventService.logCourseClickedEvent(this.globalService.isLoggedIn, this.globalService.getUserStats(),
				"training_path-page", this.globalService.getUserProfile(), course)
		}
		this.router.routeReuseStrategy.shouldReuseRoute = function () { return false };
		this.router.navigate(['/course-details', id]);
	}

	// ngOnDestroy() {

	// 	 if(isIOS){
	// 		this.inAppPurchaseManager?.shutdown();
	// 	 }

	// 	}
}