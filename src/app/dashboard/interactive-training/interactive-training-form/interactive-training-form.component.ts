import { Component, ElementRef, NgZone, OnInit, ViewChild } from '@angular/core';
import { ImageAsset, ImageSource, Page } from "@nativescript/core";
import { Frame } from '@nativescript/core';
import { localize } from '@nativescript/localize';
import { SelectedIndexChangedEventData, ValueList } from 'nativescript-drop-down';
import { AbstractControl, FormArray, FormBuilder, FormControl, FormGroup, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { DatePipe } from '@angular/common';
import { isAndroid } from "@nativescript/core";
import { RouterExtensions } from '@nativescript/angular';
import { HttpService } from '~/app/shared/services/http.service';
import * as imagepicker from "@nativescript/imagepicker";
import { FirebaseEventService } from '~/app/shared/services/firebase.event.service';
import { GlobalService } from '~/app/shared/services/global.service';
import { DashboardService } from '../../dashboard.service';
import { AccountService } from '~/app/account/account.service';
import { InteractiveTraining } from '~/app/shared/models/interactive-training'
import { TrainingTypeId } from '~/app/shared/models/enums/TrainingTypeId';
import { ImageCompressionUtil, CompressionResult } from '~/app/shared/utils/image-compression.util';

// Custom validator to reject whitespace-only input
function noWhitespaceValidator(): ValidatorFn {
	return (control: AbstractControl): ValidationErrors | null => {
		if (control.value && typeof control.value === 'string') {
			const trimmed = control.value.trim();
			if (trimmed.length === 0) {
				return { whitespace: true };
			}
		}
		return null;
	};
}
@Component({
	moduleId: module.id,
	selector: 'interactive-training-form',
	templateUrl: './interactive-training-form.component.html',
	styleUrls: ['./interactive-training-form.component.css']
})

export class InteractiveTrainingFormComponent implements OnInit {
	@ViewChild('dd') dropDown: ElementRef;
	public selectedIndex = 1;
	TrainingTypeList: ValueList<string> = new ValueList<string>();
	quizTrainingTypeList: ValueList<string> = new ValueList<string>();
	value = 1;
	profileImage: ImageAsset;
	bstring: string;
	newImage: string;
	newImageArray: { url: string, qIndex: number, aIndex: number }[] = [];
	answerImageArray: { url: string, qIndex: number, aIndex: number }[] = [];

	isUploading: boolean;
	isSubmitting: boolean = false;
	base64Image: string;
	imageBase64: any;
	isChecked = false

	id: string;
	interactiveTraining: InteractiveTraining = new InteractiveTraining()
	interactiveTrainingForm: FormGroup;
	typeOfInteractiveTraining
	isLoading: boolean;
	imageUrl: any = '';
	//typeOfInteractiveTrainingQustion
	constructor(private formBuilder: FormBuilder, private page: Page, public datepipe: DatePipe,
		private httpService: HttpService, public globalService: GlobalService,
		private route: Router, private router: RouterExtensions, private activatedRoute: ActivatedRoute,
		private dashboardService: DashboardService, private zone: NgZone, private accountService: AccountService) {
		this.id = this.activatedRoute.snapshot.paramMap.get("id")
		this.interactiveTrainingForm = this.formBuilder.group({
			nameAr: new FormControl('', [Validators.required, noWhitespaceValidator()]),
			nameEn: new FormControl('', [Validators.required, noWhitespaceValidator()]),
			id: new FormControl(''),
			trainingTypeId: new FormControl('', [Validators.required]),
			questions: this.formBuilder.array([], Validators.required)
		});
	}
	goBack() {
		Frame.topmost().goBack();
	}
	ngOnInit() {
		if (this.id) {
			this.fetchData(this.id)
		}
		this.TrainingTypeList = new ValueList<string>([
			{ value: TrainingTypeId.TrueFalse, display: "صح/خطأ" },
			{ value: TrainingTypeId.SingleChoice, display: "إختيار الإجابة الصحيحة" },
			{ value: TrainingTypeId.MultiChoice, display: "متعدد الإجابات" },
			{ value: TrainingTypeId.Quiz, display: " اختبار" },
			{ value: TrainingTypeId.CloudWords, display: "الكلمات السحابية" },
			{ value: TrainingTypeId.Survey, display: " استبيان" },
			{ value: TrainingTypeId.Evaluation, display: "تقييم" },
			{ value: TrainingTypeId.GuessNumbers, display: "تخمين الأرقام" },
			{ value: TrainingTypeId.Voting, display: "التصويت" },
			{ value: TrainingTypeId.QestionAnswer, display: "سؤال و جواب" }
		]);
		this.quizTrainingTypeList = new ValueList<string>([
			{ value: TrainingTypeId.TrueFalse, display: "صح/خطأ" },
			{ value: TrainingTypeId.SingleChoice, display: "إختيار الإجابة الصحيحة" },
			{ value: TrainingTypeId.MultiChoice, display: "متعدد الإجابات" }])
	}
	get questions(): FormArray {
		return this.interactiveTrainingForm.get('questions') as FormArray;
	}
	typeOfQuestion(i) {
		return this.questions.at(i).get('trainingTypeId').value;
	}
	answers(questionIndex): FormArray {
		return this.questions.at(questionIndex).get('answers') as FormArray;
	}
	public addQuestion(trainingTypeId) {
		console.log('njjjjjjjjjjjjjjjjj')
		const questionGroup = this.formBuilder.group({
			nameEN: [''],
			nameAr: ['', [Validators.required, noWhitespaceValidator()]],
			imageUrl: [''],
			id: [''],
			trainingTypeId: new FormControl(trainingTypeId),
			answers: this.formBuilder.array([])
		});

		this.questions.push(questionGroup);
	}
	public onQuizTrainingTypeChange(type) {

		let selected = type
		let i = this.questions.controls.length
		console.log(this.interactiveTrainingForm.get('showedQuestions').value, 'iiiiiiiii', i, this.questions.length)

		if (this.interactiveTrainingForm.get('showedQuestions').value > i) {
			this.addQuestion(selected);
			console.log('iiiiiiiii', i, this.questions.length)
			if (selected == TrainingTypeId.TrueFalse) {
				this.createAnswerControlTrueFalse(i)
			}
			else if (selected == TrainingTypeId.MultiChoice || selected == TrainingTypeId.SingleChoice) {
				this.createAnswerControlChoise(i)
			}
		}

	}
	public onTrainingTypeChange(event: SelectedIndexChangedEventData) {
		this.typeOfInteractiveTraining = this.TrainingTypeList.getValue(event.newIndex);
		//this.interactiveTrainingForm.get('trainingTypeId').setValue(this.TrainingTypeList.getValue(event.newIndex));
		this.removeQuestion(0);

		if (this.typeOfInteractiveTraining != TrainingTypeId.Quiz) {
			this.addQuestion(this.typeOfInteractiveTraining)
			//this.addAnswer(0)
			console.log('llllllllllll', this.typeOfInteractiveTraining)
			/*if ((this.typeOfInteractiveTraining == TrainingTypeId.QestionAnswer || this.typeOfInteractiveTraining == TrainingTypeId.Evaluation || this.typeOfInteractiveTraining == TrainingTypeId.CloudWords||this.typeOfInteractiveTraining == TrainingTypeId.Survey)) {
				this.addQuestion()

			} else*/ if (this.typeOfInteractiveTraining == TrainingTypeId.TrueFalse) {
				this.createAnswerControlTrueFalse(0)
			}
			else if (this.typeOfInteractiveTraining == TrainingTypeId.MultiChoice || this.typeOfInteractiveTraining == TrainingTypeId.SingleChoice) {
				this.createAnswerControlChoise(0)
			}
			else if (this.typeOfInteractiveTraining == TrainingTypeId.Voting) {
				this.createAnswerControlVoiting()
			}
		}
		else {
			this.creatControlQuiz(null, null, null)
		}

	}
	removeQuestion(questionIndex: number) {
		const questionsArray = this.interactiveTrainingForm.get('questions') as FormArray;
		questionsArray.removeAt(questionIndex);
	}
	public get TrainingTypeId(): typeof TrainingTypeId {
		return TrainingTypeId;
	}
	handlename(i, lan) {
		if (this.typeOfQuestion(i) == TrainingTypeId.Survey) return 'Ques'
		else if (this.typeOfQuestion(i) == TrainingTypeId.CloudWords || this.typeOfQuestion(i) == TrainingTypeId.QestionAnswer) return lan == 'ar' ? 'QuesTAr' : 'QuesTEn'
		else return lan == 'ar' ? 'QuesAr' : 'QuesEn'
	}
	isNotValid(controlName: string) {
		// if(controlName=='minCorrectAnswers'&&(this.interactiveTrainingForm.get(controlName)?.dirty ||this.interactiveTrainingForm.get(controlName)?.touched)){
		// 	//this.globalService.toast(localize('ExamLablesMass'));

		// }
		return !this.interactiveTrainingForm.get(controlName)?.valid && (this.interactiveTrainingForm.get(controlName)?.dirty || this.interactiveTrainingForm.get(controlName)?.touched) ? true : false
	}
	onFocus(arg, controlName) {
		this.toast(localize('ExamLablesMass'));
	}
	toast(msg) {
		this.globalService.toast(msg);
	}
	onTextFieldChange(args, controlName) {
		const textField = args.object;
		const value = textField.text;
		//this.globalService.toast(localize('ExamLablesMass'));

		!this.interactiveTrainingForm.get(controlName)?.valid && (this.interactiveTrainingForm.get(controlName)?.dirty || this.interactiveTrainingForm.get(controlName)?.touched) ? true : false
		// Remove non-digit characters
		const numericValue = value.replace(/[^\d]/g, '');

		// Limit input to maximum two digits
		const truncatedValue = numericValue.slice(0, 2);
		if (numericValue > 2) {

		}
		textField.text = truncatedValue;
		//this.inputValue = truncatedValue;
	}

	createAnswerControl(): FormGroup {
		return this.formBuilder.group({
			nameAr: new FormControl('', [Validators.required, noWhitespaceValidator()]),
			nameEN: new FormControl(''),
			imageUrl: new FormControl(''),
			isCorrect: new FormControl(false),
			id: [''],

		});
	}
	createServuyAnswerControl(): FormGroup {
		return this.formBuilder.group({
			nameAr: new FormControl('', [Validators.required, noWhitespaceValidator()]),
			imageUrl: new FormControl(''),
			isCorrect: new FormControl(false),
			id: [''],
		});
	}
	createAnswerControlVoiting() {
		this.answers(0).push(this.addAnswerControlVoiting())
		this.answers(0).push(this.addAnswerControlVoiting())

	}
	creatControlQuiz(durationInSeconds, minCorrectAnswers, showedQuestions) {
		const numberPattern = '^[0-9]+$';//
		this.interactiveTrainingForm.addControl('durationInSeconds', new FormControl(durationInSeconds, [Validators.required, Validators.pattern(numberPattern), Validators.min(1)]));
		this.interactiveTrainingForm.addControl('minCorrectAnswers', new FormControl(minCorrectAnswers, [Validators.required, Validators.pattern(numberPattern), Validators.min(1)]));
		this.interactiveTrainingForm.addControl('showedQuestions', new FormControl(showedQuestions, [Validators.required, Validators.pattern(numberPattern), Validators.min(1)]));


	}
	addAnswerControlVoiting(): FormGroup {
		return this.formBuilder.group({
			nameAr: new FormControl('', [Validators.required, noWhitespaceValidator()]),
			nameEN: new FormControl(''),
			imageUrl: new FormControl(''),
			id: [''],
			isCorrect: new FormControl(true)

		})
	}
	createAnswerControlChoise(i) {
		this.answers(i).push(this.formBuilder.group({
			nameAr: new FormControl('', [Validators.required, noWhitespaceValidator()]),
			nameEN: new FormControl(''),
			imageUrl: new FormControl(''),
			id: [''],
			isCorrect: [{ value: true, disabled: true }]
		}))
		this.answers(i).push(this.formBuilder.group({
			nameAr: new FormControl('', [Validators.required, noWhitespaceValidator()]),
			nameEN: new FormControl(''),
			imageUrl: new FormControl(''),
			id: [''],
			isCorrect: new FormControl(false)
		}))

	}
	createAnswerControlTrueFalse(i) {
		this.answers(i).push(this.formBuilder.group({
			nameAr: [{ value: 'صح', disabled: true }],
			nameEN: [{ value: 'true', disabled: true }],
			imageUrl: new FormControl(''),
			isCorrect: new FormControl(true)
		}))
		this.answers(i).push(this.formBuilder.group({
			nameAr: [{ value: 'خطأ', disabled: true }],
			nameEN: [{ value: 'False', disabled: true }],
			imageUrl: new FormControl(''),
			isCorrect: new FormControl(false),
		}))

	}
	isCheckboxChecked(questionIndex, answerIndex, checked) {
		const answersArray = this.questions.at(questionIndex).get('answers') as FormArray;
		const answerElement = answersArray.at(answerIndex).get('isCorrect')
		answerElement.setValue(checked)

		if (this.typeOfQuestion(questionIndex) == TrainingTypeId.TrueFalse) {
			const firstAnswer = answersArray.at(0).get('isCorrect');
			const secondAnswer = answersArray.at(1).get('isCorrect');
			if (answerIndex == 0) {
				checked ? secondAnswer.setValue(false) : secondAnswer.setValue(true)
			}
			else {
				checked ? firstAnswer.setValue(false) : firstAnswer.setValue(true)
			}
		}
		else if (this.typeOfQuestion(questionIndex) == TrainingTypeId.SingleChoice) {
			if (checked === true) {
				// Disable the element if it is the only true value in the array
				// Set all other elements to false
				const disabledControl = answersArray.controls.find(control => control.get('isCorrect').enabled === false);
				if (disabledControl) {
					const disabledCheckboxControl = disabledControl.get('isCorrect');
					disabledCheckboxControl.enable();
				}
				answersArray.controls.forEach((control, index) => {
					if (index !== answerIndex) {
						control.get('isCorrect').setValue(false);
						answerElement.disable();

					}
				});
			}
		}
		else if (this.typeOfQuestion(questionIndex) == TrainingTypeId.MultiChoice) {
			console.log(answerElement.value, checked, 'pppppppppppppppppppp')

			const indexTrue = answersArray.getRawValue().filter(control => control.isCorrect == true).length;
			console.log(answersArray.getRawValue().filter(control => control.isCorrect == true), 'indexTrue')
			if (indexTrue == 1) {
				answersArray.controls.forEach((control, index) => {
					if (index !== answerIndex) {
						control.get('isCorrect').enable();
					}
					if (control.get('isCorrect').value == true) {
						control.get('isCorrect').disable()
					}
				});
			}
			if (indexTrue > 1) {
				answersArray.controls.forEach((control, index) => {
					control.get('isCorrect').enable();

				});
			}
		}
	}
	addAnswer(questionIndex) {
		if (this.typeOfQuestion(questionIndex) == TrainingTypeId.Survey) {
			if (this.answers(questionIndex).length < 10) this.answers(questionIndex).push(this.createServuyAnswerControl());
		} else {
			this.answers(questionIndex).push(this.createAnswerControl());
		}
	}
	removeAnswer(index: number, questionIndex) {
		if (this.answers(questionIndex).length > 2 && this.typeOfQuestion(questionIndex) != TrainingTypeId.Survey) {
			if (this.typeOfQuestion(questionIndex) == TrainingTypeId.SingleChoice || this.typeOfQuestion(questionIndex) == TrainingTypeId.MultiChoice) {
				this.answers(questionIndex).removeAt(index);
				const answersArray = this.questions.at(questionIndex).get('answers') as FormArray;
				const indexTrue = answersArray.getRawValue().findIndex(control => control.isCorrect === true);
				console.log(indexTrue, answersArray.getRawValue(), 'lllll')
				if (indexTrue == -1) {
					answersArray.at(answersArray.length - 1).get('isCorrect').setValue(true)
					answersArray.at(answersArray.length - 1).get('isCorrect').disable();
				}
			}
			else {
				this.answers(questionIndex).removeAt(index);

			}
		}
		else {
			this.answers(questionIndex).removeAt(index);

		}
	}
	removeQuestionSurvayQuestion(questionIndex: number) {
		const questionsArray = this.interactiveTrainingForm.get('questions') as FormArray;
		if (questionsArray.length > 1) {
			questionsArray.removeAt(questionIndex);
		}
	}
	private trimFormValues(group: FormGroup | FormArray) {
		Object.keys(group.controls).forEach(key => {
			const control = group.get(key);
			if (control instanceof FormControl && typeof control.value === 'string') {
				control.setValue(control.value.trim());
			} else if (control instanceof FormGroup || control instanceof FormArray) {
				this.trimFormValues(control);
			}
		});
	}
	save(isDraft) {
		const isUpdate = this.id ? true : false
		// Trim all string values before validation
		this.trimFormValues(this.interactiveTrainingForm);
		this.interactiveTrainingForm.markAllAsTouched();

		if (this.typeOfInteractiveTraining != TrainingTypeId.Quiz) {
			if (this.interactiveTrainingForm.invalid) {
				this.globalService.toast(localize('CheckInfo'))
			}
			else {
				let interactiveObject = new InteractiveTraining()
				interactiveObject = JSON.parse(JSON.stringify(this.interactiveTrainingForm.getRawValue()))
				if (isDraft) {
					interactiveObject.isActive = false
					interactiveObject.isFinished = false
					interactiveObject.isDraft = true
				}
				else {
					interactiveObject.isActive = true
					interactiveObject.isFinished = false
					interactiveObject.isDraft = false
				}
				interactiveObject.trainingTypeId = this.typeOfInteractiveTraining
				interactiveObject.imageUrl = this.imageUrl
				console.log(interactiveObject, 'kkkkkkkkkkkk')
				this.SaveInteractiveTraining(interactiveObject, isUpdate, isDraft)

			}
		}
		else {
			if ((this.interactiveTrainingForm.get('showedQuestions').value > this.questions.controls.length) || this.interactiveTrainingForm.invalid) {
				this.globalService.toast(localize('CheckInfo'))
			}
			else if (this.interactiveTrainingForm.get('showedQuestions').value == 0 || this.interactiveTrainingForm.get('minCorrectAnswers').value == 0 || this.interactiveTrainingForm.get('durationInSeconds').value == 0) {
				this.globalService.toast(localize('minCorrectAnswersMS'))

			}
			else if (this.interactiveTrainingForm.get('showedQuestions').value < this.interactiveTrainingForm.get('minCorrectAnswers').value) {
				this.globalService.toast(localize('minCorrectAnswersMS'))

			}
			else {
				let interactiveObject = new InteractiveTraining()
				interactiveObject = JSON.parse(JSON.stringify(this.interactiveTrainingForm.getRawValue()))
				if (isDraft) {
					interactiveObject.isActive = false
					interactiveObject.isFinished = false
					interactiveObject.isDraft = true
				}
				else {
					interactiveObject.isActive = true
					interactiveObject.isFinished = false
					interactiveObject.isDraft = false
				}
				interactiveObject.trainingTypeId = this.typeOfInteractiveTraining
				interactiveObject.imageUrl = this.imageUrl
				console.log(interactiveObject, 'kkkkkkkkkkkk')
				this.SaveInteractiveTraining(interactiveObject, isUpdate, isDraft)

			}
		}


	}
	SaveInteractiveTraining(data, isUpdated, isDraft) {
		this.isLoading = true
		console.log()
		this.isSubmitting = true
		this.dashboardService.SaveInteractiveTraining(data, isUpdated).subscribe(
			(res: any) => {
				if (res.success == true) {
					console.log(isDraft, 'SaveInteractiveTrainingRespose:', res)
					console.log(isDraft, 'SaveInteractiveTrainingRespose:', res.extraData.id)

					this.globalService.toast(localize('OperationSuccessful'));
					this.isLoading = false
					if (isDraft) {
						this.router.navigate(['/interactive-training-list']);

					} else {
						isUpdated ? this.router.navigate(['/interactive-training-view', res.extraData]) : this.router.navigate(['/interactive-training-view', res.extraData.id]);
					}
				}
				else {
					this.globalService.toast(res.errorCode);
					this.isLoading = false

				}
			}
		).add(() => {
			this.isLoading = false
		})

	}
	reset() {

		this.interactiveTrainingForm.reset()
		this.isSubmitting = false

		this.typeOfInteractiveTraining = null
		if (this.questions.length > 0) {
			for (let index = 0; index < this.questions.length; index++) {
				this.removeQuestion(index);
			}
		}
		this.removeQuestion(0);

	}
	fetchData(id: string) {
		this.dashboardService.getInteractiveTrainingById(id).subscribe(
			(data: InteractiveTraining) => {
				this.typeOfInteractiveTraining = data.trainingTypeId
				this.interactiveTrainingForm.patchValue({
					nameAr: data.nameAr,
					nameEn: data.nameEn,
					id: data.id,
					trainingTypeId: this.TrainingTypeList.getIndex(data.trainingTypeId)
				});
				this.newImage = data.imageUrl
				if (data.trainingTypeId == TrainingTypeId.Quiz) {
					this.creatControlQuiz(data.durationInSeconds, data.minCorrectAnswers, data.showedQuestions)
				}
				const questionsArray = this.interactiveTrainingForm.get('questions') as FormArray;
				questionsArray.clear();
				data.questions.forEach((question, questionIndex) => {
					const questionGroup = this.formBuilder.group({
						nameEN: [question.nameEN],
						nameAr: [question.nameAr, [Validators.required, noWhitespaceValidator()]],
						imageUrl: [question.imageUrl],
						trainingTypeId: [question.trainingTypeId],
						id: [question.id],
						answers: this.formBuilder.array([])

					});

					questionsArray.push(questionGroup);
					const answersArray = this.answers(questionIndex);
					if (question.trainingTypeId == TrainingTypeId.TrueFalse) {
						question.answers.forEach(answer => {
							const answerGroup = this.formBuilder.group({
								nameAr: [{ value: answer.nameAr, disabled: true }],
								nameEN: [{ value: answer.nameEN, disabled: true }],
								imageUrl: [answer.imageUrl],
								id: [answer.id],
								isCorrect: [answer.isCorrect]
							});
							answersArray.push(answerGroup);
						});
					}
					else {
						question.answers.forEach((answer, i) => {
							const answerGroup = this.formBuilder.group({
								nameAr: [answer.nameAr, [Validators.required, noWhitespaceValidator()]],
								nameEN: [answer.nameEN],
								imageUrl: [answer.imageUrl],
								isCorrect: [answer.isCorrect]
							});
							this.newImageArray.push({ url: answer.imageUrl, aIndex: i, qIndex: questionIndex })
							answersArray.push(answerGroup);
						});
					}


				});
			},
			error => {
				// Handle error
			}
		);
	}
	uploadImage() {
		let context = imagepicker.create({
			mode: "single"
		});
		context.authorize()
			.then(function () {
				return context.present();
			})
			.then(async (selection) => {
				let item = selection[0];
				if (isAndroid) {
					this.newImage = (item as any)._android;
				}
				this.isUploading = true;

				const result = await ImageCompressionUtil.compressFromAsset(item.asset);
				if (!result) {
					this.isUploading = false;
					this.globalService.toast(localize('tryAgain') || 'فشل ضغط الصورة، حاول مرة أخرى');
					return;
				}

				console.log(`Image compressed: ${ImageCompressionUtil.formatSize(result.sizeBytes)}, quality: ${result.qualityUsed}, ${result.width}x${result.height}`);
				this.uploadImageRequest(result);
			})

	}
	uploadImageRequest(compressionResult: CompressionResult) {

		this.isUploading = true;
		let picPath = "interactivetraining/" + this.interactiveTraining.id;
		let payload = {
			"fileName": new Date().getTime() + "." + compressionResult.extension,
			"image": `data:${compressionResult.mimeType};base64,` + compressionResult.base64,
			"path": picPath
		}
		this.accountService.uploadProfileImage(payload).subscribe(
			res => {
				this.isUploading = false;
				this.imageUrl = (res as any).extraData;
			},
			err => {
				this.isUploading = false;
				this.newImage = this.interactiveTraining.imageUrl;
				this.globalService.toast(localize('tryAgain'));
				console.log(err, 'err')
			}
		)
	}
	handleImageView(j, i) {
		this.newImageArray.filter
		const filteredImages = this.newImageArray.filter((product) => product.qIndex == j && product.aIndex == i)
		if (filteredImages.length > 0) {
			return filteredImages.pop().url;
		} else {
			return ""
		}
	}
	uploadAnswerImage(j, i) {
		let context = imagepicker.create({
			mode: "single"
		});
		context.authorize()
			.then(function () {
				return context.present();
			})
			.then(async (selection) => {
				let item = selection[0];
				if (isAndroid) {
					this.newImageArray.push({ url: (item as any)._android, qIndex: j, aIndex: i });
				}
				this.isUploading = true;

				const result = await ImageCompressionUtil.compressFromAsset(item.asset);
				if (!result) {
					this.isUploading = false;
					this.globalService.toast(localize('tryAgain') || 'فشل ضغط الصورة، حاول مرة أخرى');
					return;
				}

				console.log(`Answer image compressed: ${ImageCompressionUtil.formatSize(result.sizeBytes)}, quality: ${result.qualityUsed}`);
				this.uploadAnswerImageRequest(result, j, i);
			})

	}
	uploadAnswerImageRequest(compressionResult: CompressionResult, j, i) {

		this.isUploading = true;
		let picPath = "answers/" + this.interactiveTraining.id;
		let payload = {
			"fileName": new Date().getTime() + "." + compressionResult.extension,
			"image": `data:${compressionResult.mimeType};base64,` + compressionResult.base64,
			"path": picPath
		}
		this.accountService.uploadProfileImage(payload).subscribe(
			res => {
				this.isUploading = false;
				const answerElement = this.answers(j).at(i).get('imageUrl')
				answerElement.setValue((res as any).extraData)
			},
			err => {
				this.isUploading = false;
				this.newImage = this.interactiveTraining.imageUrl;
				this.globalService.toast(localize('tryAgain'));
				console.log(err)
			}
		)
	}

}