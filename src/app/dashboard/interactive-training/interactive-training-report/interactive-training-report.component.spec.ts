import { TestBed, inject } from '@angular/core/testing';

import { InteractiveTrainingReportComponent } from './interactive-training-report.component';

describe('a interactive-training-report component', () => {
	let component: InteractiveTrainingReportComponent;

	// register all needed dependencies
	beforeEach(() => {
		TestBed.configureTestingModule({
			providers: [
				InteractiveTrainingReportComponent
			]
		});
	});

	// instantiation through framework injection
	beforeEach(inject([InteractiveTrainingReportComponent], (InteractiveTrainingReportComponent) => {
		component = InteractiveTrainingReportComponent;
	}));

	it('should have an instance', () => {
		expect(component).toBeDefined();
	});
});