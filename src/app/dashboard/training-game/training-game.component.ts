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
	selector: 'training-game',
	templateUrl: './training-game.component.html',
	styleUrls: ['./training-game.component.css']
})

export class TrainingGameComponent implements OnInit {
	screenHeight=Screen.mainScreen.heightDIPs
	trainingGame:any[];
	isLoading: boolean;
	isSourceHasElements: boolean;
	trainingGameObservableArray: any[]=[];
	pageSize=1000
	size=10
	pageIndex=0
	allTrainingGame:any[]=[]
	constructor(private route: ActivatedRoute,private dashboardService:DashboardService,private globalService:GlobalService,private firebaseEventService:FirebaseEventService,
		private router:RouterExtensions) { }

	ngOnInit() { this.pageIndex=0
        this.getAllEducationalGames();
	 }
	goBack() {
		Frame.topmost().goBack();
	}
	
	getAllEducationalGames(){
		this.isLoading=true
      this.dashboardService.getAllEducationalGames(this.pageSize).subscribe(
		res=>{
			this.allTrainingGame=(res as any);
			this.trainingGame=(this.allTrainingGame as any[])?.slice(0,10)//(this.pageIndex*this.pageSize,(this.pageIndex*this.size)+this.size)
			this.trainingGameObservableArray.push.apply(this.trainingGameObservableArray,(this.trainingGame))
			this.trainingGame?.length>0 ? this.isSourceHasElements=true:this.isSourceHasElements=false;			
		}
	).add(()=>{
		this.isLoading=false})
	}
	public  onLoadMoreItemsRequested(args) {
		//const listView: RadListView = args.object;
		++this.pageIndex;
		this.trainingGame=this.allTrainingGame?.slice(this.pageIndex*this.size,(this.pageIndex*this.size)+this.size);
		this.trainingGameObservableArray.push.apply(this.trainingGameObservableArray,this.trainingGame)
			// if(this.trainingGame?.length>0){
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
		return this.trainingGameObservableArray;
	}

}