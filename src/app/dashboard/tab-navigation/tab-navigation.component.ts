import { Component, ChangeDetectorRef ,OnInit, AfterViewInit, ViewChild, Output, EventEmitter } from "@angular/core";
import { ActivatedRoute, Router } from '@angular/router';
import { RouterExtensions } from '@nativescript/angular';

@Component({
	moduleId: module.id,
	selector: 'tab-navigation',
	templateUrl: './tab-navigation.component.html',
	styleUrls: ['./tab-navigation.component.css']
})

export class TabNavigationComponent implements OnInit {

    isSelected: string = '0';
	selectedRoute: string = 'highlighted';

    onNavtap(route: string, selectedTab: string) {
		this.routerExtensions.navigate([route], {
            transition: {
                name: 'fade'
            }
        });
        this.isSelected = selectedTab;
        this.selectedRoute = route;
        this.cd.detectChanges();
    }


	constructor( private cd: ChangeDetectorRef,   private router: Router, private routerExtensions: RouterExtensions,) {
	}

	ngOnInit(): void {
	}




}