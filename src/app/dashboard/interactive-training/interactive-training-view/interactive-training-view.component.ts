import { Component, NgZone, OnInit, ViewContainerRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ModalDialogService, RouterExtensions } from '@nativescript/angular';
import { EventData, Frame, ImageSource, Image , Page, Switch } from '@nativescript/core';
import { GlobalService } from '~/app/shared/services/global.service';
import { DashboardService } from '../../dashboard.service';
import { InteractiveTraining } from '~/app/shared/models/interactive-training';
import { localize } from '@nativescript/localize';
import { TrainingTypeId } from '~/app/shared/models/enums/TrainingTypeId';
import { FinishingConfirmComponent } from '../finishing-confirm/finishing-confirm.component';
import { environment } from '../../../../../environments/environment';
import * as share from '@nativescript/social-share'
import { QrGenerator } from 'nativescript-qr-generator';

@Component({
	moduleId: module.id,
	selector: 'interactive-training-view',
	templateUrl: './interactive-training-view.component.html',
	styleUrls: ['./interactive-training-view.component.css']
})


export class InteractiveTrainingViewComponent implements OnInit {
	detailsId: any;
	isLoading: boolean;
	Survey: any[]=[];
	SurveyId: any;
	SurveyData: any;
	type="InteractiveTraining"
	interactiveData:InteractiveTraining
	link=''
	answersData: any={};
	guessNumbers: any;
	qrCodeImageSource: UIImage;
	imageSource: ImageSource;
	constructor(private zone: NgZone, public globalService: GlobalService,private modalService: ModalDialogService, private vcRef: ViewContainerRef,
		private page: Page,private route:Router,private router:RouterExtensions,private activatedRoute:ActivatedRoute, 
		private dashboardService: DashboardService) {	
				this.detailsId = this.activatedRoute.snapshot.paramMap.get("detailsId");
}
	 ngOnInit() { 
		this.getInteractiveTrainingById(this.detailsId)
		this.GetTotalInteractiveTrainingAnswers();
		this.getSurvey('InteractiveTraining')
		// alert(environment.WEB_API+'interactiveTraining-details'+'/'+this.detailsId)

		
	}
	goBack() {	
		Frame.topmost().goBack();
	  }
	  onCheckedChange(args: EventData) {
		const sw = args.object as Switch
		const isChecked = sw.checked // boolean
		if(isChecked!=this.interactiveData.isActive){
		this.ChangeInteractiveTrainingStatus(isChecked);}
	  }
	  
	  getSurvey(type){
		this.isLoading=true
		this.dashboardService.survey(type).subscribe(
			(res: any) => {
				this.isLoading = false;
				console.log(res)
				this.SurveyData = res.topics
				this.SurveyId = res.id
	
			}
		)
	 }
	 getInteractiveTrainingById(id: string) {
		this.dashboardService.getInteractiveTrainingById(id).subscribe(
		  (data: InteractiveTraining) => {
			this.interactiveData =data
			this.interactiveData.questions=data.questions
			this.link=environment.WEB_API+'interactiveTraining-details'+'/'+this.detailsId
			 if (this.interactiveData.trainingTypeId==TrainingTypeId.GuessNumbers){
				this.GuessNumbersReport()
			}
		  },
		  error => {
			this.globalService.toast(localize('tryAgain'));
		}
		);
	  }	
	  share(){
		share.shareUrl(this.link,"");

	  }
	  ChangeInteractiveTrainingStatus(status){
		this.dashboardService.ChangeInteractiveTrainingStatus(this.detailsId,status).subscribe(
			(res: any) => {
				if (res.success == true) {
					this.interactiveData.isActive=status
					this.globalService.toast(localize('OperationSuccessful'));
					}	
				else{
					this.globalService.toast(res.errorCode);

				}		},
			error => {
			  this.globalService.toast(localize('tryAgain'));
		  }
		  );
	  }
	  openModal() {
		const response = this.modalService.showModal(FinishingConfirmComponent, {
			
			fullscreen: false,
			//viewContainerRef: this.vcRef,
			context:{id:this.interactiveData.id}
		} as any);
		response.then(res => {
				 console.log("Modal response: " + response,res);

			if (res == 'finish') {
				this.FinishInteractiveTraining();
			}
		},
			err => {

			})
		// console.log("Modal response: " + response);
	}
	FinishInteractiveTraining(){
		this.dashboardService.FinishInteractiveTraining(this.detailsId,true).subscribe(
			(res: any) => {
				if (res.success == true) {
					this.globalService.toast(localize('OperationSuccessful'));
					this.router.navigate(['/interactive-training-report',this.detailsId]);

					}			},
			error => {
			  this.globalService.toast(localize('tryAgain'));
		  }
		  );
	  }
	  GetTotalInteractiveTrainingAnswers(){
		this.dashboardService.GetTotalInteractiveTrainingAnswers(this.detailsId).subscribe(
			(data:any) => {
			  this.answersData =data
			},
			error => {
			  this.globalService.toast(localize('tryAgain'));
		  }
		  );
	  
	  }
	  GuessNumbersReport(){
		this.dashboardService.GuessNumbersReport(this.detailsId).subscribe(
			(data: any) => {
				this.guessNumbers= data.value
			},
			error => {
				this.globalService.toast(localize('tryAgain'));
			}
		);
	}
	  public get TrainingTypeId(): typeof TrainingTypeId {
		return TrainingTypeId;
	}
	  getNameOfInterActive(){
		if(this.interactiveData?.trainingTypeId==TrainingTypeId.TrueFalse)return"صح/خطأ"
		if(this.interactiveData?.trainingTypeId==TrainingTypeId.MultiChoice)return"متعدد الإجابات" 
		if(this.interactiveData?.trainingTypeId==TrainingTypeId.SingleChoice)return "إختيار الإجابة الصحيحة"
		if(this.interactiveData?.trainingTypeId==TrainingTypeId.Quiz)return" اختبار"
		if(this.interactiveData?.trainingTypeId==TrainingTypeId.CloudWords)return"الكلمات السحابية" 
		if(this.interactiveData?.trainingTypeId==TrainingTypeId.Survey)return" استبيان"
		if(this.interactiveData?.trainingTypeId==TrainingTypeId.Evaluation)return "تقييم"
		if(this.interactiveData?.trainingTypeId==TrainingTypeId.GuessNumbers)return"تخمين الأرقام"
		if(this.interactiveData?.trainingTypeId==TrainingTypeId.Voting)return"التصويت"
		if(this.interactiveData?.trainingTypeId==TrainingTypeId.QestionAnswer)return "سؤال و جواب"
		else return""
	  }
	  getQestionType(type){
		if(type==TrainingTypeId.TrueFalse)return"صح/خطأ"
		if(type==TrainingTypeId.MultiChoice)return"متعدد الإجابات" 
		if(type==TrainingTypeId.SingleChoice)return "إختيار الإجابة الصحيحة"
		if(type==TrainingTypeId.Quiz)return" اختبار"
		if(type==TrainingTypeId.CloudWords)return"الكلمات السحابية" 
		if(type==TrainingTypeId.Survey)return" استبيان"
		if(type==TrainingTypeId.Evaluation)return "تقييم"
		if(type==TrainingTypeId.GuessNumbers)return"تخمين الأرقام"
		if(type==TrainingTypeId.Voting)return"التصويت"
		if(type==TrainingTypeId.QestionAnswer)return "سؤال و جواب"
		else return""
	  }
/* 	 async onImageLoaded(){
		const qrGenerator = new QrGenerator();
    const qrCodeImageSource = await qrGenerator.generate(this.link);
	const imageSource = new ImageSource();
 imageSource.setNativeSource(qrCodeImageSource);
const qrCodeImageView = this.page.getViewById('qrCodeImage') as any;
qrCodeImageView.imageSource  = imageSource;

} */
onImageLoaded(args){
	const image = args.object as Image;
	const result = new QrGenerator().generate(environment.WEB_API+'interactiveTraining-details'+'/'+this.detailsId);
	image.imageSource = new ImageSource(result);
} 
refresh(){
	this.getInteractiveTrainingById(this.detailsId)
		this.GetTotalInteractiveTrainingAnswers();
		this.getSurvey('InteractiveTraining')
}
}