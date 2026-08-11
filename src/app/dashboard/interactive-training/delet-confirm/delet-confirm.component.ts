import { Component, OnInit } from '@angular/core';
import { ModalDialogParams } from '@nativescript/angular';

@Component({
	moduleId: module.id,
	selector: 'delet-confirm',
	templateUrl: './delet-confirm.component.html',
	styleUrls: ['./delet-confirm.component.css']
})

export class DeletConfirmComponent implements OnInit {

	constructor(private params: ModalDialogParams) { }

	ngOnInit() { }
	closePopup() {
		this.params.closeCallback('close'); // Close the popup
	  }
	  closePopupRemove(){
		this.params.closeCallback('remove'); // Close the popup

	  }
}