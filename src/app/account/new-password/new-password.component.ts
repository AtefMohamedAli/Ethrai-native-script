import { Component, OnInit } from '@angular/core';
import { RouterExtensions } from '@nativescript/angular';
import { Page } from "@nativescript/core";
@Component({
	moduleId: module.id,
	selector: 'new-password',
	templateUrl: './new-password.component.html',
	styleUrls: ['./new-password.component.css']
})

export class NewPasswordComponent implements OnInit {

	constructor(private page: Page, private routerExtensions: RouterExtensions) {
		page.actionBarHidden = true;

	}
	goBack() {
		this.routerExtensions.back();
	}

	ngOnInit() { }
}