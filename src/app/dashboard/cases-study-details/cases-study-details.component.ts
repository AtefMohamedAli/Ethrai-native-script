import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Frame, Page } from '@nativescript/core';

@Component({
	moduleId: module.id,
	selector: 'cases-study-details',
	templateUrl: './cases-study-details.component.html',
	styleUrls: ['./cases-study-details.component.css']
})

export class CasesStudyDetailsComponent implements OnInit {

	constructor(private page: Page,private router:Router,private route: ActivatedRoute,
		) {
		page.actionBarHidden = true;
		
	 }
	ngOnInit() { }

	goBack() {
		Frame.topmost().goBack();
	}
}