import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { RouterExtensions } from '@nativescript/angular';
import { Frame, Page } from '@nativescript/core';
import { localize } from '@nativescript/localize';
import { DashboardService } from '~/app/dashboard/dashboard.service';
import { FirebaseEventService } from '~/app/shared/services/firebase.event.service';
import { GlobalService } from '~/app/shared/services/global.service';
import { ProductBriefDetail } from '../../shared/models/product-brief-detail';
import { PaymentService } from '../payment.service';

@Component({
	moduleId: module.id,
	selector: 'shopping-cart',
	templateUrl: './shopping-cart.component.html',
	styleUrls: ['./shopping-cart.component.css']
})

export class ShoppingCartComponent implements OnInit {
	productId: string;
	productType: string;
	productPrice: string;
	productDetail: any;
	products: any[] = [];
	totalWithoutVat: number = 0;
	totalWithVat: number = 0;
	discount: number = 0;
	vat: number = 0;
	vatRounded: string = "";
	totalWithoutVatRounded: string = "";
	discountRounded: string = "";
	isHighlightedLoading: boolean;
	recommendedCourses: any[];
	totalWithVatRounded: string;
	totalCost: number = 0;
	isCouponLoading: boolean = false;
	couponMessage: string;
	coupon: string = "";
	Math
	clickedd = {}; s;
	elem;
	isLoading: boolean;
	// Intl removed - not available on iOS
	intl = { format: (n) => String(n) }; // Intl polyfill for iOS
	constructor(private page: Page, private route: ActivatedRoute, private router: RouterExtensions, private paymentService: PaymentService
		, private globalService: GlobalService, private firebaseEventService: FirebaseEventService, private dashboardService: DashboardService) {
		//page.actionBarHidden = true;
		this.productId = this.route.snapshot.paramMap.get("productId");
		this.productPrice = this.route.snapshot.paramMap.get("productPrice");
		this.productType = this.route.snapshot.paramMap.get("productType");
		this.Math = Math
	}
	goBack() {
		let previousUrl = this.globalService.previousURL;
		if (previousUrl == "/payment-failed") {
			this.router.navigate(['/highlighted']);
		} else {
			Frame.topmost().goBack();
		}
	}
	templateSelector(elem: any, index: number, elems: any): string {
		if (index == 0) {
			return !elem.expanded ? 'expanded' : 'default';
		}
		return elem.expanded ? 'expanded' : 'default';
	}

	clickme(elem) {
		this.clickedd = elem;
	}
	uclickme(elem) {
		this.clickedd = {};
	}

	ngOnInit() {
		this.firebaseEventService.logViewCartEvent('shopping_cart')
		this.getShopCart();
		this.getRecommendedProducts();
		this.firebaseEventService.logScreenViewedEvent(this.globalService.isLoggedIn, this.globalService.getUserStats(), 'shopping_cart', this.globalService.getUserProfile());

	}

	// async updateShopCart(){
	// 	let product={
	// 		productId:this.productId,
	// 		amount:this.productPrice,
	// 		productType:this.productType
	// 	}
	// 	 await this.paymentService.addToShopCart(product).then(
	// 		res=>{
	// 			if((res as any).success){
	// 			//	this.productDetail= (res as any).extraData
	// 			this.getShopCart();
	// 			}
	// 		},
	// 		err=>{
	// 			console.log(err);
	// 			const toast = new Toasty({ text: localize('tryAgain') ,yAxisOffset: 50});
	// 			toast.show();
	// 			this.getShopCart();
	// 		}
	// 	);

	// }

	getRecommendedProducts() {
		this.isHighlightedLoading = true;
		this.paymentService.getHighlightedCourses(5).subscribe(
			response => {
				this.isHighlightedLoading = false;
				this.recommendedCourses = response as ProductBriefDetail[];
				this.recommendedCourses = this.recommendedCourses//.filter(course=>course.isPublished);
				if (this.recommendedCourses.length) {
					this.firebaseEventService.logCourseImpressionsEvent('shopping_cart', this.recommendedCourses, "training")
				}
			},
			err => {

			}
		)
	}

	getShopCart() {
		this.isLoading = true;
		this.paymentService.getShopCart().toPromise().then(
			res => {
				this.isLoading = false;
				this.products = res as any[];
				console.log('this.products', this.products)

				this.calculatePrices();
				this.roundValues();
			},
			err => {
				console.log(err)
			}
		)
	}
	removeFromCart(productId, index, product) {
		console.log('🛒 [RemoveFromCart] productId sent to API:', productId);
		console.log('🛒 [RemoveFromCart] product keys:', Object.keys(product));
		console.log('🛒 [RemoveFromCart] product.id:', product.id, '| product.productId:', product.productId, '| product.shoppingCartId:', product.shoppingCartId);
		this.paymentService.removeFromShopCart(productId).subscribe(
			res => {
				console.log('🛒 [RemoveFromCart] API response:', JSON.stringify(res));
				if ((res as any).success) {
					try {
						let type = product.productType == 'Course' ? 'training' : 'conference'
						this.firebaseEventService.logRemoveFromCartEvent(type, 'shopping_cart', product)
					} catch (e) {
						console.error('🛒 [RemoveFromCart] Firebase event error:', e);
					}
					this.products.splice(index, 1);
					this.globalService.shoppinCartItemsCount -= 1;
					this.calculatePrices();
					this.roundValues();
				}
			},
			err => {
				console.error('removeFromCart error:', err);
				this.globalService.toast(localize('tryAgain'));
			}
		)
	}
	calculatePrices() {
		this.totalWithoutVat = 0;
		this.totalWithVat = 0;
		this.discount = 0;
		this.vat = 0;
		this.totalCost = 0;
		this.products.forEach(prod => {
			if (prod.discount > 0) {
				this.totalCost += prod.amountWithVat;
			} else if (prod.discount == 0) {
				this.totalCost += prod.amount;
			}
			this.totalWithoutVat += prod.originalAmountWithoutVat;
			this.vat += prod.vatValue;
			this.discount += prod.discount;
		});
	}
	roundValues() {
		this.totalWithVat = this.vat + this.totalWithoutVat - this.discount;
		this.vatRounded = this.vat.toFixed(2);
		this.totalWithoutVatRounded = this.totalWithoutVat.toFixed(2);
		this.discountRounded = this.discount.toFixed(2);
		this.totalWithVatRounded = this.totalWithVat.toFixed(2);
	}
	applyCoupon(coupon: string) {
		if (coupon.trim() != "") {
			this.isCouponLoading = true;
			let payload = {
				dryRun: true,
				paymentMethod: "Mada", // Fixed
				shoppingCartItems: this.products,
				couponName: coupon
			}
			this.paymentService.applyCoupon(payload).subscribe(
				res => {
					this.coupon = coupon;
					this.isCouponLoading = false;
					let data = res as any
					if (data.success) {
						this.totalWithoutVat = data.extraData.discountPrice
						this.discount = data.extraData.discount;
						this.vat = data.extraData.vatValue;
						this.totalCost = Math.floor(data.extraData.amountWithVat)

						console.log('cccccccccccccccccc')
					}
				},
				err => {
					console.error('applyCoupon error:', err);
					this.isCouponLoading = false;
					this.coupon = "";
					console.log("err ", err);
					let error = err.error;
					if (error.success == false) {
						this.couponMessage = localize(error.errorCode)
					}//error.errorCode
				}
			)
		}
	}
	goToCheckout() {
		try {
			this.firebaseEventService.logCheckoutBeginEvent("shopping_cart", this.products)
		} catch (e) {
			console.error('logCheckoutBeginEvent failed:', e);
		}
		this.router.navigate(['/checkout', this.coupon])
	}
	goToCoursePage(id, course) {
		if (this.globalService.isEthrai || !this.globalService.isLoggedIn) {
			this.firebaseEventService.logCourseClickedEvent(this.globalService.isLoggedIn, this.globalService.getUserStats(),
				"shopping_cart", this.globalService.getUserProfile(), course)
		}
		this.router.router.routeReuseStrategy.shouldReuseRoute = function () { return false };

		this.router.navigate(['/course-details', id]);
	}
	toggleFavorite(item, i) {
		let payload = {
			"productId": item?.productId,
			"type": item.productType
		}
		if (!item?.isFavorite) {
			this.dashboardService.setFavoriteProducts(payload).subscribe(
				res => {
					if ((res as any).success) {
						this.products[i].isFavorite = true;
						this.globalService.toast(localize('FavAdded'))
						this.removeFromCart(item.id, i, item)
					}
				},
				err => {
					console.error('setFavorite error:', err);
					this.globalService.toast(localize('tryAgain'));
				}
			)
		} else {
			this.dashboardService.removeFavoriteProducts(payload).subscribe(
				res => {
					this.products[i].isFavorite = false;
					if ((res as any).success) {
						this.globalService.toast(localize('FavRemoved'))
					}
				},
				err => {
					console.error('removeFavorite error:', err);
					this.globalService.toast(localize('tryAgain'));
				}
			)
		}
	}
	getCourseProgressPercent(watchedSeconds: number, TotalSeconds: number) {
		const percent = (watchedSeconds / TotalSeconds) * 100;
		return this.intl.format(Number(percent.toFixed(1))) + '%';
	}
}