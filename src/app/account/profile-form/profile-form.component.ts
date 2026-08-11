import { Component, ElementRef, NgZone, OnInit, ViewChild } from '@angular/core';
import { ImageAsset, ImageSource, Page } from "@nativescript/core";
import { Frame } from '@nativescript/core';
import { localize } from '@nativescript/localize';
import { environment } from '../../../../environments/environment';
import { SelectedIndexChangedEventData, ValueList } from 'nativescript-drop-down';
import { AccountService } from '../../account/account.service';
import { Nationalities } from '../../shared/models/lookups/nationalties';
import { SignUpPayload } from '../../shared/models/signUp-payload';
import { AbstractControl, FormBuilder, FormControl, FormGroup, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { GlobalService } from '../../shared/services/global.service';
import { UserProfile } from '../../shared/models/user-profile';
import { ActivatedRoute } from '@angular/router';
import { DatePipe } from '@angular/common';
import { isAndroid } from "@nativescript/core";
import { RouterExtensions } from '@nativescript/angular';
import { HttpService } from '~/app/shared/services/http.service';
import * as imagepicker from "@nativescript/imagepicker";
import { FirebaseEventService } from '~/app/shared/services/firebase.event.service';
import { ImageCompressionUtil, CompressionResult } from '../../shared/utils/image-compression.util';

@Component({
	moduleId: module.id,
	selector: 'profile-form',
	templateUrl: './profile-form.component.html',
	styleUrls: ['./profile-form.component.css']
})

export class ProfileFormComponent implements OnInit {
	@ViewChild('dd') dropDown: ElementRef;

	public selectedIndex = 1;
	public items: Array<string>;
	NationalitiesSource: ValueList<string> = new ValueList<string>();
	signUpPayload: SignUpPayload = new SignUpPayload();
	emailRegex = environment.EMAIL_REGEX;
	passwordRegex = environment.PASSWORD_REGEX;
	birthDateRegex = environment.BIRTHDATE_REGEX;
	registerationForm: FormGroup;
	sectorsSource: ValueList<number> = new ValueList<number>();
	sectorID: number;
	nationalityID: string;
	nationalities: Nationalities[];
	isSaudi: boolean;
	profileImage: ImageAsset;
	bstring: string;
	profile: UserProfile;
	email: any;
	selectedNationalityIndex: number;
	tenantId: any;
	interestsIDs: string[];
	userTags: any[];
	tagsSource: ValueList<string> = new ValueList<string>();
	newImage: string;
	isUploading: boolean;
	isSubmitting: boolean;
	isNameEditable: boolean;
	codesSource: ValueList<string> = new ValueList<string>();
	countryCode: string;
	selectedCodeIndex: number;
	phoneCodes: any[];
	isSaudiPhone: boolean;
	base64Image: string;
	imageBase64: any;
	pendingTagIndex: number = -1; // Stores selected tag index until confirmed
	constructor(private page: Page, public datepipe: DatePipe, private route: ActivatedRoute,
		private accountService: AccountService, private globalService: GlobalService, private routerExtensions: RouterExtensions, private httpService: HttpService,
		private firebaseEventService: FirebaseEventService, private zone: NgZone) {
		//page.actionBarHidden = true;
		this.email = this.route.snapshot.paramMap.get("email");
	}
	goBack() {
		Frame.topmost().goBack();
	}

	nationalIDValidator(): ValidatorFn {
		return (control: AbstractControl): ValidationErrors | null => {
			return (control.value[0] == '1' || control.value[0] == '2' || control.value[0] == '7') ? null : { value: control.value }
		};

	}

	saudiPhoneValidator(): ValidatorFn {
		return (control: AbstractControl): ValidationErrors | null => {
			return (control.value[0] == '5') ? null : { value: control.value }
		};

	}
	ngOnInit() {
		this.profile = this.globalService.getUserProfile();
		this.isNameEditable = ["Foreigner", "GulfCooperationCountries"].includes(this.profile.type) ? true : false;
		this.newImage = this.profile.photoUrl;
		// if(this.newImage == "" || this.newImage == null){
		// 	this.newImage="~/images/avatar.png"
		// }
		this.isSaudi = this.globalService.isSaudi();
		if (this.globalService.isEthrai) {
			this.tenantId = environment.ETHRAI_GUID
		} else {
			this.tenantId = this.globalService.currentTenantId;
		}
		this.interestsIDs = this.globalService.getUserInterestsIDs() ? this.globalService.getUserInterestsIDs() : [];
		this.getUserInterests();
		this.registerationForm = new FormGroup({
			email: new FormControl('', [Validators.pattern(this.emailRegex), Validators.required]),
			// nationalId:new FormControl('',[Validators.required,Validators.maxLength(10),Validators.minLength(10),this.nationalIDValidator()]),
			// nationalityId:new FormControl('',[Validators.required]),
			// sectorId:new FormControl('',[Validators.required]),
			birthdate: new FormControl('', [Validators.required]),
			mobile: new FormControl('', [Validators.required]),
			firstNameAr: new FormControl('', [Validators.required]),
			familyNameAr: new FormControl('', [Validators.required]),
			countryCode: new FormControl('', [Validators.required])
		})

		this.initializeForm();
		this.getPhoneCodes();
		if (this.globalService.isEthrai) {
			this.firebaseEventService.logScreenViewedEvent(this.globalService.isLoggedIn, this.globalService.getUserStats(), 'account_edit', this.globalService.getUserProfile());
		}

		// this.getAllNationalties();
		// this.getSectors();
	}


	getAllNationalties() {
		this.accountService.getAllNationalities().subscribe(
			response => {
				this.nationalities = response as Nationalities[];
				this.nationalities.forEach(nationality => {
					this.NationalitiesSource.push({ value: nationality.id, display: nationality.nameAr })
				});
				this.selectedNationalityIndex = this.NationalitiesSource.getIndex(this.profile.nationalityId);
			},
			error => {

			}
		)
	}

	getSectors() {
		this.sectorsSource.push({ value: 1, display: localize('SectorPrivate') });
		this.sectorsSource.push({ value: 2, display: localize('SectorPublic') });
		this.sectorsSource.push({ value: 0, display: localize('SectorUnemployed') });
	}

	onNationalityChange(event: SelectedIndexChangedEventData) {
		this.nationalityID = this.NationalitiesSource.getValue(event.newIndex);
		if (this.nationalities[event.newIndex].phoneCode != '00966') {
			this.isSaudi = false;
			this.registerationForm.removeControl('nationalId');
			this.registerationForm.removeControl('sectorId');
			this.registerationForm.get('mobile').clearValidators()
			this.registerationForm.get('mobile').setValidators([Validators.required, Validators.minLength(6), Validators.maxLength(10)])
		} else {
			this.isSaudi = true;
			this.registerationForm.addControl('nationalId', new FormControl('', [Validators.required, Validators.maxLength(10), Validators.minLength(10), this.nationalIDValidator()]));
			this.registerationForm.addControl('sectorId', new FormControl('', [Validators.required]));
			this.registerationForm.get('mobile').clearValidators()
			this.registerationForm.get('mobile').setValidators([Validators.required, Validators.minLength(9), Validators.maxLength(9), this.saudiPhoneValidator()]);
		}
	}
	onSectorChange(event: SelectedIndexChangedEventData) {
		this.sectorID = this.sectorsSource.getValue(event.newIndex);

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

	isNotValid(controlName: string) {
		return !this.registerationForm.get(controlName)?.valid && (this.registerationForm.get(controlName)?.dirty || this.registerationForm.get(controlName)?.touched) ? true : false
	}

	initializeForm() {
		// this.nationalityID=this.profile.nationalityId;
		// this.sectorID=this.profile.sectorId;
		if (!this.isSaudi) {
			// this.registerationForm.removeControl('nationalId');
			// this.registerationForm.removeControl('sectorId');
			this.registerationForm.setValue({
				"firstNameAr": this.profile.firstNameAr,
				"familyNameAr": this.profile.familyNameAr,
				"email": this.email,
				"birthdate": this.datepipe.transform(this.profile.birthdate, 'MM-dd-yyyy'),
				"mobile": this.profile.mobile,
				"countryCode": this.profile.countryCode ? this.profile.countryCode : "0"
				// "nationalityId":this.profile.nationalityId,
			})
		} else {
			this.registerationForm.setValue({
				"firstNameAr": this.profile.firstNameAr,
				"familyNameAr": this.profile.familyNameAr,
				"email": this.email,
				"birthdate": this.profile.birthdateHijri,
				"mobile": this.profile.mobile,
				"countryCode": this.profile.countryCode ? this.profile.countryCode : 0
				// "nationalId":this.profile.nationalId,
				// "nationalityId":this.profile.nationalityId,
				// "sectorId":this.profile.sectorId,
			})
		}

	}

	saveProfile() {
		this.registerationForm.markAllAsTouched();
		if (this.registerationForm.valid) {
			let updatedProfile = this.profile;
			// updatedProfile.nationalityId=this.nationalityID;
			// updatedProfile.sectorId=this.sectorID
			updatedProfile.familyNameAr = this.registerationForm.value.familyNameAr;
			updatedProfile.firstNameAr = this.registerationForm.value.firstNameAr;
			updatedProfile.mobile = this.registerationForm.value.mobile;
			updatedProfile.countryCode = this.countryCode;
			// updatedProfile.birthdate=this.registerationForm.value.birthdate;
			updatedProfile.interestsIds = this.interestsIDs;
			let tenant = updatedProfile.tenants.find(tenant => tenant.tenantId == this.tenantId)
			let tenantIndex = updatedProfile.tenants.indexOf(tenant);
			// console.log(updatedProfile.tenants[tenantIndex],tenant)
			updatedProfile.tenants[tenantIndex].email = this.registerationForm.value.email
			// if(this.newImage.startsWith("")){
			// 	updatedProfile.photoUrl=this.newImage;
			// }
			this.isSubmitting = true
			this.accountService.updateProfile(updatedProfile).subscribe(
				response => {
					this.isSubmitting = false
					if ((response as any).success) {
						if (this.globalService.isEthrai) {
							this.firebaseEventService.logUpdateProfileEvent(this.globalService.isLoggedIn, this.globalService.getUserStats(),
								'account_edit', this.globalService.getUserProfile())
						}
						this.globalService.setUserProfile(updatedProfile);
						this.globalService.toast(localize('OperationSuccessful'))
						this.routerExtensions.navigate(["/account"]);
					}
				},
				err => {
					this.isSubmitting = false
					console.log(err)

				}
			)
		}

	}

	getUserInterests() {
		this.accountService.getAllTags().subscribe(
			response => {
				let allTags = response as any[]
				this.userTags = allTags.filter(tag => {
					if (this.interestsIDs.includes(tag.id)) {
						return tag;
					}
				});

				// Add empty placeholder as first item
				this.tagsSource.push({ value: '', display: '' });

				allTags.forEach(tag => {
					this.tagsSource.push({ value: tag.id, display: tag.nameAr })
				});
			});

	}

	removeTag(tag) {
		let index = this.userTags.indexOf(tag);
		this.userTags.splice(index, 1);
		let index2 = this.interestsIDs.indexOf(tag.id);
		if (index2 !== -1) {
			this.interestsIDs.splice(index2, 1);
		}
	}

	trackByTag(index: number, tag: any): string {
		return tag.nameAr || index.toString();
	}

	addTag() {
		// Open dropdown to select
		this.dropDown.nativeElement.open();
	}

	onTagChange(event: SelectedIndexChangedEventData) {
		// Skip if index is -1 (reset state) or 0 (empty placeholder)
		if (event.newIndex <= 0) return;

		// Just store the pending selection - will be confirmed on dropdown close
		this.pendingTagIndex = event.newIndex;
	}

	onDropdownClosed() {
		// Called when dropdown closes (checkmark tapped)
		if (this.pendingTagIndex > 0) {
			let tagId = this.tagsSource.getValue(this.pendingTagIndex);
			if (!this.interestsIDs?.includes(tagId)) {
				this.interestsIDs.push(tagId);
				this.userTags.push({ nameAr: this.tagsSource.getDisplay(this.pendingTagIndex) });
			}
			this.pendingTagIndex = -1;
		}
		// Reset dropdown to first item (empty placeholder)
		this.dropDown.nativeElement.selectedIndex = 0;
	}
	uploadImageRequest(compressionResult: CompressionResult) {

		this.isUploading = true;
		let picPath = "profile/" + this.profile.id;
		let payload = {
			"fileName": new Date().getTime() + "." + compressionResult.extension,
			"image": `data:${compressionResult.mimeType};base64,` + compressionResult.base64,
			"path": picPath
		}
		this.accountService.uploadProfileImage(payload).subscribe(
			res => {
				this.isUploading = false;
				this.profile.photoUrl = (res as any).extraData;
				this.newImage = this.profile.photoUrl;
				this.accountService.updateProfile(this.profile).subscribe(
					response => {
						if ((response as any).success) {
							if (this.globalService.isEthrai) {
								this.firebaseEventService.logProfileUploadedImageEvent(this.globalService.isLoggedIn, this.globalService.getUserStats(),
									'account_edit', this.globalService.getUserProfile())
							}
							this.globalService.setUserProfile(this.profile);
							this.globalService.toast(localize('OperationSuccessful'));
						}
					},
					err => {

					}
				)
			},
			err => {
				this.isUploading = false;
				this.newImage = this.profile.photoUrl;
				this.globalService.toast(localize('tryAgain'));
				console.log(err)
			}
		)
	}
	onCodeChange(event: SelectedIndexChangedEventData) {
		this.countryCode = this.codesSource.getValue(event.newIndex);
		if (this.countryCode == '00966') {
			this.isSaudiPhone = true;
			this.countryCode = this.codesSource.getValue(event.newIndex)
			this.registerationForm.addControl('mobile', new FormControl('', [Validators.required, Validators.minLength(9), Validators.maxLength(9), this.saudiPhoneValidator()]));

		} else {
			this.isSaudiPhone = false;
			this.countryCode = this.codesSource.getValue(event.newIndex)
			this.registerationForm.get('mobile').setValidators([Validators.required, Validators.minLength(6), Validators.maxLength(10)])
		}
	}
	getPhoneCodes() {
		this.accountService.getPhoneCodes().subscribe(
			res => {
				this.phoneCodes = res as any[];
				this.phoneCodes.forEach(element => {
					this.codesSource.push({ value: element.phoneCode, display: element.phoneCode })
				});
				this.selectedCodeIndex = this.codesSource.getIndex(this.profile.countryCode)
				console.log("this.selectedCodeIndex", this.selectedCodeIndex)
				this.countryCode = this.codesSource.getValue(this.selectedCodeIndex)
			},
			err => {

			}
		)
	}
	openList() {
		this.dropDown.nativeElement.open();
	}
}

