import { Component, OnInit } from '@angular/core';
import { Frame } from '@nativescript/core';
import { ActivatedRoute, Router } from '@angular/router';
import { localize } from '@nativescript/localize';
import { isIOS, Page,isAndroid ,Screen} from '@nativescript/core';
import { SelectedIndexChangedEventData, ValueList } from 'nativescript-drop-down';
import { RouterExtensions } from '@nativescript/angular';
import { DashboardService } from '../dashboard.service';
import { FirebaseEventService } from '~/app/shared/services/firebase.event.service';
import { GlobalService } from '~/app/shared/services/global.service';
import { LoadOnDemandListViewEventData, RadListView } from 'nativescript-ui-listview';




@Component({
	moduleId: module.id,
	selector: 'cases-study',
	templateUrl: './cases-study.component.html',
	styleUrls: ['./cases-study.component.css']
})

export class CasesStudyComponent implements OnInit {
	screenHeight=Screen.mainScreen.heightDIPs
     filterCases:ValueList<string> = new ValueList<string>();
	 casesStudy:any[];
	 isLoading: boolean;
	 isSourceHasElements: boolean;
	 casesStudyObservableArray: any[]=[];
	 pageSize=1000
	 size=10
	 pageIndex=0
     allCasesStudy:any[]=[]
	constructor(private route: ActivatedRoute,private dashboardService:DashboardService,private globalService:GlobalService,private firebaseEventService:FirebaseEventService,
		private router:RouterExtensions) { 
			this.filterCases.push({value: "myCasesStudy", display: "حالاتي الدراسية"});
		this.filterCases.push({value: "AllCasesStudy", display: "جميع الحالات الدراسية"});
		}


	ngOnInit() {
		this.pageIndex=0
        this.getAllCasesStudy();
	 }
	goBack() {
		Frame.topmost().goBack();
	}
	public onchange(args: SelectedIndexChangedEventData) {
		let selectedValue=this.filterCases.getValue(args.newIndex)
		this.casesStudyObservableArray=[]
		if(selectedValue=="myCasesStudy") {this.getMyCasesStudy()}
		else this.getAllCasesStudy()
    }
	getAllCasesStudy(){
		this.isLoading=true
      this.dashboardService.getAllCasesStudy(this.pageSize).subscribe(
		res=>{
			this.allCasesStudy=(res as any);
			this.casesStudy=(this.allCasesStudy as any[])?.slice(0,10)//(this.pageIndex*this.pageSize,(this.pageIndex*this.size)+this.size)
			this.casesStudyObservableArray.push.apply(this.casesStudyObservableArray,(this.casesStudy))
			this.casesStudy?.length>0 ? this.isSourceHasElements=true:this.isSourceHasElements=false;			
		}
	).add(()=>{
		this.isLoading=false})
	}
	getMyCasesStudy(){
		this.isLoading=true
      this.dashboardService.getMyCasesStudy().subscribe(
		res=>{

			console.log('casesStudy',res)
			this.allCasesStudy=(res as any);
			this.casesStudy=(this.allCasesStudy as any[])?.slice(0,10)
			this.casesStudyObservableArray.push.apply(this.casesStudyObservableArray,(this.casesStudy))
			this.casesStudy?.length>0 ? this.isSourceHasElements=true:this.isSourceHasElements=false;
		}
	).add(()=>{
		this.isLoading=false})
	}
	public  onLoadMoreItemsRequested(args) {
		//const that = new WeakRef(this);
		//const listView: RadListView = args.object;
		++this.pageIndex;
		this.casesStudy=this.allCasesStudy?.slice(this.pageIndex*this.size,(this.pageIndex*this.size)+this.size);
		this.casesStudyObservableArray.push.apply(this.casesStudyObservableArray,this.casesStudy)
			// if(this.casesStudy?.length>0){
			// 	args.returnValue = true;
			// 	setTimeout(function () {
			// 		listView.notifyLoadOnDemandFinished();
			// 		console.log("hhhhhhhh",this.pageIndex)
			// 	}, 500);
			// } else {
			// 	args.returnValue = false;
			// 	listView.notifyAppendItemsOnDemandFinished(0, true);
			// 	console.log("xxxxxxxxxxx",this.pageIndex)
			// }
	}
	get dataItems() {
		return this.casesStudyObservableArray;
	}
	
}