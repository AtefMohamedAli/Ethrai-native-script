import { Component, OnInit } from '@angular/core';
import { EventData, Switch } from '@nativescript/core'
import { Frame } from '@nativescript/core';
import { Page } from '@nativescript/core';

@Component({
	moduleId: module.id,
	selector: 'content-language',
	templateUrl: './content-language.component.html',
	styleUrls: ['./content-language.component.css']
})

export class ContentLanguageComponent implements OnInit {

	public items: Array<string>;
	constructor(private page: Page) { 
		//page.actionBarHidden = true;
		this.items = ["العربية", "English"];

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