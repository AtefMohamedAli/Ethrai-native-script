import { Component, Input, Output, EventEmitter, OnDestroy, OnInit, ElementRef, NgZone } from '@angular/core';
import { Page, SegmentedBarItem } from "@nativescript/core";
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { localize } from '@nativescript/localize';
import { SelectedIndexChangedEventData, ValueList } from 'nativescript-drop-down';
import { SurveyPayload } from '~/app/shared/models/survey-payload';
import { GlobalService } from '~/app/shared/services/global.service';
import { DashboardService } from '../dashboard.service';
import { Subscription } from 'rxjs';
@Component({
	moduleId: module.id,
	selector: 'survey',
	templateUrl: './survey.component.html',
	styleUrls: ['./survey.component.css']
})

export class SurveyComponent implements OnInit, OnDestroy {
	@Input() SurveyData: any;
	@Input() type: any;
	@Input() productId: any;
	@Input() SurveyId: any;
	@Input() enrollmentId: string = '';
	@Output() surveySubmitted = new EventEmitter<void>();

	formGroup: FormGroup = new FormGroup({});
	clickedd1 = {}; b;
	elem;
	isSubmitting = false
	surveyPayload: SurveyPayload
	isLoading: boolean = false;
	isSurvey: boolean = false;
	newSurveyData: any;
	labelRef: any;
	private submitSub: Subscription;

	constructor(private fb: FormBuilder, private globalService: GlobalService, private dashboardService: DashboardService,
		private elementRef: ElementRef, private ngZone: NgZone
	) {
	}

	ngOnInit() {
		/*if(this.SurveyData){
			this.SurveyData.forEach(element => {                
				element?.questions.forEach(g => {
					this.addFromControl(g.id)
				});
			});
			this.newSurveyData = this.SurveyData.map(obj => ({ ...obj, isActive: true }));
			console.log(',.,,,,',this.newSurveyData)
		}*/
		if (this.SurveyData) {
			this.newSurveyData = this.SurveyData.map(element => {
				const updatedQuestions = element.questions.map(question => {
					this.addFromControl(question.id);
					const surveyOption: ValueList<string> = new ValueList<string>();
					question.answerChoices.forEach(choice => {
						surveyOption.push({ value: choice.id, display: choice.descriptionAr });
					});
					return { ...question, surveyOption };
					// const surveyOption: any[] = question.answerChoices.map(choice => {
					// 	return { title: choice.descriptionAr, value: choice.id, isChecked: false }; // Assuming 'descriptionAr' is the display property
					// });
					// return { ...question, surveyOption };
				});
				return { ...element, questions: updatedQuestions, isActive: true };
			});

			//console.log(',.,,,,', this.newSurveyData[0].questions[0].surveyOption);
		}

		this.surveyPayload = {
			enrollmentId: "",
			surveyId: "string",
			productId: "",
			answers: [
			],

		}
	}

	ngOnDestroy(): void {
		if (this.submitSub) {
			this.submitSub.unsubscribe();
		}
	}

	private isAlreadySavedError(err: any): boolean {
		return err?.error?.errorCode === 'AlreadySaved' || err?.errorCode === 'AlreadySaved';
	}

	private getAnswerIdFromControlValue(question: any, controlValue: any): string | null {
		if (controlValue === undefined || controlValue === null || controlValue === '') return null;
		const options = question?.surveyOption;

		if (typeof controlValue === 'number') {
			if (controlValue < 0 || !options?.getValue) return null;
			return options.getValue(controlValue) || null;
		}

		if (typeof controlValue === 'string') {
			const numericValue = Number(controlValue);
			if (!Number.isNaN(numericValue) && String(numericValue) === controlValue && options?.getValue) {
				return options.getValue(numericValue) || null;
			}
			return controlValue;
		}

		return controlValue?.value || controlValue?.id || null;
	}

	private rebuildSurveyPayloadFromForm(): SurveyPayload {
		const answersByQuestion = new Map<string, string>();

		this.newSurveyData?.forEach(topic => {
			topic?.questions?.forEach(question => {
				const controlName = this.getControlFormName(question?.id);
				const controlValue = this.formGroup.get(controlName)?.value;
				const answerId = this.getAnswerIdFromControlValue(question, controlValue);
				if (question?.id && answerId) {
					answersByQuestion.set(question.id, answerId);
				}
			});
		});

		return {
			enrollmentId: this.enrollmentId || '',
			productId: this.productId,
			surveyId: this.SurveyId,
			answers: Array.from(answersByQuestion.entries()).map(([questionId, answerId]) => ({ questionId, answerId }))
		};
	}

	private handleSurveySuccess(): void {
		this.isSurvey = true;
		this.globalService.toast(localize('surveySuccess'));
		this.surveySubmitted.emit();
	}
	checkBoxId(i) {
		return 'CB' + i
	}
	clickme(i) {
		this.newSurveyData[i].isActive = false;
		//const page: Page = <Page>this.elementRef.nativeElement.page;
		//page.css = '#he { height: 300 }'


	}
	uclickme(i) {
		this.newSurveyData[i].isActive = true;
		// const page: Page = <Page>this.elementRef.nativeElement.page;
		// page.css = '.coll_height { height: 60 }'
	}
	addSurvey(type) {
		this.isLoading = true;
		if (this.submitSub) {
			this.submitSub.unsubscribe();
		}
		this.submitSub = this.dashboardService.addSurvey(this.surveyPayload, 'TrainingResource', type).subscribe(
			(res: any) => {
				this.isLoading = false;
				this.isSubmitting = false;
				if (res?.success === true) {
					this.handleSurveySuccess();
				}
				else {
					this.globalService.toast(localize('tryAgain'));
				}
			},
			err => {
				this.isLoading = false;
				this.isSubmitting = false;
				if (this.isAlreadySavedError(err)) {
					this.handleSurveySuccess();
					return;
				}
				this.globalService.toast(localize('tryAgain'));
			}
		);
	}
	addCourseSurvey() {
		this.isLoading = true;
		if (this.submitSub) {
			this.submitSub.unsubscribe();
		}
		this.submitSub = this.dashboardService.addCourseSurvey(this.surveyPayload).subscribe(
				(res: any) => {
					this.isLoading = false;
					this.isSubmitting = false;
					if (res?.success === true) {
						this.handleSurveySuccess();
					}
				else {
					this.globalService.toast(localize('tryAgain'));
				}
			},
			err => {
				this.isLoading = false;
				this.isSubmitting = false;
				if (this.isAlreadySavedError(err)) {
					this.handleSurveySuccess();
					return;
				}
				this.globalService.toast(localize('tryAgain'));
			}
		);
	}
	handleQ(ans, i, l) {
		for (let index = 0; index < l; index++) {
			if (i == index) {
				let SurveyOption: ValueList<string> = new ValueList<string>();

				ans.forEach(element => {
					SurveyOption.push({ value: element.id, display: element.descriptionAr });

				});
				return SurveyOption
			}
		}

	}
	save() {
		if (this.isSubmitting) return;
		this.formGroup.markAllAsTouched();//Show All Validation Messages
		console.log(this.formGroup.value);

		if (!this.formGroup.invalid) {
			this.surveyPayload = this.rebuildSurveyPayloadFromForm();
			if (!this.surveyPayload.answers?.length) {
				this.globalService.toast(localize('surveyVM'));
				return;
			}

			this.isSubmitting = true;
			if (this.type == 'TRAININGGAME') this.addSurvey('EducationalGames');
			else if (this.type == 'INTERACTIVEEX') this.addSurvey('InteractiveExercises');
			else if (this.type == 'InteractiveTraining') this.addSurvey('InteractiveTraining');
			else if (this.type == 'Course') this.addCourseSurvey();
			else this.isSubmitting = false;
		} else {
			this.globalService.toast(localize('surveyVM'))

		}
	}

	addFromControl(id) {
		let validators = [];
		validators.push(Validators.required);
		this.formGroup.addControl(this.getControlFormName(id), this.fb.control(null, validators));
		return ''
	}
	getControlFormName(id) {
		return `Control_${id}`;
	}
	isNotValid(id) {
		const controlName = this.getControlFormName(id);
		return !this.formGroup.get(controlName)?.valid && (this.formGroup.get(controlName)?.dirty || this.formGroup.get(controlName)?.touched) ? true : false
	}
	reset() {
		this.isSubmitting = false
		this.formGroup.reset()
		this.surveyPayload = {
			enrollmentId: "",
			surveyId: "",
			productId: "",
			answers: [],

		}
	}
	onAnswerChange(e, item, i, j, k, questionId) {
		setTimeout(() => {
			if (e.value == null) {
				console.log('Null', e.value, j, item.isChecked, k)
				return;
			}
			item.isChecked = e.value == true ? true : false;
			if (!item.isChecked || item.isChecked == null) {
				console.log('!item.isChecked', e.value, j, item.isChecked, k)

				return;
			}
			console.log('Checked', e.value, j, item.isChecked, k)
			if (item.isChecked == true) {
				const selectedAnswerId = item.value;
				const foundIndex = this.surveyPayload.answers.findIndex(el => el.questionId === questionId);

				if (foundIndex !== -1) {
					// Update the existing answerId
					this.surveyPayload.answers[foundIndex].answerId = selectedAnswerId;
				} else {
					// If the questionId is not found, splice the existing item and push a new one
					//this.surveyPayload.answers.splice(this.surveyPayload.answers.findIndex(el => el.questionId === questionId), 1);
					this.surveyPayload.answers.push({ answerId: selectedAnswerId, questionId: questionId });
				}

				this.newSurveyData[i].questions[j].surveyOption.forEach(element => {
					if (element.value != item.value) {
						element.isChecked = false;
					}
				});
			}
		});
	}
	/*onChange(event:SelectedIndexChangedEventData,questionId,ans, i, l){console.log(event.newIndex)
		let data=this.handleQ(ans, i, l);
		const found = this.surveyPayload.answers.some(el => el.answerId === data.getValue(event.newIndex));
		if (!found) this.surveyPayload.answers.push({answerId:data.getValue(event.newIndex),questionId:questionId});
		this.surveyPayload.answers.push({answerId:data.getValue(event.newIndex),questionId:questionId})
	}*/
	isCheckedFun(t) {
		return t.isChecked
	}
	toggleActiveState(item: any) {
		item.isActive = !item.isActive;
	}
	onChange(event: SelectedIndexChangedEventData, questionId, ans, i, l) {
		if (event?.newIndex === undefined || event.newIndex === null || event.newIndex < 0) {
			return;
		}
		if (!ans?.getValue) return;
		const selectedAnswerId = ans.getValue(event.newIndex);
		if (!selectedAnswerId) return;
		/*const found = this.surveyPayload.answers.some(el => el.answerId === selectedAnswerId);
		if (!found) {
			this.surveyPayload.answers.push({ answerId: selectedAnswerId, questionId });
		}*/
		const foundIndex = this.surveyPayload.answers.findIndex(el => el.questionId === questionId);

		if (foundIndex !== -1) {
			this.surveyPayload.answers[foundIndex].answerId = selectedAnswerId;
		} else {
			this.surveyPayload.answers.push({ answerId: selectedAnswerId, questionId: questionId });
		}
	}
}
