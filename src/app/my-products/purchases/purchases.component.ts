import { Component, OnInit } from '@angular/core';
import { Frame, Page } from '@nativescript/core';
import { FirebaseEventService } from '~/app/shared/services/firebase.event.service';
import { GlobalService } from '~/app/shared/services/global.service';
import { MyProductsService } from '../my-products.service';

@Component({
	moduleId: module.id,
	selector: 'purchases',
	templateUrl: './purchases.component.html',
	styleUrls: ['./purchases.component.css']
})

export class PurchasesComponent implements OnInit {

	clickedd = {}; s;
	purchases: any[];
	Math: Math;
	isLoading: boolean;
	purchasesCount: number;
	filter: any;
	// Intl removed - not available on iOS
	intl = { format: (n) => String(n) }; // Intl polyfill for iOS
	constructor(private page: Page, private myProductsService: MyProductsService, private globalService: GlobalService, private firebaseEventService: FirebaseEventService) {
		//page.actionBarHidden = true;
		this.Math = Math
		this.filter = this.globalService.getPurchasesFilter();
	}

	templateSelector(item: any, index: number, items: any): string {
		if (index == 0) {
			return !item.expanded ? 'expanded' : 'default';
		}
		return item.expanded ? 'expanded' : 'default';
	}


	clickme(item) {
		this.clickedd = item;
	}
	uclickme(item) {
		this.clickedd = {};
	}
	goBack() {

		Frame.topmost().goBack();

	}

	ngOnInit() {
		this.isLoading = true;
		this.firebaseEventService.logScreenViewedEvent(this.globalService.isLoggedIn, this.globalService.getUserStats(), 'purchases', this.globalService.getUserProfile());
		if (this.filter != undefined) {
			let filterByPaymentStatus = this.filter.paymentStatus.some(item => item.isChecked)
			let filterByPaymentMethod = this.filter.paymentMethods.some(item => item.isChecked)
			let options: any = {}
			options.fromPrice = this.filter.minPrice,
				options.toPrice = this.filter.maxPrice,
				options.paymentMethod = filterByPaymentMethod ? this.filter.paymentMethods.find(item => item.isChecked)?.value : 'All'

			if (filterByPaymentStatus) {
				options.status = this.filter.paymentStatus.find(item => item.isChecked)?.value
			}
			console.log("options", options)
			this.myProductsService.getFilteredPurchases(options).subscribe(
				res => {
					this.isLoading = false;
					this.purchases = (res as any[]);
					this.purchasesCount = this.purchases?.length
					if (this.filter?.sortType == 'asc') {
						this.purchases.sort(this.sortByPriceAsc);
					} else if (this.filter?.sortType == 'desc') {
						this.purchases.sort(this.sortByPriceDesc)

					}
				},
				err => {
					this.isLoading = false;
					console.log(err)
				}
			)
		} else if (this.filter == undefined) {
			// this.purchases.sort(this.sortByDateDesc);
			this.myProductsService.getPurchases().subscribe(
				res => {
					this.isLoading = false;
					this.purchases = (res as any[]);
					this.purchasesCount = this.purchases.length
					this.purchases.sort(this.sortByDateDesc)
				},
				err => {
					this.isLoading = false;
					console.log(err)
				}
			)
		}
	}
	sortByPriceDesc(a, b) {
		let aPrice = a.invoice.paymentMethod == 'AppleInAppPurchase' ? a.appleDisplayAmount : a.invoice.amount
		let bPrice = b.invoice.paymentMethod == 'AppleInAppPurchase' ? b.appleDisplayAmount : b.invoice.amount
		if (aPrice > bPrice) {
			return -1;
		}
		if (bPrice < bPrice) {
			return 1;
		}
		return 0;
	}
	sortByPriceAsc(a, b) {
		let aPrice = a.invoice.paymentMethod == 'AppleInAppPurchase' ? a.appleDisplayAmount : a.invoice.amount
		let bPrice = b.invoice.paymentMethod == 'AppleInAppPurchase' ? b.appleDisplayAmount : b.invoice.amount
		if (aPrice < bPrice) {
			return -1;
		}
		if (bPrice > bPrice) {
			return 1;
		}
		return 0;
	}

	sortByDateDesc(a, b) {
		let aDate = Date.parse(a.created)
		let bDate = Date.parse(b.created)
		if (aDate > bDate) {
			return -1;
		}
		if (aDate < bDate) {
			return 1;
		}
		return 0;
	}
	getDate(date) {
		if (!date) return '';
		const d = new Date(date);
		return d.getFullYear() + '/' + (d.getMonth() + 1) + '/' + d.getDate();
	}
}