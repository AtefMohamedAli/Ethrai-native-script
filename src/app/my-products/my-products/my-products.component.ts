import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { ScrollView, SearchBar, StackLayout, Screen, isAndroid } from '@nativescript/core';
import { Page } from '@nativescript/core';
import { RouterExtensions } from '@nativescript/angular';
import { MyProductsService } from '../my-products.service';
import { Category } from '../../shared/models/category';
import { GlobalService } from '../../shared/services/global.service';
import { EnrolledCourse } from '../../shared/models/enrolled-course';
import { EnrolledCoursePath } from '../../shared/models/enrolled-course-path';
import { EnrolledWebinar } from '../../shared/models/enrolled-webinar';
import { SearchFilter } from '../../shared/models/search-filter';
import { isIOS } from "@nativescript/core";
import { DashboardService } from '~/app/dashboard/dashboard.service';
import { localize } from '@nativescript/localize';
import { FirebaseEventService } from '~/app/shared/services/firebase.event.service';
import { map, mergeMap } from 'rxjs/operators';
import { Observable, forkJoin } from 'rxjs';
declare var UISearchBarStyle: any;
declare var UIImage: any;

@Component({
    moduleId: module.id,
    selector: 'my-products',
    templateUrl: './my-products.component.html',
    styleUrls: ['./my-products.component.css']
})

export class MyProductsComponent implements OnInit {
    @ViewChild('scroll', { static: false }) scrollView: ScrollView;
    @ViewChild('st', { static: false }) st: StackLayout;

    searchPhrase: string;
    categories: Category[];
    categoriesNames: string[] = [];
    isLoading: boolean;
    isLoggedIn: boolean;
    myCoursePaths: EnrolledCoursePath[];
    myCourses: EnrolledCourse[];
    //myCourses: any[];
    tempCoursePaths: EnrolledCoursePath[];
    tempCourses: EnrolledCourse[];
    myWebinars: any[];
    tempWebinars: any[];
    filter: SearchFilter;
    myKes: any[];
    tempKes: any[];
    Math
    upComingWebinars: EnrolledWebinar[];
    isLoadingWebinars: boolean;
    dialogOpen = false;
    // Intl removed - not available on iOS
    intl = { format: (n) => String(n) }; // Intl polyfill for iOS
    productsCount: number = 0;
    myCasesStudy: any[];
    constructor(private page: Page, private router: RouterExtensions, private myProductsService: MyProductsService,
        private globalService: GlobalService, private dashboardService: DashboardService, private firebaseEventService: FirebaseEventService) {
        //page.actionBarHidden = true;
        this.Math = Math

    }
    clear() {
        this.searchPhrase = "";
        this.myCourses = this.tempCourses;
        this.myCoursePaths = this.tempCoursePaths;
        this.myWebinars = this.tempWebinars;
        this.myKes = this.tempKes
        this.dialogOpen = false
    }
    ngOnInit() {
        this.isLoggedIn = this.globalService.isLoggedIn;
        if (this.isLoggedIn) {
            this.filter = this.globalService.getMyProductsFilter();
            if (this.globalService.isEthrai) {
                this.firebaseEventService.logScreenViewedEvent(this.globalService.isLoggedIn, this.globalService.getUserStats(), 'my_products', this.globalService.getUserProfile());
            }
            if (this.filter == undefined) {
                this.getEnrolledCourses();
                this.getEnrolledCoursePaths();
                this.getEnrolledWebinars();
                this.getEnrolledKes();
                this.getMyCasesStudy()
            } else {
                let productType: string = this.filter.productTypes?.some(item => item.isChecked) ? this.filter.productTypes.find(x => x.isChecked).value : undefined
                if (productType) {
                    if (productType == 'trainingProgram') {
                        this.getFilteredCourses();
                    } else if (productType == 'webinar') {
                        this.getFilteredWebinars();
                    } else if (productType == 'coursePath') {
                        this.getFilteredCoursePaths()
                    } else if (productType == 'ke') {
                        this.getUserFilteredKes();
                    }
                    else if (productType == 'CASESESTUDY') {
                        this.getMyCasesStudy();
                    }
                } else {
                    this.getFilteredCourses();
                    this.getFilteredCoursePaths();
                    this.getFilteredWebinars();
                    this.getUserFilteredKes();
                }
            }
        } else {
            this.firebaseEventService.logScreenViewedEvent(this.isLoggedIn, null, 'my_products', null);
        }
        this.getAllCategories();
    }
    goToWebinarsPage(id, webinars) {
        if (this.globalService.isEthrai || !this.globalService.isLoggedIn) {
            this.firebaseEventService.logKeWebinarsClickedEvent(this.globalService.isLoggedIn, this.globalService.getUserStats(),
                "my_products", this.globalService.getUserProfile(), webinars, id, null)
        }
        this.router.navigate(['/webinar-details', id]);
    }
    goToKePage(id, ke) {
        if (this.globalService.isEthrai || !this.globalService.isLoggedIn) {
            this.firebaseEventService.logKeWebinarsClickedEvent(this.globalService.isLoggedIn, this.globalService.getUserStats(),
                "my_products", this.globalService.getUserProfile(), ke, id, 'knowledge enrichment')
        }
        this.router.navigate(['/ke-details', id]);
    }
    getMyCasesStudy() {
        this.isLoading = true
        /*this.dashboardService.getMyCasesStudy().subscribe(
          res=>{
  
              console.log('casesStudy',res)
              this.myCasesStudy=(res as any[])
              if(this.myCasesStudy?.length){
                  this.productsCount+=this.myCasesStudy.length
              }		}
      ).add(()=>{
          this.isLoading=false})*/
        this.getCaseStudyDataWithRatings().subscribe(res => {
            this.isLoading = false
            this.myCasesStudy = (res as any[])
            if (this.myCasesStudy?.length && this.filter == undefined) {
                this.productsCount += this.myCasesStudy.length
            }
        })
    }
    getCaseStudyDataWithRatings() {
        this.isLoading = true
        return this.dashboardService.getMyCasesStudy().pipe(
            mergeMap((caseStudyData: any[]) => {

                const requests = caseStudyData.map(item => this.dashboardService.GetStudyPlanRating(item.id).pipe(
                    map((ratingResponse: any) => {
                        return ratingResponse ? ratingResponse : { rating: 0, numberOfRatings: 0 };
                    })
                ));
                return forkJoin(requests).pipe(
                    map((ratings: any[]) => {
                        return caseStudyData.map((item, index) => {
                            return { ...item, ratings: ratings[index] };
                        });
                    })
                );
            })
        );
    }
    goToCasesStudy(id) {
        this.router.navigate(['/training-resources-detail', id, 'CASESESTUDY'])
    }
    getEnrolledKes() {
        return this.myProductsService.getWatchedKes().toPromise().then(
            response => {
                this.isLoading = false;
                setTimeout(() => {
                    this.myKes = response as any[];
                    if (this.myKes?.length) {
                        this.productsCount += this.myKes.length
                    }
                    this.tempKes = this.myKes
                }, 1500);


            },

            err => {

            }
        )
    }

    getUserFilteredKes() {
        let options = { minRating: this.filter.rating?.some(item => item.isChecked) ? this.filter.rating.find(x => x.isChecked).rate : 0 }

        return this.myProductsService.getFilteredKes(options).toPromise().then(
            response => {
                this.isLoading = false;
                this.myKes = response as any[]
                if (this.filter?.sortType == 'earlier') {
                    this.myKes?.sort(this.sortByDateAsc);
                } else {
                    this.myKes?.sort(this.sortByDateDesc)

                }
            },

            err => {

            }
        )
    }
    ngAfterViewInit() {
        let x = (this.scrollView as any).nativeElement
        // console.log("screen heighttt",x.scrollableHeight,Screen.mainScreen.heightDIPs)
        x.scrollToVerticalOffset(x.scrollableHeight, true)
        // x.scrollToVerticalOffset(x.getLocationRelativeTo((this.st as any).nativeElement).y, true);   
    }
    loadedSB(args) {
        setTimeout(() => {
            if (isAndroid) {
                args.object.android.clearFocus();
            }
        }, 200)

    }
    onSubmit(args) {
        const searchBar = args.object as SearchBar;
        if (isAndroid) {
            args.object.android.clearFocus();
        }
        if (this.globalService.isEthrai) {
            this.firebaseEventService.logInternalSearchEvent("my_products", searchBar.text)
        }
        //this.router.navigate(['search-result'],{state:{keyword:searchBar.text}});
        let keyword = searchBar.text.toLowerCase();
        this.myCourses = this.myCourses?.filter(product => {
            if (product.nameAr.toLowerCase().includes(keyword) || product.nameEn.toLowerCase().includes(keyword)) {
                return product;
            }
        });
        this.myCoursePaths = this.myCoursePaths?.filter(product => {
            if (product.nameAr.toLowerCase().includes(keyword) || product.nameEn.toLowerCase().includes(keyword)) {
                return product;
            }
        });
        this.myWebinars = this.myWebinars?.filter(product => {
            if (product.nameAr.toLowerCase().includes(keyword) || product.nameEn.toLowerCase().includes(keyword)) {
                return product;
            }
        });
        this.myKes = this.myKes?.filter(product => {
            if (product.nameAr.toLowerCase().includes(keyword) || product.nameEn.toLowerCase().includes(keyword)) {
                return product;
            }
        });
        this.myCasesStudy = this.myCasesStudy?.filter(product => {
            if (product.nameAr.toLowerCase().includes(keyword) || product.nameEn.toLowerCase().includes(keyword)) {
                return product;
            }
        });
        // this.scrollView.scrollToVerticalOffset(this.scrollView.scrollableHeight,true)

    }

    onTextChanged(e) {
        if (e.value) {
            this.dialogOpen = true
        } else {
            this.clear()
        }
    }

    onClear(args) {

        this.myCourses = this.tempCourses;
        this.myCoursePaths = this.tempCoursePaths;
        this.myWebinars = this.tempWebinars;
        this.myKes = this.tempKes
    }

    public searchBarLoaded(args) {
        let searchBar = <SearchBar>args.object
        if (isIOS) {
            var nativeSearchBar = searchBar.nativeView;
            nativeSearchBar.searchBarStyle = UISearchBarStyle.Prominent;
            nativeSearchBar.backgroundImage = UIImage.new();
        }
    }

    getFilteredCourses() {
        this.isLoading = true;
        let selectedRating: number = this.filter.rating?.some(item => item.isChecked) ? this.filter.rating.find(x => x.isChecked).rate : 0
        let priceCategory: string = this.filter.priceTypes?.some(item => item.isChecked) ? this.filter.priceTypes.find(x => x.isChecked).value : "All"
        let duration = this.filter.durations.some(item => item.isChecked) ? this.filter.durations.find(x => x.isChecked) : undefined
        let options = {
            minRating: selectedRating,
            pricingType: priceCategory,
            minHours: duration ? duration.min : 0,
            maxHours: duration ? duration.max : 10000,
            levels: this.filter.levels.length ? this.filter.levels.length : []
        }
        return this.myProductsService.getUserFilteredCourses(options).toPromise().then(
            response => {
                this.isLoading = false;
                this.myCourses = response as EnrolledCourse[]
                if (this.filter?.sortType == 'earlier') {
                    this.myCourses.sort(this.sortByDateAsc);
                } else {
                    this.myCourses.sort(this.sortByDateDesc)

                }
            },

            err => {

            }
        )
    }
    getFilteredCoursePaths() {
        this.isLoading = true;
        let options = {
            minRating: this.filter.rating?.some(item => item.isChecked) ? this.filter.rating.find(x => x.isChecked).rate : 0,
            pricingType: this.filter.priceTypes?.some(item => item.isChecked) ? this.filter.priceTypes.find(x => x.isChecked).value : 'All'
        }

        return this.myProductsService.getUserFilteredCoursePaths(options).toPromise().then(
            response => {
                this.isLoading = false;
                this.myCoursePaths = response as EnrolledCoursePath[]
                this.tempCoursePaths = this.myCoursePaths;
                if (this.filter?.sortType == 'earlier') {
                    this.myCoursePaths.sort(this.sortByDateAsc);
                } else {
                    this.myCoursePaths.sort(this.sortByDateDesc)

                }
            },

            err => {

            }
        )
    }
    getFilteredWebinars() {
        this.isLoadingWebinars = true;
        let options = { minRating: this.filter.rating?.some(item => item.isChecked) ? this.filter.rating.find(x => x.isChecked).rate : 0 }

        return this.myProductsService.getUserFilteredWebinars(options).toPromise().then(
            response => {
                this.isLoadingWebinars = false;
                this.myWebinars = response as EnrolledWebinar[];
                this.upComingWebinars = this.myWebinars.filter(webinar => {
                    let endtDate = Date.parse(webinar.endDate);
                    let now = Date.parse(new Date().toString());
                    if (now < endtDate) {
                        return webinar;
                    }

                })
                this.tempWebinars = this.myWebinars;
                if (this.filter?.sortType == 'earlier') {
                    this.myWebinars?.sort(this.sortByDateAsc);
                } else {
                    this.myWebinars?.sort(this.sortByDateDesc)

                }
            },

            err => {

            }
        )
    }

    getEnrolledCourses() {
        this.isLoading = true;
        return this.myProductsService.getUserEnrolledCourses().toPromise().then(
            response => {
                this.isLoading = false;
                this.myCourses = response as EnrolledCourse[];
                if (this.myCourses?.length) {
                    this.productsCount += this.myCourses.length
                }
                this.tempCourses = this.myCourses;


            },

            err => {

            }
        )
    }
    getEnrolledCoursePaths() {
        this.isLoading = true;
        return this.myProductsService.getUserEnrolledCoursePaths().toPromise().then(
            response => {
                this.isLoading = false;
                this.myCoursePaths = response as EnrolledCoursePath[];
                if (this.myCoursePaths?.length) {
                    this.productsCount += this.myCoursePaths.length
                }
            },

            err => {

            }
        )
    }
    getEnrolledWebinars() {
        this.isLoadingWebinars = true;
        return this.myProductsService.getUserEnrolledWebinars().toPromise().then(
            response => {
                this.isLoadingWebinars = false;
                this.myWebinars = response as EnrolledWebinar[];
                if (this.myWebinars?.length) {
                    this.productsCount += this.myWebinars.length
                }
                this.tempWebinars = this.myWebinars;
                this.upComingWebinars = (response as EnrolledWebinar[]).filter(webinar => {
                    let endtDate = Date.parse(webinar.endDate);
                    let now = Date.parse(new Date().toString());
                    if (now < endtDate) {
                        return webinar;
                    }

                })
                console.log("this.upComingWebinars ", this.upComingWebinars.length)
            },

            err => {

            }
        )
    }
    getAllCategories() {
        this.categories = this.globalService.getCategories();
    }
    sortByDateDesc(a, b) {
        let aDate;
        let bDate;
        if (a.publishDate) {
            aDate = Date.parse(a.publishDate)
            bDate = Date.parse(b.publishDate)
        } else if (a.startDate) {
            aDate = Date.parse(a.startDate)
            bDate = Date.parse(b.startDate)
        }

        if (aDate > bDate) {
            return -1;
        }
        if (aDate < bDate) {
            return 1;
        }
        return 0;
    }
    sortByDateAsc(a, b) {
        let aDate;
        let bDate;
        if (a.publishDate) {
            aDate = Date.parse(a.publishDate)
            bDate = Date.parse(b.publishDate)
        } else if (a.startDate) {
            aDate = Date.parse(a.startDate)
            bDate = Date.parse(b.startDate)
        }
        if (aDate < bDate) {
            return -1;
        }
        if (aDate > bDate) {
            return 1;
        }
        return 0;
    }

    setFavoriteP(id, type, isFav: boolean, i) {
        if (this.globalService.isLoggedIn) {
            let payload = {
                "productId": id,
                "type": type
            }
            if (!isFav) {
                this.dashboardService.setFavoriteProducts(payload).subscribe(
                    res => {
                        if ((res as any).success) {
                            this.myCourses[i].isFavorite = true;
                            this.globalService.toast(localize('FavAdded'))

                        }
                    },
                    err => {

                    }
                )
            } else {
                this.dashboardService.removeFavoriteProducts(payload).subscribe(
                    res => {
                        this.myCourses[i].isFavorite = false;
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
    getUpcommingWebinar() {
        this.isLoading = true;
        this.myProductsService.getUserEnrolledWebinars().subscribe(
            response => {
                this.isLoading = false;
                this.upComingWebinars = (response as EnrolledWebinar[]).filter(webinar => {
                    let endtDate = Date.parse(webinar.endDate);
                    let now = Date.parse(new Date().toString());
                    if (now < endtDate) {
                        return this.upComingWebinars;
                    }

                })
            },

            err => {

            }
        )
    }
    setFavoriteW(id, type, isFav: boolean, i) {
        console.log('ll', this.myWebinars[i], isFav)

        if (this.globalService.isLoggedIn) {
            let payload = {
                "productId": id,
                "type": type
            }
            if (!isFav) {
                this.dashboardService.setFavoriteProducts(payload).subscribe(
                    res => {
                        if ((res as any).success) {
                            this.myWebinars[i].isFavorite = true;
                            this.globalService.toast(localize('FavAdded'))

                        }
                    },
                    err => {

                    }
                )
            } else {
                this.dashboardService.removeFavoriteProducts(payload).subscribe(
                    res => {
                        this.myWebinars[i].isFavorite = false;
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
    setFavoriteK(id, type, isFav: boolean, i) {
        console.log('ll', this.myKes[i], isFav)
        if (this.globalService.isLoggedIn) {
            let payload = {
                "productId": id,
                "type": type
            }
            if (!isFav) {
                this.dashboardService.setFavoriteProducts(payload).subscribe(
                    res => {
                        if ((res as any).success) {
                            this.myKes[i].isFavorite = true;
                            this.globalService.toast(localize('FavAdded'))

                        }
                    },
                    err => {

                    }
                )
            } else {
                this.dashboardService.removeFavoriteProducts(payload).subscribe(
                    res => {
                        this.myKes[i].isFavorite = false;
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
    goToCoursePage(id, course) {
        if (this.globalService.isEthrai) {
            this.firebaseEventService.logMyProductsCourseClickedEvent(this.globalService.isLoggedIn, this.globalService.getUserStats(),
                "my_products", this.globalService.getUserProfile(), course)
        }
        this.router.router.routeReuseStrategy.shouldReuseRoute = function () { return false };
        this.router.navigate(['/course-details', id]);
    }
}