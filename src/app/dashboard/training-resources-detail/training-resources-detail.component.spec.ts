import { TestBed, inject } from '@angular/core/testing';

import { TrainingResourcesDetailComponent } from './training-resources-detail.component';

describe('a training-resources-detail component', () => {
	let component: TrainingResourcesDetailComponent;

	// register all needed dependencies
	beforeEach(() => {
		TestBed.configureTestingModule({
			providers: [
				TrainingResourcesDetailComponent
			]
		});
	});

	// instantiation through framework injection
	beforeEach(inject([TrainingResourcesDetailComponent], (TrainingResourcesDetailComponent) => {
		component = TrainingResourcesDetailComponent;
	}));

	it('should have an instance', () => {
		expect(component).toBeDefined();
	});
});