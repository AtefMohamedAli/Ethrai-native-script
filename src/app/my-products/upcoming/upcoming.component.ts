import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Frame, Page ,isAndroid ,Screen} from '@nativescript/core';
import { DashboardService } from '~/app/dashboard/dashboard.service';
import { EnrolledWebinar } from '~/app/shared/models/enrolled-webinar';
import { GlobalService } from '~/app/shared/services/global.service';
import { MyProductsService } from '../my-products.service';
import { localize } from '@nativescript/localize';
import { LoadOnDemandListViewEventData, RadListView } from 'nativescript-ui-listview';
import { ProductsDetail } from '~/app/shared/models/products-detail';
import { ProductsSearchOptions } from '~/app/shared/models/products-search-options';
import { FirebaseEventService } from '~/app/shared/services/firebase.event.service';
import { RouterExtensions } from '@nativescript/angular';
@Component({
	moduleId: module.id,
	selector: 'upcoming',
	templateUrl: './upcoming.component.html',
	styleUrls: ['./upcoming.component.css']
})

export class UpcomingComponent implements OnInit {
	isLoading: boolean;
	myWebinars: any=[];
	Math;
	categoryId: string;
	pageIndex: any=0;
	pageSize: number=10;
	webinars: any;
	isSourceHasElements: any;
	webinarsObservableArray: any=[];
	constructor(private router:RouterExtensions,private page: Page,private myProductsService:MyProductsService,private route: ActivatedRoute,private dashboardService:DashboardService,private globalService:GlobalService,
		private firebaseEventService:FirebaseEventService) { 
		//page.actionBarHidden = true;
		//this.categoryId = this.route.snapshot.paramMap.get("id");
		this.Math=Math
	 }
	
	goBack() {
		
		Frame.topmost().goBack();
	
	  }

	ngOnInit() { 

		this.getEnrolledWebinars();
		if(this.globalService.isEthrai){
			this.firebaseEventService.logScreenViewedEvent(this.globalService.isLoggedIn,this.globalService.getUserStats(),'upcoming_webinars',this.globalService.getUserProfile());
		}

	}
	goToWebinarsPage(id,webinars){
		if(this.globalService.isEthrai || !this.globalService.isLoggedIn){
			this.firebaseEventService.logKeWebinarsClickedEvent(this.globalService.isLoggedIn,this.globalService.getUserStats(),
			"upcoming_webinars",this.globalService.getUserProfile(),webinars,id,null)
		}
		this.router.navigate(['/webinar-details',id]);
	}
	get dataItems() {
        return this.webinarsObservableArray;
    }
    public addMoreCourses(listView: RadListView) {
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
		console.log("onLoadMoreItemsRequestedddd",this.pageIndex,this.pageSize)
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
		console.log("getWebinars")
		this.isLoading=true;
		let options=new ProductsSearchOptions();
		options.pageIndex=this.pageIndex;
		options.pageSize=this.pageSize;
		options.categoryId=this.myWebinars[0].categoryId;
		//options.categoryId="b3a7d95b-1171-e711-80bc-0050568c6f75"
		return this.dashboardService.searchProducts(options).toPromise().then(
            response=>{

			    this.isLoading=false;
                let products=response as ProductsDetail;
			    this.webinars = products.webinars.filter(web=>web.isPublished);
				this.webinarsObservableArray.push.apply(this.webinarsObservableArray,this.webinars);
				this.webinars.length>0 ? this.isSourceHasElements=true:this.isSourceHasElements=false;
				++this.pageIndex;
            },
            error=>{

            }
		)
	}
	getEnrolledWebinars(){
		console.log("getEnrolledWebinars my webinarrs")

        this.isLoading=true;
        this.myProductsService.getUserEnrolledWebinars().subscribe(
            response=>{
                this.isLoading=false;
                this.myWebinars =(response as  EnrolledWebinar[]).filter(webinar=>{
					let endtDate = Date.parse(webinar.endDate);
					let now= Date.parse(new Date().toString());
					if(now<endtDate){
						return webinar;
					}

				}) 
				// if(isAndroid){
					// 	this.pageSize=10;
					// this.pageIndex=0;
						this.getWebinars();
					// }
            },

            err=>{

            }
        )
    }


}