import { Component, OnInit } from '@angular/core';
import { Frame, Page } from '@nativescript/core';
import { FirebaseEventService } from '~/app/shared/services/firebase.event.service';
import { GlobalService } from '~/app/shared/services/global.service';
import { SettingsService } from '../settings.service';

@Component({
	moduleId: module.id,
	selector: 'help-center',
	templateUrl: './help-center.component.html',
	styleUrls: ['./help-center.component.css']
})

export class HelpCenterComponent implements OnInit {
	clickedd = {}; s;
	qAndA: any=[];
	selectedTopic: any={};
	isLoading: boolean;
	constructor(private page: Page,private settingsService:SettingsService,private globalService:GlobalService,
		private firebaseEventService:FirebaseEventService) { 
		//page.actionBarHidden = true;

	 }
	 getText(html):string{
		return html?.replace(/<[^>]+>/g, '').replace(/&nbsp;/g, '');
	}
	 clickme(item) {
        this.clickedd = item;
    }
    uclickme() {
        this.clickedd = {};
    }

	goBack() {
		
		Frame.topmost().goBack();
	
	  }

	ngOnInit() {
		this.getQandA();
		if(this.globalService.isLoggedIn && this.globalService.isEthrai){
			this.firebaseEventService.logScreenViewedEvent(this.globalService.isLoggedIn,this.globalService.getUserStats(),'help_center',this.globalService.getUserProfile());
		}else if(!this.globalService.isLoggedIn){
			this.firebaseEventService.logScreenViewedEvent(this.globalService.isLoggedIn,null,'help_center',null);	
		}
	 }

	getQandA(){
		this.isLoading=true;
		this.settingsService.getQandA().subscribe(
			res=>{
				this.isLoading=false;
				this.qAndA=res as any
				this.selectedTopic=this.qAndA[0]
			},
			err=>{

			}
		)
	}

	selectTopic(topic){
		this.selectedTopic=topic;
	}
}