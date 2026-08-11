import { Component, Input, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Page } from '@nativescript/core';
import { Frame } from '@nativescript/core';
import { LoadOnDemandListViewEventData, RadListView } from 'nativescript-ui-listview';
import { ProductsDetail } from '../../shared/models/products-detail';
import { ProductsSearchOptions } from '../../shared/models/products-search-options';
import { GlobalService } from '../../shared/services/global.service';
import { DashboardService } from '../dashboard.service';
import { localize } from '@nativescript/localize';
import { RouterExtensions } from '@nativescript/angular';
@Component({
	moduleId: module.id,
	selector: 'highlighted-card',
	templateUrl: './highlighted-card.component.html',
	styleUrls: ['./highlighted-card.component.css']
})

export class HighlightedCardComponent implements OnInit {
    @Input()data: any;
    @Input()type: any;
    @Input()path: any;

	constructor(private page: Page,private route: ActivatedRoute,private dashboardService:DashboardService,private globalService:GlobalService,private router:RouterExtensions) { }

	ngOnInit() { }
	setFavorite(id,type,isFav:boolean){
		console.log("isFavisFav",isFav,id,type)
		if(this.globalService.isLoggedIn){
			let payload={
				"productId": id,
				"type": type
			}
			console.log("fav payload",payload)
			if(!isFav){
				this.dashboardService.setFavoriteProducts(payload).subscribe(
					res=>{
						// console.log("faavvvvvvvvvvvvlllllvv",res)

						if((res as any).success){
							this.data.isFavorite=true;
							this.globalService.toast(localize('FavAdded'))
						}
					},
					err=>{
						
					}
				)
			}else{
				this.dashboardService.removeFavoriteProducts(payload).subscribe(
					res=>{
						// console.log("faavvvvvvvvvvvvlllllvv",res)
						this.data.isFavorite=false;
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
	goToDetails(id,data){
		if(this.type=='TrainingSources'){
			//this.router.navigate(['/interactive-training-view',id])
			
			if(data.isFinished==false)this.router.navigate(['/interactive-training-view',id]);
			else if(data.isFinished==true)this.router.navigate(['/interactive-training-report',id]);
		}
		else{
			this.router.navigate(['/training-resources-detail',id,this.type])

		}

	}
	goToInterActiveForm(){
		if(!this.globalService.isLoggedIn){
			this.globalService.toast(localize('LogInPLz'))

		}else{
			this.router.navigate(['/interactive-training-form'])

		}
	}
}