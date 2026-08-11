import { TestBed, inject } from '@angular/core/testing';

import { InteractiveExercisesComponent } from './interactive-exercises.component';

describe('a interactive-exercises component', () => {
	let component: InteractiveExercisesComponent;

	// register all needed dependencies
	beforeEach(() => {
		TestBed.configureTestingModule({
			providers: [
				InteractiveExercisesComponent
			]
		});
	});

	// instantiation through framework injection
	beforeEach(inject([InteractiveExercisesComponent], (InteractiveExercisesComponent) => {
		component = InteractiveExercisesComponent;
	}));

	it('should have an instance', () => {
		expect(component).toBeDefined();
	});
});