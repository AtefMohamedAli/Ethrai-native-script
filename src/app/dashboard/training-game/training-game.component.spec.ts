import { TestBed, inject } from '@angular/core/testing';

import { TrainingGameComponent } from './training-game.component';

describe('a training-game component', () => {
	let component: TrainingGameComponent;

	// register all needed dependencies
	beforeEach(() => {
		TestBed.configureTestingModule({
			providers: [
				TrainingGameComponent
			]
		});
	});

	// instantiation through framework injection
	beforeEach(inject([TrainingGameComponent], (TrainingGameComponent) => {
		component = TrainingGameComponent;
	}));

	it('should have an instance', () => {
		expect(component).toBeDefined();
	});
});