import { Component, OnInit } from '@angular/core';
import { SearchBar } from '@nativescript/core';
import { Page } from '@nativescript/core';
import { RouterExtensions } from '@nativescript/angular';
import { Frame } from '@nativescript/core';
import { isIOS, isAndroid } from '@nativescript/core';
import { ListViewEventData } from 'nativescript-ui-listview';
import { GlobalService } from '../../shared/services/global.service';
import { MyProductsService } from '../my-products.service';
import { FirebaseEventService } from '~/app/shared/services/firebase.event.service';
import { DashboardService } from '~/app/dashboard/dashboard.service';
import { localize } from '@nativescript/localize';

declare var UISearchBarStyle: any;
declare var UIImage: any;

@Component({
	moduleId: module.id,
	selector: 'bookmarks',
	templateUrl: './bookmarks.component.html',
	styleUrls: ['./bookmarks.component.css']
})

export class BookmarksComponent implements OnInit {

	searchPhrase: string;
    clickedd = {}; s;
    categories: any;
    subCategories: any;
    bookmarks: any;
    tempBookmarks: any;
    selectedCourseId: any;
    args: any;
    dialogOpen=false

	constructor(private page: Page,private router:RouterExtensions,private globalService:GlobalService,private myProductsService:MyProductsService,
        private firebaseEventService:FirebaseEventService,private dashboardService:DashboardService) { 
		//page.actionBarHidden = true;

	 }
	 goBack() {
		
		Frame.topmost().goBack();
	
	  }

      templateSelector(item: any, index: number, items: any): string {
        if (index == 0) {
            return !item.expanded ? 'expanded' : 'default';
        }
        return item.expanded ? 'expanded' : 'default';
    }

  
    clickme(item) {
        this.clickedd = item;
    }
    uclickme(item) {
        this.clickedd = {};
    }
  
    filterBokkmarks(courseId){
        this.selectedCourseId=courseId;
        if(courseId=='0'){
            this.bookmarks=this.tempBookmarks;
        }else{
            this.bookmarks=this.tempBookmarks.filter(bookmark=>{
                if(bookmark.courseId==courseId){
                    return bookmark;
                }
            })
        }
    }

	ngOnInit() {
        this.selectedCourseId='0';
        this.getAllCategories();
        this.getSubCategories();
        this.getBookmarks();
        if(this.globalService.isEthrai){
            this.firebaseEventService.logScreenViewedEvent(this.globalService.isLoggedIn,this.globalService.getUserStats(),'bookmarks',this.globalService.getUserProfile());
        }
     }

     getAllCategories(){
		this.categories=this.globalService.getCategories();
	 }

     getSubCategories(){
         if(this.globalService.isEthrai){
            this.subCategories=this.globalService.getSubCategories();
         }else{
            this.subCategories=this.globalService.getSubCategories().filter(category=>category.isEthraiOnly==false)
         }
	 }

	onSubmit(args) {
        this.selectedCourseId=""
        const searchBar = args.object as SearchBar;
        args.object.dismissSoftInput();
        if(this.globalService.isEthrai){
            this.firebaseEventService.logInternalSearchEvent("bookmarks",searchBar.text)
        }
        let keyword=searchBar.text.toLowerCase();
     //   this.router.navigate(['search-result'],{state:{keyword:searchBar.text}});
        this.bookmarks=this.tempBookmarks?.filter(item=>{
            if(item.courseNameAr.toLowerCase().includes(keyword) ||item.courseNameEn.toLowerCase().includes(keyword)){
                return item;
            }
        });
    }

    onTextChanged(e) {
        if(e.value){
            this.dialogOpen=true
        }else{
            this.onClear()
        }
    }

    onClear() {
        this.dialogOpen=false
        this.searchPhrase=""
        this.bookmarks=this.tempBookmarks;
        this.selectedCourseId="0";
    }

    getBookmarks(){
        this.myProductsService.getBookMarks().subscribe(
            response=>{

                this.bookmarks=response as any[];
                this.tempBookmarks=this.bookmarks;
            },
            err=>{

            }
        )
    }
    goToCourse(courseId,detailId){
        this.router.navigate(['/course-details',courseId,detailId])
    }
    
    removeBookMark(bookmark,courseindex,bookmarkIndex){
            this.dashboardService.removeBookMark(bookmark.courseDetailId).subscribe(
                res=>{
                    if((res as any)?.success){
                        this.bookmarks[courseindex].bookmarks.splice(bookmarkIndex,1);
                        if(this.bookmarks[courseindex].bookmarks.length==0){
                            this.bookmarks.splice(courseindex,1)
                        }
                        this.globalService.toast(localize('BookmarkRemoved'))
                    }
                },
                err=>{
                    console.log(err)
                }
            )
    }
}