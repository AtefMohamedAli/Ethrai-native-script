import { Component, OnInit } from '@angular/core';
import { Switch } from '@nativescript/core';
import { Page } from '@nativescript/core';
import { EventData } from '@nativescript/core';
import { Frame } from '@nativescript/core';
import { NotificationSearchOption } from '~/app/shared/models/notification-search-option';
import { GlobalService } from '../../shared/services/global.service';
import { SettingsService } from '../settings.service';
import { NotificationsWithCount } from '../../shared/models/notifications-with-count';
import { Notifications } from '../../shared/models/notifications';
import { UserProfile } from '../../shared/models/user-profile';
import { FirebaseEventService } from '~/app/shared/services/firebase.event.service';

@Component({
	moduleId: module.id,
	selector: 'notifications',
	templateUrl: './notifications.component.html',
	styleUrls: ['./notifications.component.css']
})

export class NotificationsComponent implements OnInit {
	unReadNotifications: Notifications[];
	readNotifications:Notifications[];
	isLoading: boolean;
	profile:UserProfile;

	constructor(private page: Page,private settingsService:SettingsService,private globalService:GlobalService,
		private firebaseEventService:FirebaseEventService) { 
		//page.actionBarHidden = true;

	 }
	goBack() {
		
		Frame.topmost().goBack();
	
	  }
	  onCheckedChange(args: EventData,type:string) {
		const sw = args.object as Switch
		const isChecked = sw.checked // boolean
		if(type==='mail'){
			this.profile.settings.disableEmailNotification=isChecked;
		}else if(type==='notifications'){
			this.profile.settings.disableNotification=isChecked;
		}
		this.settingsService.updateProfile(this.profile).subscribe(
			response=>{
				if((response as any).success){
					this.globalService.setUserProfile(this.profile);
				}
			},
			err=>{

			}
		)
	  }
	ngOnInit() { 
		this.profile=this.globalService.getUserProfile();
		// this.profile.settings.disableNotification
		this.getNotifications();
		if(this.globalService.isEthrai){
			this.firebaseEventService.logScreenViewedEvent(this.globalService.isLoggedIn,this.globalService.getUserStats(),'notifications',this.globalService.getUserProfile());
		}

	}

	getNotifications(){
		this.isLoading=true;
		var nowDate = new Date();
		let options =new NotificationSearchOption();
		options.pageIndex=0;
		options.pageSize=200;
		options.userProfielId=this.profile.id;
		options.type="System";
		options.status="All";
		options.afterDate=new Date((nowDate.setMonth(nowDate.getMonth() - 1))).toLocaleDateString();
		this.settingsService.getNotification(options).subscribe(
			response=>{
				this.isLoading=false;
				let notifications=(response as NotificationsWithCount).notifications;
				this.unReadNotifications=notifications.filter(notification=>{if(!notification.isRead){return notification}})
				this.readNotifications=notifications.filter(notification=>{if(notification.isRead){return notification}})
				this.settingsService.markNotificationsAsRead(options.type).subscribe(
					res=>{
						console.log(res)
					}
				)
			},
			err=>{
			}
		)
	}

}