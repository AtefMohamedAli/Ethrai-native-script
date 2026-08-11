import { Component, OnInit } from '@angular/core';
import { RouterExtensions } from '@nativescript/angular';
import { Frame } from '@nativescript/core';
import { ValueList } from 'nativescript-drop-down';
import { SearchFilter } from '../../shared/models/search-filter';
import { FirebaseEventService } from '../../shared/services/firebase.event.service';
import { GlobalService } from '../../shared/services/global.service';
import { DashboardService } from '../dashboard.service';
@Component({
	moduleId: module.id,
	selector: 'webinar-filter',
	templateUrl: './webinar-filter.component.html',
	styleUrls: ['./webinar-filter.component.css']
})

export class WebinarFilterComponent implements OnInit {

	sortBy: ValueList<string>=new ValueList<string>();
	filter: SearchFilter;
	webinarTypes: any[];
	ratings:any[];
	selectedSort: number;
	constructor(private globalService:GlobalService,private firebaseEventService:FirebaseEventService,private dashboardService:DashboardService,
		private router:RouterExtensions) { 
		this.sortBy.push({value: "latest", display: "الأحدث"});
		this.sortBy.push({value: "earlier", display: "الأقدم"});

		this.ratings=this.globalService.getRatingsFilter()
		this.webinarTypes=[
			{value:"Recorded",text:"مؤتمرات مسجلة",isChecked:false},
			{value:"Live",text:"مؤتمرات قيد البث",isChecked:false},
			{value:"Scheduled",text:"مؤتمرات مجدولة",isChecked:false},
		]
	}

	ngOnInit() { 
		this.filter=this.globalService.getWebinarsFilter();
		if(this.filter){
		
			this.selectedSort=this.sortBy.getIndex(this.filter.sortType);
			
			if(this.filter?.rating){
				this.ratings=this.filter.rating
			}
			this.webinarTypes.forEach(type=>{
				if(this.filter.webinarTypes.includes(type.value)){
					type.isChecked=true
				}
			})
		}
			if(this.globalService.isLoggedIn && this.globalService.isEthrai){
				this.firebaseEventService.logScreenViewedEvent(this.globalService.isLoggedIn,this.globalService.getUserStats(),'webinars_filter',this.globalService.getUserProfile());
	
			}else if(!this.globalService.isLoggedIn){
				this.firebaseEventService.logScreenViewedEvent(this.globalService.isLoggedIn,null,'webinars_filter',null);
			}
		
	}
	reset(){
		if(this.filter){
			this.filter.webinarTypes=[];
		}
		this.globalService.setWebinarsFilter(undefined);
		
		this.ratings.forEach(check => {
			check.isChecked=false;
		});
		this.webinarTypes.forEach(type=>type.isChecked=false)
		this.selectedSort=null
	}
	onSortChange(e){
		if(this.filter==undefined){
			this.filter=new SearchFilter();
			this.filter.sortType=this.sortBy.getValue(e.newIndex)
		}else{
			this.filter.sortType=this.sortBy.getValue(e.newIndex)
		}
	}
	showResults(){
		if(this.filter){
			this.filter.rating=this.ratings;
		}
		let params =this.globalService.getCategoryParams()
		this.globalService.setWebinarsFilter(this.filter);
		if(params.categoryId!=null&&params.categoryName!=null){
			this.router.navigate(['/online-classes',params.categoryId,params.categoryName]);

		}
		else{
			this.router.navigate(['/online-classes']);

		}

	}
	onRatingChange(e,item){
		if(this.filter==undefined){
			this.filter=new SearchFilter();
		}

		item.isChecked = !item.isChecked;

		if (!item.isChecked) {
		  return;
		}
	
		// uncheck all other options
		this.ratings.forEach(element => {
		  if (element.text !== item.text) {
			element.isChecked = false;
		  }
		});
	  
	}
	goBack() {
		Frame.topmost().goBack();
	  }
	onWebinarTypeChange(e,type,i){
		this.webinarTypes[i].isChecked=true
		if(!this.filter){
			this.filter=new SearchFilter()
		}
		if(e.value && !this.filter.webinarTypes.includes(type)){
			this.filter.webinarTypes.push(type)
		}else{
			if(this.filter.webinarTypes.includes(type)){
				this.filter.webinarTypes.splice(this.filter.webinarTypes.indexOf(type),1)
			}
		}
	}
}