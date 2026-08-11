import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Frame } from '@nativescript/core';
import { DashboardService } from '~/app/dashboard/dashboard.service';
import { GlobalService } from '~/app/shared/services/global.service';
import { SettingsService } from '../settings.service';
import { localize } from '@nativescript/localize';
import { FirebaseEventService } from '~/app/shared/services/firebase.event.service';
import { RouterExtensions } from '@nativescript/angular';

@Component({
	moduleId: module.id,
	selector: 'webinar-instructor',
	templateUrl: './webinar-instructor.component.html',
	styleUrls: ['./webinar-instructor.component.css']
})

export class WebinarInstructorComponent implements OnInit {
	Math;
	instructorId: string;
	instructorData: any;
	webanir: any;
	instructor: any;

	constructor(private router:RouterExtensions,private activatedRoute:ActivatedRoute,private settingsService:SettingsService,private dashboardService:DashboardService,private globalService:GlobalService,
		private firebaseEventService:FirebaseEventService) {
		this.activatedRoute.paramMap.subscribe(params=>{
            this.instructorId=params.get('WebinarInstructorId')
        })
		this.Math=Math
	 }

	ngOnInit() {
		if(this.globalService.isLoggedIn && this.globalService.isEthrai){
            this.firebaseEventService.logScreenViewedEvent(this.globalService.isLoggedIn,this.globalService.getUserStats(),'instructor_profile',this.globalService.getUserProfile());

		}else if(!this.globalService.isLoggedIn){
			this.firebaseEventService.logScreenViewedEvent(this.globalService.isLoggedIn,null,'instructor_profile',null);
		}
		this.getInstructorProfile()
		this.getInstructorWebanirList()
	 }
	goBack() {
		
		Frame.topmost().goBack();
	
	  }
	  getText(html){
		return html?.replace(/(<style[\w\W]+style>)/g, "").replace(/(<w:[\w\W]+\/>)/g, "").replace(/<[^>]+>/g, '').replace(/&nbsp;/g, '').replace(/\s+/g," ")
	}
	  getInstructorProfile() {
        this.settingsService.getWebinarInstructor(this.instructorId).subscribe(
            res=>{
                this.instructor=res as any
				console.log(this.instructor)
            }
        )
    }
	goToWebinarsPage(id,webinars){
		if(this.globalService.isEthrai || !this.globalService.isLoggedIn){
			this.firebaseEventService.logKeWebinarsClickedEvent(this.globalService.isLoggedIn,this.globalService.getUserStats(),
			"instructor_profile",this.globalService.getUserProfile(),webinars,id,null)
		}
		this.router.navigate(['/webinar-details',id]);
	}
	getInstructorWebanirList() {
        this.settingsService.getWebinarInstrlist(this.instructorId).subscribe(
            res=>{
                this.webanir=res as any
				console.log(this.webanir)
            }
        )
    }

	  setFavorite(id,type,isFav:boolean,i){
		console.log("isFavisFav",isFav,id,type)
		if(this.globalService.isLoggedIn){
			let payload={
				"productId": id,
				"type": type
			}
			console.log("fav payload",payload)
			if(!isFav){
				this.dashboardService.setFavoriteProducts(payload).subscribe(
					res=>{
						// console.log("faavvvvvvvvvvvvlllllvv",res)

						if((res as any).success){
							this.webanir[i].isFavorite=true;
							this.globalService.toast(localize('FavAdded'))
						}
					},
					err=>{
						
					}
				)
			}else{
				this.dashboardService.removeFavoriteProducts(payload).subscribe(
					res=>{
						// console.log("faavvvvvvvvvvvvlllllvv",res)
						this.webanir[i].isFavorite=false;
						if((res as any).success){
							this.globalService.toast(localize('FavRemoved'))

						}
					},
					err=>{
						
					}
				)
			}
			
	
		}else{
			this.globalService.toast(localize('LogNeededFav'))
		}

	}

}