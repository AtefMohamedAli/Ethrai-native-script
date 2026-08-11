import { Component, Input, OnInit } from '@angular/core';
import { ModalDialogParams, RouterExtensions } from '@nativescript/angular';
import { DashboardService } from '../../dashboard.service';
import { localize } from '@nativescript/localize';
import { GlobalService } from '~/app/shared/services/global.service';

@Component({
	moduleId: module.id,
	selector: 'finishing-confirm',
	templateUrl: './finishing-confirm.component.html',
	styleUrls: ['./finishing-confirm.component.css']
})

export class FinishingConfirmComponent implements OnInit {
	//@Input() context: any; 
	constructor(private params: ModalDialogParams,private dashboardService: DashboardService, public globalService: GlobalService,private router:RouterExtensions) { }

	ngOnInit() {
		console.log(this.params.context.id,'lllllllll')
	 }
	closePopup() {
		this.params.closeCallback('close'); // Close the popup
	}
	finish() {
		//this.FinishInteractiveTraining();
		this.FinishInteractiveTraining();

		this.params.closeCallback('finish'); 
		//this.router.navigate(['/interactive-training-report']);

	}
	FinishInteractiveTraining(){
		this.dashboardService.FinishInteractiveTraining(this.params.context.id,true).subscribe(
			(res: any) => {
				console.log(res,'FinishInteractiveTraining')
				if (res.success == true) {
					this.globalService.toast(localize('OperationSuccessful'));
					this.router.navigate(['/interactive-training-report',this.params.context.id]);

					}			},
			error => {
			  this.globalService.toast(localize('tryAgain'));
		  }
		  );
	  }
	/*FinishInteractiveTraining(){
		this.dashboardService.FinishInteractiveTraining(this.params.context.id,true).subscribe(
			(res: any) => {
				if (res.success == true) {
					this.globalService.toast(localize('OperationSuccessful'));
					}			},
			error => {
			  this.globalService.toast(localize('tryAgain'));
		  }
		  );
	  }*/
}