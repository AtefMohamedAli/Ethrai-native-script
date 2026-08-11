import { TestBed, inject } from '@angular/core/testing';

import { DurationComponent } from './duration.component';

describe('a duration component', () => {
	let component: DurationComponent;

	// register all needed dependencies
	beforeEach(() => {
		TestBed.configureTestingModule({
			providers: [
				DurationComponent
			]
		});
	});

	// instantiation through framework injection
	beforeEach(inject([DurationComponent], (DurationComponent) => {
		component = DurationComponent;
	}));

	it('should have an instance', () => {
		expect(component).toBeDefined();
	});
});