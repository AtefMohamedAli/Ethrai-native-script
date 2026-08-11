import { TestBed, inject } from '@angular/core/testing';

import { InteractiveTrainingViewComponent } from './interactive-training-view.component';

describe('a interactive-training-view component', () => {
	let component: InteractiveTrainingViewComponent;

	// register all needed dependencies
	beforeEach(() => {
		TestBed.configureTestingModule({
			providers: [
				InteractiveTrainingViewComponent
			]
		});
	});

	// instantiation through framework injection
	beforeEach(inject([InteractiveTrainingViewComponent], (InteractiveTrainingViewComponent) => {
		component = InteractiveTrainingViewComponent;
	}));

	it('should have an instance', () => {
		expect(component).toBeDefined();
	});
});