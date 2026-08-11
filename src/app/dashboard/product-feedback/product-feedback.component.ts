import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { registerElement } from '@nativescript/angular';
import { localize } from '@nativescript/localize';
import { FirebaseEventService } from '~/app/shared/services/firebase.event.service';
import { GlobalService } from '~/app/shared/services/global.service';
import { DashboardService } from '../dashboard.service';
registerElement('StarRating', () => require('@triniwiz/nativescript-star-ratings').StarRating);

@Component({
	moduleId: module.id,
	selector: 'product-feedback',
	templateUrl: './product-feedback.component.html',
	styleUrls: ['./product-feedback.component.css']
})

export class ProductFeedbackComponent implements OnInit ,OnDestroy{
	rating: number=5;
    @Input() productType: any;
	@Input() productId;
	@Input() enrollmentId;
	description:string="";
	@Output() feedback: EventEmitter<any> = new EventEmitter();
	constructor(private dashboardService:DashboardService,private globalService:GlobalService,private firebaseEventService:FirebaseEventService) { }
	
	ngOnDestroy(): void {
		this.feedback.unsubscribe();
	}

	ngOnInit() { }

	getRating(args: any) {
		this.rating = Number(args.object.get('value'));
	}
	addReview(){
		if(this.productType=='Course'){
			let product={
				productId:this.productId,
				description: this.description,
				rating:this.rating,
				enrollmentId:this.enrollmentId,
			  }
			this.dashboardService.addRatingToCourse(product).subscribe(
				res=>{
					if((res as any).success){
						this.feedback.emit((res as any).extraData);
						this.globalService.toast(localize('succRate'));
						if(this.globalService.isEthrai){
							this.firebaseEventService.logRatingSubmitEvent('course_page',this.description)
						}
						this.description=null;
					}
				},
				err=>{
					this.handleError(err)
				})
		}else if(this.productType=='CoursePath'){

		}else if(this.productType=='Ke'){
			let product={
				productId:this.productId,
				description: this.description,
				rating:this.rating,
			  }
			this.dashboardService.addKeFeedback(product).subscribe(
				res=>{
					if((res as any).success){
						this.feedback.emit((res as any).extraData);
						this.globalService.toast(localize('succRate'));
						if(this.globalService.isEthrai){
							this.firebaseEventService.logRatingSubmitEvent('knwoledge_enrichment_page',this.description)
						}
						this.description=null
					}
				},
				err=>{
					this.handleError(err)
				})
		}else if(this.productType=='INTERACTIVEEX'){
			let product={
				productId:this.productId,
				description: this.description,
				rating:this.rating,
			  }
			this.dashboardService.addInteractiveExercisesFeedback(product).subscribe(
				res=>{
					if((res as any).success){
						this.feedback.emit((res as any).extraData.extraData);
						this.globalService.toast(localize('succRate'));
						
						this.description=null
					}
				},
				err=>{
					this.handleError(err)
				})
		}else if(this.productType=='CASESESTUDY'){
			let product={
				productId:this.productId,
				description: this.description,
				rating:this.rating,
			  }
			this.dashboardService.addStudyPlaneFeedback(product).subscribe(
				res=>{
					if((res as any).success){
						this.feedback.emit((res as any).extraData.extraData);
						this.globalService.toast(localize('succRate'));
						this.description=null
					}
				},
				err=>{
					this.handleError(err)
				})
		}else if(this.productType=='TRAININGGAME'){
			let product={
				productId:this.productId,
				description: this.description,
				rating:this.rating,
			  }
			this.dashboardService.addEducationalGamesFeedback(product).subscribe(
				res=>{
					if((res as any).success){
						this.feedback.emit((res as any).extraData.extraData);
						this.globalService.toast(localize('succRate'));
						this.description=null
					}
				},
				err=>{
					this.handleError(err)
				})
		}if(this.productType=='Webinar'){
			let product={
				productId:this.productId,
				description: this.description,
				rating:this.rating,
			  }
			this.dashboardService.addWebinarFeedback(product).subscribe(
				res=>{
					if((res as any).success){
						this.feedback.emit((res as any).extraData);
						this.globalService.toast(localize('succRate'));
						if(this.globalService.isEthrai){
							this.firebaseEventService.logRatingSubmitEvent('webinar_page',this.description)
						}
						this.description=null
					}
				},
				err=>{
					this.handleError(err)
				})
		}
	}
	handleError(err){
		this.feedback.emit(null)
		this.description=null
		if(err.error.errorCode=='AlreadySaved'){
			this.globalService.toast(localize('alreadyRated'))
		}else{
			this.globalService.toast(localize('tryAgain'))
		}
	}
}