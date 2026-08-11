import { NgModule } from '@angular/core'
import { Routes } from '@angular/router'
import { NativeScriptRouterModule } from '@nativescript/angular'

import { ItemsComponent } from './item/items.component'
import { ItemDetailComponent } from './item/item-detail.component'
import { LoginComponent } from './account/login/login.component';
import { LoginByMailComponent } from './account/login-by-mail/login-by-mail.component';
import { RegisterComponent } from './account/register/register.component';
import { SplashScreenComponent } from './account/splash-screen/splash-screen.component';
import { ForgotPasswordComponent } from './account/forgot-password/forgot-password.component';
import { NewPasswordComponent } from './account/new-password/new-password.component';
import { CategoriesComponent } from './onboarding/categories/categories.component';
import { DurationComponent } from './onboarding/duration/duration.component';
import { KnowledgeComponent } from './onboarding/knowledge/knowledge.component';
import { RegisterConfirmComponent } from './onboarding/register-confirm/register-confirm.component';
import { HighlightedComponent } from './dashboard/highlighted/highlighted.component';

import {AuthGuard}  from './shared/services/auth.guard'
import { ExploreComponent } from './dashboard/explore/explore.component'
import { SearchResultComponent } from './dashboard/search-result/search-result.component';
import { FilterComponent } from './dashboard/filter/filter.component';
import { CategoryComponent } from './dashboard/category/category.component';
import { TabNavigationComponent } from './dashboard/tab-navigation/tab-navigation.component';
import { TraingPathComponent } from './dashboard/traing-path/traing-path.component'
import { OnlineClassesComponent } from './dashboard/online-classes/online-classes.component'
import { AccountPageComponent } from './account/account-page/account-page.component';
import { ProfileViewComponent } from './account/profile-view/profile-view.component';
import { ProfileFormComponent } from './account/profile-form/profile-form.component';
import { VideoSettingsComponent } from './settings/video-settings/video-settings.component';
import { DownloadSettingsComponent } from './settings/download-settings/download-settings.component';
import { ContentLanguageComponent }from './settings/content-language/content-language.component';
import { LearningReminderComponent } from './settings/learning-reminder/learning-reminder.component';
import { NotificationsComponent } from './settings/notifications/notifications.component';
import { AboutEthraiComponent } from './settings/about-ethrai/about-ethrai.component'
import { MyProductsComponent } from './my-products/my-products/my-products.component';
import { FavoritesComponent } from './my-products/favorites/favorites.component';
import { DownloadedComponent } from './my-products/downloaded/downloaded.component';
import { BookmarksComponent } from './my-products/bookmarks/bookmarks.component';
import { TraingCourseComponent } from './dashboard/training-course/training-course.component'
import { ChangePasswordComponent } from './account/change-password/change-password.component'
import { ShoppingCartComponent } from './payment/shopping-cart/shopping-cart.component';
import { CheckoutComponent } from './payment/checkout/checkout.component';
import { CourseDetailsComponent } from './dashboard/course-details/course-details.component';
import { CertificatesComponent } from './my-products/certificates/certificates.component';
import { PurchasesComponent } from './my-products/purchases/purchases.component';
import { PaymentSuccessComponent } from './payment/payment-success/payment-success.component';
import { PaymentFailedComponent } from './payment/payment-failed/payment-failed.component';
import { UpcomingComponent } from './my-products/upcoming/upcoming.component';
import { ContactUsComponent } from './settings/contact-us/contact-us.component';
import { HelpCenterComponent } from './settings/help-center/help-center.component';
import { WebinarDetails } from './dashboard/webinar-Detail/webinar-details.component'
import { CoursePathDetails } from './dashboard/course-path-detail/course-path-details.component'
import { KnowledgeEnrichmentDetails } from './dashboard/knowledge-enrichment-detail/ke-details.component'
import { KnowledgeEnrichmentComponent } from './dashboard/knowledge-enrichment/knowledge-enrich.component'
import { ChooseAccountComponent } from './account/choose-account/choose-account.component';
import { PurchaseFilterComponent } from './my-products/purchase-filter/purchase-filter.component';
import { BecomePartnerComponent } from './settings/become-partner/become-partner.component';
import { CorporateTrainingComponent } from './settings/corporate-training/corporate-training.component';
import { RegiserConfirmComponent } from './account/regiser-confirm/regiser-confirm.component';
import { ModalComponent } from './settings/modal/modal.component'
import { TraingProgramCardComponent } from './dashboard/training-program-card/training-program-card.component'
import { TrainingProgramListComponent } from './dashboard/training-program-list/training-program-list.component'

import { HighlightedCardComponent } from './dashboard/highlighted-card/highlighted-card.component'

import { InstructorProfileComponent } from './settings/instructor-profile/instructor-profile.component';
import { WebinarInstructorComponent } from './settings/webinar-instructor/Webinar-instructor.component';
import { CourseRatingModalComponent } from './dashboard/course-rating-modal/course-rating-modal.component';
import {KeFilterComponent} from './dashboard/ke-filter/ke-filter.component'
import {WebinarFilterComponent} from './dashboard/webinar-filter/webinar-filter.component'
import {CasesStudyComponent} from './dashboard/cases-study/cases-study.component'

import {CasesStudyDetailsComponent} from './dashboard/cases-study-details/cases-study-details.component'
import { TrainingGameComponent } from './dashboard/training-game/training-game.component'
import { InteractiveExercisesComponent } from './dashboard/interactive-exercises/interactive-exercises.component'
import { TrainingResourcesDetailComponent } from './dashboard/training-resources-detail/training-resources-detail.component'
import {InteractiveTrainingListComponent} from './dashboard/interactive-training/interactive-training-list/interactive-training-list.component';
import {InteractiveTrainingViewComponent} from './dashboard/interactive-training/interactive-training-view/interactive-training-view.component';
import {InteractiveTrainingFormComponent} from './dashboard/interactive-training/interactive-training-form/interactive-training-form.component';
import {InteractiveTrainingReportComponent} from './dashboard/interactive-training/interactive-training-report/interactive-training-report.component';
import {DigitalLibraryComponent} from './dashboard/digitalLibrary/digitalLibrary.component';

import {ReportingComponent} from './dashboard/Reporting/Reporting.component';


const routes: Routes = [
  // { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: '', component:HighlightedComponent, pathMatch: 'full' ,canActivate:[AuthGuard]},
  { path: 'splash', component: SplashScreenComponent },
  { path: 'login', component: LoginComponent },
  { path: 'login-by-mail', component: LoginByMailComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'forgot-password', component: ForgotPasswordComponent },
  { path: 'new-password', component: NewPasswordComponent },
  { path: 'categories', component: CategoriesComponent },
  { path: 'duration', component: DurationComponent },
  { path: 'knowledge', component: KnowledgeComponent },
  { path: 'register-confirm', component: RegisterConfirmComponent },
  { path: 'highlighted', component: HighlightedComponent },
  { path: 'explore', component: ExploreComponent },
  { path: 'search-result', component: SearchResultComponent },
  { path: 'filter/:type', component: FilterComponent },
  { path: 'category/:id/:categoryNameAr', component: CategoryComponent },
  { path: 'traing-path/:id/:categoryNameAr', component: TraingPathComponent },
  { path: 'online-classes/:id/:categoryNameAr', component: OnlineClassesComponent },
  { path: 'online-classes', component: OnlineClassesComponent },

  { path: 'account', component: AccountPageComponent },
  { path: 'profile-view', component: ProfileViewComponent },
  { path: 'profile-form/:email', component: ProfileFormComponent },
  { path: 'video-settings', component: VideoSettingsComponent },
  { path: 'download-settings', component: DownloadSettingsComponent },
  { path: 'content-language', component: ContentLanguageComponent },
  { path: 'learning-reminder', component: LearningReminderComponent },
  { path: 'notifications', component: NotificationsComponent },
  { path: 'about-ethrai', component: AboutEthraiComponent },
  { path: 'my-products', component: MyProductsComponent },
  { path: 'favorites', component: FavoritesComponent },
  { path: 'downloaded', component: DownloadedComponent },
  { path: 'bookmarks', component: BookmarksComponent },
  { path: 'training-course/:id/:categoryNameAr', component: TraingCourseComponent},
  { path: 'change-password', component: ChangePasswordComponent },
  { path: 'shopping-cart', component: ShoppingCartComponent },
  { path: 'checkout/:coupon', component: CheckoutComponent },
  { path: 'course-details/:courseId', component: CourseDetailsComponent },
  { path: 'certificates', component: CertificatesComponent },
  { path: 'purchases', component: PurchasesComponent },
  { path: 'payment-success', component: PaymentSuccessComponent },
  { path: 'payment-failed', component: PaymentFailedComponent },
  { path: 'upcoming', component: UpcomingComponent },
  { path: 'contactus', component: ContactUsComponent },
  { path: 'helpcenter', component: HelpCenterComponent }, 
  { path: 'webinar-details/:webinarId', component: WebinarDetails },
  { path: 'course-path-details/:pathId', component: CoursePathDetails },
  { path: 'ke-details/:keId', component: KnowledgeEnrichmentDetails },
  { path: 'kes/:id/:categoryNameAr', component: KnowledgeEnrichmentComponent},
  { path: 'choose-account', component: ChooseAccountComponent },
  { path: 'purchase-filter/:purchasesCount', component: PurchaseFilterComponent },
  { path: 'become-partner', component: BecomePartnerComponent },
  { path: 'corporate-training', component: CorporateTrainingComponent },
  { path: 'regiser-confirm/:email', component: RegiserConfirmComponent },

  { path: 'modal', component: ModalComponent },
  { path: 'traing-program-card', component: TraingProgramCardComponent },
  { path: 'training-program-list/:title', component: TrainingProgramListComponent },
  { path: 'highlighted-card', component: HighlightedCardComponent },
  { path: 'instructor/:instructorId', component:  InstructorProfileComponent},
  { path: 'WebinarInstructor/:WebinarInstructorId', component:  WebinarInstructorComponent},
  { path: 'courseRating', component: CourseRatingModalComponent },

  { path: 'course-details/:courseId/:detailId', component: CourseDetailsComponent },
  {path:'ke-filter' , component:KeFilterComponent},
  {path:'webinar-filter', component:WebinarFilterComponent},

  {path:'cases-study', component:CasesStudyComponent},
  {path:'cases-study-details', component:CasesStudyDetailsComponent},

  {path:'training-game', component:TrainingGameComponent},
  {path:'training-game-details', component:CasesStudyDetailsComponent},

  {path:'interactive-exercises', component:InteractiveExercisesComponent},
  {path:'interactive-exercises-details', component:CasesStudyDetailsComponent},
  { path: 'training-resources-detail/:detailsId', component: TrainingResourcesDetailComponent },

  {path:'interactive-training-list', component:InteractiveTrainingListComponent},
  {path:'interactive-training-form', component:InteractiveTrainingFormComponent},
  {path:'interactive-training-form/:id', component:InteractiveTrainingFormComponent},

  {path:'interactive-training-view', component:InteractiveTrainingViewComponent},
  {path:'interactive-training-report', component:InteractiveTrainingReportComponent},
  {path:'interactive-training-view/:detailsId', component:InteractiveTrainingViewComponent},
  {path:'interactive-training-report/:detailsId', component:InteractiveTrainingReportComponent},

 
  { path: 'training-resources-detail/:detailsId/:type', component: TrainingResourcesDetailComponent },

  {path:'DigitalLibrary', component:DigitalLibraryComponent},
  {path:'DigitalLibrary/:type', component:DigitalLibraryComponent},

  { path: 'Reporting/:detailsId/:type', component: ReportingComponent },

  


]

@NgModule({
  imports: [NativeScriptRouterModule.forRoot(routes)],
  exports: [NativeScriptRouterModule],
})
export class AppRoutingModule {}
