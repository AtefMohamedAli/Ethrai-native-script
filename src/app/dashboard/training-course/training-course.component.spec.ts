import { TestBed, inject } from '@angular/core/testing';

import { TraingCourseComponent } from './training-course.component';

describe('a traing-path component', () => {
	let component: TraingCourseComponent;

	// register all needed dependencies
	beforeEach(() => {
		TestBed.configureTestingModule({
			providers: [
				TraingCourseComponent
			]
		});
	});

	// instantiation through framework injection
	beforeEach(inject([TraingCourseComponent], (TraingCourseComponent) => {
		component = TraingCourseComponent;
	}));

	it('should have an instance', () => {
		expect(component).toBeDefined();
	});
});