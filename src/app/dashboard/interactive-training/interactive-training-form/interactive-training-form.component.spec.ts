import { TestBed, inject } from '@angular/core/testing';

import { InteractiveTrainingFormComponent } from './interactive-training-form.component';

describe('a interactive-training-form component', () => {
	let component: InteractiveTrainingFormComponent;

	// register all needed dependencies
	beforeEach(() => {
		TestBed.configureTestingModule({
			providers: [
				InteractiveTrainingFormComponent
			]
		});
	});

	// instantiation through framework injection
	beforeEach(inject([InteractiveTrainingFormComponent], (InteractiveTrainingFormComponent) => {
		component = InteractiveTrainingFormComponent;
	}));

	it('should have an instance', () => {
		expect(component).toBeDefined();
	});
});