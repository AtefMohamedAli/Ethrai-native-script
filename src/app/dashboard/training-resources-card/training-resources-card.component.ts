import { Component, Input, OnInit } from '@angular/core';
import { RouterExtensions } from '@nativescript/angular';

@Component({
	moduleId: module.id,
	selector: 'training-resources-card',
	templateUrl: './training-resources-card.component.html',
	styleUrls: ['./training-resources-card.component.css']
})

export class TrainingResourcesCardComponent implements OnInit {
    @Input()data: any;
    @Input()type: any;
	@Input()isDigitalLibrary
	constructor(private router:RouterExtensions) { }

	ngOnInit() {
	 }
	 goToDetails(){
		console.log(';;;;;;;',this.data)
        this.router.navigate(['/training-resources-detail',this.data?.id,this.type])
    }
}