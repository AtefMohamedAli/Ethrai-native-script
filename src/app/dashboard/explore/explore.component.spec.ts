import { TestBed, inject } from '@angular/core/testing';

import { ExploreComponent } from './explore.component';

describe('a explore component', () => {
	let component: ExploreComponent;

	// register all needed dependencies
	beforeEach(() => {
		TestBed.configureTestingModule({
			providers: [
				ExploreComponent
			]
		});
	});

	// instantiation through framework injection
	beforeEach(inject([ExploreComponent], (ExploreComponent) => {
		component = ExploreComponent;
	}));

	it('should have an instance', () => {
		expect(component).toBeDefined();
	});
});