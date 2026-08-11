import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Page } from '@nativescript/core';
import { Frame ,isAndroid ,Screen} from '@nativescript/core';
import { localize } from '@nativescript/localize';
import { LoadOnDemandListViewEventData, RadListView } from 'nativescript-ui-listview';
import { ProductsDetail } from '~/app/shared/models/products-detail';
import { ProductsSearchOptions } from '~/app/shared/models/products-search-options';
import { FirebaseEventService } from '~/app/shared/services/firebase.event.service';
import { GlobalService } from '~/app/shared/services/global.service';
import { DashboardService } from '../dashboard.service';

@Component({
	moduleId: module.id,
	selector: 'traing-path',
	templateUrl: './traing-path.component.html',
	styleUrls: ['./traing-path.component.css']
})

export class TraingPathComponent implements OnInit {
	Math;
	isLoading: boolean;
	categoryId: string;
	categoryNameAr: any;
	pageIndex: any=0;
	pageSize: number=10;
	coursePathsObservableArray: any=[];
	coursePaths: any;
	isSourceHasElements: boolean;
	isHighlightedLoading: boolean;
	highlighted: any;
	screenHeight=Screen.mainScreen.heightDIPs
	isAndroid: boolean;
	// Intl removed - not available on iOS
	intl = { format: (n) => String(n) }; // Intl polyfill for iOS
	
	constructor(private page: Page,private route: ActivatedRoute,private dashboardService:DashboardService,private globalService:GlobalService,
		private firebaseEventService:FirebaseEventService) {
		//page.actionBarHidden = true;
		this.categoryId = this.route.snapshot.paramMap.get("id");
		this.categoryNameAr = this.route.snapshot.paramMap.get("categoryNameAr");
		this.Math=Math
		this.isAndroid=isAndroid
	 }
	goBack() {
		
		Frame.topmost().goBack();
	
	  }
	ngOnInit() { 
		// this.pageSize=10;
		// this.pageIndex=0;
		if(isAndroid){
			this.getCoursePaths();
		}
		this.getHighlightedTrainingPath();
		if(this.globalService.isEthrai){
			this.firebaseEventService.logScreenViewedEvent(this.globalService.isLoggedIn,this.globalService.getUserStats(),'list_of_training_paths',this.globalService.getUserProfile());
		}		
	}
	getHighlightedTrainingPath() {
		this.isHighlightedLoading=true;
		this.dashboardService.getHighligtedProducts(this.categoryId,5).subscribe(
			res=>{
				this.isHighlightedLoading=false;
				this.highlighted=(res as any).coursePaths
				++this.pageIndex;
			}
		)
	}
	get dataItems() {
        return this.coursePathsObservableArray;
    }
    public addMoreCourses(listView: RadListView) {
		++this.pageIndex;
		this.getCoursePaths();
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
		await this.getCoursePaths()
		// if (this.coursePaths.length > 0) {
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
	getCoursePaths(){
		this.isLoading=true;
		let options=new ProductsSearchOptions();
		options.pageIndex=this.pageIndex;
		options.pageSize=this.pageSize;
		options.categoryId=this.categoryId;
		return this.dashboardService.searchProducts(options).toPromise().then(
            response=>{

			    this.isLoading=false;
                let products=response as any;
			    this.coursePaths = products.coursePaths.filter(path=>path.isPublished);
				this.coursePathsObservableArray.push.apply(this.coursePathsObservableArray,this.coursePaths);
				this.coursePaths.length>0 ? this.isSourceHasElements=true:this.isSourceHasElements=false;

            },
            error=>{
				this.isLoading=false;
				this.globalService.toast(localize('LoadError'))
            }
		)
	}
	
	setFavoriteP(id,type,isFav:boolean,i){
		if(this.globalService.isLoggedIn){
			let payload={
				"productId": id,
				"type": type
			}
			if(!isFav){
				this.dashboardService.setFavoriteProducts(payload).subscribe(
					res=>{
						if((res as any).success){
							this.highlighted[i].isFavorite=true;
							this.globalService.toast(localize('FavAdded'))

						}
					},
					err=>{
						
					}
				)
			}else{
				this.dashboardService.removeFavoriteProducts(payload).subscribe(
					res=>{
						this.highlighted[i].isFavorite=false;
						if((res as any).success){
							this.globalService.toast(localize('FavRemoved'))

						}
					},
					err=>{
						
					}
				)
			}
			
	
		}else{
			this.globalService.toast(localize('LogNeededFav'))
		}

	}
}