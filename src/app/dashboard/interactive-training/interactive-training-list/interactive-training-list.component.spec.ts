import { TestBed, inject } from '@angular/core/testing';

import { InteractiveTrainingListComponent } from './interactive-training-list.component';

describe('a interactive-training-list component', () => {
	let component: InteractiveTrainingListComponent;

	// register all needed dependencies
	beforeEach(() => {
		TestBed.configureTestingModule({
			providers: [
				InteractiveTrainingListComponent
			]
		});
	});

	// instantiation through framework injection
	beforeEach(inject([InteractiveTrainingListComponent], (InteractiveTrainingListComponent) => {
		component = InteractiveTrainingListComponent;
	}));

	it('should have an instance', () => {
		expect(component).toBeDefined();
	});
});