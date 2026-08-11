import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Page } from '@nativescript/core';
import { Frame } from '@nativescript/core';
import { LoadOnDemandListViewEventData, RadListView } from 'nativescript-ui-listview';
import { ProductsDetail } from '../../shared/models/products-detail';
import { ProductsSearchOptions } from '../../shared/models/products-search-options';
import { GlobalService } from '../../shared/services/global.service';
import { DashboardService } from '../dashboard.service';
import { localize } from '@nativescript/localize';
import { RouterExtensions } from '@nativescript/angular'
import { FirebaseEventService } from '~/app/shared/services/firebase.event.service';
@Component({
	moduleId: module.id,
	selector: 'ke-webinar-card',
	templateUrl: './ke-webinar-card.component.html',
	styleUrls: ['./ke-webinar-card.component.css']
})

export class KeWebinarCardComponent implements OnInit {
	@Input() product: any;
	@Input() productType: any;
	@Output() favRemoved = new EventEmitter<boolean>();
	@Input() showType: boolean
	@Input() screenName: any;
	Math: Math;
	// Intl removed - not available on iOS
	rating: any;
	date: string;
	constructor(private page: Page, private routerExtensions: RouterExtensions, private route: ActivatedRoute, private dashboardService: DashboardService, private globalService: GlobalService,
		private firebaseEventService: FirebaseEventService) {
		this.Math = Math
	}
	goBack() {

		Frame.topmost().goBack();

	}
	ngOnInit() {
		this.product?.rating ? this.rating = Math.round(this.product.rating) : this.rating = 5;
		this.productType != 'Ke' ? this.date = this.getDate(this.product?.startDate) : this.date = this.getDate(this.product?.publishDate)
	}
	getText(html) {
		return html?.replace(/<[^>]+>/g, '').replace(/&nbsp;/g, '')
	}
	setFavorite(id, isFav: boolean) {
		console.log("isFavisFav", isFav, id)
		if (this.globalService.isLoggedIn) {
			let payload = {
				"productId": id,
				"type": this.productType
			}
			console.log("fav payload", payload)
			if (!isFav) {
				this.dashboardService.setFavoriteProducts(payload).subscribe(
					res => {
						if ((res as any).success) {
							this.product.isFavorite = true;
							this.globalService.toast(localize('FavAdded'))
						}
					},
					err => {

					}
				)
			} else {
				this.dashboardService.removeFavoriteProducts(payload).subscribe(
					res => {
						this.product.isFavorite = false;
						if ((res as any).success) {
							this.favRemoved.emit(true)
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
	goToProduct(id) {
		if (this.productType == 'Ke') {
			if (this.globalService.isEthrai || !this.globalService.isLoggedIn) {
				this.firebaseEventService.logKeWebinarsClickedEvent(this.globalService.isLoggedIn, this.globalService.getUserStats(),
					this.screenName, this.globalService.getUserProfile(), this.product, this.product.id, null)
			}
			this.routerExtensions.navigate(['/ke-details', id])
		} else if (this.productType == 'Webinar') {
			if (this.globalService.isEthrai || !this.globalService.isLoggedIn) {
				this.firebaseEventService.logKeWebinarsClickedEvent(this.globalService.isLoggedIn, this.globalService.getUserStats(),
					this.screenName, this.globalService.getUserProfile(), this.product, this.product.id, null)
			}
			this.routerExtensions.navigate(['/webinar-details', id]);
		}
	}
	getDate(date) {
		if (!date) return '';
		const d = new Date(date);
		return d.getFullYear() + '/' + (d.getMonth() + 1) + '/' + d.getDate();
	}
}