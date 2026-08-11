import { Component, OnInit, ViewContainerRef } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ModalDialogService, RouterExtensions, ModalDialogOptions } from '@nativescript/angular';
import { Frame, SearchBar,Screen } from '@nativescript/core';
import { SelectedIndexChangedEventData, ValueList } from 'nativescript-drop-down';
import { DashboardService } from '../../dashboard.service';
import { GlobalService } from '~/app/shared/services/global.service';
import { FirebaseEventService } from '~/app/shared/services/firebase.event.service';
import { LoadOnDemandListViewEventData, RadListView } from 'nativescript-ui-listview';
import { localize } from '@nativescript/localize';
import { DeletConfirmComponent } from '../delet-confirm/delet-confirm.component';

@Component({
	moduleId: module.id,
	selector: 'interactive-training-list',
	templateUrl: './interactive-training-list.component.html',
	styleUrls: ['./interactive-training-list.component.css']
})

export class InteractiveTrainingListComponent implements OnInit {

	searchPhrase: string;
    isLoggedIn: boolean;
	isEmpty: boolean;
    dialogOpen=false



	filterCases: ValueList<string> = new ValueList<string>();
	payload = { eGword: null, pageSize: 5, pageIndex: 0, isDraft: null,fromDate:"",toDate:""}//{"eGword":"kk","pageSize":20,"pageIndex":0,"isDraft":null,"fromDate":null,"toDate":null}
	isLoading: boolean = true;
	interactiveTraining: any[]=[]
	interactiveTrainingObservableArray: any[] = []
	isSourceHasElements: boolean;
	constructor(private modalService: ModalDialogService, private vcRef: ViewContainerRef, private route: ActivatedRoute, private dashboardService: DashboardService, private globalService: GlobalService, private firebaseEventService: FirebaseEventService,
		private router: RouterExtensions) {
		this.filterCases.push({ value: "published", display: "تم النشر" });
		this.filterCases.push({ value: "unpublished", display: "لم ينشر بعد" });
	}
	screenHeight=Screen.mainScreen.heightDIPs

	ngOnInit() {
		this.isLoading = true

		this.getSearchInteractiveTraining()
	}
	goToDitals(id,isFinish,isActive){
		 if(isFinish==false)this.router.navigate(['/interactive-training-view',id]);
else if(isFinish==true)this.router.navigate(['/interactive-training-report',id]);





	}
	goBack() {
		Frame.topmost().goBack();
	}
	getSearchInteractiveTraining() {

		this.dashboardService.SearchInteractiveTraining(this.payload).subscribe(
			res => {
				console.log( res as any)
				this.interactiveTraining = (res as any[]);
				this.interactiveTrainingObservableArray.push.apply(this.interactiveTrainingObservableArray, (this.interactiveTraining))
				this.interactiveTraining?.length > 0 ? this.isSourceHasElements = true : this.isSourceHasElements = false;
							this.isLoading = false

			}
		).add(() => {
			this.isLoading = false
		})

	}
	public onchangeIT(args: SelectedIndexChangedEventData) {
		let selectedValue = this.filterCases.getValue(args.newIndex)
		this.interactiveTrainingObservableArray = []
		this.payload.pageIndex = 0
		if (selectedValue == "unpublished") {
			this.payload.isDraft = true
			this.getSearchInteractiveTraining()
		}
		else {
			this.payload.isDraft = false
			this.getSearchInteractiveTraining()
		}

	}
	public onLoadMoreItemsRequested(args) {
		//const that = new WeakRef(this);
		this.isLoading = true

		//const listView: RadListView = args.object;
		++this.payload.pageIndex;
		this.getSearchInteractiveTraining()
		// if (this.interactiveTraining?.length > 0) {
		// 	args.returnValue = true;
		// 	setTimeout(function () {
		// 		listView.notifyLoadOnDemandFinished();
		// 		//console.log("hhhhhhhh", this.payload.pageIndex)
		// 	}, 500);
		// } else {
		// 	args.returnValue = false;
		// 	listView.notifyAppendItemsOnDemandFinished(0, true);
		// 	//console.log("xxxxxxxxxxx", this.payload.pageIndex)
		// }
	}
	get dataItems() {
		return this.interactiveTrainingObservableArray;
	}
	remove(id, i) {
		this.isLoading = true
		console.log(i, id)
		this.dashboardService.DeleteInteractiveTraining(id).subscribe(
			(res: any) => {
				if (res.success == true) {
					this.globalService.toast(localize('DeletedSuccessfully'));
					this.interactiveTrainingObservableArray.splice(i, 1)
					this.isLoading = false

				}
				else {
					this.globalService.toast(res.errorCode);
					this.isLoading = false

				}
			}
		).add(() => {
			this.isLoading = false
		})

	}
	openModal(id, i) {
		const response = this.modalService.showModal(DeletConfirmComponent, {
			/*context: {
				dim: "#00000000"      
			},*/
			fullscreen: false,
			viewContainerRef: this.vcRef,
			// dimAmount: 0.5,
		} as any);
		response.then(res => {
			if (res == 'remove') {
				this.remove(id, i)
			}
			//this.router.navigate(['/purchases'])
		},
			err => {

			})
		// console.log("Modal response: " + response);
	}

	onSubmit(args) {
        const searchBar = args.object as SearchBar;
       this.payload.eGword=searchBar.text
	   this.payload.fromDate=null
	   this.payload.toDate=null
	   this.payload.pageIndex=0
	   this.isLoading = true
	   this.interactiveTrainingObservableArray=[]
	   this.getSearchInteractiveTraining()
      
    }
	goToInterActiveForm(){
		if(!this.globalService.isLoggedIn){
			this.globalService.toast(localize('LogInPLz'))

		}else{
			this.router.navigate(['/interactive-training-form'])

		}
	}
    onTextChanged(e) {
        if(e.value){
            this.dialogOpen=true
        }else{
            this.onClear()
        }
    }

    onClear() {
        this.dialogOpen=false
        this.searchPhrase=""
		this.payload.eGword=null
		this.payload.pageIndex=0
		this.interactiveTrainingObservableArray=[]
		this.isLoading = true

		this.getSearchInteractiveTraining()

    }
}