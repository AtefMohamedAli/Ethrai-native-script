import { TestBed, inject } from '@angular/core/testing';

import { CourseDetailsComponent } from './course-details.component';

describe('a course-details component', () => {
	let component: CourseDetailsComponent;

	// register all needed dependencies
	beforeEach(() => {
		TestBed.configureTestingModule({
			providers: [
				CourseDetailsComponent
			]
		});
	});

	// instantiation through framework injection
	beforeEach(inject([CourseDetailsComponent], (CourseDetailsComponent) => {
		component = CourseDetailsComponent;
	}));

	it('should have an instance', () => {
		expect(component).toBeDefined();
	});
});