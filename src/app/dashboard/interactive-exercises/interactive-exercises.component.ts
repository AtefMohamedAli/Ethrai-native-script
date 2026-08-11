import { Component, OnInit } from '@angular/core';
import { Frame } from '@nativescript/core';
import { ActivatedRoute, Router } from '@angular/router';
import { localize } from '@nativescript/localize';
import { isIOS, Page,isAndroid ,Screen} from '@nativescript/core';
import { RouterExtensions } from '@nativescript/angular';
import { DashboardService } from '../dashboard.service';
import { FirebaseEventService } from '~/app/shared/services/firebase.event.service';
import { GlobalService } from '~/app/shared/services/global.service';
import { LoadOnDemandListViewEventData, RadListView } from 'nativescript-ui-listview';



@Component({
	moduleId: module.id,
	selector: 'interactive-exercises',
	templateUrl: './interactive-exercises.component.html',
	styleUrls: ['./interactive-exercises.component.css']
})

export class InteractiveExercisesComponent implements OnInit {
	screenHeight=Screen.mainScreen.heightDIPs
	interactiveExercises:any[];
	isLoading: boolean;
	isSourceHasElements: boolean;
	interactiveExercisesObservableArray: any[]=[];
	pageSize=1000
	size=10
	pageIndex=0
	allInteractiveExercises:any[]=[]
	constructor(private route: ActivatedRoute,private dashboardService:DashboardService,private globalService:GlobalService,private firebaseEventService:FirebaseEventService,
		private router:RouterExtensions) { }

	ngOnInit() { this.pageIndex=0
        this.getAllInteractiveExercises();
	 }
	goBack() {
		Frame.topmost().goBack();
		
	}
	
	getAllInteractiveExercises(){
		this.isLoading=true
      this.dashboardService.getAllInteractiveExercises(this.pageSize).subscribe(
		res=>{
			this.allInteractiveExercises=(res as any);
			this.interactiveExercises=(this.allInteractiveExercises as any[])?.slice(0,10)//(this.pageIndex*this.pageSize,(this.pageIndex*this.size)+this.size)
			this.interactiveExercisesObservableArray.push.apply(this.interactiveExercisesObservableArray,(this.interactiveExercises))
			this.interactiveExercises?.length>0 ? this.isSourceHasElements=true:this.isSourceHasElements=false;			
		}
	).add(()=>{
		this.isLoading=false})
	}
	public  onLoadMoreItemsRequested(args) {
		//const listView: RadListView = args.object;
		++this.pageIndex;
		this.interactiveExercises=this.allInteractiveExercises?.slice(this.pageIndex*this.size,(this.pageIndex*this.size)+this.size);
		this.interactiveExercisesObservableArray.push.apply(this.interactiveExercisesObservableArray,this.interactiveExercises)
			// if(this.interactiveExercises?.length>0){
			// 	args.returnValue = true;
			// 	setTimeout(function () {
			// 		listView.notifyLoadOnDemandFinished();
			// 	}, 500);
			// } else {
			// 	args.returnValue = false;
			// 	listView.notifyAppendItemsOnDemandFinished(0, true);
			// }
	}
	get dataItems() {
		return this.interactiveExercisesObservableArray;
	}

}