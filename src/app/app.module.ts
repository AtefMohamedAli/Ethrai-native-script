import { NgModule, NO_ERRORS_SCHEMA } from '@angular/core'
import { NativeScriptFormsModule, NativeScriptModule, NativeScriptCommonModule } from '@nativescript/angular'
import { DropDownModule } from "nativescript-drop-down/angular";
//import { Printer } from "nativescript-printer";
import { AppRoutingModule } from './app-routing.module'
import { AppComponent } from './app.component'
import { ItemsComponent } from './item/items.component'
import { ItemDetailComponent } from './item/item-detail.component'
import { LoginComponent } from './account/login/login.component';
import { LoginByMailComponent } from './account/login-by-mail/login-by-mail.component';
import { OtpVerificationComponent } from './account/otp-verification/otp-verification.component';
import { RegisterComponent } from './account/register/register.component';
import { SplashScreenComponent } from './account/splash-screen/splash-screen.component';
import { ForgotPasswordComponent } from './account/forgot-password/forgot-password.component';
import { NewPasswordComponent } from './account/new-password/new-password.component';
import { CategoriesComponent } from './onboarding/categories/categories.component';
import { DurationComponent } from './onboarding/duration/duration.component';
import { KnowledgeComponent } from './onboarding/knowledge/knowledge.component';
import { RegisterConfirmComponent } from './onboarding/register-confirm/register-confirm.component';
import { HighlightedComponent } from './dashboard/highlighted/highlighted.component';
import { ExploreComponent } from './dashboard/explore/explore.component';
import { SearchResultComponent } from './dashboard/search-result/search-result.component';
import { FilterComponent } from './dashboard/filter/filter.component';
import { CategoryComponent } from './dashboard/category/category.component';
import { TabNavigationComponent } from './dashboard/tab-navigation/tab-navigation.component';
import { TraingPathComponent } from './dashboard/traing-path/traing-path.component';
import { OnlineClassesComponent } from './dashboard/online-classes/online-classes.component';
import { AccountPageComponent } from './account/account-page/account-page.component';
import { ProfileViewComponent } from './account/profile-view/profile-view.component';
import { ProfileFormComponent } from './account/profile-form/profile-form.component';
import { VideoSettingsComponent } from './settings/video-settings/video-settings.component';
import { DownloadSettingsComponent } from './settings/download-settings/download-settings.component';
import { ContentLanguageComponent } from './settings/content-language/content-language.component';
import { LearningReminderComponent } from './settings/learning-reminder/learning-reminder.component';
import { NotificationsComponent } from './settings/notifications/notifications.component';
import { AboutEthraiComponent } from './settings/about-ethrai/about-ethrai.component';
import { MyProductsComponent } from './my-products/my-products/my-products.component';
import { FavoritesComponent } from './my-products/favorites/favorites.component';
import { DownloadedComponent } from './my-products/downloaded/downloaded.component';
import { BookmarksComponent } from './my-products/bookmarks/bookmarks.component';
import { ChangePasswordComponent } from './account/change-password/change-password.component';
import { ShoppingCartComponent } from './payment/shopping-cart/shopping-cart.component';
import { CheckoutComponent } from './payment/checkout/checkout.component';
import { CourseDetailsComponent } from './dashboard/course-details/course-details.component';
import { CertificatesComponent } from './my-products/certificates/certificates.component';
import { PurchasesComponent } from './my-products/purchases/purchases.component';
import { AuthGuard } from './shared/services/auth.guard'
import { HttpService } from './shared/services/http.service'
import { GlobalService } from './shared/services/global.service'
import { FirebaseEventService } from './shared/services/firebase.event.service'
import { ApiLoggingInterceptor } from './shared/services/api-logging.interceptor'
import { HTTP_INTERCEPTORS } from '@angular/common/http'
import { NativeScriptHttpClientModule } from '@nativescript/angular'

import { TNSCheckBoxModule } from '@nstudio/nativescript-checkbox/angular';
import { ReactiveFormsModule } from '@angular/forms';
import { NativeScriptUIListViewModule } from "nativescript-ui-listview/angular";
import { DatePipe } from '@angular/common';
import { TraingCourseComponent } from './dashboard/training-course/training-course.component'
import { DetailsTreeComponent } from './dashboard/details-tree/details-tree.component';
import { PaymentSuccessComponent } from './payment/payment-success/payment-success.component';
import { PaymentFailedComponent } from './payment/payment-failed/payment-failed.component';
import { UpcomingComponent } from './my-products/upcoming/upcoming.component';

import { WebinarDetails } from './dashboard/webinar-Detail/webinar-details.component';
import { CoursePathDetails } from './dashboard/course-path-detail/course-path-details.component';
import { ContactUsComponent } from './settings/contact-us/contact-us.component';
import { HelpCenterComponent } from './settings/help-center/help-center.component';
import { KnowledgeEnrichmentDetails } from './dashboard/knowledge-enrichment-detail/ke-details.component';
import { KnowledgeEnrichmentComponent } from './dashboard/knowledge-enrichment/knowledge-enrich.component';
import { ChooseAccountComponent } from './account/choose-account/choose-account.component';
import { PurchaseFilterComponent } from './my-products/purchase-filter/purchase-filter.component';
import { BecomePartnerComponent } from './settings/become-partner/become-partner.component';
import { CorporateTrainingComponent } from './settings/corporate-training/corporate-training.component';
import { ModalComponent } from './settings/modal/modal.component';

import { NativeScriptDateTimePickerModule } from "@nativescript/datetimepicker/angular";
import { TrainingProgramListComponent } from './dashboard/training-program-list/training-program-list.component';
import { TraingProgramCardComponent } from './dashboard/training-program-card/training-program-card.component';
import { KeWebinarCardComponent } from './dashboard/ke-webinar-card/ke-webinar-card.component';
import { TraingPathCardComponent } from './dashboard/training-path-card/training-path-card.component';

import { HighlightedCardComponent } from './dashboard/highlighted-card/highlighted-card.component'
import { RegiserConfirmComponent } from './account/regiser-confirm/regiser-confirm.component';

import { InstructorProfileComponent } from './settings/instructor-profile/instructor-profile.component';
import { WebinarInstructorComponent } from './settings/webinar-instructor/Webinar-instructor.component';
import { CourseRatingModalComponent } from './dashboard/course-rating-modal/course-rating-modal.component';
import { SadadPopupComponent } from './payment/sadad-popup/sadad-popup.component';
import { KeFilterComponent } from './dashboard/ke-filter/ke-filter.component'
import { NativeScriptMaterialTabsModule } from "@nativescript-community/ui-material-tabs/angular";
import { NativeScriptMaterialSliderModule } from "@nativescript-community/ui-material-slider/angular";
import { WebinarFilterComponent } from './dashboard/webinar-filter/webinar-filter.component';
import { ProductFeedbackComponent } from './dashboard/product-feedback/product-feedback.component';
import { PriceTemplateComponent } from './dashboard/price-template/price-template.component';
import { SaudiDividerComponent } from './dashboard/saudi-divider/saudi-divider.component';
import { NativeScriptAnimationsModule } from "@nativescript/angular";

import { NativeScriptAnimatedCircleModule } from '@nativescript/animated-circle/angular';
import { CasesStudyComponent } from './dashboard/cases-study/cases-study.component';
import { CasesStudyDetailsComponent } from './dashboard/cases-study-details/cases-study-details.component'
import { TrainingResourcesCardComponent } from './dashboard/training-resources-card/training-resources-card.component';
import { InteractiveExercisesComponent } from './dashboard/interactive-exercises/interactive-exercises.component';
import { TrainingGameComponent } from './dashboard/training-game/training-game.component';
import { TrainingResourcesDetailComponent } from './dashboard/training-resources-detail/training-resources-detail.component';
import { SurveyComponent } from './dashboard/survey/survey.component';
import { SurveyModalComponent } from './dashboard/survey-modal/survey-modal.component';
import { InteractiveTrainingListComponent } from './dashboard/interactive-training/interactive-training-list/interactive-training-list.component';
import { InteractiveTrainingViewComponent } from './dashboard/interactive-training/interactive-training-view/interactive-training-view.component';
import { InteractiveTrainingFormComponent } from './dashboard/interactive-training/interactive-training-form/interactive-training-form.component';
import { InteractiveTrainingReportComponent } from './dashboard/interactive-training/interactive-training-report/interactive-training-report.component';
//import { NativeScriptUIChartModule } from "nativescript-ui-chart/angular";
import { DeletConfirmComponent } from './dashboard/interactive-training/delet-confirm/delet-confirm.component';
import { FinishingConfirmComponent } from './dashboard/interactive-training/finishing-confirm/finishing-confirm.component';
import { DigitalLibraryComponent } from './dashboard/digitalLibrary/digitalLibrary.component';
import { ReportingComponent } from './dashboard/Reporting/Reporting.component';
import { LocalizePipe } from './shared/pipes/localize.pipe';
import '@angular/compiler';



@NgModule({
  bootstrap: [AppComponent],
  imports: [NativeScriptModule, AppRoutingModule, TNSCheckBoxModule, DropDownModule, NativeScriptHttpClientModule, NativeScriptFormsModule, DropDownModule,
    ReactiveFormsModule, NativeScriptCommonModule, NativeScriptDateTimePickerModule, NativeScriptMaterialTabsModule,
    NativeScriptMaterialSliderModule, NativeScriptAnimatedCircleModule, NativeScriptAnimationsModule,
  ],

  declarations: [AppComponent, ItemsComponent, ItemDetailComponent, LoginComponent, LoginByMailComponent, OtpVerificationComponent, RegisterComponent, SplashScreenComponent, ForgotPasswordComponent, NewPasswordComponent,
    CategoriesComponent, DurationComponent, KnowledgeComponent, RegisterConfirmComponent, HighlightedComponent, ExploreComponent, SearchResultComponent, FilterComponent, CategoryComponent, TabNavigationComponent,
    TraingPathComponent, OnlineClassesComponent, AccountPageComponent, ProfileViewComponent, ProfileFormComponent, VideoSettingsComponent, DownloadSettingsComponent, ContentLanguageComponent, LearningReminderComponent,
    NotificationsComponent, AboutEthraiComponent, MyProductsComponent, FavoritesComponent, DownloadedComponent, BookmarksComponent, TraingCourseComponent, ChangePasswordComponent, ShoppingCartComponent, CheckoutComponent, CourseDetailsComponent,
    CertificatesComponent, PurchasesComponent, DetailsTreeComponent, PaymentSuccessComponent, PaymentFailedComponent, UpcomingComponent, WebinarDetails, HelpCenterComponent, ContactUsComponent, CoursePathDetails
    , KnowledgeEnrichmentDetails, KnowledgeEnrichmentComponent, ChooseAccountComponent, PurchaseFilterComponent, BecomePartnerComponent, CorporateTrainingComponent, ModalComponent, TraingProgramCardComponent, TrainingProgramListComponent, RegiserConfirmComponent, KeWebinarCardComponent, HighlightedCardComponent,
    TraingPathCardComponent, InstructorProfileComponent, WebinarInstructorComponent, CourseRatingModalComponent, SadadPopupComponent, KeFilterComponent, WebinarFilterComponent, ProductFeedbackComponent, PriceTemplateComponent, SaudiDividerComponent, CasesStudyComponent, CasesStudyDetailsComponent, TrainingResourcesCardComponent, InteractiveExercisesComponent, TrainingGameComponent, TrainingResourcesDetailComponent,
    SurveyComponent, SurveyModalComponent, InteractiveTrainingListComponent, InteractiveTrainingFormComponent, InteractiveTrainingViewComponent, InteractiveTrainingReportComponent, DeletConfirmComponent, DigitalLibraryComponent, FinishingConfirmComponent, ReportingComponent, LocalizePipe],


  providers: [
    GlobalService,
    HttpService,
    DatePipe,
    AuthGuard,
    FirebaseEventService,
    { provide: HTTP_INTERCEPTORS, useClass: ApiLoggingInterceptor, multi: true },
  ],//Printer],
  schemas: [NO_ERRORS_SCHEMA],
})
export class AppModule { }
