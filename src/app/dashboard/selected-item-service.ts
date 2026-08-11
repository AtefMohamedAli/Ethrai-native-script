import { Injectable } from '@angular/core';
import { Subject, Subscription } from 'rxjs';

@Injectable({
    providedIn: 'root',
  })
export class SelectedItemService {

 private subject$ = new Subject()

 emit(event) {
    this.subject$.next(event); 
  } 

 on() {
 return this.subject$;

 }

}