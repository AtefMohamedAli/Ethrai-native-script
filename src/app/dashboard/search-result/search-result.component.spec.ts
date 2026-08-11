import { TestBed, inject } from '@angular/core/testing';

import { SearchResultComponent } from './search-result.component';

describe('a search-result component', () => {
	let component: SearchResultComponent;

	// register all needed dependencies
	beforeEach(() => {
		TestBed.configureTestingModule({
			providers: [
				SearchResultComponent
			]
		});
	});

	// instantiation through framework injection
	beforeEach(inject([SearchResultComponent], (SearchResultComponent) => {
		component = SearchResultComponent;
	}));

	it('should have an instance', () => {
		expect(component).toBeDefined();
	});
});