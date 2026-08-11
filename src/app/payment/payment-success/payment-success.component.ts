import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { RouterExtensions } from '@nativescript/angular';
import { Page } from '@nativescript/core';
import { FirebaseEventService } from '~/app/shared/services/firebase.event.service';
import { GlobalService } from '../../shared/services/global.service';

@Component({
	moduleId: module.id,
	selector: 'payment-success',
	templateUrl: './payment-success.component.html',
	styleUrls: ['./payment-success.component.css']
})

export class PaymentSuccessComponent implements OnInit {
	productId: string;

	constructor(private page: Page,private route:ActivatedRoute,private router:RouterExtensions,private globalService:GlobalService,private firebaseEventService:FirebaseEventService) 
	{
		page.actionBarHidden = true;
		// this.productId = this.route.snapshot.paramMap.get("productId");

	 }

	ngOnInit() { 
		this.firebaseEventService.logScreenViewedEvent(this.globalService.isLoggedIn,this.globalService.getUserStats(),'payment_success',this.globalService.getUserProfile());

	}

	goToCourse(){
		this.globalService.previousURL='/payment-success'
		this.router.navigate(['my-products'])
	}
}