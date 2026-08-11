import { Component, NgZone, OnInit, Output } from '@angular/core';
// import { Filepicker } from '@martinbuezas/nativescript-filepicker';
import { Frame, isIOS, knownFolders, Page, path, File, isAndroid } from '@nativescript/core';
import { LoadEventData } from '@nativescript/core';
import { environment } from '../../../../environments/environment';
import { SelectedIndexChangedEventData, ValueList } from 'nativescript-drop-down';
import { SettingsService } from '../settings.service';
import { HttpService } from '~/app/shared/services/http.service';
import { GlobalService } from '~/app/shared/services/global.service';
import { localize } from '@nativescript/localize';
import { AbstractControl, FormControl, FormGroup, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { AccountService } from '../../../app/account/account.service';
import { FirebaseEventService } from '~/app/shared/services/firebase.event.service';

@Component({
	moduleId: module.id,
	selector: 'become-partner',
	templateUrl: './become-partner.component.html',
	styleUrls: ['./become-partner.component.css']
})

export class BecomePartnerComponent implements OnInit {
	regex = environment.EMAIL_REGEX;
	info: any = [];
	typesSource: ValueList<string> = new ValueList<string>();
	selectedType: number = 0;
	showOrgnizationData: boolean;
	rechaptcha: any;
	webView: any;
	webViewSource: string;
	uploadedFilePath: string;
	contactForm: FormGroup;
	type: string;
	@Output() selectedFileName: string;
	isSending: boolean;
	codesSource: ValueList<string> = new ValueList<string>();
	selectedCodeIndex: any;
	countryCode: string;
	requestSuccess: boolean;
	qualificationsSource: any = new ValueList<string>();
	qualification: any;

	constructor(private page: Page, private settingsService: SettingsService, private httpService: HttpService, private globalService: GlobalService,
		private accountService: AccountService, private firebaseEventService: FirebaseEventService, private ngZone: NgZone
	) {
		console.log("constructor we clicked on join us")
		//page.actionBarHidden = true;

	}
	goBack() {

		Frame.topmost().goBack();

	}
	onCodeChange(event: SelectedIndexChangedEventData) {
		this.countryCode = this.codesSource.getValue(event.newIndex)
	}
	onQualificationChange(event: SelectedIndexChangedEventData) {
		this.qualification = this.qualificationsSource.getValue(event.newIndex)
		console.log(this.countryCode)
	}
	getPhoneCodes() {
		this.accountService.getPhoneCodes().subscribe(
			res => {
				let phoneCodes = res as any[];
				phoneCodes.forEach(element => {
					this.codesSource.push({ value: element.phoneCode, display: element.phoneCode })
				});
				this.selectedCodeIndex = this.codesSource.getIndex('00966')
				this.countryCode = this.codesSource.getValue(this.selectedCodeIndex)
			},
			err => {

			}
		)
	}

	ngOnInit() {
		if (this.globalService.isLoggedIn && this.globalService.isEthrai) {
			this.firebaseEventService.logScreenViewedEvent(this.globalService.isLoggedIn, this.globalService.getUserStats(), 'be_partner', this.globalService.getUserProfile());

		} else if (!this.globalService.isLoggedIn) {
			this.firebaseEventService.logScreenViewedEvent(this.globalService.isLoggedIn, null, 'be_partner', null);

		}
		this.getPhoneCodes()
		this.webViewSource = environment.WEB_API + 'reCAPTCHA.htm'
		this.settingsService.getBePartnerInfo().subscribe(
			res => {
				this.info = (res as any)[0]
			}
		)
		this.contactForm = new FormGroup({
			email: new FormControl('', [Validators.pattern(this.regex), Validators.required]),
			fullContactName: new FormControl('', [Validators.required, this.noWhitespace()]),
			areaCode: new FormControl('', [Validators.required]),
			type: new FormControl('', [Validators.required]),
			message: new FormControl('', [Validators.required, this.noWhitespace()]),
			phoneNumber: new FormControl('', [Validators.required, Validators.pattern('^[0-9]*$'), Validators.minLength(6), Validators.maxLength(10)]),
			urlLink: new FormControl('', []),
			qualification: new FormControl('', [Validators.required])
		})
		this.typesSource.push({ value: "Instructor", display: 'الأفراد' })
		this.typesSource.push({ value: "Business", display: 'المنظمات' })

		this.qualificationsSource.push({ value: "Diploma", display: 'دبلوم' })
		this.qualificationsSource.push({ value: "Bachelor", display: 'بكالوريوس' })
		this.qualificationsSource.push({ value: "HigherDiploma", display: 'دبلوم عالي' })
		this.qualificationsSource.push({ value: "Masters", display: 'ماجستير' })
		this.qualificationsSource.push({ value: "PhD", display: 'دكتوراه' })

		this.selectedType = this.typesSource.getIndex("Instructor");

	}
	getText(html): string {
		return html?.replace(/<[^>]+>/g, '').replace(/&nbsp;/g, '').split('.').join('. ');
	}
	openPicker() {
		// if(isAndroid){
		// 	Filepicker.pickFile({type:'*/*'}).then(
		// 		res=>{
		// 			if(res != null){
		// 				this.uploadedFilePath=res;
		// 				console.log("res",res);
		// 				 this.selectedFileName="تم الرفع"//File.fromPath(this.uploadedFilePath).name;
		// 			}else{
		// 				this.uploadedFilePath=undefined;
		// 				this.selectedFileName=""
		// 			}
		// 		},
		// 		err=>{
		// 			console.log(err)
		// 		}
		// 	)
		// }else{

		// let mediafilepicker = new Mediafilepicker(); 
		// let extensions = [];

		// if (isIOS) {
		// 	extensions = [kUTTypePDF, kUTTypeText,kUTTypeSpreadsheet,kUTTypePNG,kUTTypeJPEG];
		// } else {
		// 	extensions = ['txt', 'pdf','doc','docx','png','jpg','jpeg'];
		// }

		// let options: FilePickerOptions = {
		// 	android: {
		// 		extensions: extensions,
		// 		maxNumberFiles: 1
		// 	},
		// 	ios: {
		// 		extensions: extensions,
		// 		multipleSelection: false
		// 	}
		// };
		// mediafilepicker.openFilePicker(options);

		// mediafilepicker.on("getFiles", (res)=> {
		// 	let results = res.object.get('results');
		// 	this.uploadedFilePath=results[0].file;
		// 	this.selectedFileName=File.fromPath(this.uploadedFilePath).name;
		// 	console.log("///////////////////",this.selectedFileName);
		// },this.uploadedFilePath);

		// mediafilepicker.on("error", function (res) {
		// 	let msg = res.object.get('msg');
		// 	console.log("errrrrrrrrrrr",msg);
		// });

	}
	onTypeChange(e: SelectedIndexChangedEventData) {
		// this.selectedType=e.newIndex;
		this.type = this.typesSource.getValue(e.newIndex)
		if (this.typesSource.getValue(e.newIndex) == "Business") {
			this.showOrgnizationData = true;
			this.contactForm.addControl('companyName', new FormControl('', [Validators.required, this.noWhitespace()]));
		} else {
			this.showOrgnizationData = false;
			this.contactForm.removeControl('companyName')
		}
	}
	onloadFinished(args: LoadEventData) {
		let webview = args.object as any;
		this.webView = webview;
		// Inject the bridge shim for captcha communication
		this.injectBridgeShim(webview);
	}

	injectBridgeShim(webview: any) {
		const script = `
			if (!window.nsWebViewBridge) {
				window.nsWebViewBridge = {
					emit: function(name, data) {
						var url = 'https://ethrai.sa/ns-bridge/' + name + '?data=' + encodeURIComponent(data);
						console.log('Emitting via navigation:', url);
						window.location.href = url;
					},
					on: function(name, callback) {
						console.log('Registered listener for:', name);
					}
				};
				console.log('nsWebViewBridge shim injected');
			}
		`;

		if (webview.android) {
			webview.android.getSettings().setJavaScriptEnabled(true);
			webview.android.evaluateJavascript(script, null);
		} else if (webview.ios) {
			webview.ios.evaluateJavaScriptCompletionHandler(script, null);
		}
	}

	onLoadStarted(args: any) {
		const url = args.url;
		console.log("Navigation detected:", url);
		if (url && (url.indexOf('ns-bridge/captcha') > -1 || url.indexOf('ns-bridge://captcha') > -1)) {
			if (url.indexOf('data=') > -1) {
				const params = new URLSearchParams(url.split('?')[1]);
				const token = params.get('data');
				console.log("Captcha token received:", token ? token.substring(0, 20) + '...' : 'null');

				this.ngZone.run(() => {
					this.rechaptcha = token;
					console.log("Captcha token saved");
				});

				args.object.stopLoading();
			}
		}
	}

	uploadFileRequest() {
		console.log(this.uploadedFilePath)
		let request = {
			url: this.httpService.apiURL + 'media',
			method: "POST",
			headers: {
				"Authorization": "Bearer " + this.globalService.getToken(),
				//  "Content-Type": "application/json"
			},
			description: "description",
		};
		let params;
		if (this.uploadedFilePath != undefined && this.contactForm.get("urlLink").value == '') {
			this.isSending = true
			let selectedFile = File.fromPath(this.uploadedFilePath);
			let f = knownFolders.documents();
			let p = f.getFile((Date.now())?.toString());
			const binary = selectedFile.readSync((err) => { console.log(err) })
			p.writeSync(binary, err => { console.log(err) })
			console.log("[p]", p.path)
			params = [
				{ name: "data", value: JSON.stringify({ path: "partnerform" }) },
				{ name: "Attachment", filename: p.path },
				// { name: "recaptcha", value: this.rechaptcha},
				// { name: "email", value: this.contactForm.get('email').value},
				// { name: "phoneNumber", value: this.contactForm.get('phoneNumber').value},
				// { name: "areaCode", value: this.countryCode},
				// { name: "fullContactName", value: this.contactForm.get('fullContactName').value},
				// { name: "message", value: this.contactForm.get('message').value},
				// { name: "companyName", value: this.contactForm.get('companyName')?this.contactForm.get('companyName').value:''},
				// { name: "type", value: this.type},
			];
			//    let task = this.session.multipartUpload(params, request);
			//    task.on("error",  e=>{
			// 	   console.log("errrrr",e.error,e.response,e.responseCode)
			// 	   this.isSending=false
			// 	   this.globalService.toast(localize('tryAgain'))

			//    }
			//    );
			//    task.on("responded",  e=>{
			// 	this.isSending=false
			// 	   let response=JSON.parse(e.data);
			// 	   if((response as any).success){
			// 		 this.globalService.toast(localize('OperationSuccessful'))
			// 		   console.log("this.file uploaded",e)
			// 	   }
			//    });
		} else {
			this.isSending = true
			let payload = this.contactForm.value;
			payload.type = this.type;
			payload.recaptcha = this.rechaptcha
			payload.areaCode = this.countryCode
			payload.qualification = this.qualification
			this.settingsService.submitBePartnerForm(payload).subscribe(
				res => {
					this.isSending = false
					if ((res as any).success) {
						this.globalService.toast(localize('OperationSuccessful'))
						this.requestSuccess = true;
					}
				},
				err => {
					this.isSending = false
					console.log("this.file uploaded", err)

					this.globalService.toast(localize('tryAgain'))

				}
			)
		}

	}
	noWhitespace(): ValidatorFn {
		return (control: AbstractControl): ValidationErrors | null => {
			if (typeof control.value === 'string' && control.value.trim().length === 0 && control.value.length > 0) {
				return { whitespace: true };
			}
			return null;
		};
	}

	private trimFormValues(): void {
		Object.keys(this.contactForm.controls).forEach(key => {
			const control = this.contactForm.get(key);
			if (control && typeof control.value === 'string') {
				control.setValue(control.value.trim(), { emitEvent: false });
			}
		});
	}

	submit() {
		if (this.isSending) {
			return;
		}

		this.trimFormValues();
		this.contactForm.markAllAsTouched();

		if (!this.globalService.isLoggedIn && this.uploadedFilePath != undefined && this.contactForm.get("urlLink").value == '') {
			this.globalService.toast(localize('LoginToUloadFile'));
			return;
		}

		if (!this.contactForm.valid) {
			this.globalService.toast(localize('PleaseFillAllRequiredFields') || 'الرجاء تعبئة جميع الحقول المطلوبة');
			return;
		}

		if (!this.rechaptcha || this.rechaptcha.length === 0) {
			this.globalService.toast(localize('PleaseCompleteTheCaptcha') || 'الرجاء التحقق من أنك لست روبوت');
			return;
		}

		this.uploadFileRequest();
	}
	isNotValid(controlName: string) {
		return !this.contactForm?.get(controlName)?.valid && (this.contactForm?.get(controlName)?.dirty || this.contactForm?.get(controlName)?.touched) ? true : false
	}
	showForm() {
		this.contactForm.reset();
		// Set actual values, not indices
		this.type = "Instructor";
		this.contactForm.get('type').setValue("Instructor");
		this.countryCode = "00966";
		this.contactForm.get('areaCode').setValue("00966");
		this.selectedType = 0;
		this.selectedCodeIndex = this.codesSource.getIndex('00966');
		this.requestSuccess = false;
	}
}