import { TestBed, inject } from '@angular/core/testing';

import { WebinarInstructorComponent } from './Webinar-instructor.component';

describe('a webinar-instructor component', () => {
	let component: WebinarInstructorComponent;

	// register all needed dependencies
	beforeEach(() => {
		TestBed.configureTestingModule({
			providers: [
				WebinarInstructorComponent
			]
		});
	});

	// instantiation through framework injection
	beforeEach(inject([WebinarInstructorComponent], (WebinarInstructorComponent) => {
		component = WebinarInstructorComponent;
	}));

	it('should have an instance', () => {
		expect(component).toBeDefined();
	});
});