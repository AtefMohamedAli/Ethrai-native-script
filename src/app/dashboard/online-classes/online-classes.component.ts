import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { RouterExtensions } from '@nativescript/angular';
import { Frame, isAndroid ,Screen } from '@nativescript/core';
import { Page } from '@nativescript/core';
import { LoadOnDemandListViewEventData, RadListView } from 'nativescript-ui-listview';
import { FirebaseEventService } from '~/app/shared/services/firebase.event.service';
import { GlobalService } from '~/app/shared/services/global.service';
import { OnlineClass } from '../../shared/models/online-class';
import { ProductsDetail } from '../../shared/models/products-detail';
import { ProductsSearchOptions } from '../../shared/models/products-search-options';
import { WebinarBriefDetail } from '../../shared/models/webinar-brief-detail';
import { DashboardService } from '../dashboard.service';

@Component({
	moduleId: module.id,
	selector: 'online-classes',
	templateUrl: './online-classes.component.html',
	styleUrls: ['./online-classes.component.css']
})

export class OnlineClassesComponent implements OnInit {
	onlineClasses: any[];
	isLoadingClasses: boolean;
	categoryId: string;
	categoryNameAr: string;
	isLoading: boolean;
	pageSize: number=10;
	pageIndex: number=0;
	webinars: WebinarBriefDetail[];
	webinarsObservableArray: any=[];
	isSourceHasElements: boolean;
	screenHeight=Screen.mainScreen.heightDIPs
	options: any=new ProductsSearchOptions();

	constructor(private page: Page,private dashboardService:DashboardService,private route: ActivatedRoute,
		private globalService:GlobalService,private firebaseEventService:FirebaseEventService,private router:RouterExtensions) {
		//page.actionBarHidden = true;
		this.categoryId = this.route.snapshot.paramMap.get("id");
		this.categoryNameAr = this.route.snapshot.paramMap.get("categoryNameAr");
	 }
	goBack() {
		
		Frame.topmost().goBack();
	
	  }
	ngOnInit() { 
		if(this.globalService.isEthrai || !this.globalService.isLoggedIn){
			this.firebaseEventService.logScreenViewedEvent(this.globalService.isLoggedIn,this.globalService.getUserStats(),
			'webinar_list_by_category',this.globalService.getUserProfile())
		}
		let filter=this.globalService.getWebinarsFilter();
		if(filter){
			let selectedRating:number=filter?.rating?.some(item=>item.isChecked)?filter.rating.find(x=>x.isChecked).rate:0
			this.options.minRating=selectedRating;
			this.options.categoryId=this.categoryId;
			this.options.pageSize=this.pageSize;
			this.options.webinarWatchTypes=filter.webinarTypes;
			this.options.publishDateSortingType=filter?.sortType=='earlier'?'Asc':'Desc'
			this.options.pricingSortingType='None'
		}else{
			this.options.pageSize=this.pageSize;
			this.options.categoryId=this.categoryId;
			this.options.minRating=0;
		}
		// if(isAndroid){
		// 	this.pageSize=10;
		// this.pageIndex=0;
			this.getWebinars();
		// }
		

	}

	get dataItems() {
        return this.webinarsObservableArray;
    }
    public addMoreCourses(listView: RadListView) {
		console.log("addd")
		++this.pageIndex;
		this.getWebinars();
		if (listView) {
			// Call the optimized function for on-demand loading finished.
			// (with 0 because the ObservableArray has already
			// notified about the inserted items)
			listView.notifyAppendItemsOnDemandFinished(0, !this.isSourceHasElements);
		}
    
    }
	
	public async onLoadMoreItemsRequested(args) {
		//const that = new WeakRef(this);
		//const listView: RadListView = args.object;
		await this.getWebinars()
		// if (this.webinars.length > 0) {
		// 	// setTimeout(function () {
		// 	// 	that.get().addMoreCourses(listView);
		// 	// }, 0);
		// 	listView.notifyAppendItemsOnDemandFinished(0, !this.isSourceHasElements);
		// 	args.returnValue = true;
		// } else {
		// 	args.returnValue = false;
		// 	listView.notifyAppendItemsOnDemandFinished(0, true);
		// }
	}
	getWebinars(){
		this.isLoading=true;
		this.options.pageIndex=this.pageIndex;

		return this.dashboardService.searchProducts(this.options).toPromise().then(
            response=>{

			    this.isLoading=false;
                let products=response as ProductsDetail;
			    this.webinars = products.webinars.filter(web=>web.isPublished);
				this.webinarsObservableArray.push.apply(this.webinarsObservableArray,this.webinars);
				this.webinars.length>0 ? this.isSourceHasElements=true:this.isSourceHasElements=false;
				if(products.totalWebinars<4){
					this.screenHeight=.8*this.screenHeight
				}
				++this.pageIndex;
            },
            error=>{

            }
		)
	}
	getOnlineClasses(){
		this.isLoadingClasses=true;
		this.dashboardService.getOnlineClasses().subscribe(
            response=>{
			    this.isLoadingClasses=false;
			    let classes = response as OnlineClass[];
				if(classes != null){
					this.onlineClasses=classes.filter(value=>value.categoryIds.some(value=>value===this.categoryId));
				}
            },
            error=>{

            }
		)
	}

	enrollToWebinar(){
		
	}
	addFilter(){
		this.globalService.setCategoryParams({categoryId:this.categoryId,categoryName:this.categoryNameAr})
		this.router.navigate(['/webinar-filter']);
	}
}