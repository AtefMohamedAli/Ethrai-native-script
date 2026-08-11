import { TestBed, inject } from '@angular/core/testing';

import { CourseRatingModalComponent } from './course-rating-modal.component';

describe('a course-rating-modal component', () => {
	let component: CourseRatingModalComponent;

	// register all needed dependencies
	beforeEach(() => {
		TestBed.configureTestingModule({
			providers: [
				CourseRatingModalComponent
			]
		});
	});

	// instantiation through framework injection
	beforeEach(inject([CourseRatingModalComponent], (CourseRatingModalComponent) => {
		component = CourseRatingModalComponent;
	}));

	it('should have an instance', () => {
		expect(component).toBeDefined();
	});
});