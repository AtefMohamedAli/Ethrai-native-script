import { Component, OnInit } from '@angular/core';
import { EventData, Switch } from '@nativescript/core'
import { Frame } from '@nativescript/core';
import { Page } from '@nativescript/core';
import { SelectedIndexChangedEventData } from 'nativescript-drop-down';
import { GlobalService } from '~/app/shared/services/global.service';



@Component({
	moduleId: module.id,
	selector: 'video-settings',
	templateUrl: './video-settings.component.html',
	styleUrls: ['./video-settings.component.css']
})

export class VideoSettingsComponent implements OnInit {
    public items: Array<string>;
	index;
	constructor(private page: Page,public globalService:GlobalService) { 
		//page.actionBarHidden = true;
		this.items = ["auto","360","480","720","1080"];
		let quality=this.globalService.getVideoQuality();		
		quality?this.index=this.items.indexOf(quality):this.index=0;
	 }
	goBack() {
		
		Frame.topmost().goBack();
	
	  }
	  onCheckedChange(args: EventData,type) {
		const sw = args.object as Switch
		const isChecked = sw.checked
		if(type=='autoPlay'){
			this.globalService.setAutoPlayNextVideo(isChecked);
		}
	  }
	ngOnInit() { }

	onQualityChange(e:SelectedIndexChangedEventData){
		this.index=e.newIndex;
		let quality=this.items[e.newIndex];
		this.globalService.setVideoQuality(quality);
		console.log(this.globalService.getVideoQuality())
	}
}