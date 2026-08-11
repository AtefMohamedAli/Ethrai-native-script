import { TestBed, inject } from '@angular/core/testing';

import { DetailsTreeComponent } from './details-tree.component';

describe('a course-details component', () => {
	let component: DetailsTreeComponent;

	// register all needed dependencies
	beforeEach(() => {
		TestBed.configureTestingModule({
			providers: [
				DetailsTreeComponent
			]
		});
	});

	// instantiation through framework injection
	beforeEach(inject([DetailsTreeComponent], (CourseDetailsComponent) => {
		component = CourseDetailsComponent;
	}));

	it('should have an instance', () => {
		expect(component).toBeDefined();
	});
});