import { Component, OnInit } from '@angular/core';
import { ModalDialogParams } from '@nativescript/angular';

@Component({
    moduleId: module.id,
    selector: 'survey-modal',
    templateUrl: './survey-modal.component.html',
    styleUrls: ['./survey-modal.component.css']
})

export class SurveyModalComponent implements OnInit {
    surveyData: any;
    surveyId: any;
    productId: any;
    enrollmentId: string;
    type: string;

    constructor(private params: ModalDialogParams) {
        this.surveyData = params.context.surveyData;
        this.surveyId = params.context.surveyId;
        this.productId = params.context.productId;
        this.enrollmentId = params.context.enrollmentId || '';
        this.type = params.context.type || 'Course';
    }

    ngOnInit() { }

    onSurveySubmitted() {
        this.params.closeCallback({ submitted: true });
    }

    close() {
        this.params.closeCallback({ submitted: false });
    }
}
