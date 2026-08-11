import { Injectable } from '@angular/core';
import { LoginPayload } from '../shared/models/login-payload';
import { HttpService } from '../shared/services/http.service';
import { SignUpPayload } from '../shared/models/signUp-payload';



@Injectable({
    providedIn: 'root',
  })
export class PaymentService{


    constructor(private httpService: HttpService){

    }

    getProductDetail(productId){
        return this.httpService.getAuthRequest("Courses/"+productId);
    }
    addToShopCart(body){
        return this.httpService.postAuthRequest("UserData/shopcarts",body).toPromise();
    }
    getShopCart(){
        return this.httpService.getAuthRequest("UserData/shopcarts");
    }
    getHighlightedCourses(limit:number){
        return this.httpService.getAuthRequest('courses/tags/recommended/'+limit);
    }
    removeFromShopCart(itemId){
        return this.httpService.postAuthRequest("UserData/shopcarts/delete/"+itemId,{});    
    }
    applyCoupon(body){
        return this.httpService.postAuthRequest("UserData/orders/dryrun",body)
    }
    postUserOrders(body){
        return this.httpService.postAuthRequest('UserData/orders',body);
    }
    postAppleOrder(body){
        return this.httpService.postAuthRequest('UserData/orders/apple',body);
    }
    getSiteMaintenanceState(){
        return this.httpService.getAuthRequest('UserData/maintenance/state');
    }
}