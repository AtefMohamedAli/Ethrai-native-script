import { Component, OnInit, ViewContainerRef } from '@angular/core';
import { Dialogs, Frame, Page } from '@nativescript/core';
import { SettingsService } from '../settings.service';
import { Utils, Device } from '@nativescript/core'
import { environment } from '../../../../environments/environment';
import { ModalDialogService } from '@nativescript/angular';
import { ModalComponent } from '../modal/modal.component';
import { GlobalService } from '~/app/shared/services/global.service';
import { FirebaseEventService } from '~/app/shared/services/firebase.event.service';

@Component({
	moduleId: module.id,
	selector: 'about-ethrai',
	templateUrl: './about-ethrai.component.html',
	styleUrls: ['./about-ethrai.component.css']
})

export class AboutEthraiComponent implements OnInit {
	TAndC: any;
	whoWeAre: any;
	sections: any[];

	constructor(private page: Page,private settingsService:SettingsService,private modalService: ModalDialogService,
		private vcRef: ViewContainerRef,private globalService:GlobalService,private firebaseEventService:FirebaseEventService) { 
		//page.actionBarHidden = true;

	 }
	goBack() {
		
		Frame.topmost().goBack();
	
	  }
	ngOnInit() { 
		if(this.globalService.isLoggedIn && this.globalService.isEthrai){
			this.firebaseEventService.logScreenViewedEvent(this.globalService.isLoggedIn,this.globalService.getUserStats(),'about_ethrai',this.globalService.getUserProfile());
		}else if(!this.globalService.isLoggedIn){
			this.firebaseEventService.logScreenViewedEvent(this.globalService.isLoggedIn,null,'about_ethrai',null);	
		}
		this.settingsService.getAboutContent().subscribe(
			response=>{
				this.sections=response as any[]			
			},
			err=>{

			}
		)
	}
	gotoWebsite(){
		Utils.openUrl(environment.WEB_API);
	}
	getText(html):string{
		return html.replace(/<[^>]+>/g, '').replace(/&nbsp;/g, '').split('.').join('. ');
	}
	openModal(type) {
        const response =  this.modalService.showModal(ModalComponent, {
            context: {
                dim: "#00000000",
                type: type,
            },
            fullscreen: false,
            viewContainerRef: this.vcRef,
            dimAmount: 0.5,
        } as any);
        // console.log("Modal response: " + response);
    }
}