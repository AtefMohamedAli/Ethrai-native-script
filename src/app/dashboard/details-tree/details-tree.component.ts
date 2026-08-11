import { AfterViewInit, Component, ElementRef, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges, ViewChild } from '@angular/core';
import { ActivatedRoute, NavigationExtras } from '@angular/router';
import { RouterExtensions } from '@nativescript/angular';
import { Frame, isAndroid, isIOS, ObservableArray, Page } from '@nativescript/core';
import { localize } from '@nativescript/localize';
import { ListViewEventData, RadListView } from 'nativescript-ui-listview';
import { GlobalService } from '~/app/shared/services/global.service';
import { DashboardService } from '../dashboard.service';
import { SelectedItemService } from '../selected-item-service';
declare var NSMutableArray;
declare var NSIndexPath;
@Component({
    moduleId: module.id,
    selector: 'details-tree',
    templateUrl: './details-tree.component.html',
    styleUrls: ['./details-tree.component.css'],
})


export class DetailsTreeComponent implements AfterViewInit {
    @Input() detail: any;
    @Input() isEnrolled: boolean;
    @Input() courseId: string;
    @Input() tracking: any[];
    @Input() isVideoFinished: boolean;
    @Input() selectedItem: any;
    @Input() isVideoPlayed: any;
    Math: any;
    clickedd = {};
    myQuestions: ObservableArray<any>;
    dataItem: any;
    @ViewChild('listView') listView: ElementRef;
    rowIndex: number;
    isIOS = isIOS;
    isAndroid = isAndroid
    clickedd1: any;
    constructor(private page: Page, private router: RouterExtensions, private activatedRoute: ActivatedRoute, private dashboardService: DashboardService
        , private selectedItemService: SelectedItemService, private globalService: GlobalService) {
        page.actionBarHidden = true;
        this.Math = Math;
    }

    onItemSelect(item) {
        //this.selectedItem.emit(item);
    }

    ngOnInit() {
    }

    ngOnChanges(changes: SimpleChanges) {
        // Auto-expand the module (Label) that contains the currently selected item
        // This prevents the accordion from collapsing when getCourseDetails() refreshes the tree
        if ((changes['detail'] || changes['selectedItem']) && this.detail && this.selectedItem) {
            for (let item of this.detail) {
                if (item.type === 'Label' && item.details) {
                    // Check if this module contains the currently selected item (by ID)
                    const containsSelected = this.findDeep(item.details, this.selectedItem.id);
                    if (containsSelected) {
                        this.clickedd1 = item;
                        break;
                    }
                }
            }
        }
    }

    // Helper to recursively find if a nested list contains an item by ID
    private findDeep(details: any[], targetId: string): boolean {
        if (!details) return false;
        for (let child of details) {
            if (child.id === targetId) return true;
            if (child.type === 'Label' && child.details) {
                if (this.findDeep(child.details, targetId)) return true;
            }
        }
        return false;
    }

    templateSelector(item: any, index: number, items: any): string {
        //  if(item==this.selectedItem){
        //  console.log("index",index,item)

        //     //  return "expanded";
        //  }
        return item.expanded ? "expanded" : "default";
    }
    ngAfterViewInit() {
        if (this.isVideoFinished) {
            this.listView.nativeElement.selectItemAt(this.rowIndex + 1)
        }
        // this.listView.nativeElement.scrollToIndex(2,true);
        // this.listView.nativeElement.refresh();

    }

    onItemTap(event: ListViewEventData) {
        const listView = event.object;
        this.rowIndex = event.index;
        this.dataItem = event.view.bindingContext;

        if (this.dataItem.type == 'Label') {
            this.dataItem.expanded = !this.dataItem.expanded;
            if (isIOS) {
                var indexPaths = NSMutableArray.new();
                indexPaths.addObject(NSIndexPath.indexPathForRowInSection(this.rowIndex, event.groupIndex));
                listView.ios.reloadItemsAtIndexPaths(indexPaths);
            }
            if (isAndroid) {
                listView.androidListView.getAdapter().notifyItemChanged(this.rowIndex);
            }
        } else {
            // if(this.dataItem!=this.selectedItem){
            this.selectedItemService.emit(this.dataItem)
            // }
        }
    }

    toggleBookMark(detail, index) {
        let body = {
            courseDetailId: detail.id,
            courseId: this.courseId
        }
        if (detail.isBookmark) {
            this.dashboardService.removeBookMark(detail.id).subscribe(
                res => {
                    if ((res as any)?.success) {
                        this.detail[index].isBookmark = false;
                        this.globalService.toast(localize('BookmarkRemoved'))
                    }
                },
                err => {
                    console.log(err)
                }
            )
        } else {
            this.dashboardService.addBookMark(body).subscribe(
                res => {
                    if ((res as any).success) {
                        this.detail[index].isBookmark = true;
                        this.globalService.toast(localize('BookmarkAdded'))
                    }
                },
                err => {

                })
        }
    }
    isTracked(item) {
        if (this.tracking == null || this.tracking.length == 0) {
            return false;
        } else {
            return this.tracking.some(track => item?.id == track.courseDetailId)
        }
    }

    onListLoaded(args: ListViewEventData) {
        let list = (args.object) as RadListView;
        setTimeout(() => {
            if (list.items) {
                list.scrollWithAmount(200, true);
            }

            list.refresh()
        }, 500)
    }
    onTap(item) {
        if (item.type !== 'Label') {
            this.selectedItemService.emit(item)
        }
    }
    clickme1(item) {
        this.clickedd1 = item;
    }
    uclickme1() {
        this.clickedd1 = {};
    }
}

