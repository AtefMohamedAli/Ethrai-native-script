import { Component, OnInit, Input } from '@angular/core';
import { isAndroid, isIOS } from '@nativescript/core/platform';
import { GlobalService } from '../../shared/services/global.service'
@Component({
	moduleId: module.id,
	selector: 'price-template',
	templateUrl: './price-template.component.html',
	styleUrls: ['./price-template.component.css']
})

export class PriceTemplateComponent implements OnInit {
	isEthrai: any;
	isLoggedIn: boolean;
	@Input() applePrice: number;
	@Input() androidPrice: number;
	// Intl removed - not available on iOS
	intl = { format: (n) => (n != null && !isNaN(n)) ? String(n) : '' }; // Intl polyfill for iOS
	isIOS: boolean;
	isAndroid: boolean;

	constructor(private globalService: GlobalService) {
		this.isAndroid = isAndroid;
		this.isIOS = isIOS
	}

	ngOnInit() {
		this.isEthrai = this.globalService.isEthrai;
		this.isLoggedIn = this.globalService.isLoggedIn;
	}
}