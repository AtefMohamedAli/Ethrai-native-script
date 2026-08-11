import { TestBed, inject } from '@angular/core/testing';

import { HighlightedComponent } from './highlighted.component';

describe('a highlighted component', () => {
	let component: HighlightedComponent;

	// register all needed dependencies
	beforeEach(() => {
		TestBed.configureTestingModule({
			providers: [
				HighlightedComponent
			]
		});
	});

	// instantiation through framework injection
	beforeEach(inject([HighlightedComponent], (HighlightedComponent) => {
		component = HighlightedComponent;
	}));

	it('should have an instance', () => {
		expect(component).toBeDefined();
	});
});