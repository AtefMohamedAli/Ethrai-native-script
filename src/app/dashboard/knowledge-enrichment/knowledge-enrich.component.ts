import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { RouterExtensions } from '@nativescript/angular';
import { Frame, isAndroid ,Screen} from '@nativescript/core';
import { Page } from '@nativescript/core';
import { LoadOnDemandListViewEventData, RadListView } from 'nativescript-ui-listview';
import { FirebaseEventService } from '~/app/shared/services/firebase.event.service';
import { GlobalService } from '~/app/shared/services/global.service';
import { ProductsDetail } from '../../shared/models/products-detail';
import { ProductsSearchOptions } from '../../shared/models/products-search-options';
import { DashboardService } from '../dashboard.service';

@Component({
	moduleId: module.id,
	selector: 'knowledge-enrich',
	templateUrl: './knowledge-enrich.component.html',
	styleUrls: ['./knowledge-enrich.component.css']
})

export class KnowledgeEnrichmentComponent implements OnInit {
	categoryId: string;
	categoryNameAr: string;
	isLoading: boolean;
	pageSize: number=10;
	pageIndex: number=0;
	kes: any[];
	kesObservableArray: any=[];
	isSourceHasElements: boolean;
	screenHeight=Screen.mainScreen.heightDIPs
	options: any=new ProductsSearchOptions();

	constructor(private page: Page,private dashboardService:DashboardService,private route: ActivatedRoute,private globalService:GlobalService,
		private firebaseEventService:FirebaseEventService,private router:RouterExtensions) {
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
			'ke_list_by_category',this.globalService.getUserProfile())
		}
		let filter=this.globalService.getKesFilter();
		if(filter){
			let selectedRating:number=filter?.rating?.some(item=>item.isChecked)?filter.rating.find(x=>x.isChecked).rate:0
			this.options.minRating=selectedRating;
			this.options.categoryId=this.categoryId;
			this.options.pageSize=this.pageSize;
			this.options.keProductIds=filter.keTypesIds;
			this.options.publishDateSortingType=filter?.sortType=='earlier'?'Asc':'Desc'
			this.options.pricingSortingType='None'
		}else{
			this.options.pageSize=this.pageSize;
			this.options.categoryId=this.categoryId;
			this.options.minRating=0;
		}
		// if(isAndroid){
			this.pageSize=10;
			this.pageIndex=0;
			this.getKes();
		// }
	}

	get dataItems() {
        return this.kesObservableArray;
    }
    public addMoreCourses(listView: RadListView) {
		++this.pageIndex;
		this.getKes();
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
		await this.getKes();
		// if (this.kes.length > 0) {
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
	getKes(){
		this.isLoading=true;
		this.options.pageIndex=this.pageIndex;
		return this.dashboardService.searchProducts(this.options).toPromise().then(
            response=>{

			    this.isLoading=false;
                let products=response as ProductsDetail;
			    this.kes = products.kes.filter(ke=>ke.isPublished);
				this.kesObservableArray.push.apply(this.kesObservableArray,this.kes);
				this.kes.length>0 ? this.isSourceHasElements=true:this.isSourceHasElements=false;
				if(products.totalKes<4){
					this.screenHeight=.8*this.screenHeight
				}
				++this.pageIndex;
            },
            error=>{

            }
		)
	}
	addFilter(){
		this.globalService.setCategoryParams({categoryId:this.categoryId,categoryName:this.categoryNameAr})
		this.router.navigate(['/ke-filter']);
	}
}