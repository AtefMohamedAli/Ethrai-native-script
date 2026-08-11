import { Component, HostListener, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Frame, isIOS, knownFolders, path, Utils } from '@nativescript/core';
import { Page } from '@nativescript/core';
import { WebinarBriefDetail } from '../../shared/models/webinar-brief-detail';
import { DashboardService } from '../dashboard.service';
import * as share from '@nativescript/social-share'
import { localize } from '@nativescript/localize';
import { LoadEventData } from '@nativescript/core';
import { GlobalService } from '../../shared/services/global.service';
import { registerElement } from '@nativescript/angular';
//import { PDFViewNg } from 'nativescript-pdfview-ng';
import { WebViewSource } from '../course-details/web-view-source';
import { FirebaseEventService } from '~/app/shared/services/firebase.event.service';
import { environment } from '../../../../environments/environment';
import { AlibabaHTMLGenerator } from '../course-details/AlibabaHTMLGenerator';
//registerElement('PDFViewNg', () => PDFViewNg);
import { File } from "@nativescript/core/file-system";

@Component({
	moduleId: module.id,
	selector: 'ke-detail',
	templateUrl: './ke-details.component.html',
	styleUrls: ['./ke-details.component.css']
})

export class KnowledgeEnrichmentDetails implements OnInit, OnDestroy {

	isLoading: boolean;
	clickedd = {};
	clickedd1 = {};
	clickedd2 = {};
	keId: string;
	ke: any = {};
	feedbacks: any = [];
	Math: Math;
	// webViewExt: any;
	knowledge
	item
	// Intl removed - not available on iOS
	publishDate: string;
	showReviewForm: boolean;
	webview: any;
	urlProtected: any;
	subtitle: any[] = [];
	constructor(private page: Page, private dashboardService: DashboardService, private route: ActivatedRoute, private globalService: GlobalService,
		private firebaseEventService: FirebaseEventService) {
		page.actionBarHidden = true;
		this.keId = this.route.snapshot.paramMap.get("keId");
		this.getSubtitle(this.keId)
		this.Math = Math
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
	uclickme2() {
		this.clickedd2 = {};
	}
	onError(event: ErrorEvent) {
		console.dir(event)
	}
	getSubtitle(id) {
		this.isLoading = true;
		this.dashboardService.getSubtitle(id, 2).subscribe(
			res => {
				this.subtitle = (res as any);
			}
		)
	}
	goBack() {
		if (this.ke?.ke?.type == 'Video' && isIOS) {
			this.webview?.executeJavaScript("Video.remove()", true).then(
				res => console.log("res", res),
			)
		}
		Frame.topmost().goBack();
	}
	ngOnInit() {
		if (this.globalService.isLoggedIn && this.globalService.isEthrai) {
			this.firebaseEventService.logScreenViewedEvent(this.globalService.isLoggedIn, this.globalService.getUserStats(), 'knwoledge_enrichment_page', this.globalService.getUserProfile());

		} else if (!this.globalService.isLoggedIn) {
			this.firebaseEventService.logScreenViewedEvent(this.globalService.isLoggedIn, null, 'knwoledge_enrichment_page', null);
		}
		this.getKe();
		this.getFeedBacks();
	}
	getText(html) {
		return html?.replace(/<[^>]+>/g, '').replace(/&nbsp;/g, '').replace(/\s+/g, " ")
	}
	getKe() {
		this.isLoading = true;
		this.dashboardService.geKnowledgeEnrichment(this.keId).subscribe(
			response => {
				this.isLoading = false;
				this.ke = (response as any);
				console.log(this.ke?.ke?.alibabaPlayInfo, 'llllllllllllllllllll')
				this.urlProtected = this.ke?.ke?.alibabaPlayInfo;

				if (this.ke.userFeedback) {
					this.feedbacks.push(this.ke.userFeedback)
				} else {
					this.showReviewForm = true
				}
				const d = new Date(this.ke.ke?.publishDate);
				this.publishDate = d.getFullYear() + '/' + (d.getMonth() + 1) + '/' + d.getDate();
				this.firebaseEventService.DetailsImpressionEvent('knwoledge_enrichment_page', this.ke, this.durationDiff())

			},
			error => {

			}
		)
	}

	getFeedBacks() {
		this.dashboardService.getKnowledgeEnrichmentFeedBacks(this.keId, 0, 6).subscribe(
			res => {
				let feeds = res as any;
				if (feeds?.length) {
					feeds.forEach(element => {
						this.feedbacks.push(element);
					});
				}
			},
			err => {

			}
		)
	}

	shareKe() {
		if (this.globalService.isEthrai || !this.globalService.isLoggedIn) {
			this.firebaseEventService.logShareClickedEvent('knwoledge_enrichment_page')
		}
		share.shareUrl(this.ke.ke.shortUrl, "");
	}

	downloadFile(url) {
		Utils.openUrl(url);
	}
	onLoadFinishedAliBaba(args: LoadEventData) {
		this.webview = args.object;
		this.setWebViewAliBabaSrc();
		this.registerCustomEvents()

	}
	setWebViewAliBabaSrc() {
		const htmlString = this.Alibaba();
		const documents = knownFolders.documents();
		const filePath = path.join(documents.path, "alibaba_player.html");
		const file = File.fromPath(filePath);
		file.writeText(htmlString).then(() => {
			const referer = environment.WEB_API;

			if (this.webview.ios) {
				const request = NSMutableURLRequest.requestWithURL(NSURL.URLWithString(`file://${filePath}`));
				request.setValueForHTTPHeaderField(referer, "Referer");
				this.webview.ios.loadRequest(request);
				this.webview.ios.configuration.allowsInlineMediaPlayback = true;
			} else if (this.webview.android) {
				this.webview.android.loadUrl(`file://${filePath}`);
				const settings = this.webview.android.getSettings();
				settings.setJavaScriptEnabled(true);
			}
		}).catch(err => {
			console.error("Error writing HTML file:", err);
		});
	}
	registerCustomEvents() {
		if (this.webview) {
			this.webview.on("play", (msg: any) => {
				this.firebaseEventService.logKeVideoStatusEvent('ke_videostarted', 'knwoledge_enrichment_page', this.ke, this.durationDiff())
			});
			this.webview.on("end", (msg) => {

				this.firebaseEventService.logKeVideoStatusEvent('ke_videocompleted', 'knwoledge_enrichment_page', this.ke, this.durationDiff())

			})
		}
	}
	Alibaba() {
		if (!this.urlProtected || !this.urlProtected.streamingSources || this.urlProtected.streamingSources.length === 0) {
			return '<h2>No video sources available</h2>';
		}
		const coverUrl = this.urlProtected.coverUrl || '';
		const videoSources = this.urlProtected.streamingSources;
		const htmlGenerator = new AlibabaHTMLGenerator(coverUrl, videoSources, this.subtitle);
		return htmlGenerator.generateHTML();
	}

	onloadFinished(args: LoadEventData) {
		if (!this.webview) {
			this.webview = args.object;
			// webview.src=this.ke?.ke?.videoUrl; 
			this.setWebViewSrc(this.ke?.ke?.videoUrl).then(
				res => {
					this.webview.src = res;
					// this.webViewExt=webview;
					console.log("set webview sec", res)
				},
				err => {
					console.log("err webview", err)

				}
			);
			this.webview.on("play", (msg: any) => {
				this.firebaseEventService.logKeVideoStatusEvent('ke_videostarted', 'knwoledge_enrichment_page', this.ke, this.durationDiff())
			});
			this.webview.on("end", (msg) => {

				this.firebaseEventService.logKeVideoStatusEvent('ke_videocompleted', 'knwoledge_enrichment_page', this.ke, this.durationDiff())

			})
		}
	}
	async setWebViewSrc(url): Promise<string> {
		let f = knownFolders.documents();
		let folder = f.getFolder("app");
		let file = folder.getFile('local.html');
		let videoCode = url?.substring(url.lastIndexOf('/') + 1);
		console.log("videoCode", videoCode);
		let source;
		source = new WebViewSource(videoCode);

		await file.writeText(source.getHtmlString()).then(() => {
		}).catch((err) => {
			console.log(err);
		});
		return file.path;

	}
	durationDiff() {
		var diffMs = this.ke.ke.videoNumberOfSeconds * 1000;
		let durationHours = Math.floor((diffMs % 86400000) / 3600000); // hours
		let durationMinutes = Math.round(((diffMs % 86400000) % 3600000) / 60000); // minutes
		let hours = durationHours < 10 ? '0' + durationHours : durationHours
		let mins = durationMinutes < 10 ? '0' + durationMinutes : durationMinutes

		return hours + "h " + mins + "m";
	}
	ngOnDestroy() {
		//     if(isIOS && this.ke?.ke?.type == 'Video'){
		//         this.webViewExt.executeJavaScript("Video.pause()",true).then(
		//             res=>console.log("res",res),
		//         )
		// }
	}
	showFeedback(e) {
		if (e) {
			this.feedbacks.push(e);
		}
		this.showReviewForm = false;
	}
	toggleFavorite(isFavorite) {
		if (this.globalService.isLoggedIn) {
			let payload = {
				"productId": this.keId,
				"type": "Ke"
			}
			if (!isFavorite) {
				this.dashboardService.setFavoriteProducts(payload).subscribe(
					res => {
						if ((res as any).success) {
							this.ke.ke.isFavorite = true;
							this.globalService.toast(localize('FavAdded'))
						}
					},
					err => {

					}
				)
			} else {
				this.dashboardService.removeFavoriteProducts(payload).subscribe(
					res => {
						this.ke.ke.isFavorite = false;
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
}