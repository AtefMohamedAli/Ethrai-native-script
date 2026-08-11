import { Component, Input, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { isIOS, Page,isAndroid ,Screen} from '@nativescript/core';
import { Frame } from '@nativescript/core';
import { localize } from '@nativescript/localize';
import { LoadOnDemandListViewEventData, RadListView } from 'nativescript-ui-listview';
import { FirebaseEventService } from '~/app/shared/services/firebase.event.service';
import { GlobalService } from '~/app/shared/services/global.service';
import { ProductBriefDetail } from '../../shared/models/product-brief-detail';
import { ProductsDetail } from '../../shared/models/products-detail';
import { ProductsSearchOptions } from '../../shared/models/products-search-options';
import { DashboardService } from '../dashboard.service';

@Component({
	moduleId: module.id,
	selector: 'training-program-list',
	templateUrl: './training-program-list.component.html',
	styleUrls: ['./training-program-list.component.css']
})

export class TrainingProgramListComponent implements OnInit {
	isLoading: boolean;
	pageSize: number;
	courses: any;
	title: string;
	customTitle: string;
	pageIndex: number;
	size: number;
	allCourses: any[];
	isSourceHasElements: boolean;
	coursesObservableArray: any[]=[];
	screenHeight=Screen.mainScreen.heightDIPs
	@Input()screenName:string;
	constructor(private page: Page,private route: ActivatedRoute,private dashboardService:DashboardService,private firebaseEventService:FirebaseEventService
		,private globalService:GlobalService) {
		this.title = this.route.snapshot.paramMap.get("title");
	 }
	goBack() {
		Frame.topmost().goBack();
	}
	ngOnInit() { 
		this.pageIndex=0;
		this.pageSize=1000;
		this.size=10
		// if(isAndroid){
			this.getCourses();
		// }
		if(this.globalService.isEthrai || !this.globalService.isLoggedIn){
			this.firebaseEventService.logScreenViewedEvent(this.globalService.isLoggedIn,this.globalService.getUserStats(),this.screenName,
			this.globalService.getUserProfile())
		}

	}
	async getCourses() {
		if(this.title=='highlyRated'){
			this.customTitle=localize('highlyRated')
			await this.getHighlyRated();
		}else if(this.title=='lastViewed'){
			this.customTitle=localize('lastViewed')
			await this.getLastViewed();
		}else if(this.title=='recommended'){
			this.customTitle=localize('highlightedByPrefrence')
			await this.getRecommendedProducts();
		}else if(this.title='latest'){
			this.customTitle=localize('upcomingEvents')
			await this.getUpcomingEvents();

		}
	}


	getLastViewed() {
		this.isLoading=true
	return	this.dashboardService.getLastViewedCourses(this.pageSize).toPromise().then(
			res=>{
				this.isLoading=false
				this.allCourses=(res as any).courses.filter(c=>c.isPublished);
				this.courses=(this.allCourses as any[])?.slice(0,10)//(this.pageIndex*this.pageSize,(this.pageIndex*this.size)+this.size)
				this.coursesObservableArray.push.apply(this.coursesObservableArray,(this.courses))
				this.courses?.length>0 ? this.isSourceHasElements=true:this.isSourceHasElements=false;

			}
		)
	}
	getHighlyRated() {
		this.isLoading=true
		return this.dashboardService.getHighlyRatedCourses(this.pageSize).toPromise().then(
			res=>{
				this.isLoading=false
				this.allCourses=(res as any).courses.filter(c=>c.isPublished)
				this.courses=(this.allCourses as any[])?.slice(0,10);
				this.coursesObservableArray.push.apply(this.coursesObservableArray,(this.courses))
				this.courses?.length>0 ? this.isSourceHasElements=true:this.isSourceHasElements=false;

			}
		)
	}

	getRecommendedProducts(){
		this.isLoading=true;
	   return this.dashboardService.getHighlightedCoursesByTags(this.pageSize).toPromise().then(
		   response=>{
			   this.isLoading=false;
			  this.allCourses= (response as ProductBriefDetail[])//.filter(course=>course.isPublished);
			  this.courses=(this.allCourses as any[])?.slice(0,10);
				this.coursesObservableArray.push.apply(this.coursesObservableArray,(this.courses))
				this.courses?.length>0 ? this.isSourceHasElements=true:this.isSourceHasElements=false;

		   },
		   err=>{

		   }
	   )
   }
   getUpcomingEvents(){
	this.isLoading=true;
	return this.dashboardService.getUpcomingEvents(this.pageSize).toPromise().then(
		 response=>{
			this.isLoading=false;
			let events= response as ProductsDetail
			this.allCourses= events.courses.filter(course=>course.isPublished);
			this.courses=(this.allCourses as any[])?.slice(0,10);
			this.coursesObservableArray.push.apply(this.coursesObservableArray,this.courses)
			this.courses?.length>0 ? this.isSourceHasElements=true:this.isSourceHasElements=false;

		 },
		 err=>{
			console.log(err)
		 }
	 )
 }


 public addMoreCourses(listView: RadListView) {
	++this.pageIndex;
	console.log("++this.pageIndex",this.pageIndex)
	this.courses=this.allCourses?.slice(this.pageIndex*this.size,(this.pageIndex*this.size)+this.size)
	// console.log(this.pageIndex*this.size,(this.pageIndex*this.size)+this.size,this.courses.length)
	this.coursesObservableArray.push.apply(this.coursesObservableArray,this.courses)
	if (listView) {
		// Call the optimized function for on-demand loading finished.
		// (with 0 because the ObservableArray has already
		// notified about the inserted items)
		listView.notifyAppendItemsOnDemandFinished(0, false);
	}

}

public  onLoadMoreItemsRequested(args) {
	//const that = new WeakRef(this);
	console.log("onLoadMoreItemsRequested",this.pageIndex)
	//const listView: RadListView = args.object;
	// if(isIOS && !this.courses){
	// 	await this.getCourses();
	// }
	++this.pageIndex;
	this.courses=this.allCourses?.slice(this.pageIndex*this.size,(this.pageIndex*this.size)+this.size);
	this.coursesObservableArray.push.apply(this.coursesObservableArray,this.courses)

		// if(this.courses?.length>0){
		// 	args.returnValue = true;
		// 	setTimeout(function () {
        //         listView.notifyLoadOnDemandFinished();
        //     }, 500);
		// 	// listView.notifyAppendItemsOnDemandFinished(10, false);
		// } else {
		// 	args.returnValue = false;
		// 	listView.notifyAppendItemsOnDemandFinished(0, true);
		// }
	

}
get dataItems() {
	return this.coursesObservableArray;
}
}