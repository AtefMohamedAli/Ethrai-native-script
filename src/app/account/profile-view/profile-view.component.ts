import { Component, OnInit } from '@angular/core';
import { RouterExtensions } from '@nativescript/angular';
import { Page } from "@nativescript/core";
import { Frame } from '@nativescript/core';
import { environment } from '../../../../environments/environment';
import { UserProfile } from '../../shared/models/user-profile';
import { GlobalService } from '../../shared/services/global.service';
import { AccountService } from '../account.service';

@Component({
	moduleId: module.id,
	selector: 'profile-view',
	templateUrl: './profile-view.component.html',
	styleUrls: ['./profile-view.component.css']
})

export class ProfileViewComponent implements OnInit {
	profile: UserProfile;
	interestsIDs: string[];
	userTags: any = [];
	currentTenantID: any;
	public email: string;
	isSaudi: boolean;
	isEthrai: any;
	constructor(private page: Page, private globalService: GlobalService, private accountService: AccountService,
		private router: RouterExtensions) {
		//page.actionBarHidden = true;

	}
	goBack() {

		Frame.topmost().goBack();

	}
	ngOnInit() {
		this.isEthrai = this.globalService.isEthrai
		this.profile = this.globalService.getUserProfile();
		// if(this.profile.photoUrl == "" || this.profile.photoUrl == null){
		// 	this.profile.photoUrl="~/images/avatar.png"
		// }
		this.interestsIDs = this.globalService.getUserInterestsIDs();
		this.isSaudi = this.globalService.isSaudi();
		this.getUserInterests();
		this.getUserCurrentTenant();
	}

	getUserInterests() {
		this.accountService.getAllTags().subscribe(
			response => {
				let allTags = response as any[]
				this.userTags = allTags.filter(tag => {
					if (this.interestsIDs.includes(tag.id)) {
						return tag;
					}
				})
			})
	}

	getUserCurrentTenant() {
		this.email = this.globalService.getUserCurrentEmail();
		// this.accountService.getCurrentTenant().subscribe(
		// 	response=>{
		// 	   let tenant=response as any
		// 	   let currentTenantID = tenant.id;
		// 	   let currentTenant=this.profile.tenants.filter(t=>{t.tenantId==currentTenantID;return t});
		// 	   this.email=currentTenant[0].email;
		// 	   this.globalService.setCurrentTenant(currentTenant[0]);
		// 	})
	}

	navigateToProfileForm() {
		if (this.email) {
			this.router.navigate(['/profile-form', this.email]);
		} else {
			this.globalService.toast('Unable to load profile email');
		}
	}

}