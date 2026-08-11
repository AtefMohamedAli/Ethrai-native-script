import { Component, OnInit } from '@angular/core';
import { Page } from "@nativescript/core";
import { Router } from '@angular/router';
import { RouterExtensions } from '@nativescript/angular';


@Component({
	moduleId: module.id,
	selector: 'splash-screen',
	templateUrl: './splash-screen.component.html',
	styleUrls: ['./splash-screen.component.css']
})

export class SplashScreenComponent implements OnInit {

	constructor(private page: Page , private router: RouterExtensions) {
		page.actionBarHidden = true;

	 }

	ngOnInit() {
		setTimeout(() => {
			//this.router.navigate(['/login']);
			this.router.navigate(['/login'], { clearHistory: true })
		  },7200);
	 }
}