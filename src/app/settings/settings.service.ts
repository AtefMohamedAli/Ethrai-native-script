import { Injectable } from '@angular/core';
import { HttpService } from '../shared/services/http.service';
import { NotificationSearchOption } from '../shared/models/notification-search-option';



@Injectable({
    providedIn: 'root',
  })
export class SettingsService{


    constructor(private httpService: HttpService){

    }

    getAboutContent(){
        return this.httpService.getAuthRequest('lookups/pageParts/AboutUs');
    }
    getNotification(body:NotificationSearchOption){
        return this.httpService.postAuthRequest('Notification/get',body);
    }
    updateProfile(body){
        return this.httpService.postAuthRequest('Profile/full',body);
    }
    getContactInfos(){
        return this.httpService.getAuthRequest("Tenants/contactInfos");
    }
    postTicket(body){
        return this.httpService.postAuthRequest('UserData/usertickets',body)
    }
    getQandA(){
        return this.httpService.postAuthRequest("Tenants/topics/faqs",{})
    }
    getTicketsIssues(){
        return this.httpService.getAuthRequest('UserData/usertickets/issues/types');
    }
    getBePartnerInfo(){
        return this.httpService.getAuthRequest('Lookups/pageParts/Partner');
    }
    getTrainingInfo(){
        return this.httpService.getAuthRequest('Lookups/pageParts/HomeTenant');
    }
    submitTrainigContactForm(payload){
        return this.httpService.postAuthRequest('Tenants/getInTouch/submit',payload)
    }
    submitBePartnerForm(payload){
        return this.httpService.postAuthRequest('Tenants/getInTouch/submit',payload)
    }
    getEthraiTerms(){
        return this.httpService.getAuthRequest('Lookups/footerlinks')
    }
    getInstructorProfile(id){
        return this.httpService.getAuthRequest('Courses/courseInstructor/'+id)
    }
    getWebinarInstructor(id){
        return this.httpService.getAuthRequest('Webinars/expert/'+id)
    }
    getWebinarInstrlist(id){
        return this.httpService.getAuthRequest('Webinars/expert/'+id+'/'+'webinars')
    }
    markNotificationsAsRead(type){
        return this.httpService.postAuthRequest("Notification/"+type+"/markallasread",{})
    }
}