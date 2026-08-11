import { Component, OnInit } from '@angular/core';
import { RouterExtensions } from '@nativescript/angular';
import { Frame } from '@nativescript/core';
import { ValueList } from 'nativescript-drop-down';
import { SearchFilter } from '~/app/shared/models/search-filter';
import { FirebaseEventService } from '~/app/shared/services/firebase.event.service';
import { GlobalService } from '~/app/shared/services/global.service';
import { DashboardService } from '../dashboard.service';

@Component({
	moduleId: module.id,
	selector: 'ke-filter',
	templateUrl: './ke-filter.component.html',
	styleUrls: ['./ke-filter.component.css']
})

export class KeFilterComponent implements OnInit {
	
	sortBy: ValueList<string>=new ValueList<string>();
	filter: SearchFilter;
	kesTypes: any[];
	ratings:any[];
	selectedSort: number;
	constructor(private globalService:GlobalService,private firebaseEventService:FirebaseEventService,private dashboardService:DashboardService,
		private router:RouterExtensions) { 
		this.sortBy.push({value: "latest", display: "الأحدث"});
		this.sortBy.push({value: "earlier", display: "الأقدم"});

		this.ratings=this.globalService.getRatingsFilter()
	}

	ngOnInit() { 
		this.filter=this.globalService.getKesFilter();
		if(this.filter != undefined){
		
			this.selectedSort=this.sortBy.getIndex(this.filter.sortType);
			
			if(this.filter?.rating){
				this.ratings=this.filter.rating
			}
		}
			if(this.globalService.isLoggedIn && this.globalService.isEthrai){
				this.firebaseEventService.logScreenViewedEvent(this.globalService.isLoggedIn,this.globalService.getUserStats(),'kes_filter',this.globalService.getUserProfile());
	
			}else if(!this.globalService.isLoggedIn){
				this.firebaseEventService.logScreenViewedEvent(this.globalService.isLoggedIn,null,'kes_filter',null);
			}
		
		this.getKesTypes()
	}
	getKesTypes() {
		this.dashboardService.getKesTypes().subscribe(
			res=>{
				this.kesTypes=res as any;
				this.kesTypes.forEach(type=>{
					if(this.filter){
						if(this.filter.keTypesIds.includes(type.id)){
							type.checked=true
						}
					}else{
						type.checked=false
					}
				})
			}
		)
	}
	reset(){
		if(this.filter){
			this.filter.keTypesIds=[];
		}
		this.globalService.setKesFilter(undefined);
		
		this.ratings.forEach(check => {
			check.isChecked=false;
		});
		this.kesTypes.forEach(type=>type.checked=false)
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
		this.globalService.setKesFilter(this.filter);
		this.router.navigate(['/kes',params.categoryId,params.categoryName]);

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
	onKeTypeChange(e,id){
		if(!this.filter){
			this.filter=new SearchFilter()
		}
		if(e.value && !this.filter.keTypesIds.includes(id)){
			this.filter.keTypesIds.push(id)
		}else{
			if(this.filter.keTypesIds.includes(id)){
				this.filter.keTypesIds.splice(this.filter.keTypesIds.indexOf(id),1)
			}
		}
	}
}