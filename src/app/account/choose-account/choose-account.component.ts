import { Component, OnInit } from '@angular/core';
import { RouterExtensions } from '@nativescript/angular';
import { Page } from "@nativescript/core";
import { Frame } from '@nativescript/core';
import { environment } from '../../../../environments/environment';
import { ValueList } from 'nativescript-drop-down';
import { GlobalService } from '../../shared/services/global.service';
import { HttpService } from '../../shared/services/http.service';
import { UserProfile } from '~/app/shared/models/user-profile';
import { AccountService } from '../account.service';
import { DashboardService } from '~/app/dashboard/dashboard.service';
import { FirebaseEventService } from '~/app/shared/services/firebase.event.service';

@Component({
	moduleId: module.id,
	selector: 'choose-account',
	templateUrl: './choose-account.component.html',
	styleUrls: ['./choose-account.component.css']
})

export class ChooseAccountComponent implements OnInit {
    public items: Array<string>;
	tenantsSource: ValueList<string> = new ValueList<string>();
	selectedTenantID: string;
	tenants: any;
	selectedTenant: number;
	tenant: any;
	constructor(private page: Page,private globalService:GlobalService,private router:RouterExtensions,private httpService:HttpService,
		private accountService:AccountService,private dashboardService:DashboardService,private firebaseEventService:FirebaseEventService) { 
		page.actionBarHidden = true;
		 this.tenants=this.globalService.getUserTenants();
		this.tenants.forEach(tenant => {
			this.tenantsSource.push({ value: tenant.id, display: tenant.nameAr})
		});
		this.selectedTenant=this.tenantsSource.getIndex(environment.ETHRAI_GUID)
		this.selectedTenantID = this.tenantsSource.getValue(this.selectedTenant);

	 }
	 goBack() {
		
		Frame.topmost().goBack();
	
	  }

	ngOnInit() {
		this.globalService.isEthrai=true;
		this.httpService.apiURL=environment.API_URL
		this.globalService.setEthraiTenant(true)
		this.globalService.currentTenantId=this.selectedTenantID

		this.getUserProfile();
	 }

	onTenantChange(e){
		this.selectedTenantID = this.tenantsSource.getValue(e.newIndex);
		this.tenant=this.tenants[e.newIndex]
		if(environment.ETHRAI_GUID !==this.selectedTenantID){
			this.httpService.apiURL="https://"+this.tenant.domain+".ethrai.sa/api/";
			this.globalService.isEthrai=false
			// this.globalService.setEthraiTenant(false)
		}else if(environment.ETHRAI_GUID ==this.selectedTenantID){
			this.httpService.apiURL=environment.API_URL
			// this.globalService.setEthraiTenant(true)
			this.globalService.isEthrai=true
		}
		this.globalService.currentTenantId=this.tenantsSource.getValue(e.newIndex)
		// this.globalService.setCurrentTenant(this.tenants[e.newIndex])
	}
	goToTenant(){
		if(environment.ETHRAI_GUID !==this.selectedTenantID && this.globalService.getIsKeepLogged()){
			this.globalService.setTenantDomain(this.tenant.domain)
			this.globalService.setEthraiTenant(false)
		}else if(environment.ETHRAI_GUID ==this.selectedTenantID && this.globalService.getIsKeepLogged()){
			this.globalService.setEthraiTenant(true)
		}
		if(this.globalService.editPrefrences){
			this.router.navigate(['categories']);
		}else{
			this.router.navigate(['highlighted']);
		}
	}
	getUserProfile(){
		this.accountService.getUserProfile().subscribe(
			response=>{
				let profile = response as UserProfile
				this.globalService.setUserProfile(profile);
				this.globalService.setUserType(profile.type);
				this.getUserStats();

			}
		)
	}
	getUserStats(){
		this.dashboardService.getUserStats().subscribe(
			res=>{
				this.globalService.setUserStats(res);
				this.firebaseEventService.logScreenViewedEvent(this.globalService.isLoggedIn,res,'login_tenant',this.globalService.getUserProfile());
			}
		)
	}
}