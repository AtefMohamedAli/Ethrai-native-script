import { Component, OnInit } from '@angular/core';
import { Frame, Page } from '@nativescript/core';
import { MyProductsService } from '../my-products.service';
import { Utils } from "@nativescript/core";
import * as share from '@nativescript/social-share'
import { GlobalService } from '../../shared/services/global.service';
import { FirebaseEventService } from '~/app/shared/services/firebase.event.service';
import { ProductsSearchOptions } from '~/app/shared/models/products-search-options';
import { DashboardService } from '~/app/dashboard/dashboard.service';
import { localize } from '@nativescript/localize';

@Component({
	moduleId: module.id,
	selector: 'certificates',
	templateUrl: './certificates.component.html',
	styleUrls: ['./certificates.component.css']
})

export class CertificatesComponent implements OnInit {
	certs: any[] = [];
	isLoading: boolean = false;
	options: any = new ProductsSearchOptions();;
	private readonly certsSearchEndpoint = 'UserData/certs/search';
	// Intl removed - not available on iOS
	constructor(private page: Page, private myProductsService: MyProductsService, private globalService: GlobalService, private firebaseEventService: FirebaseEventService, private dashboardService: DashboardService) {
		//page.actionBarHidden = true;

	}

	goBack() {

		Frame.topmost().goBack();

	}
	ngOnInit() {
		console.log('📄 [Certificates] Page loaded');
		this.firebaseEventService.logScreenViewedEvent(this.globalService.isLoggedIn, this.globalService.getUserStats(), 'my_certificates', this.globalService.getUserProfile());
		let filter = this.globalService.getCertsFilter();
		if (filter) {
			let selectedRating: number = filter?.rating?.some(item => item.isChecked) ? filter.rating.find(x => x.isChecked).rate : 0
			let priceCategory: string = filter?.priceTypes?.some(item => item.isChecked) ? filter.priceTypes.find(x => x.isChecked).value : 'All'
			let duration = filter.durations?.some(item => item.isChecked) ? filter.durations.find(x => x.isChecked) : undefined
			let minDuration = duration?.min ? duration?.min : 0;
			let maxDuration = duration?.max ? duration?.max : 10000;
			this.options.maxHours = maxDuration
			this.options.minHours = minDuration
			this.options.minRating = selectedRating;
			this.options.pricingType = priceCategory;
			filter.levels.length > 0 ? this.options.levels = filter.levels : this.options.levels = [];
		} else {
			this.options.maxHours = 10000
			this.options.minHours = 0
			this.options.minRating = 0;
			this.options.pricingType = "All";
			this.options.levels = []
		}
		if (this.showCertificates()) {
			console.log(`📡 [Certificates] Request -> POST ${this.certsSearchEndpoint}`);
			console.log('📦 [Certificates] Request payload:', JSON.stringify(this.options, null, 2));
			this.isLoading = true;
			this.myProductsService.getFilteredCertificates(this.options).subscribe(
				res => {
					this.isLoading = false;
					console.log(`✅ [Certificates] Response <- ${this.certsSearchEndpoint}`);
					console.log('📥 [Certificates] Response body:', JSON.stringify(res, null, 2));
					this.certs = res as any[];
					console.log('📊 [Certificates] Total certificates:', this.certs?.length || 0);
					if (filter?.sortType == 'earlier') {
						this.certs?.sort(this.sortByDateAsc);
					} else {
						this.certs?.sort(this.sortByDateDesc)

					}
				},
				err => {
					this.isLoading = false;
					console.error(`❌ [Certificates] Request failed <- ${this.certsSearchEndpoint}`);
					console.error('📦 [Certificates] Failed payload:', JSON.stringify(this.options, null, 2));
					console.error('🧾 [Certificates] Error details:', err);
				}
			)
		} else {
			console.log('⛔ [Certificates] Certificates are hidden for this user based on profile rules');
		}

	}
	downloadCertificate(cert) {
		const certCode = cert.code;
		// Determine certificate type: Course=1, Webinar=2, Path=3
		const certType = cert.productType === 'Webinar' ? 2 : cert.productType === 'CoursePath' ? 3 : 1;
		if (certCode) {
			console.log(`🎓 [downloadCertificate] Requesting media url | Type: ${certType} | Code: ${certCode}`);
			this.dashboardService.getCertificateMediaUrl(certType, certCode).subscribe(
				res => {
					console.log('🎓 [downloadCertificate] Response received:', JSON.stringify(res, null, 2));
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
					console.log('Certificate download error:', err);
				}
			);
		}
	}

	shareCertificate(cert) {
		const certCode = cert.code;
		const certType = cert.productType === 'Webinar' ? 2 : cert.productType === 'CoursePath' ? 3 : 1;
		if (certCode) {
			console.log(`🎓 [shareCertificate] Requesting media url | Type: ${certType} | Code: ${certCode}`);
			this.dashboardService.getCertificateMediaUrl(certType, certCode).subscribe(
				res => {
					console.log('🎓 [shareCertificate] Response received:', JSON.stringify(res, null, 2));
					let url = (res as any).url || (res as any).certificateUrl || (res as any).data || (res as any).extraData || res;
					if (typeof url === 'string') {
						if (!url.startsWith('http')) {
							url = 'https://' + url;
						}
						share.shareUrl(url, "");
					} else {
						console.log('Error in shareUrl: response is not a valid string URL. Response was:', JSON.stringify(res));
						this.globalService.toast(localize('tryAgain'));
					}
				},
				err => {
					this.globalService.toast(localize('tryAgain'));
					console.log('Certificate share error:', err);
				}
			);
		}
	}

	showCertificates() {
		let isForeginer = ['GulfCooperationCountries', 'Foreigner'].includes(this.globalService.getUserType());
		let isNameApproved = this.globalService.getUserProfile().namesApprovalStatus == 'Approved';
		if (isForeginer && !isNameApproved) {
			return false;
		}
		return true;
	}
	sortByDateDesc(a, b) {
		let aDate = Date.parse(a.certificateDate)
		let bDate = Date.parse(b.certificateDate)
		if (aDate > bDate) {
			return -1;
		}
		if (aDate < bDate) {
			return 1;
		}
		return 0;
	}
	sortByDateAsc(a, b) {
		let aDate = Date.parse(a.certificateDate)
		let bDate = Date.parse(b.certificateDate)
		if (aDate < bDate) {
			return -1;
		}
		if (aDate > bDate) {
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
