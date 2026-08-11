import { Component, HostListener, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Frame, isIOS, knownFolders, Utils, path } from '@nativescript/core';
import { Page } from '@nativescript/core';
import { WebinarBriefDetail } from '../../shared/models/webinar-brief-detail';
import { DashboardService } from '../dashboard.service';
import * as share from '@nativescript/social-share'
import { localize } from '@nativescript/localize';
import { LoadEventData } from '@nativescript/core';
import { GlobalService } from '../../shared/services/global.service';
import { WebViewSource } from '../course-details/web-view-source';
import { FirebaseEventService } from '~/app/shared/services/firebase.event.service';
import { AlibabaHTMLGenerator } from '../course-details/AlibabaHTMLGenerator';
import { environment } from '../../../../environments/environment';
import { File } from "@nativescript/core/file-system";

@Component({
	moduleId: module.id,
	selector: 'webinar-detail',
	templateUrl: './webinar-details.component.html',
	styleUrls: ['./webinar-details.component.css']
})

export class WebinarDetails implements OnInit, OnDestroy {

	isLoading: boolean;
	webinars: WebinarBriefDetail[];
	clickedd = {};
	clickedd1 = {};
	webinarId: string;
	webinar: any = {};
	durationMinutes: number;
	durationHours: number;
	feedbacks: any = [];
	Math: Math;
	showFinishedButton: boolean = false;
	showCertificateButton: boolean = false;
	showAlredyEnrolledButton: boolean = false;
	showEnrollButton: boolean = false;
	showLiveButton: boolean = false;
	clickedd2: {};
	// webViewExt: any;
	item
	// Intl removed - not available on iOS
	intl = { format: (n) => String(n) }; // Intl polyfill for iOS
	showReviewForm: boolean;
	webview: any;
	isLoggedIn: boolean = false;
	urlProtected: any;
	constructor(private page: Page, private dashboardService: DashboardService, private route: ActivatedRoute, private globalService: GlobalService,
		private firebaseEventService: FirebaseEventService) {
		page.actionBarHidden = true;
		this.webinarId = this.route.snapshot.paramMap.get("webinarId");
		this.Math = Math
		this.isLoggedIn = this.globalService.isLoggedIn
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
	goBack() {
		if (this.urlProtected && isIOS) {
			this.webview?.executeJavaScript("Video.remove()", true).then(
				res => console.log("res", res),
			)
		}
		Frame.topmost().goBack();
	}
	ngOnInit() {
		this.getWebinar();
		this.getFeedBacks();
	}

	getWebinar() {
		if (this.globalService.isLoggedIn) {
			this.firebaseEventService.logScreenViewedEvent(this.globalService.isLoggedIn, this.globalService.getUserStats(), 'webinar_page', this.globalService.getUserProfile());

		} else {
			this.firebaseEventService.logScreenViewedEvent(this.globalService.isLoggedIn, null, 'webinar_page', null);

		}
		this.isLoading = true;
		this.dashboardService.getWebinar(this.webinarId).subscribe(
			response => {
				this.webinar = (response as any);
				this.urlProtected = this.webinar?.webinar?.alibabaPlayInfo;

				if (this.webinar.userFeedback) {
					this.feedbacks.push(this.webinar.userFeedback)
				}
				this.isLoading = false;

				let progressStatus = this.webinar.webinar.progressStatus;
				if (!this.webinar.userFeedback && progressStatus == 'Done') {
					this.showReviewForm = true;
				}
				if (progressStatus == 'Done') {
					if (this.webinar.enrollment != undefined) {
						if (this.webinar.enrollment.webinarCertificate.certificateUrl) {
							this.showCertificateButton = true;
							let duration = this.durationDiff();
							this.firebaseEventService.logWebinarDetailsRegistrationBtnClick('webinar_page', this.webinar, duration, "conference_completed")
						}
					} else {
						this.showFinishedButton = true;
					}
					// if(user enrolled in the webinar) {
					// Download certificate button is appear // تنزيل الشهادة
					// }
					// else{
					// Finished webinar button is appear // المؤتمر منتهي
					// }
				} else if (progressStatus == 'Pending') {
					if (this.webinar.enrollment) {
						this.showAlredyEnrolledButton = true;

					} else {
						this.showEnrollButton = true;
					}
					// if(user enrolled in the webinar) {
					// Enrolled button is appear // انت مسجّل
					// }
					// else{
					// Enroll in the webinar button is appear // سَجّل في المؤتمر
					// }
				} else {
					this.showLiveButton = true
					// webinar is Live button is appear // المؤتمر قيد البث
				}
				let duration = this.durationDiff();
				this.firebaseEventService.logWebinarDetailsImpressionEvent('webinar_page', this.webinar, duration)

			},
			error => {
				console.log("errrrrrrrr")
			}
		)
	}

	getFeedBacks() {
		this.dashboardService.getWebinarFeedBacks(this.webinarId, 0, 6).subscribe(
			res => {
				let feeds = res as any;
				if (feeds.length) {
					feeds.forEach(element => {
						this.feedbacks.push(element);
					});
				}
			},
			err => {

			}
		)
	}
	durationDiff() {
		let startDate = Date.parse(this.webinar.webinar.startDate);
		let endtDate = Date.parse(this.webinar.webinar.endDate);
		var diffMs = (endtDate - startDate);
		this.durationHours = Math.floor((diffMs % 86400000) / 3600000); // hours
		this.durationMinutes = Math.round(((diffMs % 86400000) % 3600000) / 60000); // minutes
		let hours = this.durationHours < 10 ? '0' + this.durationHours : this.durationHours
		let mins = this.durationMinutes < 10 ? '0' + this.durationMinutes : this.durationMinutes

		return hours + "h " + mins + "m";
	}
	enrollToWebinar() {
		let duration = this.durationDiff();
		this.firebaseEventService.logWebinarDetailsRegistrationBtnClick('webinar_page', this.webinar, duration, "add_to_cart")
		if (this.globalService.isLoggedIn) {
			let lastRegistrationDate = Date.parse(this.webinar.webinar.lastRegistrationDate);
			let currentDate = Date.parse(new Date().toString());
			if (currentDate < lastRegistrationDate) {
				this.dashboardService.enrollToWebinar(this.webinarId).subscribe(
					res => {
						console.log(res)
						if ((res as any).success) {
							this.globalService.toast(localize('EnrollSuccess'));
							let duration = this.durationDiff();
							this.firebaseEventService.logWebinarDetailsRegistrationBtnClick('webinar_page', this.webinar, duration, "purchase")
							this.showEnrollButton = false;
							this.getWebinar();
						}
					},
					err => {
						console.log("err", err)
						this.globalService.toast(localize('EnrollFailure'))
					}
				)
			} else {
				this.globalService.toast(localize('RegistrationDateError'))
			}
		} else {
			this.globalService.toast(localize('LoginToEnrollWebinar'))
		}
	}
	goToWebinar() {
		if (this.webinar.enrollment) {
			if (this.webinar.webinar.showYoutubeUrl) {
				Utils.openUrl(this.webinar.enrollment.youtubeUrl)
			} else {
				Utils.openUrl(this.webinar.enrollment.zoomUrl)

			}
		} else {
			this.globalService.toast(localize('NotEnrolled'))
		}
	}
	shareWebinar() {
		if (this.globalService.isEthrai || !this.globalService.isLoggedIn) {
			this.firebaseEventService.logShareClickedEvent('webinar_page')
		}
		share.shareUrl(this.webinar.webinar.shortWebinarUrl, "");
	}

	downloadFile(url) {
		Utils.openUrl(url);
	}

	downloadCertificate() {
		const certCode = this.webinar.enrollment?.webinarCertificate?.code;
		if (certCode) {
			this.dashboardService.getCertificateMediaUrl(2, certCode).subscribe(
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
					console.log('Webinar certificate error:', err);
				}
			);
		}
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
				this.firebaseEventService.logWebinarVideoStatusEvent('conference_videostarted', 'webinar_page', this.webinar, this.durationDiff())
			});
			this.webview.on("end", (msg) => {

				this.firebaseEventService.logWebinarVideoStatusEvent('conference_videocompleted', 'webinar_page', this.webinar, this.durationDiff())

			})
		}
	}
	Alibaba() {

		const coverUrl = this.urlProtected.coverUrl || '';
		const videoSources = this.urlProtected.streamingSources;
		const htmlGenerator = new AlibabaHTMLGenerator(coverUrl, videoSources, []);
		return htmlGenerator.generateHTML();
	}
	onloadFinished(args: LoadEventData) {
		if (!this.webview) {
			this.webview = args.object;
			// webview.src=this.webinar?.webinar?.videoUrl;
			this.setWebViewSrc(this.webinar?.webinar?.videoUrl).then(
				res => {
					this.webview.src = res;
					// this.webViewExt = webview;
					console.log("set webview sec", res)
				},
				err => {
					console.log("err webview", err)

				}
			);
			this.webview.on("play", (msg: any) => {
				this.firebaseEventService.logWebinarVideoStatusEvent('conference_videostarted', 'webinar_page', this.webinar, this.durationDiff())
			});
			this.webview.on("end", (msg) => {

				this.firebaseEventService.logWebinarVideoStatusEvent('conference_videocompleted', 'webinar_page', this.webinar, this.durationDiff())

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
	getText(html) {
		return html?.replace(/(<style[\w\W]+style>)/g, "").replace(/(<w:[\w\W]+\/>)/g, "").replace(/<[^>]+>/g, '').replace(/&nbsp;/g, '')
	}

	ngOnDestroy() {
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
				"productId": this.webinarId,
				"type": "Webinar"
			}
			if (!isFavorite) {
				this.dashboardService.setFavoriteProducts(payload).subscribe(
					res => {
						if ((res as any).success) {
							this.webinar.webinar.isFavorite = true;
							this.globalService.toast(localize('FavAdded'))
						}
					},
					err => {

					}
				)
			} else {
				this.dashboardService.removeFavoriteProducts(payload).subscribe(
					res => {
						this.webinar.webinar.isFavorite = false;
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