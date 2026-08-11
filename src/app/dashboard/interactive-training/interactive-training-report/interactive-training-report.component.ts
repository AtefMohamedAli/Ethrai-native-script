import { Component, ElementRef, NgZone, OnInit, ViewChild, ViewContainerRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ModalDialogService, RouterExtensions } from '@nativescript/angular';
import { EventData, Frame, LoadEventData, Page, Switch, Utils, View, WebView, isAndroid, isIOS } from '@nativescript/core';
import { GlobalService } from '~/app/shared/services/global.service';
import { DashboardService } from '../../dashboard.service';
import { InteractiveTraining } from '~/app/shared/models/interactive-training';
import { localize } from '@nativescript/localize';
import { TrainingTypeId } from '~/app/shared/models/enums/TrainingTypeId';
import { FinishingConfirmComponent } from '../finishing-confirm/finishing-confirm.component';
import { environment } from '../../../../../environments/environment';
import * as share from '@nativescript/social-share'
import { AnswersSurvey, Survey, SurveyRes } from '~/app/shared/models/answers-survey-report'
//import { Printer } from "nativescript-printer";

@Component({
	moduleId: module.id,
	selector: 'interactive-training-report',
	templateUrl: './interactive-training-report.component.html',
	styleUrls: ['./interactive-training-report.component.css']
})

export class InteractiveTrainingReportComponent implements OnInit {
	detailsId: string;
	interactiveData: InteractiveTraining;
	answersData: any;
	arrayOfAnswersSurvey: AnswersSurvey[] = [];
	arrayOfSurvey: Survey[] = [];
	guessNumbers: any;
	evaluationReport: any;
	quizReport: any[] = [];
	quizDetailsList: any;
	questionsCount: any;
	questionsCountArray: any[] = [];
	resultArray: Survey[]=[];
	@ViewChild('contant', { static: false }) contentRef: ElementRef;
	yourStackLayoutInstance: any;
	checked: boolean;


	constructor(private zone: NgZone, public globalService: GlobalService, private modalService: ModalDialogService, private vcRef: ViewContainerRef,
		private page: Page, private route: Router, private router: RouterExtensions, private activatedRoute: ActivatedRoute,
		private dashboardService: DashboardService, ){//private printer: Printer) {
		this.detailsId = this.activatedRoute.snapshot.paramMap.get("detailsId");

	}
	circleProgress: number = 30;
	ngOnInit() {
		this.getInteractiveTrainingById(this.detailsId)
		this.GetTotalInteractiveTrainingAnswers();
		setInterval(() => {
			if (this.circleProgress === 100) {
				this.circleProgress = 0;
			}
			this.circleProgress++;
		}, 100);
	}
	goBack() {
		Frame.topmost().goBack();
	}
	getInteractiveTrainingById(id: string) {
		this.dashboardService.getInteractiveTrainingById(id).subscribe(
			(data: InteractiveTraining) => {
				this.interactiveData = data
				if (this.interactiveData.trainingTypeId == TrainingTypeId.Survey) {
					this.getSurveyReport(this.detailsId)
				}
				else if (this.interactiveData.trainingTypeId == TrainingTypeId.GuessNumbers) {
					this.GuessNumbersReport()
				}
				else if (this.interactiveData.trainingTypeId == TrainingTypeId.Evaluation) {
					this.GetEvaluationReportRating()
				}
				else if (this.interactiveData.trainingTypeId == TrainingTypeId.QestionAnswer) {
					this.EvaluationReport()
				}
				else if (this.interactiveData?.trainingTypeId == TrainingTypeId.Quiz) {
					this.QuizReport()
				}
			},
			error => {
				this.globalService.toast(localize('tryAgain'));
			}
		);
	}

	getSurveyReport(id) {
		this.dashboardService.SurveyReport(id).subscribe((n: SurveyRes) => {
			console.log(n)
			this.arrayOfAnswersSurvey = n.value;
			/*this.interactiveData.questions.forEach(element => {
				this.arrayOfSurvey.push({
					questionsId: element.id,
					questionsName: element.nameAr,
					answers: []
				})
			});*/
			this.arrayOfAnswersSurvey.forEach(e => {
				const index = this.resultArray.findIndex(item => item.questionsId === e.questionId);
				if (index === -1) {
					
					this.resultArray.push({
						questionsId: e.questionId,
						questionsName: e.questionName,
						
						answers:e.answerCount==0?[]: [
							{
								answerName: e.answerName,
								answerCount: e.answerCount,
								questionId: e.questionId,
								questionName: e.questionName,
							}
						]
					});
				} else {
					if(e.answerCount>0){
					this.resultArray[index].answers.push({
						answerName: e.answerName,
						answerCount: e.answerCount,
						questionId: e.questionId,
						questionName: e.questionName,
					});}
				}
			});
		})
		console.log(this.resultArray)

	}
	/*getSurveyReport(id) {
		this.dashboardService.SurveyReport(id).subscribe((n: SurveyRes) => {
			console.log(n)
			this.arrayOfAnswersSurvey = n.value;

			this.interactiveData.questions.forEach(element => {
				this.arrayOfSurvey.push({
					questionsId: element.id,
					questionsName: element.nameAr,
					notAgree: 0,
					notAgreeCompletly: 0,
					agree: 0,
					agreeto: 0,
					agreeCompletly: 0
				})
			});
			this.resultArray = this.arrayOfSurvey.map((servey) => {
				const matchingAnswers = this.arrayOfAnswersSurvey.filter((answer) => answer.questionName === servey.questionsName && answer.questionId == servey.questionsId);
				if (matchingAnswers.length > 0) {
					const agree = matchingAnswers.reduce((sum, answer) => {
						if (answer.answerName === "أوافق") {
							return sum + answer.answerCount;
						}
						return sum;
					}, 0);
					const agreeto = matchingAnswers.reduce((sum, answer) => {
						if (answer.answerName === "أوافق الى حد ما") {
							return sum + answer.answerCount;
						}
						return sum;
					}, 0);
					const agreeCompletly = matchingAnswers.reduce((sum, answer) => {
						if (answer.answerName === "أوافق بشدة") {
							return sum + answer.answerCount;
						}
						return sum;
					}, 0);
					const notAgree = matchingAnswers.reduce((sum, answer) => {
						if (answer.answerName === "لا أوافق") {
							return sum + answer.answerCount;
						}
						return sum;
					}, 0);
					const notAgreeCompletly = matchingAnswers.reduce((sum, answer) => {
						if (answer.answerName === "لا أوافق بشدة") {
							return sum + answer.answerCount;
						}
						return sum;
					}, 0);
					return {
						questionsId: servey.questionsId,
						questionsName: servey.questionsName,
						notAgree: servey.notAgree + notAgree,
						notAgreeCompletly: servey.notAgreeCompletly + notAgreeCompletly,
						agree: servey.agree + agree,
						agreeto: servey.agreeto + agreeto,
						agreeCompletly: servey.agreeCompletly + agreeCompletly
					};
				} else {
					return servey;
				}
			});

			console.log(this.resultArray);
		})
	}*/
	GuessNumbersReport() {
		this.dashboardService.GuessNumbersReport(this.detailsId).subscribe(
			(data: any) => {
				this.guessNumbers = data.value
			},
			error => {
				this.globalService.toast(localize('tryAgain'));
			}
		);
	}
	EvaluationReport() {
		this.dashboardService.EvaluationReport(this.detailsId).subscribe(
			(data: any) => {
				this.evaluationReport = data.value.answersEvaluationList
			},
			error => {
				this.globalService.toast(localize('tryAgain'));
			}
		);
	}
	GetEvaluationReportRating() {
		this.dashboardService.GetEvaluationReportRating(this.detailsId).subscribe(
			(data: any) => {
				this.evaluationReport = data
			},
			error => {
				this.globalService.toast(localize('tryAgain'));
			}
		);
	}
	QuizReport() {
		this.dashboardService.QuizReport(this.detailsId).subscribe(
			(data: any) => {
				this.quizDetailsList = data.value.quizDetailsList

				this.questionsCount = data.value.questionsCount
				this.questionsCountArray.push({ name: 'المشاركين' });
				for (let l = 0; l < this.questionsCount; l++) {
					this.questionsCountArray.push({ name: 'السؤال' });
				}
				this.questionsCountArray.push({ name: 'النتيجة' });

			},
			error => {
				this.globalService.toast(localize('tryAgain'));
			}
		);
	}
	GetTotalInteractiveTrainingAnswers() {
		this.dashboardService.GetTotalInteractiveTrainingAnswers(this.detailsId).subscribe(
			(data: any) => {
				this.answersData = data
			},
			error => {
				this.globalService.toast(localize('tryAgain'));
			}
		);

	}
	public get TrainingTypeId(): typeof TrainingTypeId {
		return TrainingTypeId;
	}
	getNameOfInterActive() {
		if (this.interactiveData?.trainingTypeId == TrainingTypeId.TrueFalse) return " نشاط صح/خطأ"
		if (this.interactiveData?.trainingTypeId == TrainingTypeId.MultiChoice) return " نشاط متعدد الإجابات"
		if (this.interactiveData?.trainingTypeId == TrainingTypeId.SingleChoice) return "نشاط إختيار الإجابة الصحيحة"
		if (this.interactiveData?.trainingTypeId == TrainingTypeId.Quiz) return " نشاط اختبار"
		if (this.interactiveData?.trainingTypeId == TrainingTypeId.CloudWords) return "نشاط الكلمات السحابية"
		if (this.interactiveData?.trainingTypeId == TrainingTypeId.Survey) return " نشاط استبيان"
		if (this.interactiveData?.trainingTypeId == TrainingTypeId.Evaluation) return "نشاط تقييم"
		if (this.interactiveData?.trainingTypeId == TrainingTypeId.GuessNumbers) return "نشاط تخمين الأرقام"
		if (this.interactiveData?.trainingTypeId == TrainingTypeId.Voting) return "نشاط التصويت"
		if (this.interactiveData?.trainingTypeId == TrainingTypeId.QestionAnswer) return "نشاط سؤال و جواب"
		else return ""
	}

	/*public download() {
		let view: View = this.page.getViewById("print");
		this.printer.printScreen({
			view: view
		}).then((success) => {
			console.log('llllllll', success)
		}, (error) => {
			alert("Error: " + error);
		});
	}*/
	handleRepeatName(){
		return this.interactiveData?.trainingTypeId == TrainingTypeId.CloudWords?"اجمالي تكرار الكلمة":"اجمالي التكرار "
	}


}