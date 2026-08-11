import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { RouterExtensions } from '@nativescript/angular';
import { Frame, isAndroid, Page, Slider } from '@nativescript/core';
import { localize } from '@nativescript/localize';
import { ValueList } from 'nativescript-drop-down';
import { FirebaseEventService } from '~/app/shared/services/firebase.event.service';
import { GlobalService } from '../../shared/services/global.service';
import { MyProductsService } from '../my-products.service';

@Component({
	moduleId: module.id,
	selector: 'purchase-filter',
	templateUrl: './purchase-filter.component.html',
	styleUrls: ['./purchase-filter.component.css']
})

export class PurchaseFilterComponent implements OnInit {

	sliderMinValue: number = 0;
	sliderMaxValue: number = 600;
	filter;
	sortBy: ValueList<string>=new ValueList<string>();
	prices: ValueList<number>=new ValueList<number>();
	paymentMethods;
	selectedSort: number=null;
	purchasesCount: number;
	isAndroid: boolean;
	paymentStatus: { value: string; display: string; isChecked: boolean; }[];
	// Intl removed - not available on iOS
	intl = { format: (n) => String(n) }; // Intl polyfill for iOS
	selectedMinIndex: number;
	selectedMaxIndex: number;
	constructor(private page: Page,private globalService:GlobalService,private router:RouterExtensions,private activeRoute:ActivatedRoute,
		private firebaseEventService:FirebaseEventService,private myProductsService:MyProductsService) { 
		//page.actionBarHidden = true;
		this.isAndroid=isAndroid
		this.sortBy.push({value: "desc", display: "الأعلى سعراً"});
		this.sortBy.push({value: "asc", display: "الأقل سعراً"});
		this.paymentMethods=[
			// {value: "Sadad", display: localize('Sadad'),isChecked:false},
			{value: "Mada", display:localize('Mada'),isChecked:false},
			{value: "Free", display: localize('Free'),isChecked:false},
			{value: "AppleInAppPurchase", display: localize('applePurchase'),isChecked:false}

		]
		this.paymentStatus=[
			{value: "PmtNew", display: localize('PmtNew'),isChecked:false},
			{value: "PmtUpdated", display: localize('PmtUpdated'),isChecked:false},
			//{value: "PmtReversal", display: localize('PmtReversal'),isChecked:false},
			{value: "PmtCompleted", display: localize('PmtCompleted'),isChecked:false},
			{value: "PmtNotCompleted", display: localize('PmtNotCompleted'),isChecked:false}

		]
	 	this.myProductsService.getPrices().toPromise().then(
			 res=>{
				let allPrices=res as any[]
				allPrices.forEach(price=>this.prices.push({value: price.price, display: this.intl.format(price.price)+' ر.س'}));
				if(this.filter != undefined){
					this.selectedMinIndex=this.prices.getIndex(this.sliderMinValue)
					this.selectedMaxIndex=this.prices.getIndex(this.sliderMaxValue)
				}
			}
		)
		this.filter=this.globalService.getPurchasesFilter();
		this.purchasesCount=parseInt(this.activeRoute.snapshot.paramMap.get("purchasesCount"));
		if(this.filter != undefined){
			this.sliderMinValue=this.filter.minPrice;
			this.sliderMaxValue=this.filter.maxPrice;
			// this.selectedMinIndex=this.prices.getIndex(this.sliderMinValue)
			// this.selectedMaxIndex=this.prices.getIndex(this.sliderMaxValue)

			this.selectedSort=this.sortBy.getIndex(this.filter.sortType);
			this.paymentMethods=this.filter.paymentMethods
			this.paymentStatus=this.filter.paymentStatus
		}
	 }
	 public onSliderMinValueChange(e) {
        // let slider = <Slider>args.object;
        this.sliderMinValue = this.prices.getValue(e.newIndex);//Math.floor(slider.value);
		if(this.filter==undefined){
			this.filter={
				minPrice:this.sliderMinValue,
				maxPrice:this.sliderMaxValue,
				sortType:"",
				paymentMethods:this.paymentMethods,
				paymentStatus:this.paymentStatus
			}
		}else{
			this.filter.minPrice=this.sliderMinValue
		}
    }
	public onSliderMaxValueChange(e) {
        // let slider = <Slider>args.object;
        this.sliderMaxValue = this.prices.getValue(e.newIndex)//Math.floor(slider.value);
		if(this.filter==undefined){
			this.filter={
				minPrice:this.sliderMinValue,
				maxPrice:this.sliderMaxValue,
				sortType:"",
				paymentMethods:this.paymentMethods,
				paymentStatus:this.paymentStatus
			}
		}else{
			this.filter.maxPrice=this.sliderMaxValue
		}
    }
	onSortChange(e){
		if(this.filter==undefined){
			this.filter={
				minPrice:undefined,
				maxPrice:undefined,
				sortType:this.sortBy.getValue(e.newIndex),
				paymentMethods:this.paymentMethods,
				paymentStatus:this.paymentStatus
			}
		}else{
			this.filter.sortType=this.sortBy.getValue(e.newIndex)
		}
	}
	reset(){
		this.filter=undefined;
		// this.sliderMaxValue=600;
		// this.sliderMinValue=0;
		this.selectedSort=null;
		this.selectedMinIndex=null;
		this.selectedMaxIndex=null;
		this.paymentMethods.forEach(check => {
			check.isChecked=false;
		});
		this.paymentStatus.forEach(check => {
			check.isChecked=false;
		});
	}
	 goBack() {
		
		Frame.topmost().goBack();
	
	  }
	ngOnInit() {
		
		this.firebaseEventService.logScreenViewedEvent(this.globalService.isLoggedIn,this.globalService.getUserStats(),'purchases_filter',this.globalService.getUserProfile());

	 }

	showResults(){
		let filterByPaymentStatus=this.paymentStatus.some(item=>item.isChecked)
		let filterByPaymentMethod=this.paymentMethods.some(item=>item.isChecked)
		if(this.filter==undefined && (filterByPaymentStatus||filterByPaymentMethod)){
			this.filter={
				minPrice:0,
				maxPrice:600,
				sortType:"",
				paymentMethods:this.paymentMethods,
				paymentStatus:this.paymentStatus
			}
		}else if(this.filter!=undefined){
			this.filter.paymentMethods=this.paymentMethods;
			this.filter.paymentStatus=this.paymentStatus;
		}
		this.globalService.setPurchasesFilter(this.filter);
		this.router.navigate(['/purchases'])
	}
	onMethodChange(item){

		item.isChecked = !item.isChecked;

		if (!item.isChecked) {
		  return;
		}

		// uncheck all other options
		this.paymentMethods.forEach(element => {
		  if (element.display !== item.display) {
			element.isChecked = false;
		  }
		});

	}
	onStatusChange(item){
		item.isChecked = !item.isChecked;

		if (!item.isChecked) {
		  return;
		}
	
		// uncheck all other options
		this.paymentStatus.forEach(element => {
		  if (element.display !== item.display) {
			element.isChecked = false;
		  }
		});
	  
	}
}