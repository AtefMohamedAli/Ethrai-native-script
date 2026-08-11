import { Injectable } from '@angular/core';
import { LoginPayload } from '../shared/models/login-payload';
import { HttpService } from '../shared/services/http.service';
import { SignUpPayload } from '../shared/models/signUp-payload';



@Injectable({
    providedIn: 'root',
  })
export class MyProductsService{


    constructor(private httpService: HttpService){

    }

    getUserEnrolledCourses(){
        return this.httpService.getAuthRequest("UserData/courses/enrolled");
    }
    getUserEnrolledCoursePaths(){
        return this.httpService.getAuthRequest("UserData/coursepath/enrolled");
    }
    getUserEnrolledWebinars(){
        return this.httpService.getAuthRequest("UserData/webinars/detailedEnrolled");
    }
    getFavoriteProducts(limit){
        return this.httpService.getAuthRequest("UserData/products/favorites/"+limit);
    }
    getBookMarks(){
        return this.httpService.getAuthRequest("UserData/products/userBookMarks");
    }
    getCertificates(){
        return this.httpService.getAuthRequest("UserData/certs");
    }
    getFilteredCertificates(options){
        return this.httpService.postAuthRequest("UserData/certs/search",options);

    }
    getPurchases(){
        return this.httpService.getAuthRequest("UserData/orders");
    }
    getFilteredPurchases(options){
        return this.httpService.postAuthRequest("UserData/orders/user/search",options);
    }
    getWatchedKes(){
        return this.httpService.getAuthRequest("UserData/kes/watched");
    }
    getFilteredKes(options){
        return this.httpService.postAuthRequest("UserData/kes/watched/search",options);
    }
    getUserFilteredCourses(options){
        return this.httpService.postAuthRequest("UserData/courses/enrolled/search",options);
    }
    getUserFilteredCoursePaths(options){
        return this.httpService.postAuthRequest("UserData/coursepath/enrolled/search",options);
    }
    getUserFilteredWebinars(options){
        return this.httpService.postAuthRequest("UserData/webinars/detailedEnrolled/search",options);
    }
    getPrices(){
        return this.httpService.getRequest('Lookups/Prices')
    }
}