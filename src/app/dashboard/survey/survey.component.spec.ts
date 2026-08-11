import { TestBed, inject } from '@angular/core/testing';

import { SurveyComponent } from './survey.component';

describe('a survey component', () => {
	let component: SurveyComponent;

	// register all needed dependencies
	beforeEach(() => {
		TestBed.configureTestingModule({
			providers: [
				SurveyComponent
			]
		});
	});

	// instantiation through framework injection
	beforeEach(inject([SurveyComponent], (SurveyComponent) => {
		component = SurveyComponent;
	}));

	it('should have an instance', () => {
		expect(component).toBeDefined();
	});
});