import { TestBed, inject } from '@angular/core/testing';

import { UpcomingComponent } from './upcoming.component';

describe('a upcoming component', () => {
	let component: UpcomingComponent;

	// register all needed dependencies
	beforeEach(() => {
		TestBed.configureTestingModule({
			providers: [
				UpcomingComponent
			]
		});
	});

	// instantiation through framework injection
	beforeEach(inject([UpcomingComponent], (UpcomingComponent) => {
		component = UpcomingComponent;
	}));

	it('should have an instance', () => {
		expect(component).toBeDefined();
	});
});