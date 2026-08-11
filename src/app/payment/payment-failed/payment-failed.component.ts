import { Component, OnInit } from '@angular/core';
import { RouterExtensions } from '@nativescript/angular';
import { Page } from '@nativescript/core';
import { FirebaseEventService } from '~/app/shared/services/firebase.event.service';
import { GlobalService } from '~/app/shared/services/global.service';

@Component({
	moduleId: module.id,
	selector: 'payment-failed',
	templateUrl: './payment-failed.component.html',
	styleUrls: ['./payment-failed.component.css']
})

export class PaymentFailedComponent implements OnInit {

	constructor(private page: Page,private router:RouterExtensions,private globalService:GlobalService,private firebaseEventService:FirebaseEventService) 
	{
		page.actionBarHidden = true;
		
	 }
	ngOnInit() {
		this.firebaseEventService.logScreenViewedEvent(this.globalService.isLoggedIn,this.globalService.getUserStats(),'payment_failed',this.globalService.getUserProfile());

	 }

	goToCart(){
		this.globalService.previousURL="/payment-failed"
		this.router.navigate(['/shopping-cart']);
	}
}