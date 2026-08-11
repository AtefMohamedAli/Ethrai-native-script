import { TestBed, inject } from '@angular/core/testing';

import { InstructorProfileComponent } from './instructor-profile.component';

describe('a instructor-profile component', () => {
	let component: InstructorProfileComponent;

	// register all needed dependencies
	beforeEach(() => {
		TestBed.configureTestingModule({
			providers: [
				InstructorProfileComponent
			]
		});
	});

	// instantiation through framework injection
	beforeEach(inject([InstructorProfileComponent], (InstructorProfileComponent) => {
		component = InstructorProfileComponent;
	}));

	it('should have an instance', () => {
		expect(component).toBeDefined();
	});
});