import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { isAndroid, Page } from '@nativescript/core';
import { Frame } from '@nativescript/core';
import { LoadOnDemandListViewEventData, RadListView } from 'nativescript-ui-listview';
import { ProductsDetail } from '../../shared/models/products-detail';
import { ProductsSearchOptions } from '../../shared/models/products-search-options';
import { GlobalService } from '../../shared/services/global.service';
import { DashboardService } from '../dashboard.service';
import { localize } from '@nativescript/localize';

@Component({
	moduleId: module.id,
	selector: 'training-path-card',
	templateUrl: './training-path-card.component.html',
	styleUrls: ['./training-path-card.component.css']
})

export class TraingPathCardComponent implements OnInit {
	@Input() path: any;
	@Input() pageName: any;
	@Input() showType: boolean;
	@Output() favRemoved = new EventEmitter<boolean>();
	Math
	isAndroid: boolean;
	// Intl removed - not available on iOS
	intl = { format: (n) => String(n) }; // Intl polyfill for iOS
	publishDate: string;
	constructor(private page: Page, private route: ActivatedRoute, private dashboardService: DashboardService, private globalService: GlobalService) {
		this.Math = Math
	}
	goBack() {

		Frame.topmost().goBack();

	}
	ngOnInit() {
		this.isAndroid = isAndroid
		if (this.path?.publishDate) {
			const d = new Date(this.path.publishDate);
			this.publishDate = d.getFullYear() + '/' + (d.getMonth() + 1) + '/' + d.getDate();
		}

	}
	setFavorite(id, isFav: boolean) {
		if (this.globalService.isLoggedIn) {
			let payload = {
				"productId": id,
				"type": "TrainingPath"
			}
			if (!isFav) {
				this.dashboardService.setFavoriteProducts(payload).subscribe(
					res => {
						if ((res as any).success) {
							this.path.isFavorite = true;
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
						this.path.isFavorite = false;
						if ((res as any).success) {
							this.globalService.toast(localize('FavRemoved'))
							this.favRemoved.emit(true)
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

}