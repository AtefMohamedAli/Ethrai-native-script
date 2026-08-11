import { Component, OnInit, ViewContainerRef } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { RouterExtensions } from '@nativescript/angular';
import { Frame, Page, isAndroid, isIOS, Utils, Dialogs } from '@nativescript/core';
import { localize } from '@nativescript/localize';
import { PaymentService } from '../payment.service';
// import { InAppBrowser } from 'nativescript-inappbrowser';
import { ModalDialogService } from '@nativescript/angular';

import {
	buyItem,
	BuyItemOptions,
	canMakePayments,
	fetchItems,
	finalizeOrder,
	init as initPayments,
	Item,
	PaymentEvent,
	paymentEvents,
	toMainThread
} from '@nativescript/payments'
import { GlobalService } from '../../shared/services/global.service';
import { DashboardService } from '~/app/dashboard/dashboard.service';
import { ProductBriefDetail } from '~/app/shared/models/product-brief-detail';
import { SadadPopupComponent } from '../sadad-popup/sadad-popup.component';
import { FirebaseEventService } from '~/app/shared/services/firebase.event.service';

@Component({
	moduleId: module.id,
	selector: 'checkout',
	templateUrl: './checkout.component.html',
	styleUrls: ['./checkout.component.css']
})

export class CheckoutComponent implements OnInit {
	products: any[];
	totalWithoutVat: number;
	totalWithVat: number;
	discount: number;
	vat: number;
	totalCost: number;
	vatRounded: string;
	totalWithoutVatRounded: string;
	discountRounded: string;
	totalWithVatRounded: string;
	isAndroid: boolean;
	isIOS: boolean;
	sadadPay: boolean = false;
	coupon: string;
	payURL: any;
	item: Item[];
	isLoading: boolean;
	similarCourses: any[];
	recommendedCourses: ProductBriefDetail[];
	isHighlightedLoading: boolean;
	Math;
	// Intl removed - not available on iOS
	intl = { format: (n) => String(n) }; // Intl polyfill for iOS
	constructor(private page: Page, private route: ActivatedRoute, private globalService: GlobalService, private paymentService: PaymentService,
		private router: RouterExtensions, private dashboardService: DashboardService, private modalService: ModalDialogService, private vcRef: ViewContainerRef,
		private firebaseEventService: FirebaseEventService) {
		//page.actionBarHidden = true;
		this.isAndroid = isAndroid;
		this.isIOS = isIOS;
		this.coupon = this.route.snapshot.paramMap.get("coupon");
		this.Math = Math
	}
	goBack() {
		Frame.topmost().goBack();

	}
	ngOnInit() {
		this.getShopCart();
		this.getRecommendedProducts();
		this.firebaseEventService.logScreenViewedEvent(this.globalService.isLoggedIn, this.globalService.getUserStats(), 'checkout', this.globalService.getUserProfile());

	}

	getShopCart() {
		this.paymentService.getShopCart().toPromise().then(
			res => {
				this.products = res as any[];
				console.log(this.products)
				this.calculatePrices();
				this.roundValues();
				let myProduct = this.products[0]
			},
			err => {
				console.log(" ", err)
			}
		)
	}
	roundValues() {
		this.totalWithVat = this.vat + this.totalWithoutVat - this.discount;
		this.vatRounded = this.vat.toFixed(2);
		this.totalWithoutVatRounded = this.totalWithoutVat.toFixed(2);
		this.discountRounded = this.discount.toFixed(2);
		this.totalWithVatRounded = this.totalWithVat.toFixed(2);
	}

	calculatePrices() {
		this.totalWithoutVat = 0;
		this.discount = 0;
		this.vat = 0;
		this.totalCost = 0;
		this.products.forEach(prod => {
			if (prod.discount > 0) {
				this.totalCost += prod.amountWithVat;
			} else if (prod.discount == 0) {
				this.totalCost += prod.amount;
			}
			this.totalWithoutVat += prod.discountPrice;
			this.vat += prod.vatValue;
			this.discount += prod.discount;
		});
	}
	setPaymentMethod(method) {
		if (method == 'Mada') {
			this.sadadPay = false;
		} else if (method == 'Sadad') {
			this.sadadPay = true
		}

	}

	buyProducts() {
		this.firebaseEventService.logPaymentInfoEvent('checkout', this.products, this.sadadPay ? 'Sadad' : 'Mada')

		let payload = {
			dryRun: false,
			paymentMethod: this.sadadPay ? 'Sadad' : 'Mada',
			shoppingCartItems: this.products,
			couponName: this.coupon
		}

		this.isLoading = true;
		this.paymentService.postUserOrders(payload).subscribe(
			res => {
				this.isLoading = false;
				let response = res as any
				if (response.success) {
					let method: string = (response.extraData.invoice.paymentMethod).toLowerCase();
					this.startTraining()
					if (!this.sadadPay) {
						this.payURL = response.extraData.invoice.madaInfo.redirectUrl;
						let trackId = response.extraData.invoice.madaInfo.trackId;
						console.log("trackId444", trackId)
						this.firebaseEventService.logPurchaseEvent("checkout", this.products, method, trackId, this.vat, this.coupon ? this.coupon : 'na')
						this.openLink(this.payURL);
					} else {
						// this.router.navigate(['/payment-success']);
						this.firebaseEventService.logPurchaseEvent("checkout", this.products, method, response.extraData.invoice.id, this.vat, this.coupon ? this.coupon : 'na')
						this.openModal();

					}
				}
			},
			err => {
				console.log(err)
				this.isLoading = false;
				if (err.error.success == false) {
					if (err.error.errorCode.includes('SadadNotAllowed')) {
						this.globalService.toast(localize('SadadNotAllowed'))
					} else if (err.error.errorCode.includes('ProductAlreadyOwned')) {
						this.globalService.toast(localize('tryAgain'))

					}
					this.router.navigate(['/payment-failed']); //{ replaceUrl: true }
				}
			}
		)
	}
	async openLink(url) {
		Utils.openUrl(url);
		
	}
	getRecommendedProducts() {
		this.isHighlightedLoading = true;
		this.dashboardService.getHighlightedCoursesByTags(5).subscribe(
			response => {
				this.isHighlightedLoading = false;
				this.recommendedCourses = (response as ProductBriefDetail[])//.filter(course=>course.isPublished);
				if (this.recommendedCourses.length) {
					this.firebaseEventService.logCourseImpressionsEvent("checkout", this.recommendedCourses, "training")
				}
			},
			err => {

			}
		)
	}
	startTraining() {
		this.products.forEach(element => {
			if (element.productType == "StudyPlan") {
				let payload = {
					"userProfileId": this.globalService.getUserProfile().id,
					"studyPlanId": element.productId,
					"isEnrollment": true
				}
				this.dashboardService.StartTraining(payload).subscribe(
					res => {
						console.log(res)
					},
					err => {

					}
				)
			}
		});

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
	openModal() {
		const response = this.modalService.showModal(SadadPopupComponent, {
			context: {
				dim: "#00000000"
			},
			fullscreen: false,
			viewContainerRef: this.vcRef,
			dimAmount: 0.5,
		} as any);
		response.then(res => {
			this.router.navigate(['/purchases'])
		},
			err => {

			})
		// console.log("Modal response: " + response);
	}
	goToCoursePage(id, course) {
		if (this.globalService.isEthrai || !this.globalService.isLoggedIn) {
			this.firebaseEventService.logCourseClickedEvent(this.globalService.isLoggedIn, this.globalService.getUserStats(),
				"checkout", this.globalService.getUserProfile(), course)
		}
		this.router.router.routeReuseStrategy.shouldReuseRoute = function () { return false };

		this.router.navigate(['/course-details', id]);
	}
}