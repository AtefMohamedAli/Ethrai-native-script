import { Component, OnInit } from '@angular/core';
import { ModalDialogParams } from '@nativescript/angular';
import { Frame, isAndroid } from '@nativescript/core';
import { Page } from '@nativescript/core';
import { SettingsService } from '../settings.service';


@Component({
	moduleId: module.id,
	selector: 'modal',
	templateUrl: './modal.component.html',
	styleUrls: ['./modal.component.css']
})

export class ModalComponent implements OnInit {
    public items: Array<string>;
	type: any;
	content: any={};
	isAndroid
	constructor(private page: Page,private settingsService:SettingsService,private params: ModalDialogParams) { 
		this.type = params.context.type;
	 }
	goBack() {
		
		Frame.topmost().goBack();
	
	  }
	
	ngOnInit() { 
		this.isAndroid=isAndroid
		this.settingsService.getEthraiTerms().subscribe(
			res=>{
				if(this.type=='privacy'){
					this.content=(res as any).ethraiLinks.find(item=>item.flag=='PrivacyPolicy')
				}else if(this.type=='terms'){
					this.content=(res as any).ethraiLinks.find(item=>item.flag=='TermsAndConditions')
				}
			},
			err=>{}
		)
	}
	onLabelLoaded(event)
{        
    event.object.textAlignment = "right";
}
	getText(html):string{
		return html?.replace(/<[^>]+>/g, '').replace(/&nbsp;/g, '');
	}
}