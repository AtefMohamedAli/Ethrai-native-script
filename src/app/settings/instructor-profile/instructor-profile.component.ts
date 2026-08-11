import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Frame, isAndroid } from '@nativescript/core';
import { DashboardService } from '~/app/dashboard/dashboard.service';
import { GlobalService } from '~/app/shared/services/global.service';
import { SettingsService } from '../settings.service';
import { localize } from '@nativescript/localize';
import { FirebaseEventService } from '~/app/shared/services/firebase.event.service';
import { RouterExtensions } from '@nativescript/angular';

@Component({
	moduleId: module.id,
	selector: 'instructor-profile',
	templateUrl: './instructor-profile.component.html',
	styleUrls: ['./instructor-profile.component.css']
})

export class InstructorProfileComponent implements OnInit {
	instructorId: string;
	instructorData: any={};
	Math;
	courses: any[]=[];
	isAndroid: boolean;
	// Intl removed - not available on iOS
	intl = { format: (n) => String(n) }; // Intl polyfill for iOS
	constructor(private activatedRoute:ActivatedRoute,private settingsService:SettingsService,private dashboardService:DashboardService,private globalService:GlobalService,
		private firebaseEventService:FirebaseEventService,private router:RouterExtensions) { 
		this.activatedRoute.paramMap.subscribe(params=>{
            this.instructorId=params.get('instructorId')
        })
		this.Math=Math
		this.isAndroid=isAndroid

	}
	goBack() {
		
		Frame.topmost().goBack();
	
	  }

	ngOnInit() {
		if(this.globalService.isLoggedIn && this.globalService.isEthrai){
            this.firebaseEventService.logScreenViewedEvent(this.globalService.isLoggedIn,this.globalService.getUserStats(),'instructor_profile',this.globalService.getUserProfile());

		}else if(!this.globalService.isLoggedIn){
			this.firebaseEventService.logScreenViewedEvent(this.globalService.isLoggedIn,null,'instructor_profile',null);
		}
		console.log(this.instructorId)
		this.getInstructorProfile()
	 }
	 getInstructorProfile() {
        this.settingsService.getInstructorProfile(this.instructorId).subscribe(
            res=>{
                this.instructorData=res as any
				this.courses=(res as any).courses
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
							this.courses[i].isFavorite=true;
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
						this.courses[i].isFavorite=false;
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
	getText(html){
		return html?.replace(/(<style[\w\W]+style>)/g, "").replace(/(<w:[\w\W]+\/>)/g, "").replace(/<[^>]+>/g, '').replace(/&nbsp;/g, '').replace(/\s+/g," ")
	}
	goToCoursePage(id,course){
		if(this.globalService.isEthrai || !this.globalService.isLoggedIn){
			this.firebaseEventService.logCourseClickedEvent(this.globalService.isLoggedIn,this.globalService.getUserStats(),
			"instructor_profile",this.globalService.getUserProfile(),course)
		}
		this.router.navigate(['/course-details',id]);
	}
}