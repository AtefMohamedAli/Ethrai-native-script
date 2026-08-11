import { Component, OnInit } from '@angular/core';
import { EventData, Switch } from '@nativescript/core'
import { Frame } from '@nativescript/core';
import { Page } from '@nativescript/core';

@Component({
	moduleId: module.id,
	selector: 'download-settings',
	templateUrl: './download-settings.component.html',
	styleUrls: ['./download-settings.component.css']
})

export class DownloadSettingsComponent implements OnInit {

	public items: Array<string>;
	constructor(private page: Page) { 
		//page.actionBarHidden = true;
		this.items = ["auto","360p","480p","720p","1080p"];

	 }
	goBack() {
		
		Frame.topmost().goBack();
	
	  }
	  onCheckedChange(args: EventData) {
		const sw = args.object as Switch
		const isChecked = sw.checked // boolean
	  }
	ngOnInit() { }
}