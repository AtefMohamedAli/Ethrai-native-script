import { ChangeDetectorRef, Component, Input, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Frame } from '@nativescript/core';
import { DashboardService } from '../dashboard.service';
import { RouterExtensions } from '@nativescript/angular';
import { GlobalService } from '~/app/shared/services/global.service';
import { Categories } from '~/app/shared/models/lookups/categories';
import { isIOS, Page, isAndroid, Screen } from '@nativescript/core';
import { LoadOnDemandListViewEventData, RadListView } from 'nativescript-ui-listview';

@Component({
	moduleId: module.id,
	selector: 'digitalLibrary',
	templateUrl: './digitalLibrary.component.html',
	styleUrls: ['./digitalLibrary.component.css']
})

export class DigitalLibraryComponent implements OnInit {
	@Input() type;
	@Input() isEmbedded = false;

	isCategoriesLoading: boolean;
	categories: Categories[];
	isLoading: boolean;
	pageSize = 1000
	size = 10
	pageIndex = 0
	screenHeight = Screen.mainScreen.heightDIPs
	data: any[];
	dataObservableArray: any[] = [];
	allData: any[] = []
	isSourceHasElements: boolean;
	searchedType = 'حالات دراسية';
	selectedSubCategoryId;
	convertedCategoryId = 123

	constructor(private route: ActivatedRoute, private dashboardService: DashboardService, private globalService: GlobalService,
		private router: RouterExtensions, private activatedRoute: ActivatedRoute, private changeDetectorRef: ChangeDetectorRef) {

	}

	ngOnInit() {
		if (!this.type) this.type = this.activatedRoute.snapshot.paramMap.get("type");
		else this.type = 'CASESESTUDY';

		this.getAllCategories()
		this.selectType(this.type)
		//this.search('123')
	}
	goBack() {
		Frame.topmost().goBack();
	}
	selectType(type) {
		this.type = type
		if (type == 'CASESESTUDY') this.searchedType = 'حالات دراسية'
		else if (type == 'INTERACTIVEEX') this.searchedType = 'تمارين تفاعلية'
		else if (type == 'TRAININGGAME') this.searchedType = "العاب تدريبية"
		//else this.searchedType='123'
		!this.selectedSubCategoryId ? this.search('123') : this.search(this.selectedSubCategoryId)

	}
	search(id) {
		this.isLoading = true
		this.selectedSubCategoryId = id;
		id == '123' ? this.convertedCategoryId = 123 : this.convertedCategoryId = 0
		console.log(id, this.searchedType)
		this.dataObservableArray = []
		this.dashboardService.SearchDigitalLibrary(this.searchedType, id).subscribe(
			(response: any) => {
				this.allData = response;
				console.log('allData', this.allData.length)
				this.isLoading = false

				this.data = (this.allData as any[])?.slice(0, 10)//(this.pageIndex*this.pageSize,(this.pageIndex*this.size)+this.size)	
				this.dataObservableArray.push.apply(this.dataObservableArray, (this.data))
				this.data?.length > 0 ? this.isSourceHasElements = true : this.isSourceHasElements = false;

			},
			err => {
				this.isLoading = false

			}
		)
	}
	getAllCategories() {
		this.isCategoriesLoading = true;
		this.dashboardService.getCategories().subscribe(
			response => {
				this.isCategoriesLoading = false;
				this.categories = (response as Categories[]);
			},
			err => {

			}
		)
	}
	getAllInteractiveExercises() {
		this.isLoading = true
		this.dashboardService.getAllInteractiveExercises(this.pageSize).subscribe(
			res => {
				this.allData = (res as any);
				this.data = (this.allData as any[])?.slice(0, 10)//(this.pageIndex*this.pageSize,(this.pageIndex*this.size)+this.size)
				this.dataObservableArray.push.apply(this.dataObservableArray, (this.data))
				this.data?.length > 0 ? this.isSourceHasElements = true : this.isSourceHasElements = false;
			}
		).add(() => {
			this.isLoading = false
		})
	}
	getAllEducationalGames() {
		this.isLoading = true
		this.dashboardService.getAllEducationalGames(this.pageSize).subscribe(
			res => {
				this.allData = (res as any);
				this.data = (this.allData as any[])?.slice(0, 10)//(this.pageIndex*this.pageSize,(this.pageIndex*this.size)+this.size)
				this.dataObservableArray.push.apply(this.dataObservableArray, (this.data))
				this.data?.length > 0 ? this.isSourceHasElements = true : this.isSourceHasElements = false;
			}
		).add(() => {
			this.isLoading = false
		})
	}
	getAllCasesStudy() {
		this.isLoading = true
		this.dashboardService.getAllCasesStudy(this.pageSize).subscribe(
			res => {
				this.allData = (res as any);
				this.data = (this.allData as any[])?.slice(0, 10)//(this.pageIndex*this.pageSize,(this.pageIndex*this.size)+this.size)
				this.dataObservableArray.push.apply(this.dataObservableArray, (this.data))
				this.data?.length > 0 ? this.isSourceHasElements = true : this.isSourceHasElements = false;
			}
		).add(() => {
			this.isLoading = false
		})
	}
	// public  onLoadMoreItemsRequested(args) {
	// 	//const listView: RadListView = args.object;
	// 	++this.pageIndex;
	// 	this.data=this.allData?.slice(this.pageIndex*this.size,(this.pageIndex*this.size)+this.size);
	// 	this.dataObservableArray.push.apply(this.dataObservableArray,this.data)
	// 		if(this.data?.length>0){
	// 			args.returnValue = true;
	// 			setTimeout(function () {
	// 				listView.notifyLoadOnDemandFinished();
	// 			}, 500);
	// 		} else {
	// 			args.returnValue = false;
	// 			listView.notifyAppendItemsOnDemandFinished(0, true);
	// 		}
	// }
	public onLoadMoreItemsRequested(args) {
		//const listView = args.object;
		++this.pageIndex;
		this.data = this.allData?.slice(this.pageIndex * this.size, (this.pageIndex * this.size) + this.size);
		this.dataObservableArray.push(...this.data);
		console.log('onLoadMoreItemsRequested', this.pageIndex)

	}

	get dataItems() {
		return this.dataObservableArray;
	}
}