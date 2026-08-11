import { Component, NgZone, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AndroidApplication, Connectivity, Folder, Frame, Page, Utils, knownFolders, path } from '@nativescript/core';
import { DashboardService } from '../dashboard.service';
import { GlobalService } from '~/app/shared/services/global.service';
import { isAndroid, isIOS, Application } from "@nativescript/core";
import { WebViewSource } from '../course-details/web-view-source';
import * as share from '@nativescript/social-share'
import { PaymentService } from '~/app/payment/payment.service';
import { localize } from '@nativescript/localize';
import { concatMap, tap } from 'rxjs/operators';
// openFile is accessed via Utils.openFile() - imported above from @nativescript/core
import * as fileSystem from "@nativescript/core/file-system";
import { Http } from '@nativescript/core';
import { getFile } from '@nativescript/core/http';
import { RouterExtensions } from '@nativescript/angular';
// import { InAppPurchaseManager, InAppPurchaseResultCode, InAppPurchaseStateUpdateListener,
//     InAppOrderResult,InAppPurchaseTransactionState, InAppProduct ,InAppListProductsResult,
//     InAppPurchaseType,InAppOrderConfirmResult } from 'nativescript-in-app-purchase'
import { LoadEventData, WebView } from '@nativescript/core';
//import { BlockScreenCapture } from 'capacitor-block-screen-capture';
import { device } from '@nativescript/core/platform';
import { ios } from '@nativescript/core/application';
import { environment } from '../../../../environments/environment';
import { AlibabaHTMLGenerator } from '../course-details/AlibabaHTMLGenerator';
//import { PDFView } from "nativescript-pdf-view";
import { File } from "@nativescript/core/file-system";

@Component({
	moduleId: module.id,
	selector: 'training-resources-detail',
	templateUrl: './training-resources-detail.component.html',
	styleUrls: ['./training-resources-detail.component.css']
})

export class TrainingResourcesDetailComponent implements OnInit {
	detailsId
	isLoading: boolean = true
	skillsIDs: string[];
	skills: any[] = [];
	isEthrai: boolean;
	isAndroid: boolean
	isIOS: boolean
	details: any = {}
	type: any
	attachmantType: string
	url: string = "https://docs.google.com/gview?embedded=true&url="
	feedbacks: any[] = []
	webview: any;
	isEnrollment: boolean
	isAlreadyInCart
	showAppleBuyButton
	showWaitPaymentButton
	showCartButton: boolean
	paymentNotCompleted: boolean
	paymentCompleted: boolean
	paymentWaiting: boolean
	showProcessingButton: boolean;
	private secureOverlay: UIView;
	// Intl removed - not available on iOS
	intl = { format: (n) => String(n) }; // Intl polyfill for iOS
	similar: any[] = []
	Math: Math;
	Survey: any[] = [];
	SurveyId: any;
	SurveyData: any;
	showReviewForm: boolean;
	// fs = require('fs');
	//private inAppPurchaseManager: InAppPurchaseManager;

	public isFullscreen: boolean = false;
	showFile: boolean = false;
	isQueryProduct: boolean;
	isConfirmed: boolean;
	isLoggedIn: boolean;
	originalFlags: any;
	pdf: boolean = false;
	urlProtected: any;

	constructor(private paymentService: PaymentService, private zone: NgZone, public globalService: GlobalService,
		private page: Page, private route: Router, private router: RouterExtensions, private activatedRoute: ActivatedRoute,
		private dashboardService: DashboardService) {
		page.actionBarHidden = true;
		this.detailsId = this.activatedRoute.snapshot.paramMap.get("detailsId");
		this.type = this.activatedRoute.snapshot.paramMap.get("type");
		this.Math = Math

		this.isEthrai = this.globalService.isEthrai;

	}

	toggleHeight() {
		this.isFullscreen = !this.isFullscreen;
	}
	getFileExtension(url) {
		const extension = url.split('.').pop().toLowerCase();
		return extension;
	}
	handlePDF() {
		const fileExtension = this.getFileExtension(this.url);

		if (fileExtension === "pdf") {
			this.pdf = true
			console.log("The URL is pointing to a PDF file");
		} else this.pdf = false
	}
	ngOnDestroy() {
		if (isIOS) {
			//	this.inAppPurchaseManager?.shutdown(); 
			if (isIOS && this.secureOverlay) {
				this.secureOverlay.removeFromSuperview();
			}
		}
		if (isAndroid && this.originalFlags) {
			const activity = Application.android.foregroundActivity;
			activity.getWindow().setFlags(this.originalFlags, android.view.WindowManager.LayoutParams.FLAG_SECURE);
		}
	}
	addSecure() {
		if (isAndroid) {
			const activity = Application.android.foregroundActivity;
			this.originalFlags = activity.getWindow().getAttributes().flags;
			activity.getWindow().setFlags(android.view.WindowManager.LayoutParams.FLAG_SECURE, android.view.WindowManager.LayoutParams.FLAG_SECURE);

		}
		if (isIOS) {
			this.secureOverlay = UIView.alloc().initWithFrame(ios.window.bounds);
			this.secureOverlay.backgroundColor = UIColor.blackColor;
			this.secureOverlay.alpha = 1;
			ios.window.addSubview(this.secureOverlay);
		}
	}
	goToDetails(id) {
		if (isIOS) {
			this.webview?.executeJavaScript("Video.remove()", true).then(
				res => { this.webview = null; console.log("res go to course", res) },
			)
		}

		this.route.routeReuseStrategy.shouldReuseRoute = function () { return false }
		this.route.onSameUrlNavigation = 'reload'
		this.router.navigate(['/training-resources-detail', id, this.type])
	}

	/*public downloadFile () {
	
		if (isAndroid) {
	
	
			
			const documents = fileSystem.knownFolders.documents();
					documents.path = android.os.Environment.getExternalStorageDirectory().getAbsolutePath();
					const folder = documents.getFolder('abcde');
					var file = fileSystem.path.join(folder.path, "https://ipacdn.azureedge.net/bcnt/casesstudy/sample.pdf".split("/").pop());
					var url = "https://ipacdn.azureedge.net/bcnt/casesstudy/sample.pdf";
	
	
			Http.getFile(url, file).then(res => {
				var savedFile = fileSystem.File.fromPath(file);
				savedFile.readText().then(content => {
					console.log(content);
				})
				console.log(savedFile.path);  
			})   
		
		/*	Http.getFile('https://ipacdn.azureedge.net/bcnt/casesstudy/sample.pdf').then(downloadedFile => {
		
				var documents = fileSystem.knownFolders.documents();
				var path = fileSystem.path.join(documents.path, "FILE.txt");
				var mySavedFile = fileSystem.File.fromPath(path);
		
				// if your file content is not text you can use readSync and WriteSync for binary data
				downloadedFile .readText().then(content => {
					mySavedFile.writeText(content).then(() => {
						console.log("Succsess!");
						mySavedFile.readText().then(content => {
							console.log("saved content: " + content);
						})
					})
				})
			})
	
		/*	const documents = fileSystem.knownFolders.documents();
					documents.path = android.os.Environment.getExternalStorageDirectory().getAbsolutePath();
					const folder = documents.getFolder('abcde');
					var file = fileSystem.path.join(folder.path, 'https://ipacdn.azureedge.net/bcnt/casesstudy/sample.pdf');
					var url = 'https://ipacdn.azureedge.net/bcnt/casesstudy/sample.pdf' ;
			/*const androidDownloadsPath = android.os.Environment.getExternalStoragePublicDirectory(android.os.Environment.DIRECTORY_DOWNLOADS).toString();
			const androidFolderPath = fileSystem.path.join(androidDownloadsPath, "SimpleFileTransfer");
			const filePath: string = fileSystem.path.join(androidFolderPath, 'fileName');*/
	/*getFile(url , file).then((resultFile) => {
					// The returned result will be File object
					console.log(resultFile,'lkkkkkk')

	}, (e) => {
		console.log(e);})*/
	/* const permissions = require("nativescript-permissions");
	 permissions.requestPermission(android.Manifest.permission.WRITE_EXTERNAL_STORAGE, "I need these permissions because I'm cool")
		 .then(() => {
			 let downloadedFilePath = fileSystem.path.join(knownFolders.documents().path, "test.pdf");
			 getFile('https://ipacdn.azureedge.net/bcnt/casesstudy/sample.pdf', downloadedFilePath).then(resultFile => {
				 console.log(resultFile,'lkkkkkk')
				 alert({
					 title: 'Saved!',
					 okButtonText: 'OK',
					 message: `File saved here:\n${resultFile.path}`
				 });
			 }, error => {
				 alert({
					 title: 'Error',
					 okButtonText: 'OK',
					 message: `${error}`
				 });
			 });
		 });
	 /*const filepath=fileSystem.path.join(knownFolders.currentApp().path,'test'+'.pdf')
	 return Http.getFile({url:this.url,headers:{"resposeType":"pdf"},method:'GET'},filepath).then((res:fileSystem.File)=>{
		 openFile(res.path)
	 },e=>{return e}
	 )*/

	//  }
	//}
	ngOnInit() {
		this.isLoggedIn = this.globalService.isLoggedIn
		this.isEthrai = this.globalService.isEthrai
		this.isAndroid = isAndroid;
		this.isIOS = isIOS;
		if (isIOS) {
			// this.getInAppPurchaseManager();
		}
		if (this.type == 'CASESESTUDY') {

			this.getAllCasesStudyData().subscribe(res => {
				console.log('handele')
				if (!this.isLoggedIn && this.details?.type != 'Video') {
					this.url = this.url + this.details.attachmentFreeUrl
					this.addSecure()
				} else {
					this.isEnrolled();
				}
			});
			this.getSimilarCasesStudy();
			this.getStudyPlanUserFeedbacks()
			this.getStudyPlanFeedBacks();

		}
		else if (this.type == 'TRAININGGAME') {
			this.getTrainingGameDetails();
			this.getSimilarTraingGame()
			this.getSurvey('EducationalGames')
			this.getEducationalGamesUserFeedbacks()
			this.getEducationalGamesFeedBacks()
		}
		else if (this.type == 'INTERACTIVEEX') {
			this.getInterActiveExDetails();
			this.getSimilarInterActive()
			this.getSurvey('InteractiveTraining')
			this.getInteractiveExercisesUserFeedbacks()
			this.getInteractiveExerciseFeedBacks()

		}
	}

	goBack() {
		if (isIOS) {
			this.webview?.executeJavaScript("Video.remove()", true).then(
				res => console.log("res go back", res),
			)
		}
		Frame.topmost().goBack();
	}
	// Removed: onImageLoaded function that used WebViewExt
	isEnrolled() {
		this.dashboardService.ISEnrollmentSp(this.detailsId).subscribe(
			(res: boolean) => {
				if (res == true) {
					this.showCartButton = false
					this.showWaitPaymentButton = false
					this.showProcessingButton = false
					this.showAppleBuyButton = false
					this.showFile = true
					if (this.details?.type != 'Video') {
						this.url = this.url + this.details?.attachmentFullUrl

						//this.url = "http://docs.google.com/gview?embedded=true&url=" + this.url
						this.handlePDF()
					}
				}
				else {
					this.handleSubscription();

				}

			}
		);
	}

	handleCaseseDetails(res) {

		this.isLoading = false;
		this.details = res as any
		this.attachmantType = this.details.type
		console.log('type', this.attachmantType)
		this.skillsIDs = this.details.skillsIds;

		this.getSkilles();

	}
	getAllCasesStudyData() {
		this.isLoading = true
		if (this.isEthrai) {

			return this.dashboardService.getCasesStudyDetail(this.detailsId)
				.pipe(

					tap(res => {
						this.isLoading = false, this.handleCaseseDetails(res)
					}),
					concatMap((res) => this.dashboardService.getInvoicedProducts()),
					tap(res => this.handleInvoicedProducts(res)),
				)
		} else {
			return this.dashboardService.getCasesStudyDetail(this.detailsId)
				.pipe(
					tap(res => { this.isLoading = false, this.handleCaseseDetails(res) }),

				)

		}
	}
	getInvoicedProducts() {
		this.dashboardService.getInvoicedProducts().subscribe(
			(res: any) => {
				this.handleInvoicedProducts(res)
			});

	}
	getTrainingGameDetails() {
		this.dashboardService.getTraingGameDetail(this.detailsId).subscribe(
			(res: any) => {
				this.isLoading = false;
				this.details = res
				this.attachmantType = 'games'
				this.url = res.gameUploadUrl
				this.skillsIDs = res.skillsIds;
				this.getSkilles();
			}
		)
	}
	getInterActiveExDetails() {
		this.dashboardService.getInterActiveDetail(this.detailsId).subscribe(
			(res: any) => {
				this.isLoading = false;
				this.details = res
				this.attachmantType = 'InteractiveEx'
				this.url = res.gameUploadUrl
				this.skillsIDs = res.skillsIds;
				this.getSkilles();
			}
		)
	}
	//Similar
	getSimilarCasesStudy() {
		this.dashboardService.getSimilarCasesStudy(this.detailsId, 8).subscribe(
			(res: any) => {
				this.isLoading = false;
				this.similar = res
			}
		)

	}
	getSimilarTraingGame() {
		this.dashboardService.getSimilarTraingGame(this.detailsId, 8).subscribe(
			(res: any) => {
				this.isLoading = false;
				this.similar = res
			}
		)

	}
	getSimilarInterActive() {
		this.dashboardService.getSimilarInterActive(this.detailsId, 8).subscribe(
			(res: any) => {
				this.isLoading = false;
				this.similar = res
			}
		)

	}


	getSkilles() {
		this.dashboardService.getSkills().subscribe(
			res => {
				this.skills = (res as any[])?.filter(skill => {
					if (this.skillsIDs?.includes(skill.id)) {
						return skill;
					}
				});
			}
		);
	}
	onLoadFinishedAliBaba(args: LoadEventData) {
		this.webview = args.object;
		this.urlProtected = this.details?.alibabaPlayInfo;
		this.setWebViewAliBabaSrc();

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

	Alibaba() {
		if (!this.urlProtected || !this.urlProtected.streamingSources || this.urlProtected.streamingSources.length === 0) {
			return '<h2>No video sources available</h2>';
		}
		const coverUrl = this.urlProtected.coverUrl || '';
		const videoSources = this.urlProtected.streamingSources;
		const htmlGenerator = new AlibabaHTMLGenerator(coverUrl, videoSources, []);
		return htmlGenerator.generateHTML();
	}
	onloadFinished(args: LoadEventData) {
		if (!this.webview) {
			this.webview = args.object;
			// webview.src=this.ke?.ke?.videoUrl; 
			this.setWebViewSrc(this.details?.videoUrl).then(
				res => {
					this.webview.src = res;
					// this.webViewExt=webview;
					console.log("set webview sec", res)
				},
				err => {
					console.log("err webview", err)

				}
			);

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
	share() {
		share.shareUrl(this.details.shortUrl, "");
	}
	//paymentBTN
	goToShoppingCart() {
		this.router.navigate(['shopping-cart']);
	}
	addToShoppingCart() {
		let product = {
			productId: this.details.id,
			amount: this.details.spPrice,
			productType: 'StudyPlan'
		}
		this.paymentService.addToShopCart(product).then(
			res => {
				console.log('kkkkkkkkkk', res)
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
	}
	onloadFinishedPdf(args: LoadEventData) {
		let webview = args.object as any;
		// this.setWebViewSrc().then(
		//     res=>{
		//         webview.src=res;
		//         this.webViewExt=webview;
		//     }
		// );
		this.webview = webview
		if (this.url !== "https://docs.google.com/gview?embedded=true&url=") {
			webview.src = this.url
		}
	}
	handleInvoicedProducts(res) {
		let invoicedProducts = res as any
		this.paymentNotCompleted = !invoicedProducts.some(m => (m.productId === this.details.id && m.productType === "StudyPlan"))
			|| invoicedProducts.some(m => ((m.productId === this.details.id && m.productType === "StudyPlan"))
				&& !["PmtCompleted", "PmtUpdated", "PmtNew"].includes(m.status))

		this.paymentCompleted = invoicedProducts.some(m => m.productId === this.details.id && m.productType === "StudyPlan" && m.status === "PmtCompleted");
		console.log(this.paymentNotCompleted, this.paymentCompleted)
	}
	handleSubscription() {
		if (this.details?.spPrice) {
			if (this.paymentNotCompleted) {
				if (this.details?.type != 'Video') {
					this.url = this.url + this.details?.attachmentFreeUrl

					//this.url = "http://docs.google.com/gview?embedded=true&url=" + this.url
				}
				this.addSecure()

				if (isAndroid) {
					this.paymentService.getShopCart().subscribe(
						res => {
							let products = res as any
							this.isAlreadyInCart = products.some(product => product.productId === this.details.id);
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
						let currRequest = reqArray.find(req => req.productId == this.detailsId)
						if (currRequest) {
							this.showProcessingButton = true;
							this.buyProducts(currRequest);
						}

					} else {
						this.showAppleBuyButton = true;
					}


					/*BlockScreenCapture.blockScreenCapture({ shouldBlock: true }).then(r => {
						console.log('jjjjjjj', r)
						r.isBlocked = true
						console.log('jkkkkkkkkkk', r)
					});*/
				}

				console.log("99999", this.paymentNotCompleted)

			} else if (this.paymentCompleted) {
				this.showCartButton = false
				this.showWaitPaymentButton = false
				this.showFile = true

				if (this.details?.type != 'Video') {
					this.url = this.url + this.details?.attachmentFullUrl
					//this.url = "http://docs.google.com/gview?embedded=true&url=" + this.url
				}
			} else { //PmtUpdated , PmtNew
				this.showWaitPaymentButton = true
				//waiting for payment
			}
			this.handlePDF()

		}
		console.log('//////////////////', this.showCartButton, this.showWaitPaymentButton)

	}
	buyProducts(payload) {
		const type = Connectivity.getConnectionType();
		if (type == Connectivity.connectionType.none) {
			this.globalService.toast(localize('proceessing'));
			this.globalService.setInAppFailedRequests(payload);
			this.zone.run(() => {
				this.showAppleBuyButton = false;
				this.showProcessingButton = true;
			})
		} else {
			this.paymentService.getSiteMaintenanceState().subscribe(
				res => {
					if (res) {
						this.globalService.toast(localize('processingLater'));
						this.globalService.setInAppFailedRequests(payload);
						this.zone.run(() => {
							this.showAppleBuyButton = false;
							this.showProcessingButton = true;
						})
					} else {
						this.paymentService.postAppleOrder(payload).subscribe(
							res => {
								console.log("postUserOrders result", res)
								// this.isLoading=false;
								let response = res as any
								if (response.success) {
									this.zone.run(() => this.showAppleBuyButton = false)
									this.globalService.toast(localize('EnrollSuccess'));
									this.globalService.editInAppFailedRequests(payload);
								}
							},
							err => {
								this.globalService.toast(localize('proceessing'));
								this.globalService.setInAppFailedRequests(payload);
								this.zone.run(() => {
									this.showAppleBuyButton = false;
									this.showProcessingButton = true;
								})

							}
						)
					}
				})
		}
	}
	downloadFile() {
		Utils.openUrl(this.url);

	}
	getSurvey(type) {
		this.isLoading = true
		this.dashboardService.survey(type).subscribe(
			(res: any) => {
				this.isLoading = false;
				//console.log(res)
				this.SurveyData = res.topics
				this.SurveyId = res.id

			}
		)
	}
	//feedbacks
	LogInPLz() {
		this.globalService.toast(localize('LogInPLz'))
	}
	showFeedback(e) {
		if (e) {
			this.feedbacks.push(e);
		}
		this.showReviewForm = false;
	}
	getInteractiveExercisesUserFeedbacks() {
		this.dashboardService.getInteractiveExercisesUserFeedbacks(this.detailsId).subscribe(
			(res: any) => {
				let feeds = res.extraData.extraData;
				if (feeds) {
					this.feedbacks.push(feeds);
					this.showReviewForm = false;
				} else {
					this.showReviewForm = true;
				}
			},
			err => {
			}
		)
	}
	getEducationalGamesUserFeedbacks() {
		this.dashboardService.getEducationalGamesUserFeedbacks(this.detailsId).subscribe(
			(res: any) => {
				let feeds = res.extraData.extraData;
				if (feeds) {
					this.feedbacks.push(feeds);
					this.showReviewForm = false;
				} else {
					this.showReviewForm = true;
				}
			},
			err => {
			}
		)
	}
	getStudyPlanUserFeedbacks() {
		this.dashboardService.getStudyPlanUserFeedbacks(this.detailsId).subscribe(
			(res: any) => {
				let feeds = res.extraData.extraData;
				if (feeds) {
					this.feedbacks.push(feeds);
					this.showReviewForm = false;
				} else {
					this.showReviewForm = true;
				}
			},
			err => {
			}
		)
	}
	getEducationalGamesFeedBacks() {
		this.dashboardService.getEducationalGamesFeedBacks(this.details, 0, 6).subscribe(
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
	getInteractiveExerciseFeedBacks() {
		this.dashboardService.getInteractiveExerciseFeedBacks(this.detailsId, 0, 6).subscribe(
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

	getStudyPlanFeedBacks() {
		this.dashboardService.getStudyPlanFeedBacks(this.detailsId, 0, 6).subscribe(
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

	goReporting() {
		let typeOfReporting = ''
		if (this.type == 'TRAININGGAME') typeOfReporting = 'EducationalGames'
		else if (this.type == 'INTERACTIVEEX') typeOfReporting = 'InteractiveExercises'//InteractiveExercises
		this.router.navigate(['/Reporting', this.detailsId, typeOfReporting])

	}


	//   getInAppPurchaseManager(){
	// const purchaseStateUpdateListener: InAppPurchaseStateUpdateListener = {
	// 	onUpdate: (purchaseTransactionState: InAppPurchaseTransactionState): void => {
	// 		if (purchaseTransactionState.resultCode === InAppPurchaseResultCode.Purchased) {
	//             if(!this.isConfirmed){
	//                 this.confirmOrder(purchaseTransactionState);
	//                 this.isConfirmed=true;
	//             }
	// 		}
	// 		if (purchaseTransactionState.resultCode === InAppPurchaseResultCode.Failed) {
	// 			console.log("PURCHASE FAIL");
	// 		}
	// 		if (purchaseTransactionState.resultCode === InAppPurchaseResultCode.Purchasing) {
	// 			console.log("PURCHASE INPROGRESS")
	// 		}
	// 	},
	// 	onUpdateHistory: (purchaseTransactionState: InAppPurchaseTransactionState): void => {
	// 		if (purchaseTransactionState.resultCode === InAppPurchaseResultCode.Restored) {
	// 			console.log("PURCHASE RESTORED")
	// 		}
	// 	}
	// 	}
	// 	InAppPurchaseManager.bootStrapInstance(purchaseStateUpdateListener).then(inAppPurchaseManager => {
	// 		this.inAppPurchaseManager = inAppPurchaseManager
	// 	})
	// }
	// queryProducts() {
	//     let courseArr=[];
	//     courseArr.push(this.details)
	//     this.paymentService.getSiteMaintenanceState().subscribe(
	//         res=>{
	//             if(res){
	//                 this.globalService.toast(localize('underMaintenance'))
	//             }else{
	//                 const myProductIds = [this.details.appleId] //['sa.ethrai_mobile.app.tire2']
	//                 const myProductType = InAppPurchaseType.InAppPurchase 
	//                 this.isQueryProduct=true;
	//                 this.inAppPurchaseManager.list(myProductIds, myProductType)
	//                     .then(
	//                         (result: InAppListProductsResult) => {
	//                         this.isQueryProduct=false;
	//                         const product:
	//                          InAppProduct = result.products[0]
	//                         if(product){
	//                             // get the products ...
	//                             this.inAppPurchaseManager.order(product).then(
	//                                 (result: InAppOrderResult) => {
	//                                 if (result.success) {

	//                                 }
	//                             },
	//                             err=>{console.log(err)}
	//                             )

	//                         }else{
	//                             const toast = new Toasty({ text: localize('tryAgain') ,yAxisOffset: 50});
	//                             toast.show();
	//                         }
	//                         }
	//                     ,err=>{
	//                         this.isQueryProduct=false;
	//                         console.log("kkkkkkkkkkk",err)
	//                     }

	//                     )
	//                         }
	//             }
	//         )
	// }
	// confirmOrder(purchaseTransactionState: InAppPurchaseTransactionState) {
	//     const isConsumable = (productId: string): boolean => { 
	//         /* determine if is consumable and can be purchased more then once */
	//         return true }
	//         // alert("Confirm Order")
	//     // only purchased products can be confirmed

	//     if (purchaseTransactionState.resultCode === InAppPurchaseResultCode.Purchased) {
	//         const consumable: boolean = isConsumable(purchaseTransactionState.productIdentifier)
	//         this.inAppPurchaseManager.orderConfirm(purchaseTransactionState, consumable)
	//             .then((result: InAppOrderConfirmResult) => {
	//                 if (result.success) {
	//                     let payload=
	//                     {
	//                         productId: this.details.id,
	//                         productType: "StudyPlan",
	//                         appleProductId: this.details.appleId,
	//                         transactionReceipt:this.inAppPurchaseManager.getStoreReceipt()
	//                     }
	// 					this.startTraining()
	//                     this.buyProducts(payload)
	//                 }else{
	//                     // alert("order confirmation FAILED")
	//                 }
	//             })//.catch(err=>alert(err))

	//     }

	// //    alert("confirm order method finished") 
	// }
	startTraining() {
		let payload = {
			"userProfileId": this.globalService.getUserProfile().id,
			"studyPlanId": this.detailsId,
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


}