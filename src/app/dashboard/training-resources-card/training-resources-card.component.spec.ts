import { TestBed, inject } from '@angular/core/testing';

import { TrainingResourcesCardComponent } from './training-resources-card.component';

describe('a training-resources-card component', () => {
	let component: TrainingResourcesCardComponent;

	// register all needed dependencies
	beforeEach(() => {
		TestBed.configureTestingModule({
			providers: [
				TrainingResourcesCardComponent
			]
		});
	});

	// instantiation through framework injection
	beforeEach(inject([TrainingResourcesCardComponent], (TrainingResourcesCardComponent) => {
		component = TrainingResourcesCardComponent;
	}));

	it('should have an instance', () => {
		expect(component).toBeDefined();
	});
});