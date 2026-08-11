import { Component, OnInit } from '@angular/core';
import { Page } from "@nativescript/core";
import { Frame } from '@nativescript/core';
import { FirebaseEventService } from '~/app/shared/services/firebase.event.service';
import { GlobalService } from '~/app/shared/services/global.service';
@Component({
	moduleId: module.id,
	selector: 'register-confirm',
	templateUrl: './register-confirm.component.html',
	styleUrls: ['./register-confirm.component.css']
})

export class RegisterConfirmComponent implements OnInit {

	constructor(private page: Page ,private firebaseEventService:FirebaseEventService,private globalService:GlobalService) { 
		page.actionBarHidden = true;
		
	 }
	 goBack() {
		
		Frame.topmost().goBack();
	
	  }

	ngOnInit() {
		if(this.globalService.isEthrai){
			this.firebaseEventService.logScreenViewedEvent(this.globalService.isLoggedIn,this.globalService.getUserStats(),'confirmation',this.globalService.getUserProfile());
		}
	 }
}