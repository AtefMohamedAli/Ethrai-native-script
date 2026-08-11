import { Component, OnInit } from '@angular/core';
import { EventData, Switch } from '@nativescript/core'
import { Frame } from '@nativescript/core';
import { Page } from '@nativescript/core';

@Component({
	moduleId: module.id,
	selector: 'learning-reminder',
	templateUrl: './learning-reminder.component.html',
	styleUrls: ['./learning-reminder.component.css']
})

export class LearningReminderComponent implements OnInit {

	constructor(private page: Page) { 
		//page.actionBarHidden = true;

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