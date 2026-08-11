import { TestBed, inject } from '@angular/core/testing';

import { HighlightedCardComponent } from './highlighted-card.component';

describe('a highlighted-card component', () => {
	let component: HighlightedCardComponent;

	// register all needed dependencies
	beforeEach(() => {
		TestBed.configureTestingModule({
			providers: [
				HighlightedCardComponent
			]
		});
	});

	// instantiation through framework injection
	beforeEach(inject([HighlightedCardComponent], (HighlightedCardComponent) => {
		component = HighlightedCardComponent;
	}));

	it('should have an instance', () => {
		expect(component).toBeDefined();
	});
});