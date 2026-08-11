import { Component, OnInit } from '@angular/core';
import { SearchBar } from "@nativescript/core/ui/search-bar";
import { isAndroid, Page } from "@nativescript/core";
import { RouterExtensions } from '@nativescript/angular';
import { GlobalService } from '~/app/shared/services/global.service';
import { DashboardService } from '../dashboard.service';
import { isIOS } from "@nativescript/core";
import { FirebaseEventService } from '~/app/shared/services/firebase.event.service';
declare var UISearchBarStyle: any;
declare var UIImage: any;
import { TextField, Utils } from "@nativescript/core";

@Component({
    moduleId: module.id,
    selector: 'explore',
    templateUrl: './explore.component.html',
    styleUrls: ['./explore.component.css']
})

export class ExploreComponent implements OnInit {
    dialogOpen = false;
    //overlay_conf = false;
    overlay_conf = false;
    b_btn2 = false;
    searchPhrase: string;
    categories: any;
    courses: any;
    isLoading: boolean;
    webinars: any;
    isSearchLoading: boolean;
    kes: any;
    myTextField: any;
    constructor(private page: Page, private globalService: GlobalService, private router: RouterExtensions, private dashboardService: DashboardService,
        private firebaseEventService: FirebaseEventService) {
        page.actionBarHidden = true;
    }
    ngOnInit() {
        this.categories = this.globalService.getCategories();
        console.log(this.categories.length)
        this.getMostSearchedCourses();
        if (this.globalService.isLoggedIn && this.globalService.isEthrai) {
            this.firebaseEventService.logScreenViewedEvent(this.globalService.isLoggedIn, this.globalService.getUserStats(), 'explore_products', this.globalService.getUserProfile());

        } else if (!this.globalService.isLoggedIn) {
            this.firebaseEventService.logScreenViewedEvent(this.globalService.isLoggedIn, null, 'explore_products', null);

        }
    }
    showDialog() {
        this.dialogOpen = true;
    }
    overlay(e) {
        this.myTextField = e.object
        this.overlay_conf = true;
        this.b_btn2 = true;
        console.log("overlay(e)", this.overlay_conf)

    }

    closeDialog() {
        this.myTextField?.dismissSoftInput();
        this.dialogOpen = false;
        if (isIOS) {
            setTimeout(() => {
                this.overlay_conf = false;
            }, 100);
        } else {
            this.overlay_conf = false;
        }
        this.b_btn2 = false;
    }
    getMostSearchedCourses() {
        this.isLoading = true;
        this.dashboardService.getMostSearchedCourses(7).subscribe(
            res => {
                this.isLoading = false;
                this.courses = (res as any).courses.filter(course => course.isPublished)
            }
        )
    }

    onSubmit(args) {
        const searchBar = args.object as SearchBar;
        console.log(`Searching for ${searchBar.text}`);
        if (this.globalService.isEthrai || !this.globalService.isLoggedIn) {
            this.firebaseEventService.logInternalSearchEvent("explore_products", searchBar.text)
        }
        this.router.navigate(['search-result'], { state: { keyword: searchBar.text } });
    }
    showAll(keyword) {
        if (this.globalService.isEthrai || !this.globalService.isLoggedIn) {
            this.firebaseEventService.logInternalSearchEvent("explore_products", keyword)
        }
        this.router.navigate(['search-result'], { state: { keyword: keyword } });
    }
    getSearchSuggestions(e) {
        this.myTextField = e.object;
        this.isSearchLoading = true
        if (e.value) {
            this.dashboardService.getSearchSuggestions(e.value, 3).subscribe(
                res => {
                    this.isSearchLoading = false
                    this.courses = (res as any).courses;
                    this.webinars = (res as any).webinars;
                    this.kes = (res as any).kes

                    this.showDialog()
                }
            )
        } else {
            this.dialogOpen = false;
            this.overlay_conf = false;
            this.b_btn2 = false;
        }
    }

    clear() {
        this.myTextField?.dismissSoftInput();
        this.searchPhrase = "";
        this.dialogOpen = false;
        this.overlay_conf = false;
        this.b_btn2 = false;
    }


    /*    loadedSB(args) { 
           setTimeout(() => {
               if(isAndroid){
                   args.object.android.clearFocus();
               }
           }, 200)
           
       } */

    public searchBarLoaded(args) {
        let searchBar = <SearchBar>args.object
        if (isIOS) {
            var nativeSearchBar = searchBar.nativeView;
            nativeSearchBar.searchBarStyle = UISearchBarStyle.Prominent;
            nativeSearchBar.backgroundImage = UIImage.new();
        }
    }
    goToMostSearched(id, course) {
        if (!this.overlay_conf) {
            if (this.globalService.isEthrai || !this.globalService.isLoggedIn) {
                this.firebaseEventService.logCourseClickedEvent(this.globalService.isLoggedIn, this.globalService.getUserStats(),
                    "explore_products", this.globalService.getUserProfile(), course)
            }
            this.router.router.routeReuseStrategy.shouldReuseRoute = function () { return false };
            this.router.navigate(['/course-details', id]);
        }
    }
    goToCoursePage(id, course) {
        if (this.globalService.isEthrai || !this.globalService.isLoggedIn) {
            this.firebaseEventService.logCourseClickedEvent(this.globalService.isLoggedIn, this.globalService.getUserStats(),
                "explore_products", this.globalService.getUserProfile(), course)
        }
        this.router.router.routeReuseStrategy.shouldReuseRoute = function () { return false };
        this.router.navigate(['/course-details', id]);
    }
    goToWebinar(id, webinar) {
        if (this.globalService.isEthrai || !this.globalService.isLoggedIn) {
            this.firebaseEventService.logKeWebinarsClickedEvent(this.globalService.isLoggedIn, this.globalService.getUserStats(),
                "main_product_category", this.globalService.getUserProfile(), webinar, id, null)
        }
        this.router.navigate(['/webinar-details', id]);
    }
    goToKe(id, ke) {
        if (this.globalService.isEthrai || !this.globalService.isLoggedIn) {
            this.firebaseEventService.logKeWebinarsClickedEvent(this.globalService.isLoggedIn, this.globalService.getUserStats(),
                "main_product_category", this.globalService.getUserProfile(), ke, id, 'knowledge enrichment')
        }
        this.router.navigate(['/ke-details', id]);
    }
    goToCategory(id, nameAr) {
        console.log("this.overlay_conf", this.overlay_conf)
        if (!this.overlay_conf) {
            this.router.navigate(["/category", id, nameAr])
        }
    }
}