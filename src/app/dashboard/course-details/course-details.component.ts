import { ViewContainerRef, AfterViewInit, ApplicationRef, ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef, NgZone, OnChanges, OnInit, SimpleChanges, ViewChild, HostListener } from '@angular/core';
import { ActivatedRoute, NavigationExtras, Router } from '@angular/router';
import { RouterExtensions } from '@nativescript/angular';
import { AndroidActivityEventData, AndroidApplication, ApplicationSettings, Connectivity, Dialogs, Frame, knownFolders, Page, path, WebView } from '@nativescript/core';
import { DashboardService } from '../dashboard.service';
import { registerElement } from "@nativescript/angular";
// import { Video } from '@nstudio/nativescript-exoplayer';
import { SelectedItemService } from '../selected-item-service';
// import { PDFViewNg } from 'nativescript-pdfview-ng';
import * as share from '@nativescript/social-share'
import { GlobalService } from '../../shared/services/global.service';
import { localize } from '@nativescript/localize';
import { EnrolledCourse } from '../../shared/models/enrolled-course';
import { Utils } from "@nativescript/core";
import { PaymentService } from '../../payment/payment.service';
import { AccountService } from '../../account/account.service';
import { environment } from '../../../../environments/environment';
import { LoadEventData } from '@nativescript/core';
// Removed: import { LoadFinishedEventData, WebConsoleEventData, WebViewExt, LoadEventData, WebViewEventData } from '@nota/nativescript-webview-ext';
import { WebViewSource } from './web-view-source';
import { Observable, Subscription } from 'rxjs';
import { switchMap, map, concatMap, tap, retryWhen, delay } from 'rxjs/operators';
import { isAndroid, isIOS } from "@nativescript/core";
// import { InAppPurchaseManager, InAppPurchaseResultCode, InAppPurchaseStateUpdateListener,
//     InAppOrderResult,InAppPurchaseTransactionState, InAppProduct ,InAppListProductsResult,
//     InAppPurchaseType,InAppOrderConfirmResult } from 'nativescript-in-app-purchase'
import { ModalDialogService } from '@nativescript/angular';
import { CourseRatingModalComponent } from '../course-rating-modal/course-rating-modal.component';
import { SurveyModalComponent } from '../survey-modal/survey-modal.component';
import { FirebaseEventService } from '~/app/shared/services/firebase.event.service';
import { Application, ApplicationEventData, LaunchEventData, OrientationChangedEventData, UnhandledErrorEventData } from "@nativescript/core";
import { SelectedIndexChangedEventData } from '@nativescript/core/ui/tab-view';
import { AlibabaHTMLGenerator } from './AlibabaHTMLGenerator';
import { File } from "@nativescript/core/file-system";
import { InlineVideoWebView } from './inline-video-webview';

// iOS native type declarations
declare const NSURL: any;
declare const NSMutableURLRequest: any;
declare const NSString: any;

// Android native type declarations
declare const java: any;
declare const android: any;

// Register custom WebView with inline video playback support
registerElement("InlineVideoWebView", () => InlineVideoWebView);
// registerElement("Video", () => Video);
// registerElement('PDFViewNg', () => PDFViewNg);


@Component({
    moduleId: module.id,
    selector: 'course-details',
    templateUrl: './course-details.component.html',
    styleUrls: ['./course-details.component.css'],
})


export class CourseDetailsComponent implements OnInit {
    // @ViewChild('pdf') pdf:PDFViewNg
    @ViewChild('videoWebView') videoWebViewRef: ElementRef<WebView>;
    //  @ViewChild('webViewExt') webView:ElementRef
    // webViewExt:WebViewExt

    Math: any;
    courseId: string;
    course: any = {};
    durationHours: number = 0;
    durationMinutes: number = 0;
    skillsIDs: string[];
    skills: any[] = [];
    feedbacks: any[] = [];
    isLoading: boolean;
    progressPercentage: number = 0;
    courseDetails: any[] = [];
    parents: any[];
    childern: any[];
    collapsableParents: any[];
    collapsableSubParents: any[];
    selectedItem: any;
    url: string;
    clickedd = {};
    clickedd1 = {};
    myCourses: any[];
    paymentNotCompleted: boolean = false;
    paymentCompleted: boolean = false;
    paymentWaiting: boolean = false;
    isCourseFinished: boolean = false;
    isAlreadyEnrolled: boolean = false;
    showEnrollButton: boolean = false;
    showCartButton: boolean = false;
    showCertificateButton: boolean = false;
    showWaitCertificateButton: boolean;
    surveyData: any;
    surveyId: any;
    isAlreadyInCart: boolean;
    isEthrai: boolean;
    tenantName: any;
    isVideoLoading: boolean;
    subsVar: Subscription;
    private routeParamSub: Subscription;
    isAutoPlay: boolean;
    isVideoFinished: boolean;
    assessmentQuestionIndex: number;
    assessmentQuestionsNo: any;
    assessmentProgressPercent: number = 0;
    assessmentQuestions: any;
    selectedAnswerId: any;
    correctAnswerId: any;
    isFirstAnswerAttempt: any = true;
    correctAnswersCount: number = 0;
    correctAnswersPercentage: number = 0;
    isAndroid;
    private surveyRequestPending = false;
    private trackingRequests = new Map<string, Subscription>();
    private trackingMutationQueue: Promise<void> = Promise.resolve();
    private surveyRequestPromise: Promise<boolean> | null = null;
    private surveyRequestSub: Subscription;
    private courseFinishedFlowPromise: Promise<void> | null = null;
    private courseFinishedFlowQueued = false;
    private courseInfoSub: Subscription;
    private courseDetailsSub: Subscription;
    private subtitleSub: Subscription;
    private skillsSub: Subscription;
    private similarCoursesSub: Subscription;
    private userFeedbacksSub: Subscription;
    private videoSecondsSub: Subscription;
    private pageLoadedHandler: () => void;
    private pageUnloadedHandler: () => void;
    private isPageActive = false;
    private isComponentDestroyed = false;
    private asyncContextEpoch = 0;
    private videoSecondsRequestSeq = 0;
    showResult: boolean = false;
    currentVideoSecond: number = 0;
    assessmentAnswers: { questionId: string, truthy: any, choiceId: string }[] = [];
    similarCourses: any[];
    showWaitButton: boolean;
    flattenedDetails: any[] = [];
    attendedSeconds: any;
    certificateURL: any;
    //private inAppPurchaseManager: InAppPurchaseManager;
    showAppleBuyButton: boolean;
    certSubscription: Subscription;
    isIOS: boolean;
    isConfirmed: boolean;
    isQueryProduct: boolean;
    item
    shoppingCartItemsCount: number;
    showProcessingButton: boolean;
    loggedDuration: string;
    LabelsArray: any = [];
    showSimilarCourse: boolean;
    detailId: string;
    isVideoPlayed: boolean;
    isQuestionAnswered: boolean = false;
    // Intl polyfill for iOS - safely handles undefined/null
    intl = { format: (n: any) => n != null ? String(n) : '0' };

    // Helper for number formatting
    formatNumber(n: any): string {
        return n != null ? String(n) : '0';
    }

    // --- Persistent local tracking for Activity/SelfAssessment items ---
    private getLocalTrackingKey(enrollmentId: string): string {
        return `localTrackings_${enrollmentId}`;
    }
    private saveLocalTracking(enrollmentId: string, courseDetailId: string): void {
        const key = this.getLocalTrackingKey(enrollmentId);
        let ids: string[] = [];
        try {
            const stored = ApplicationSettings.getString(key, '[]');
            ids = JSON.parse(stored);
        } catch (e) { ids = []; }
        if (!ids.includes(courseDetailId)) {
            ids.push(courseDetailId);
            ApplicationSettings.setString(key, JSON.stringify(ids));
        }
    }
    private getLocalTrackings(enrollmentId: string): string[] {
        const key = this.getLocalTrackingKey(enrollmentId);
        try {
            return JSON.parse(ApplicationSettings.getString(key, '[]'));
        } catch (e) { return []; }
    }
    private checkAllVideosWatched(fromLoad: boolean = false): void {
        if (!this.flattenedDetails || !this.course?.enrollment?.trackings) return;
        const allVideos = this.flattenedDetails.filter(d => d.type === 'Video');
        const trackedIds = this.course.enrollment.trackings.map(t => t.courseDetailId);
        const allWatched = allVideos.length > 0 && allVideos.every(v => trackedIds.includes(v.id));
        if (allWatched) {
            this.progressPercentage = 100;
            console.log('📊 [checkAllVideosWatched] All', allVideos.length, 'videos watched → forcing progress to 100%');
            if (!this.isCourseFinished) {
                this.isCourseFinished = true;
                if (!fromLoad) {
                    if (this.globalService.isEthrai && this.selectedItem) {
                        this.firebaseEventService.logCourseCompletedEvent('course_page', this.course, this.selectedItem.nameAr, this.loggedDuration, 100, this.getItemUnit(this.selectedItem));
                    }
                    this.globalService.toast(localize('Congrats'));
                }
                this.proceedAfterCourseFinished();
            }
        }
    }

    logVal(val: any, tag: string): any {
        console.log(`DEBUG [${tag}]:`, val);
        return val;
    }
    publishDate: string;
    webview: any;
    selectedTabIndex: any = 1;
    urlProtected: any;
    subtitle: any[] = [];
    videoPlayerSrc: string = '';  // Bound to WebViewExt [src] in template
    constructor(private page: Page, private route: Router, private router: RouterExtensions, private activatedRoute: ActivatedRoute, private dashboardService: DashboardService
        , private selectedItemService: SelectedItemService, public globalService: GlobalService, private paymentService: PaymentService,
        private accountService: AccountService, private modalService: ModalDialogService, private firebaseEventService: FirebaseEventService,
        private vcRef: ViewContainerRef, private zone: NgZone) {


        page.actionBarHidden = true;
        this.routeParamSub = this.activatedRoute.paramMap.subscribe(params => {
            const newCourseId = params.get('courseId');
            const newDetailId = params.get('detailId');
            const courseChanged = this.courseId && newCourseId && this.courseId !== newCourseId;
            this.courseId = newCourseId;
            this.detailId = newDetailId;

            if (courseChanged) {
                console.log('🔄 [paramMap] Course changed from', this.courseId, 'to', newCourseId, '→ full reload');
                // Clean up old course state
                this.cleanupVideo();
                this.clearRuntimeSubscriptions();
                this.invalidateAsyncContext();

                // Reset course state
                this.course = {};
                this.flattenedDetails = [];
                this.LabelsArray = [];
                this.selectedItem = null;
                this.isAlreadyEnrolled = false;
                this.isCourseFinished = false;
                this.progressPercentage = 0;
                this.attendedSeconds = 0;
                this.showEnrollButton = false;
                this.showCartButton = false;
                this.showCertificateButton = false;
                this.showWaitCertificateButton = false;
                this.isVideoFinished = false;
                this.assessmentAnswers = [];
                this.feedbacks = [];
                this.surveyData = null;
                this.surveyId = null;
                this.currentVideoSecond = 0;
                this.isVideoPlayed = false;

                // Re-subscribe to item selection
                this.isPageActive = true;
                this.isComponentDestroyed = false;
                this.subsVar = this.onItemSelected();

                // Reload course data (same as ngOnInit)
                if (this.globalService.isLoggedIn) {
                    const epoch = this.getCurrentAsyncEpoch();
                    this.safeUnsubscribe(this.courseInfoSub);
                    this.courseInfoSub = this.getAllCourseInfo(epoch).subscribe(
                        () => {
                            if (!this.isAsyncContextActive(epoch)) return;
                            this.handleSubscriptionToCourse();
                        },
                        err => {
                            if (!this.isAsyncContextActive(epoch)) return;
                            this.isLoading = false;
                        }
                    );
                } else {
                    this.getCourseDetails();
                }
                this.getSimilarCourses();
                this.getUserFeedbacks();
            }
        });
        this.Math = Math;
        this.isAutoPlay = this.globalService.isAutoPlayNextVideo();
        this.assessmentQuestionIndex = 0;
        this.isEthrai = this.globalService.isEthrai;
        this.isConfirmed = false;
        //this.protected()
    }

    private getCurrentAsyncEpoch(): number {
        return this.asyncContextEpoch;
    }

    private invalidateAsyncContext(): void {
        this.asyncContextEpoch += 1;
    }

    private isAsyncContextActive(epoch: number): boolean {
        return !this.isComponentDestroyed && this.isPageActive && epoch === this.asyncContextEpoch;
    }

    private isAlreadySavedError(err: any): boolean {
        return err?.error?.errorCode === 'AlreadySaved' || err?.errorCode === 'AlreadySaved';
    }

    private markFeedbackSubmittedLocally(): void {
        if (this.course?.course) {
            this.course.course.isFeedBackSubmitted = true;
            ApplicationSettings.setBoolean(`feedback_${this.courseId}`, true);
        }
    }

    private markSurveyAnsweredLocally(): void {
        if (this.course?.course) {
            this.course.course.isSurveyAnswered = true;
            ApplicationSettings.setBoolean(`survey_${this.courseId}`, true);
        }
    }

    private isFeedbackModalSubmitted(response: any): boolean {
        const result = Array.isArray(response) ? response[0] : response;
        return !!result?.success || !!result?.submitted;
    }

    private safeUnsubscribe(subscription?: Subscription): void {
        if (subscription) {
            subscription.unsubscribe();
        }
    }

    private cleanupTrackingRequests(): void {
        this.trackingRequests.forEach((sub) => sub?.unsubscribe());
        this.trackingRequests.clear();
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

    onError(event: ErrorEvent) {
        console.dir(event)
    }
    goBack() {
        this.cleanupVideo();
        if (this.globalService.previousURL?.includes("/payment-success")) {
            this.router.navigate(['/my-products'])
        } else {
            Frame.topmost().goBack();
        }
    }

    /** Stop and release video on both iOS and Android */
    private cleanupVideo() {
        if (!this.webview) return;
        const wv = this.webview;
        // Null out the reference FIRST so any late-firing handlers see webview as null
        this.webview = null;
        // Remove ALL event listeners — prevents ghost events from cached webviews
        wv.off("timechange");
        wv.off("percentwatchedchanged");
        wv.off("end");
        wv.off("pause");
        wv.off("play");
        try {
            if (isIOS && (wv as any).ios) {
                (wv as any).ios.evaluateJavaScriptCompletionHandler("Video.remove()", (result: any, error: any) => { });
            } else if (isAndroid && (wv as any).android) {
                // Free the hardware video decoder by destroying the video element.
                // Android limits concurrent media decoders. If we don't do this, 
                // the next course page might fail to play video.
                (wv as any).android.evaluateJavascript("if (window.Video) window.Video.remove();", null);
                // Force the WebView to pause all background tasks and media
                (wv as any).android.onPause();
                (wv as any).android.loadUrl('about:blank');
            }
        } catch (e) { console.log('cleanupVideo error:', e); }
    }

    templateSelector(item: any, index: number, items: any): string {
        if (index == 0) {
            return !item.expanded ? 'expanded' : 'default';
        }
        return item.expanded ? 'expanded' : 'default';
    }

    ngOnInit() {
        this.isComponentDestroyed = false;
        this.isPageActive = true;
        this.isAndroid = isAndroid;
        this.isIOS = isIOS;
        this.shoppingCartItemsCount = this.globalService.shoppinCartItemsCount;

        this.pageLoadedHandler = () => this.onPageLoaded();
        this.pageUnloadedHandler = () => this.onPageUnloaded();
        this.page.on(Page.loadedEvent, this.pageLoadedHandler);
        this.page.on(Page.unloadedEvent, this.pageUnloadedHandler);

        this.safeUnsubscribe(this.subsVar);
        this.subsVar = this.onItemSelected();

        this.getUserFeedbacks();

        if (this.globalService.isLoggedIn) {
            if (this.isEthrai) {
                this.firebaseEventService.logScreenViewedEvent(this.globalService.isLoggedIn, this.globalService.getUserStats(), 'course_page', this.globalService.getUserProfile());
            }
            const epoch = this.getCurrentAsyncEpoch();
            this.safeUnsubscribe(this.courseInfoSub);
            this.courseInfoSub = this.getAllCourseInfo(epoch).subscribe(
                () => {
                    if (!this.isAsyncContextActive(epoch)) return;
                    this.handleSubscriptionToCourse();
                },
                err => {
                    if (!this.isAsyncContextActive(epoch)) return;
                    this.isLoading = false;
                    console.log('getAllCourseInfo error:', err);
                }
            );

        } else {
            this.getCourseDetails();
            this.firebaseEventService.logScreenViewedEvent(false, null, 'course_page', null);

        }
        this.getSimilarCourses();
        if (this.page.isLoaded) {
            this.onPageLoaded();
        }
    }

    private onPageLoaded(): void {
        if (this.isComponentDestroyed) return;
        this.isPageActive = true;
        this.safeUnsubscribe(this.subsVar);
        this.subsVar = this.onItemSelected();
        this.getSubtitle(this.courseId);

        // Re-check cart status when page is re-loaded (e.g., coming back from shopping cart)
        if (this.course?.course) {
            this.isAlreadyInCart = false;
            this.showCartButton = false;
            this.handleSubscriptionToCourse();
        }
    }

    private onPageUnloaded(): void {
        if (this.isComponentDestroyed) return;
        this.isPageActive = false;
        this.invalidateAsyncContext();
        this.cleanupVideo();
        this.clearRuntimeSubscriptions();
    }
    protected(id) {
        this.isLoading = true;
        this.dashboardService.protected(id).subscribe(
            res => {
                this.urlProtected = (res as any).details[0]?.alibabaPlayInfo;
            }
        )
        // this.showEnrollButton=true;
    }
    getSubtitle(id, epoch: number = this.getCurrentAsyncEpoch()) {
        this.isLoading = true;
        this.safeUnsubscribe(this.subtitleSub);
        this.subtitleSub = this.dashboardService.getSubtitle(id, 0).subscribe(
            res => {
                if (!this.isAsyncContextActive(epoch)) return;
                this.subtitle = (res as any);
            },
            err => {
                if (!this.isAsyncContextActive(epoch)) return;
                console.log('getSubtitle error:', err);
            }
        );
    }
    onLoadFinishedAliBaba(args: LoadEventData) {
        console.log('DEBUG onLoadFinishedAliBaba called');
        this.webview = args.object;

        // InlineVideoWebView handles iOS WKWebView inline playback configuration at creation time
        // No additional configuration needed here

        // Load video content if available
        if (this.urlProtected?.streamingSources?.length > 0) {
            this.setWebViewAliBabaSrc();
        }

        this.registerCustomEvents();
    }

    onBridgeEvent(args: any) {
        const url = args.url;
        // ROOT GUARD: If this component is destroyed, ignore ALL bridge events.
        // On Android, the cached native WebView can still fire bridge URLs after
        // the Angular component is destroyed. This is THE entry point for all
        // Android video events (timechange, end, play, pause) if the prompt fails.
        if (this.isComponentDestroyed) {
            // Only stop loading if it's actually a bridge URL. Don't stop normal URLs
            // since NativeScript can reuse components/views and might be mid-navigation.
            if (url && url.indexOf('ns-bridge') > -1) {
                if (args.object && args.object.stopLoading) {
                    args.object.stopLoading();
                }
            }
            return;
        }
        if (url && url.indexOf('ns-bridge') > -1) {
            // Extract event name from URL path: .../ns-bridge/eventName?data=...
            const bridgeIndex = url.indexOf('ns-bridge/');
            if (bridgeIndex > -1) {
                const afterBridge = url.substring(bridgeIndex + 'ns-bridge/'.length);
                const eventName = afterBridge.split('?')[0];
                let eventData: any = null;

                if (url.indexOf('data=') > -1) {
                    try {
                        const params = url.split('?')[1];
                        const dataParam = params.split('data=')[1];
                        eventData = decodeURIComponent(dataParam);
                    } catch (e) {
                        console.log('Bridge event parse error:', e);
                    }
                }

                // Map 'ended' to 'end' to match the registerCustomEvents listener
                const mappedName = eventName === 'ended' ? 'end' : eventName;

                this.zone.run(() => {
                    if (this.webview && !this.isComponentDestroyed) {
                        this.webview.notify({ eventName: mappedName, object: this.webview, data: eventData });
                    }
                });
            }
            // Stop the navigation — it's a bridge event, not a real URL
            if (args.object && args.object.stopLoading) {
                args.object.stopLoading();
            }
        }
    }
    registerCustomEvents() {
        if (this.webview) {
            // Remove all previous listeners to prevent stacking on repeated loads
            this.webview.off("timechange");
            this.webview.off("percentwatchedchanged");
            this.webview.off("end");
            this.webview.off("pause");
            this.webview.off("play");

            this.webview.on("timechange", (msg: any) => {
                if (this.isComponentDestroyed) return;
                this.currentVideoSecond = Math.round(msg.data)
            });
            this.webview.on("percentwatchedchanged", (msg) => {
                // Tracking is handled by the 'end' event
            });
            this.webview.on("end", (msg) => {
                // *** ROOT GUARD: If this component was destroyed (user navigated away),
                // do NOT emit anything — the webview is a ghost from a cached page. ***
                if (this.isComponentDestroyed) {
                    console.log('🎬 [end event] IGNORED — component destroyed (ghost webview)');
                    return;
                }
                const videoItemId = this.selectedItem?.id;
                const videoItem = this.selectedItem;
                console.log('🎬 [end event] handler called, selectedItem.id:', videoItemId);
                this.zone.run(() => {
                    this.setTrackedItem(videoItemId);
                    if (this.isAutoPlay) {
                        this.isVideoFinished = true;
                    }
                    if (this.globalService.isEthrai && videoItem) {
                        this.firebaseEventService.logVideoStartedorCompletedEvent('course_videocompleted', 'course_page', this.course, videoItem.nameAr, this.loggedDuration, this.progressPercentage, this.getItemUnit(videoItem))
                    }
                    this.setCurrentElementInfo(this.currentVideoSecond, videoItemId);
                    // Use ID-based lookup (not indexOf reference) in case flattenedDetails was rebuilt
                    const selectedItemIndex = this.flattenedDetails.findIndex(d => d.id === videoItemId);
                    if (selectedItemIndex !== -1 && selectedItemIndex + 1 < this.flattenedDetails?.length) {
                        this.selectedItem = this.flattenedDetails[selectedItemIndex + 1];
                        this.selectedItemService?.emit(this.flattenedDetails[selectedItemIndex + 1])
                    }
                });
            });
            this.webview.on("pause", (msg: any) => {
                if (this.isComponentDestroyed) return;
                this.isVideoPlayed = false;
                this.setCurrentElementInfo(this.currentVideoSecond, this.selectedItem?.id);
            });
            this.webview.on("play", (msg: any) => {
                if (this.isComponentDestroyed) return;
                this.isVideoPlayed = true;
                if (this.globalService.isEthrai) {
                    this.firebaseEventService.logVideoStartedorCompletedEvent('course_videostarted', 'course_page', this.course, this.selectedItem.nameAr, this.loggedDuration, this.progressPercentage, this.getItemUnit(this.selectedItem))
                }
            });
        }
        else {
            console.log('nsWebViewBridge is not available');
        }
    }
    Alibaba() {
        console.log('DEBUG Alibaba(): urlProtected keys =', this.urlProtected ? Object.keys(this.urlProtected) : 'null');
        console.log('DEBUG Alibaba(): urlProtected.streamingSources =', this.urlProtected?.streamingSources);
        console.log('DEBUG Alibaba(): urlProtected.playInfoList =', this.urlProtected?.playInfoList);
        if (!this.urlProtected || !this.urlProtected.streamingSources || this.urlProtected.streamingSources.length === 0) {
            return '<h2>No video sources available</h2>';
        }
        const coverUrl = this.urlProtected.coverUrl || '';
        const videoSources = this.urlProtected.streamingSources;
        let filtered = [];
        if (this.subtitle && this.subtitle.length > 0) {
            filtered = this.subtitle.find(x => x.id === this.selectedItem.id);
        }
        const htmlGenerator = new AlibabaHTMLGenerator(coverUrl, videoSources, filtered);
        return htmlGenerator.generateHTML();
    }
    getSimilarCourses() {
        const epoch = this.getCurrentAsyncEpoch();
        this.safeUnsubscribe(this.similarCoursesSub);
        this.similarCoursesSub = this.dashboardService.getSimilarCourses(5, this.courseId).subscribe(
            res => {
                if (!this.isAsyncContextActive(epoch)) return;
                this.similarCourses = res as any[]
                if (this.similarCourses.length && (this.isEthrai || !this.globalService.isLoggedIn)) {
                    this.firebaseEventService.logCourseImpressionsEvent('course_page', this.similarCourses, 'training')
                }
                setTimeout(() => {
                    if (!this.isAsyncContextActive(epoch)) return;
                    this.showSimilarCourse = true
                }, 2000);
            },
            err => {
                if (!this.isAsyncContextActive(epoch)) return;
                console.log('getSimilarCourses error:', err);
            }
        );
    }

    getAllCourseInfo(epoch: number = this.getCurrentAsyncEpoch()) {
        this.isLoading = true;
        if (this.isEthrai) {
            return this.dashboardService.getCourseDetails(this.courseId)
                .pipe(
                    tap(res => {
                        if (!this.isAsyncContextActive(epoch)) return;
                        this.isLoading = false;
                        this.handleCourseDetails(res);
                    }),
                    concatMap((res) => this.dashboardService.getInvoicedProducts()),
                    tap(res => {
                        if (!this.isAsyncContextActive(epoch)) return;
                        this.handleInvoicedProducts(res);
                    }),
                )
        } else {
            return this.dashboardService.getCourseDetails(this.courseId)
                .pipe(
                    tap(res => {
                        if (!this.isAsyncContextActive(epoch)) return;
                        this.isLoading = false;
                        this.handleCourseDetails(res);
                    })
                )
        }

    }

    handleInvoicedProducts(res) {
        let invoices = res as any[];
        this.paymentNotCompleted = !invoices.some(m => m.productId === this.courseId && m.productType === "Course"
            ||
            (m.courseIds?.includes(this.courseId) && m.productType === "CoursePath"))
            ||
            !invoices.some(m => (m.productId === this.courseId && m.productType === "Course" ||
                (m.courseIds?.includes(this.courseId) && m.productType === "CoursePath")) && ["PmtCompleted", "PmtUpdated", "PmtNew"].includes(m.status))
        // || 
        // invoices.some(m => m.productId === this.courseId && m.productType === "Course" && ["PmtExpired", "BillExpired", "PmtNotCompleted","PmtReversal"].includes(m.status))     

        this.paymentCompleted = invoices.some(m => m.productId === this.courseId && m.productType === "Course" && m.status === "PmtCompleted")
        // console.log("this.paymentNotCompleteddd",!invoices.some(m => m.productId === this.courseId && m.productType === "Course"),this.paymentNotCompleted )
        // console.log("this.paymentNotCompleted",!invoices.some(m => m.productId === this.courseId && m.productType === "Course" && ["PmtCompleted", "PmtUpdated", "PmtNew"].includes(m.status) ))
        // console.log("this.paymentNotCompleted",invoices.some(m => m.productId === this.courseId && m.productType === "Course" && ["PmtExpired", "BillExpired", "PmtNotCompleted","PmtReversal"].includes(m.status))  )  
        // console.log( this.paymentNotCompleted,this.paymentCompleted)
    }

    handleCourseDetails(res) {
        // Read from persistent ApplicationSettings first
        const persistedFeedback = ApplicationSettings.getBoolean(`feedback_${this.courseId}`, false);
        const persistedSurvey = ApplicationSettings.getBoolean(`survey_${this.courseId}`, false);

        // Preserve local answers state across reloads if the API response is delayed/cached
        const localIsFeedbackSubmitted = this.course?.course?.isFeedBackSubmitted || persistedFeedback;
        const localIsSurveyAnswered = this.course?.course?.isSurveyAnswered || persistedSurvey;
        const previousCourseId = this.course?.course?.id;

        this.course = (res as any);
        if (previousCourseId && previousCourseId !== this.course?.course?.id) {
            this.surveyData = null;
            this.surveyId = null;
            this.surveyRequestPending = false;
            this.surveyRequestPromise = null;
            this.safeUnsubscribe(this.surveyRequestSub);
        }

        if (localIsFeedbackSubmitted && !this.course?.course?.isFeedBackSubmitted) {
            this.course.course.isFeedBackSubmitted = true;
            console.log('🔄 [handleCourseDetails] Preserved local isFeedBackSubmitted: true');
        }
        if (localIsSurveyAnswered && !this.course?.course?.isSurveyAnswered) {
            this.course.course.isSurveyAnswered = true;
            console.log('🔄 [handleCourseDetails] Preserved local isSurveyAnswered: true');
        }

        console.log('📚 [CourseDetails] Course opened:', JSON.stringify(this.course));
        let totalSeconds = this.course?.course?.numberOfSeconds || 0;
        let minutes = Math.floor(totalSeconds / 60);
        this.durationHours = Math.floor(minutes / 60);
        this.durationMinutes = (minutes) % 60;

        let loggedHours = this.durationHours < 10 ? '0' + this.durationHours : this.durationHours
        let loggedMin = this.durationMinutes < 10 ? '0' + this.durationMinutes : this.durationMinutes
        this.loggedDuration = loggedHours + 'h ' + loggedMin + 'm'
        this.skillsIDs = this.course?.course?.skillIds;

        if (this.course?.course?.publishDate) {
            try {
                const d = new Date(this.course.course.publishDate);
                this.publishDate = d.getFullYear() + '/' + (d.getMonth() + 1) + '/' + d.getDate();
            } catch (e) {
                this.publishDate = '';
            }
        } else {
            this.publishDate = '';
        }

        if (this.course.userFeedback && !this.feedbacks.some(f => f.id === this.course.userFeedback.id)) {
            this.feedbacks.push(this.course.userFeedback)
        }
        if (this.course.enrollment) {
            this.isAlreadyEnrolled = true;
            this.attendedSeconds = this.course.enrollment.attendedSeconds || 0;

            // Merge persisted local trackings (Activity/SelfAssessment) back into trackings
            // [TEMPORARILY DISABLED PER USER REQUEST]
            // const localIds = this.getLocalTrackings(this.course.enrollment.id);
            // if (localIds.length > 0) {
            //     if (!this.course.enrollment.trackings) {
            //         this.course.enrollment.trackings = [];
            //     }
            //     let localSecondsAdded = 0;
            //     for (const id of localIds) {
            //         if (!this.course.enrollment.trackings.some(t => t.courseDetailId === id)) {
            //             this.course.enrollment.trackings.push({ courseDetailId: id });
            //             localSecondsAdded += 60;
            //         }
            //     }
            //     this.attendedSeconds += localSecondsAdded;
            //     console.log('📊 [handleCourseDetails] Merged', localIds.length, 'local trackings, added', localSecondsAdded, 'seconds');
            // }

            let requiredSeconds = this.course.course.numberOfSecondsRequiredToAttend || 1; // prevent div by zero
            let calcPercent = (this.attendedSeconds / requiredSeconds) * 100;

            if (isNaN(calcPercent) || !isFinite(calcPercent)) {
                this.progressPercentage = 0;
            } else {
                this.progressPercentage = calcPercent > 100 ? 100 : Number(calcPercent.toFixed(2));
            }

            // Completed courses should always show 100%
            if (this.course.enrollment.status === 'Success') {
                this.progressPercentage = 100;
            }

            this.handleSubscriptionToCourse();
        }
        const epoch = this.getCurrentAsyncEpoch();
        this.safeUnsubscribe(this.skillsSub);
        this.skillsSub = this.dashboardService.getSkills().subscribe(
            res => {
                if (!this.isAsyncContextActive(epoch)) return;
                this.skills = (res as any[]).filter(skill => {
                    if (this.skillsIDs?.includes(skill.id)) {
                        return skill;
                    }
                });
            },
            err => {
                if (!this.isAsyncContextActive(epoch)) return;
                console.log('getSkills error:', err);
            }
        );
        this.flattenedDetails = [];
        this.LabelsArray = [];
        this.flat(this.course);
        // After flattenedDetails is populated, check if all videos are watched → force 100%
        if (this.isAlreadyEnrolled) {
            this.checkAllVideosWatched(true);
        }
        let currentItem;
        if (this.detailId) {
            currentItem = this.flattenedDetails.find(el => el.id == this.detailId);
        } else if (this.isAlreadyEnrolled) {

            if (this.course.enrollment?.currentCourseDetailId) {
                currentItem = this.flattenedDetails.find(item => item.id == this.course.enrollment?.currentCourseDetailId);
                currentItem ? currentItem = currentItem : currentItem = this.flattenedDetails[0]
            } else {
                currentItem = this.flattenedDetails[0]//.find(item=>item.type=='Video');
            }
            //  this.traverseById(this.course);
        } else {
            // this.traverse(this.course)
            currentItem = this.flattenedDetails.find(item => item.type == 'Video' && item.isAvailableWithoutRegister);

        }
        if (this.globalService.isEthrai || !this.globalService.isLoggedIn) {
            this.firebaseEventService.logCourseDetailsImpressionEvent("view_item", 'course_page', this.course, currentItem?.nameAr, this.loggedDuration, this.progressPercentage, this.getItemUnit(currentItem))
        }

        if (currentItem) {
            this.selectedItem = null;
            this.selectedItem = currentItem
            this.selectedItemService.emit(currentItem)
        }
    }

    getCourseDetails() {
        this.isLoading = true;
        const epoch = this.getCurrentAsyncEpoch();
        this.safeUnsubscribe(this.courseDetailsSub);
        this.courseDetailsSub = this.dashboardService.getCourseDetails(this.courseId).subscribe(
            res => {
                if (!this.isAsyncContextActive(epoch)) return;
                this.isLoading = false;
                this.handleCourseDetails(res)
            },
            err => {
                if (!this.isAsyncContextActive(epoch)) return;
                this.isLoading = false;
                console.log('getCourseDetails error:', err);
            }
        );
        // this.showEnrollButton=true;
    }

    handleSubscriptionToCourse() {
        if (!this.isAlreadyEnrolled) {
            if (this.isEthrai && this.isCourseAvailabeInOtherTenants()) {
                this.showEnrollButton = true;
                return;
            }
            if ((this.isEthrai && this.course.course.pricing?.price && !this.course.course.isAlreadySubscribedToOne && !(this.course.course?.canAddToCart)) || !this.isEthrai) {
                this.showEnrollButton = true;
            } else if (this.isEthrai && this.course.course.pricing?.price && this.course.course.isAlreadySubscribedToOne && this.course.course?.canAddToCart) {
                if (this.paymentNotCompleted) {
                    const epoch = this.getCurrentAsyncEpoch();
                    this.paymentService.getShopCart().toPromise().then(
                        res => {
                            if (!this.isAsyncContextActive(epoch)) return;
                            let products = res as any[];
                            this.isAlreadyInCart = products.some(product => product.productId === this.courseId);
                            if (this.isAlreadyInCart) {

                            } else {
                                this.showCartButton = true;
                            }
                        },
                        err => {
                            if (!this.isAsyncContextActive(epoch)) return;
                            console.log(err)
                        }
                    )

                } else {
                    if (this.paymentCompleted) {
                        this.showEnrollButton = true;
                    } else {
                        this.showWaitButton = true;
                    }
                }
            } else {
                this.showEnrollButton = true;
            }
        } else {
            this.getCourseFinished();
        }
    }

    addToShoppingCart() {
        this.firebaseEventService.logCourseDetailsImpressionEvent("add_to_cart", 'course_page', this.course, this.selectedItem?.nameAr, this.loggedDuration, this.progressPercentage, this.getItemUnit(this.selectedItem))
        let product = {
            productId: this.courseId,
            amount: this.course.course?.pricing.price,
            productType: 'Course'
        }
        this.paymentService.addToShopCart(product).then(
            res => {
                if ((res as any).success) {
                    this.isAlreadyInCart = true
                    this.showCartButton = false;
                    this.globalService.shoppinCartItemsCount += 1;

                    //	this.productDetail= (res as any).extraData
                    // this.getShopCart();
                }
            },
            err => {
                this.showCartButton = true;
                console.log(err);
                this.globalService.toast(localize('tryAgain'))
            }
        );
    }

    enrollInCourse() {
        if (this.globalService.isLoggedIn) {
            if (this.paymentCompleted) {
                this.enroll()
            } else {
                if (this.isEthrai && this.isCourseAvailabeInOtherTenants()) {
                    this.globalService.toast(localize('CanYouEnrollFrom') + this.tenantName)

                } else if ((this.isEthrai && !this.isCourseAvailabeInOtherTenants())) {
                    if (this.globalService.getUserType() == 'SaudiTrainee' && !this.course.course.isAlreadySubscribedToOne) {

                        Dialogs.confirm({
                            title: localize('confirmEnroll'),
                            message: localize("freeProg") + this.course.course.remainingFreeCourses + localize("totalFreeProgs"),
                            okButtonText: localize('Yes'),
                            cancelButtonText: localize('No'),
                        }).then(result => {
                            if (result) {
                                this.enroll();
                            }
                        });
                    } else if (this.globalService.getUserType() == 'SaudiTrainee' && this.course.course.isAlreadySubscribedToOne) {
                        this.globalService.toast(localize('AlreadySubToOneSaudiTrainee'))
                    }
                    else {
                        this.enroll();
                    }
                } else if (!this.isEthrai) {
                    this.enroll()
                }
            }

        } else {
            this.globalService.toast(localize('noEnroll'))
        }

    }

    enroll() {
        this.dashboardService.enrollInCourse(this.courseId).subscribe(
            res => {
                if ((res as any).success) {
                    this.globalService.toast(localize('EnrollSuccess'))
                    this.showEnrollButton = false;
                    this.showCartButton = false;
                    this.showCertificateButton = false;
                    this.showWaitCertificateButton = false;
                    this.getCourseDetails();
                }

            },
            err => {
                this.globalService.toast(localize('EnrollFailure'))
                console.log("enroll errr", err)
            }
        )
    }

    isCourseAvailabeInOtherTenants(): boolean {
        let allowedCourseTenants: string[] = this.course.course.allowedTenantIds;
        let allowedCourseTenantsWithoutEthrai = allowedCourseTenants.filter(t => t != environment.ETHRAI_GUID);
        let userTenants: any[] = this.globalService.getUserTenants() ? this.globalService.getUserTenants() : JSON.parse(this.globalService.getTenants());
        if (userTenants?.length <= 1) {
            return false;
        } else {
            for (let i = 0; i < userTenants?.length; i++) {
                if (allowedCourseTenantsWithoutEthrai.includes(userTenants[i].id)) {
                    this.tenantName = userTenants[i]?.nameAr
                    return true;
                }
            }
        }
        return false;
    }
    goToShoppingCart() {
        this.router.navigate(['shopping-cart']);
    }

    downloadCertificate() {

        // Extract certificate code from the static URL and use the media API

        const certCode = this.course.enrollment?.certificate?.code;
        if (certCode) {
            this.dashboardService.getCertificateMediaUrl(1, certCode).subscribe(
                res => {
                    let url = (res as any).url || (res as any).certificateUrl || (res as any).data || (res as any).extraData || res;

                    if (typeof url === 'string') {
                        if (!url.startsWith('http')) {
                            url = 'https://' + url;
                        }
                        this.certificateURL = url;
                        console.log('🎓 [downloadCertificate] Opening URL:', url);
                        Utils.openUrl(url);
                    } else {
                        console.log('Error in OpenURL: response is not a valid string URL. Response was:', JSON.stringify(res));
                        this.globalService.toast(localize('tryAgain'));
                    }
                },
                err => {
                    this.globalService.toast(localize('tryAgain'));
                    console.log('Certificate URL fetch error:', err);
                }
            );
        } else {
            this.globalService.toast(localize('tryAgain'));
            console.log('Could not extract certificate code from:');
        }


    }


    getUserFeedbacks() {
        const epoch = this.getCurrentAsyncEpoch();
        this.safeUnsubscribe(this.userFeedbacksSub);
        this.userFeedbacksSub = this.dashboardService.getUsersFeedbacksPerCourse(this.courseId, 0, 5).subscribe(
            res => {
                if (!this.isAsyncContextActive(epoch)) return;
                let feeds = res as any[]
                if (feeds?.length) {
                    feeds.forEach(element => {
                        if (!this.feedbacks.some(f => f.id === element.id)) {
                            this.feedbacks.push(element);
                        }
                    });
                }
            },
            err => {
                if (!this.isAsyncContextActive(epoch)) return;
                console.log('getUserFeedbacks error:', err);
            }
        );
    }

    onConsole(e: any) {
        console.log("consolle", e.data);
    }

    // OLD onloadFinished removed — was dead code duplicating registerCustomEvents()
    async setWebViewSrc(): Promise<string> {
        let f = knownFolders.documents();
        let folder = f.getFolder("app");
        let file = folder.getFile('local.html');
        let videoCode = this.url?.substring(this.url.lastIndexOf('/') + 1);
        let source;
        let secondsWatched = this.course.enrollment?.currentCourseDetailSecond
        source = new WebViewSource(videoCode, secondsWatched);

        await file.writeText(source.getHtmlString()).then(() => {
        }).catch((err) => {
            console.log(err);
        });
        return file.path;

    }

    setWebViewAliBabaSrc() {
        console.log('DEBUG setWebViewAliBabaSrc() called');
        const htmlString = this.Alibaba();

        if (htmlString.includes('No video sources')) return;

        // The base URL that will be used as the Referer for video requests
        const baseRefererUrl = "mobile.ethrai.sa";

        if (isIOS && (this.webview as any).ios) {
            console.log('DEBUG: Loading with baseURL for Referer on iOS');
            try {
                // Convert HTML string to NSString
                const nsHtmlString = NSString.stringWithString(htmlString);

                // Create base URL - this will be used as Referer for all subsequent requests
                const baseUrl = NSURL.URLWithString(baseRefererUrl);

                // Load HTML with base URL - video requests will use baseURL as Referer
                (this.webview as any).ios.loadHTMLStringBaseURL(nsHtmlString, baseUrl);
                console.log('DEBUG: iOS HTML loaded with baseURL:', baseRefererUrl);
            } catch (e) {
                console.error('DEBUG: iOS loadHTMLString error:', e);
                // Fallback to standard loading
                (this.webview as any).src = htmlString;
            }
        } else if (isAndroid && (this.webview as any).android) {
            console.log('DEBUG: Loading with baseURL for Referer on Android');
            try {
                // Enable JavaScript and media settings
                const settings = (this.webview as any).android.getSettings();
                settings.setJavaScriptEnabled(true);
                settings.setMediaPlaybackRequiresUserGesture(false);
                settings.setDomStorageEnabled(true);
                settings.setMixedContentMode(android.webkit.WebSettings.MIXED_CONTENT_ALWAYS_ALLOW);

                // loadDataWithBaseURL - the baseUrl will be used as Referer for subsequent requests
                // Parameters: baseUrl, data, mimeType, encoding, historyUrl
                (this.webview as any).android.loadDataWithBaseURL(
                    baseRefererUrl,           // baseUrl - used as Referer
                    htmlString,               // data - the HTML content
                    "text/html",              // mimeType
                    "UTF-8",                  // encoding
                    null                      // historyUrl
                );
                console.log('DEBUG: Android HTML loaded with baseURL:', baseRefererUrl);
            } catch (e) {
                console.error('DEBUG: Android loadDataWithBaseURL error:', e);
                // Fallback to standard loading
                (this.webview as any).src = htmlString;
            }
        } else {
            // Fallback for other cases
            console.log('DEBUG: Loading without custom baseURL');
            (this.webview as any).src = htmlString;
        }
    }
    onItemSelected() {
        this.getSubtitle(this.courseId);
        return this.selectedItemService.on().subscribe(
            res => {
                // Guard: ignore emissions if this component is no longer active
                // This prevents ghost emissions from a previously cached course page
                if (!this.isPageActive || this.isComponentDestroyed) {
                    console.log('🚨 [SelectedItemService] Ignored emission on inactive/destroyed component');
                    return;
                }
                const previousItem = this.selectedItem;
                const previousSecond = this.currentVideoSecond;

                if (previousItem?.type == 'Video' && previousSecond) {
                    if (isIOS && this.webview) {
                        try {
                            (this.webview as any).ios?.evaluateJavaScriptCompletionHandler("Video.remove()", (result: any, error: any) => {
                                console.log("res on item selected", result);
                            });
                        } catch (e) { console.log('item selected JS error:', e); }
                    }
                    this.setCurrentElementInfo(previousSecond, previousItem?.id);
                }

                this.selectedItem = res;
                this.isVideoPlayed = false;
                const requiresReg = !this.selectedItem.isAvailableWithoutRegister;
                const notEnrolled = !this.isAlreadyEnrolled && !this.course?.enrollment;

                if (!this.isLoading && this.course?.course && requiresReg && notEnrolled) {
                    this.globalService.toast(localize('RegNeeded'));
                    return; // Stop processing for locked items if not enrolled
                }

                if (this.selectedItem.type == 'Pdf') {
                    this.url = (res as any).applicationUrl;
                    this.url = "http://docs.google.com/gview?embedded=true&url=" + this.url;
                } else if (this.selectedItem.type == 'Activity') {
                    this.url = (res as any).applicationUrl;
                } else if (this.selectedItem.type == 'Video') {
                    if (this.globalService.isEthrai || !this.globalService.isLoggedIn) {
                        this.firebaseEventService.logVideoStartedorCompletedEvent('course_videounitclicked', 'course_page',
                            this.course, this.selectedItem.nameAr, this.loggedDuration, this.progressPercentage, this.getItemUnit(this.selectedItem))

                    }

                    console.log('DEBUG: selectedItem.alibabaPlayInfo =', JSON.stringify(this.selectedItem.alibabaPlayInfo));
                    console.log('DEBUG: res.alibabaPlayInfo =', JSON.stringify((res as any).alibabaPlayInfo));
                    this.urlProtected = this.selectedItem.alibabaPlayInfo || (res as any).alibabaPlayInfo;
                    console.log('DEBUG: urlProtected =', JSON.stringify(this.urlProtected));
                    if (this.webview) {
                        this.setWebViewAliBabaSrc();
                    }

                } else if (this.selectedItem.type == 'SelfAssessment') {
                    this.assessmentQuestionsNo = this.selectedItem.assessment?.questions?.length
                    this.assessmentQuestions = this.selectedItem?.assessment?.questions;

                    this.showResult = false;
                    this.assessmentQuestionIndex = 0
                    this.assessmentProgressPercent = 0;
                    this.correctAnswersCount = 0
                    this.assessmentAnswers = [];
                }
                if (this.selectedItem.type != 'Video' && this.selectedItem.type != 'Activity' && this.selectedItem.type != 'SelfAssessment' && !this.course.enrollment?.trackings?.some(item => item.courseDetailId == this.selectedItem?.id)) {
                    this.setTrackedItem(this.selectedItem?.id);
                }
                // } 


            },
            err => {
                console.log("errr", err)
            }
        )

    }
    setTrackedItem(detailId) {
        if (!detailId) return;
        const trackingKey = String(detailId);
        this.trackingMutationQueue = this.trackingMutationQueue
            .then(() => this.trackDetailIfNeeded(trackingKey))
            .catch(err => console.log('setTrackedItem queue error:', err));
    }

    private async trackDetailIfNeeded(detailId: string): Promise<void> {
        // Only block if the component is fully destroyed — do NOT check isPageActive here.
        // The tracking call was queued while the page was active (from the 'end' event),
        // but by the time the Promise chain resolves, isPageActive may have been toggled
        // by NativeScript's page lifecycle. We must let the call complete.
        if (this.isComponentDestroyed) {
            console.log('📊 [trackDetailIfNeeded] BLOCKED: component destroyed');
            return;
        }
        if (!this.isAlreadyEnrolled || !this.course?.enrollment || !this.course?.course) {
            console.log('📊 [trackDetailIfNeeded] BLOCKED: isAlreadyEnrolled:', this.isAlreadyEnrolled, 'enrollment:', !!this.course?.enrollment, 'course:', !!this.course?.course);
            return;
        }

        const currentTrackings = this.course.enrollment?.trackings || [];
        const alreadyTracked = currentTrackings.some(item => item.courseDetailId == detailId);
        if (alreadyTracked) {
            console.log('📊 [trackDetailIfNeeded] BLOCKED: already tracked:', detailId);
            return;
        }
        if (this.trackingRequests.has(detailId)) {
            console.log('📊 [setTrackedItem] Request already pending for:', detailId);
            return;
        }

        const body = {
            courseDetailId: detailId,
            courseInstanceToken: this.course.course.courseInstanceToken,
            enrollmentId: this.course.enrollment?.id
        };

        // --- USER REQUESTED LOGS ---
        try {
            const appSettings = require('@nativescript/core/application-settings');
            const token = appSettings.getString("TOKEN", "");
            console.log('\n\n======================================================');
            console.log('📡 TRACKING API CALL (https://ethrai.sa/api/UserData/course/enroll/tracking)');
            console.log('🔑 Bearer Token:', token);
            console.log('📦 Request Body:', JSON.stringify(body, null, 2));
            console.log('📄 flatDetails (IDs & Types):', JSON.stringify(this.flattenedDetails?.map(d => ({ id: d.id, type: d.type, name: d.nameAr })), null, 2));
            console.log('======================================================\n\n');
        } catch (e) {
            console.error('Error logging tracking details:', e);
        }

        await new Promise<void>((resolve) => {
            const sub = this.dashboardService.setCourseTracking(body).subscribe(
                res => {
                    this.trackingRequests.delete(detailId);
                    if (this.isComponentDestroyed) {
                        resolve();
                        return;
                    }
                    this.zone.run(() => {
                        if ((res as any).success) {
                            this.applyTrackingMutation((res as any).extraData);
                        } else {
                            console.log('📊 [setTrackedItem] API returned success=false. Full response:', JSON.stringify(res));
                        }
                        resolve();
                    });
                },
                err => {
                    this.trackingRequests.delete(detailId);
                    if (!this.isComponentDestroyed) {
                        console.error('📊 [setTrackedItem] API ERROR:', err);
                    }
                    resolve();
                }
            );
            this.trackingRequests.set(detailId, sub);
        });
    }

    private updateProgressFromAttendedSeconds(attendedSeconds: number): void {
        const requiredSeconds = this.course?.course?.numberOfSecondsRequiredToAttend || 1;
        const calcPercent = (attendedSeconds / requiredSeconds) * 100;
        if (isNaN(calcPercent) || !isFinite(calcPercent)) {
            this.progressPercentage = 0;
            return;
        }
        this.progressPercentage = calcPercent > 100 ? 100 : Number(calcPercent.toFixed(2));
    }

    private applyTrackingMutation(extraData: any): void {
        if (!extraData || !this.course?.enrollment) return;

        const wasFinished = this.isCourseFinished;
        this.course.enrollment.trackings = [...(extraData.trackings || [])];
        this.attendedSeconds = extraData.attendedSeconds || 0;
        this.updateProgressFromAttendedSeconds(this.attendedSeconds);
        this.checkAllVideosWatched();
        const becameFinishedByTrackingCheck = !wasFinished && this.isCourseFinished;

        if (extraData.status === 'Success' || becameFinishedByTrackingCheck) {
            this.isCourseFinished = true;
            this.progressPercentage = 100;
            if (this.course.enrollment) {
                this.course.enrollment.status = 'Success';
            }
            if (!wasFinished && !becameFinishedByTrackingCheck) {
                if (this.globalService.isEthrai) {
                    this.firebaseEventService.logCourseCompletedEvent('course_page', this.course, this.selectedItem?.nameAr, this.loggedDuration, this.progressPercentage
                        , this.getItemUnit(this.selectedItem));
                }
                this.globalService.toast(localize('Congrats'));
            }
            this.proceedAfterCourseFinished();
        }
    }


    getCourseFinished() {
        console.log('🎓 [getCourseFinished] status:', this.course.enrollment.status, '| isSurveyAnswered:', this.course.course.isSurveyAnswered, '| isFeedBackSubmitted:', this.course.course.isFeedBackSubmitted, '| certificate:', this.course.enrollment.certificate?.url);
        if (this.course.enrollment.status == 'Success') {
            this.isCourseFinished = true;
            this.progressPercentage = 100;
        }
        this.proceedAfterCourseFinished();
    }

    getShopCart() {
        const epoch = this.getCurrentAsyncEpoch();
        this.paymentService.getShopCart().toPromise().then(
            res => {
                if (!this.isAsyncContextActive(epoch)) return;
                let products = res as any[];
                this.isAlreadyInCart = products.some(product => product.productId === this.courseId);
                if (this.isAlreadyInCart) {

                } else {
                    this.showCartButton = true;
                }
            },
            err => {
                if (!this.isAsyncContextActive(epoch)) return;
                console.log(err)
            }
        )
    }
    getText(html) {
        return html?.replace(/(<style[\w\W]+style>)/g, "").replace(/(<w:[\w\W]+\/>)/g, "").replace(/<[^>]+>/g, '').replace(/&nbsp;/g, '').replace(/\s+/g, " ")
    }
    shareCourse() {
        if (this.globalService.isEthrai || !this.globalService.isLoggedIn) {
            this.firebaseEventService.logShareClickedEvent("course_page")
        }
        share.shareUrl(this.course.course.shortUrl, "");
    }

    waitCertificate() {
        this.globalService.toast(localize('ContactSupportForCertificate'))
    }

    /**
     * Sequential certificate flow orchestrator.
     * Course done → Feedback popup → Survey inline → CertReadySoon (polling) → Download
     */
    proceedAfterCourseFinished() {
        if (!this.isCourseFinished || !this.course?.course) return;
        this.courseFinishedFlowQueued = true;
        if (this.courseFinishedFlowPromise) return;

        const flowEpoch = this.getCurrentAsyncEpoch();
        const flowPromise = this.runCourseFinishedFlow(flowEpoch);
        this.courseFinishedFlowPromise = flowPromise;
        flowPromise.then(
            () => { this.courseFinishedFlowPromise = null; },
            () => { this.courseFinishedFlowPromise = null; }
        );
    }

    private async runCourseFinishedFlow(flowEpoch: number): Promise<void> {
        console.log('🎓 [runCourseFinishedFlow] START | queued:', this.courseFinishedFlowQueued, '| isCourseFinished:', this.isCourseFinished, '| hasCourse:', !!this.course?.course);
        while (this.courseFinishedFlowQueued && this.isAsyncContextActive(flowEpoch)) {
            this.courseFinishedFlowQueued = false;
            if (!this.isCourseFinished || !this.course?.course) {
                console.log('🎓 [runCourseFinishedFlow] EXIT: Not finished or no course');
                return;
            }

            // Step 1: Feedback
            // Waiting for user to manually complete feedback via bottom bar button
            if (!this.course.course.isFeedBackSubmitted) {
                console.log('🎓 [runCourseFinishedFlow] STOP: Waiting for feedback');
                return;
            }

            // Step 2: Survey
            // Waiting for user to manually complete survey via bottom bar button
            if (!this.course.course.isSurveyAnswered) {
                const hasSurveyData = await this.ensureSurveyForCourse(flowEpoch);
                if (!this.isAsyncContextActive(flowEpoch)) return;

                // If there is no survey required globally for this course, we can skip waiting for it 
                if (!hasSurveyData && !this.course.course.isSurveyAnswered) {
                    console.log('🎓 [runCourseFinishedFlow] SKIPPING SURVEY: No survey required');
                    // fall through to certificate
                } else {
                    console.log('🎓 [runCourseFinishedFlow] STOP: Waiting for survey');
                    return; // Wait for manual survey submission
                }
            }

            if (this.course.course.disableCertification) {
                console.log('🎓 [runCourseFinishedFlow] EXIT: Certificate disabled or not shown');
                return;
            }

            if (this.course.enrollment?.certificate?.url) {
                this.showCertificateButton = true;
                this.certificateURL = this.course.enrollment.certificate.url;
                console.log('🎓 [runCourseFinishedFlow] EXIT: Certificate already exists');
                return;
            }
            if (!this.showCertificateButton) {
                this.showWaitCertificateButton = true;
            }
            console.log('🎓 [runCourseFinishedFlow] NO CERTIFICATE YET. | certSubscription closed?', !this.certSubscription || this.certSubscription.closed);
            if (!this.certSubscription || this.certSubscription.closed) {
                this.checkCertificate();
            }
            return;
        }
    }

    private ensureSurveyForCourse(epoch: number): Promise<boolean> {
        if (this.course?.course?.isSurveyAnswered) {
            return Promise.resolve(true);
        }
        if (this.surveyData && this.surveyId) {
            return Promise.resolve(true);
        }
        if (this.surveyRequestPromise) {
            return this.surveyRequestPromise;
        }

        this.surveyRequestPending = true;
        const tenantId = this.globalService.currentTenantId;
        this.safeUnsubscribe(this.surveyRequestSub);
        const pendingPromise = new Promise<boolean>((resolve) => {
            this.surveyRequestSub = this.dashboardService.courseSurvey(tenantId).subscribe(
                (res: any) => {
                    if (!this.isAsyncContextActive(epoch)) {
                        resolve(false);
                        return;
                    }
                    this.surveyData = res?.topics || [];
                    this.surveyId = res?.id;
                    resolve(!!this.surveyData && !!this.surveyId);
                },
                err => {
                    if (!this.isAsyncContextActive(epoch)) {
                        resolve(false);
                        return;
                    }
                    if (this.isAlreadySavedError(err)) {
                        this.markSurveyAnsweredLocally();
                        resolve(true);
                        return;
                    }
                    // No survey configured for courses — keep behavior and skip survey step
                    this.markSurveyAnsweredLocally();
                    resolve(true);
                }
            );
        });
        this.surveyRequestPromise = pendingPromise;
        pendingPromise.then(() => {
            this.surveyRequestPending = false;
            this.surveyRequestPromise = null;
        }, () => {
            this.surveyRequestPending = false;
            this.surveyRequestPromise = null;
        });
        return this.surveyRequestPromise;
    }

    getSurveyForCourse() {
        const epoch = this.getCurrentAsyncEpoch();
        this.ensureSurveyForCourse(epoch).then(() => {
            if (!this.isAsyncContextActive(epoch)) return;
            this.proceedAfterCourseFinished();
        });
    }



    traverse(abc) {
        Object.entries(abc).forEach(([key, value]) => {
            if (key == "details") {
                let details = (value as any[]);
                if (details?.length > 0) {
                    for (let i = 0; i < details?.length; i++) {
                        if (details[i].type == 'Video' && (details[i].isAvailableWithoutRegister ||
                            (!this.course.details[i].isAvailableWithoutRegister && this.course.enrollment !== undefined))) {
                            this.selectedItemService.emit(details[i]);
                            this.selectedItem = details[i]
                            break;
                        } else if (details[i].type == 'Video' && !details[i].isAvailableWithoutRegister) {
                            break;
                        } else {
                            this.traverse(details[i]);
                        }
                    };
                } else {

                }

            }
        })
    }
    traverseById(abc) {
        Object.entries(abc).forEach(([key, value]) => {
            if (key == "details") {
                let details = (value as any[]);
                if (details?.length > 0) {
                    for (let i = 0; i < details?.length; i++) {
                        if (details[i].id == this.course.enrollment?.currentCourseDetailId) {
                            this.selectedItemService.emit(details[i])
                            this.selectedItem = details[i];
                            break;
                        } else {
                            this.traverseById(details[i]);
                        }
                    };
                } else {

                }

            }
        })
    }
    getNextQuestion() {
        this.isQuestionAnswered = false;
        if (this.assessmentQuestionIndex + 1 < this.assessmentQuestionsNo) {
            ++this.assessmentQuestionIndex;
        } else {
            this.showResult = true;
            // Submit assessment answers to backend API
            if (this.isAlreadyEnrolled && this.selectedItem &&
                (this.selectedItem.type === 'Activity' || this.selectedItem.type === 'SelfAssessment')) {
                const payload = {
                    enrollmentId: this.course.enrollment.id,
                    courseDetailId: this.selectedItem.id,
                    answers: this.assessmentAnswers
                };
                console.log('📊 [Assessment] Submitting bulk answers:', JSON.stringify(payload));
                this.dashboardService.submitAssessmentAnswers(payload).subscribe(
                    (res: any) => {
                        console.log('📊 [Assessment] API response:', JSON.stringify(res));
                        // Mark as tracked locally after successful API call
                        if (!this.course.enrollment.trackings) {
                            this.course.enrollment.trackings = [];
                        }
                        if (!this.course.enrollment.trackings.some(t => t.courseDetailId === this.selectedItem?.id)) {
                            this.course.enrollment.trackings.push({ courseDetailId: this.selectedItem.id });
                        }

                        // Treat the backend response like a video tracking response to instantly trigger completion flow
                        if (res?.success) {
                            if (res.extraData) {
                                this.applyTrackingMutation(res.extraData);
                            } else {
                                this.checkAllVideosWatched();
                                if (this.isCourseFinished) {
                                    this.course.enrollment.status = 'Success';
                                    this.proceedAfterCourseFinished();
                                }
                            }
                        }

                        // Refresh course details to get updated progress from server
                        this.getCourseDetails();
                        // Wait 2 seconds then auto-advance to next item
                        const currentId = this.selectedItem?.id;
                        setTimeout(() => {
                            this.zone.run(() => {
                                // Use ID-based lookup because getCourseDetails() rebuilds flattenedDetails with new object references
                                const currentIndex = this.flattenedDetails.findIndex(item => item.id === currentId);
                                if (currentIndex !== -1 && currentIndex + 1 < this.flattenedDetails?.length) {
                                    this.selectedItem = this.flattenedDetails[currentIndex + 1];
                                    this.selectedItemService.emit(this.flattenedDetails[currentIndex + 1]);
                                }
                            });
                        }, 2000);
                    },
                    err => {
                        console.error('📊 [Assessment] API error:', err);
                        this.globalService.toast(localize('tryAgain'));
                    }
                );
            }
        }
        this.assessmentProgressPercent = Math.floor(((this.assessmentQuestionIndex + 1) / this.assessmentQuestionsNo) * 100);
        this.selectedAnswerId = undefined;
        this.correctAnswerId = undefined;
        this.isFirstAnswerAttempt = true
    }
    onSelectAnswer(answerId) {
        this.isQuestionAnswered = true
        if (this.isFirstAnswerAttempt) {
            this.selectedAnswerId = answerId
            this.correctAnswerId = this.assessmentQuestions[this.assessmentQuestionIndex]?.correctAnswer?.choiceId;
            if (this.selectedAnswerId == this.correctAnswerId) {
                this.correctAnswersCount += 1
            }
            this.correctAnswersPercentage = Math.floor((this.correctAnswersCount / this.assessmentQuestionsNo) * 100);
            this.isFirstAnswerAttempt = false

            // Collect answer for bulk API submission
            const questionId = this.assessmentQuestions[this.assessmentQuestionIndex]?.id;
            if (questionId) {
                this.assessmentAnswers.push({
                    questionId: questionId,
                    truthy: null,
                    choiceId: answerId
                });
            }
        }

    }

    // @HostListener('unloaded')
    ngOnDestroy() {
        this.isComponentDestroyed = true;
        this.isPageActive = false;
        this.invalidateAsyncContext();
        if (this.pageLoadedHandler) {
            this.page.off(Page.loadedEvent, this.pageLoadedHandler);
        }
        if (this.pageUnloadedHandler) {
            this.page.off(Page.unloadedEvent, this.pageUnloadedHandler);
        }
        this.clearSubscriptions();
        this.cleanupVideo();

        // Null out all course state so late-firing closures have nothing to emit
        this.flattenedDetails = [];
        this.selectedItem = null;
        this.course = {};
        this.selectedItemService = null;
    }

    private clearRuntimeSubscriptions() {
        this.safeUnsubscribe(this.subsVar);
        this.safeUnsubscribe(this.certSubscription);
        this.safeUnsubscribe(this.courseInfoSub);
        this.safeUnsubscribe(this.courseDetailsSub);
        this.safeUnsubscribe(this.subtitleSub);
        this.safeUnsubscribe(this.skillsSub);
        this.safeUnsubscribe(this.similarCoursesSub);
        this.safeUnsubscribe(this.userFeedbacksSub);
        this.safeUnsubscribe(this.surveyRequestSub);
        this.safeUnsubscribe(this.videoSecondsSub);
        this.cleanupTrackingRequests();
        this.surveyRequestPending = false;
        this.surveyRequestPromise = null;
        this.courseFinishedFlowQueued = false;
        this.courseFinishedFlowPromise = null;
        this.trackingMutationQueue = Promise.resolve();
        this.videoSecondsRequestSeq += 1;
    }

    clearSubscriptions() {
        this.invalidateAsyncContext();
        this.clearRuntimeSubscriptions();
        this.safeUnsubscribe(this.routeParamSub);
    }

    setCurrentElementInfo(currentSecond: number, detailId?: string) {
        if (!this.isAlreadyEnrolled || !this.course?.enrollment) return;
        const targetDetailId = detailId || this.selectedItem?.id;
        if (!targetDetailId) return;

        const epoch = this.getCurrentAsyncEpoch();
        const requestSeq = ++this.videoSecondsRequestSeq;
        const payLoad = {
            enrollmentId: this.course?.enrollment?.id,
            currentCourseDetailId: targetDetailId,
            currentCourseDetailSecond: currentSecond
        };

        this.safeUnsubscribe(this.videoSecondsSub);
        this.videoSecondsSub = this.dashboardService.setVideoSeconds(payLoad).subscribe(
            () => {
                if (!this.isAsyncContextActive(epoch) || requestSeq !== this.videoSecondsRequestSeq) return;
                this.course.enrollment.currentCourseDetailSecond = Math.round(currentSecond || 0);
            },
            err => {
                if (!this.isAsyncContextActive(epoch) || requestSeq !== this.videoSecondsRequestSeq) return;
                console.log("setVideoSeconds err", err);
            }
        );
    }
    goToCourse(id, course) {
        this.clearSubscriptions();
        this.cleanupVideo();
        this.webview = null;
        if (this.globalService.isEthrai || !this.globalService.isLoggedIn) {
            this.firebaseEventService.logCourseClickedEvent(this.globalService.isLoggedIn, this.globalService.getUserStats(),
                "course_page", this.globalService.getUserProfile(), course)
        }
        this.route.routeReuseStrategy.shouldReuseRoute = function () { return false }
        this.route.onSameUrlNavigation = 'reload'
        this.router.navigate(['/course-details', id])
    }
    // flattenDetailsTree(details,extractDetails){
    //     Array.prototype.concat.apply(
    //         details, 
    //         details.map(x => this.flattenDetailsTree(extractDetails(x) || [], extractDetails))
    //     );

    //     //   let extractDetails = x => x.details;

    //     //   let flat = flatten(extractDetails(tree), extractDetails)
    //                     //  .map(x => delete x.details && x);
    // }
    // extractDetails(tree){
    //     return x => x.details;
    // }
    flat(abc) {
        Object.entries(abc).forEach(([key, value]) => {
            if (key == "details") {
                let details = (value as any[]);
                if (details?.length > 0) {
                    for (let i = 0; i < details?.length; i++) {
                        if (details[i].type != 'Label') {
                            this.flattenedDetails.push(details[i])
                        } else if (details[i].type == 'Label') {
                            this.LabelsArray.push(details[i])
                        }
                        this.flat(details[i]);
                    };
                } else {
                }

            }
        })
    }
    openCourseRatingModal() {
        if (this.course?.course?.isFeedBackSubmitted) return;
        const response = this.modalService.showModal(CourseRatingModalComponent, {
            context: {
                dim: "#00000000",
                enrollmentId: this.course?.enrollment?.id,
                courseId: this.courseId
            },
            fullscreen: false,
            viewContainerRef: this.vcRef,
            dimAmount: 0.5,
        } as any);
        response.then((res: any) => {
            if (this.isFeedbackModalSubmitted(res)) {
                this.markFeedbackSubmittedLocally();
                if (res && res[0] && res[0].extraData) {
                    this.feedbacks.push(res[0].extraData);
                }
                // Trigger flow so certificate logic runs if survey isn't needed
                this.proceedAfterCourseFinished();
            }
        });
    }

    async openSurveyModal() {
        if (this.course?.course?.isSurveyAnswered) return;
        const flowEpoch = this.getCurrentAsyncEpoch();
        const hasSurveyData = await this.ensureSurveyForCourse(flowEpoch);
        if (!this.isAsyncContextActive(flowEpoch) || (!hasSurveyData && !this.course.course.isSurveyAnswered)) return;

        const surveyResult = await this.modalService.showModal(SurveyModalComponent, {
            context: {
                surveyData: this.surveyData,
                surveyId: this.surveyId,
                productId: this.courseId,
                enrollmentId: this.course?.enrollment?.id || '',
                type: 'Course'
            },
            fullscreen: true,
            viewContainerRef: this.vcRef,
        } as any).catch(err => {
            console.log('Survey modal error:', err);
            return null;
        });

        if (surveyResult?.submitted) {
            this.markSurveyAnsweredLocally();
            // Trigger flow so certificate logic runs now that survey is done
            this.proceedAfterCourseFinished();
        }
    }

    checkCertificate() {
        console.log('🎓 [checkCertificate] Requesting certificate | Enrollment ID:', this.course?.enrollment?.id, '| isSurveyAnswered:', this.course?.course?.isSurveyAnswered, '| isFeedBackSubmitted:', this.course?.course?.isFeedBackSubmitted);
        const epoch = this.getCurrentAsyncEpoch();
        this.safeUnsubscribe(this.certSubscription);
        this.certSubscription = this.dashboardService.checkCertificate(this.course.enrollment?.id).pipe(
            map(res => {
                console.log('🎓 [checkCertificate] Response received:', JSON.stringify(res, null, 2));
                let url = (res as any).url
                if (!url) {
                    throw new Error("Invalid Value");
                }
                return res;
            }),
            retryWhen(
                error =>
                    error.pipe(
                        delay(2000)
                    )
            )
        )
            .subscribe(
                res => {
                    if (!this.isAsyncContextActive(epoch)) return;
                    this.showCertificateButton = true;
                    this.showWaitCertificateButton = false;
                    this.certificateURL = (res as any).url
                    console.log('🎓 [checkCertificate] Certificate ready:', (res as any).url);
                },
                err => {
                    if (!this.isAsyncContextActive(epoch)) return;
                    console.error('🎓 [checkCertificate] Error response:', err);
                },
            );
    }


    //   getInAppPurchaseManager(){
    // 	const purchaseStateUpdateListener: InAppPurchaseTransactionStateUpdateListener = {
    // 		onUpdate: (purchaseTransactionState: InAppPurchaseTransactionState): void => {
    // 			if (purchaseTransactionState.resultCode === InAppPurchaseResultCode.Purchased) {
    //                 if(!this.isConfirmed){
    //                     this.confirmOrder(purchaseTransactionState);
    //                     this.isConfirmed=true;
    //                 }
    // 			}
    // 			if (purchaseTransactionState.resultCode === InAppPurchaseResultCode.Failed) {
    // 				console.log("PURCHASE FAIL");
    // 			}
    // 			if (purchaseTransactionState.resultCode === InAppPurchaseResultCode.Purchasing) {
    // 				console.log("PURCHASE INPROGRESS")
    // 			}
    // 		},
    // 		onUpdateHistory: (purchaseTransactionState: InAppPurchaseTransactionState): void => {
    // 			if (purchaseTransactionState.resultCode === InAppPurchaseResultCode.Restored) {
    // 				console.log("PURCHASE RESTORED")
    // 			}
    // 		}
    // 		}
    // 		InAppPurchaseManager.bootStrapInstance(purchaseStateUpdateListener).then(inAppPurchaseManager => {
    // 			this.inAppPurchaseManager = inAppPurchaseManager
    // 		})
    // 	}
    // 	queryProducts() {
    //         let courseArr=[];
    //         courseArr.push(this.course)
    //         this.firebaseEventService.logCheckoutBeginEvent('course_page',courseArr)
    //         this.firebaseEventService.logPaymentInfoEvent('course_page',courseArr,'apple_in_app_purchase')
    //         this.paymentService.getSiteMaintenanceState().subscribe(
    //             res=>{
    //                 if(res){
    //                     this.globalService.toast(localize('underMaintenance'))
    //                 }else{
    //                     const myProductIds = [this.course.course.appleProductId] //['sa.ethrai_mobile.app.tire2']
    //                     const myProductType = InAppPurchaseType.InAppPurchase 
    //                     this.isQueryProduct=true;
    //                     this.inAppPurchaseManager.list(myProductIds, myProductType)
    //                         .then(
    //                             (result: InAppListProductsResult) => {
    //                             this.isQueryProduct=false;
    //                             const product:
    //                              InAppProduct = result.products[0]
    //                             if(product){
    //                                 // get the products ...
    //                                 this.inAppPurchaseManager.order(product).then(
    //                                     (result: InAppOrderResult) => {
    //                                     if (result.success) {

    //                                     }
    //                                 },
    //                                 err=>{console.log(err)}
    //                                 )

    //                             }else{
    //                                 const toast = new Toasty({ text: localize('tryAgain') ,yAxisOffset: 50});
    //                                 toast.show();
    //                             }
    //                             }
    //                         ,err=>{
    //                             this.isQueryProduct=false;
    //                             console.log("kkkkkkkkkkk",err)
    //                         }

    //                         )
    //                             }
    //                 }
    //             )
    // 	}
    // 	confirmOrder(purchaseTransactionState: InAppPurchaseTransactionState) {
    //         const isConsumable = (productId: string): boolean => { 
    //             /* determine if is consumable and can be purchased more then once */
    //             return true }
    //             // alert("Confirm Order")
    //         // only purchased products can be confirmed

    //         if (purchaseTransactionState.resultCode === InAppPurchaseResultCode.Purchased) {
    //             const consumable: boolean = isConsumable(purchaseTransactionState.productIdentifier)
    //             this.inAppPurchaseManager.orderConfirm(purchaseTransactionState, consumable)
    //                 .then((result: InAppOrderConfirmResult) => {
    //                     if (result.success) {
    //                         let payload=
    //                         {
    //                             productId: this.course.course.id,
    //                             productType: "Course",
    //                             appleProductId: this.course.course.appleProductId,
    //                             transactionReceipt:this.inAppPurchaseManager.getStoreReceipt()
    //                         }
    //                         this.buyProducts(payload)
    //                     }else{
    //                         // alert("order confirmation FAILED")
    //                     }
    //                 })//.catch(err=>alert(err))

    //         }
    //     //    alert("confirm order method finished") 
    //     }

    //     buyProducts(payload){
    //         const type = Connectivity.getConnectionType();
    //         if(type == Connectivity.connectionType.none){
    //             this.globalService.toast(localize('proceessing'));
    //             this.globalService.setInAppFailedRequests(payload);
    //             this.zone.run(()=>{
    //                 this.showAppleBuyButton=false;
    //                 this.showProcessingButton=true;
    //             })
    //         }else{
    //             this.paymentService.getSiteMaintenanceState().subscribe(
    //                 res=>{
    //                     if(res){
    //                         this.globalService.toast(localize('processingLater'));
    //                         this.globalService.setInAppFailedRequests(payload);
    //                         this.zone.run(()=>{
    //                             this.showAppleBuyButton=false;
    //                             this.showProcessingButton=true;
    //                         })
    //                     }else{
    //                         this.paymentService.postAppleOrder(payload).subscribe(
    //                             res=>{
    //                                 let response= res as any
    //                                 if(response.success){
    //                                     this.zone.run(()=>{
    //                                         this.showEnrollButton=true;
    //                                         this.showAppleBuyButton=false;
    //                                         this.paymentCompleted=true;
    //                                         this.showProcessingButton=false;
    //                                         let courseArr=[];
    //                                         courseArr.push(this.course)
    //                                         this.firebaseEventService.logPurchaseEvent('course_page',courseArr,'apple_in_app_purchase',this.inAppPurchaseManager.getStoreReceipt(),'','na')
    //                                     });
    //                                     this.globalService.toast(localize('EnrollSuccess'));
    //                                     this.globalService.editInAppFailedRequests(payload)
    //                                 }
    //                             },
    //                             err=>{
    //                                 this.globalService.toast(localize('proceessing'));
    //                                 this.globalService.setInAppFailedRequests(payload);
    //                                 this.zone.run(()=>{
    //                                     this.showAppleBuyButton=false;
    //                                     this.showProcessingButton=true;
    //                                 })

    //                             }
    //                         )
    //                     }
    //             })
    //         }
    //         // this.page.on(Page.unloadedEvent, event => {
    //         //     alert("unloadedEvent")
    //         //     this.ngOnDestroy();
    //         // })

    //     }
    getItemUnit(item) {
        let itm = item
        while (itm?.parentId) {
            itm = this.LabelsArray.find(i => i.id == itm?.parentId)
        }
        return itm?.nameAr
    }
    getCourseProgressPercent(watchedSeconds: number, TotalSeconds: number) {
        const percent = (watchedSeconds / TotalSeconds) * 100;
        // Use standard string append since intl.format might not be consistently reliable here without a heavy polyfill import
        return Number(percent.toFixed(1)) + '%';
    } toggleFavorite(id, item, isFavorite) {
        if (this.globalService.isLoggedIn) {
            let payload = {
                "productId": id,
                "type": "Course"
            }
            if (!isFavorite) {
                this.dashboardService.setFavoriteProducts(payload).subscribe(
                    res => {
                        if ((res as any).success) {
                            item.isFavorite = true;
                            this.globalService.toast(localize('FavAdded'));
                            if (this.isEthrai) {
                                this.firebaseEventService.logAddToWishListEvent('course_page', this.course, this.selectedItem?.nameAr, this.loggedDuration, this.progressPercentage, this.getItemUnit(this.selectedItem))
                            }
                        }
                    },
                    err => {

                    }
                )
            } else {
                this.dashboardService.removeFavoriteProducts(payload).subscribe(
                    res => {
                        item.isFavorite = false;
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
    setSelectedTabIndex(e: SelectedIndexChangedEventData) {
        this.selectedTabIndex = e.newIndex
    }

}


