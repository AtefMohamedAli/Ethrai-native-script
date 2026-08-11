import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Page } from "@nativescript/core";
import { Frame } from '@nativescript/core';
import { localize } from '@nativescript/localize';
import { FirebaseEventService } from '~/app/shared/services/firebase.event.service';
import { GlobalService } from '../../shared/services/global.service';
import { AccountService } from '../account.service';

@Component({
	moduleId: module.id,
	selector: 'regiser-confirm',
	templateUrl: './regiser-confirm.component.html',
	styleUrls: ['./regiser-confirm.component.css']
})

export class RegiserConfirmComponent implements OnInit {
	email: string;

	constructor(private page: Page,private route: ActivatedRoute,private accountService:AccountService,private globalService:GlobalService,
		private firebaseEventService:FirebaseEventService) { 
		page.actionBarHidden = true;
		this.email = this.route.snapshot.paramMap.get("email");

	 }
	 goBack() {
		
		Frame.topmost().goBack();
	
	  }
	ngOnInit() { 
		this.firebaseEventService.logScreenViewedEvent(this.globalService.isLoggedIn,this.globalService.getUserStats(),'register_confirmation',this.globalService.getUserProfile());

	}

	resend(){
		this.accountService.resendConfirmMail({email:this.email}).subscribe(
			res=>{
				if((res as any).success){
					this.globalService.toast(localize('OperationSuccessful'))
				}
			},
			err=>{

			}
		)
	}
}