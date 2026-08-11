import { TestBed, inject } from '@angular/core/testing';

import { CorporateTrainingComponent } from './corporate-training.component';

describe('a Corporate-training component', () => {
	let component: CorporateTrainingComponent;

	// register all needed dependencies
	beforeEach(() => {
		TestBed.configureTestingModule({
			providers: [
				CorporateTrainingComponent
			]
		});
	});

	// instantiation through framework injection
	beforeEach(inject([CorporateTrainingComponent], (CorporateTrainingComponent) => {
		component = CorporateTrainingComponent;
	}));

	it('should have an instance', () => {
		expect(component).toBeDefined();
	});
});