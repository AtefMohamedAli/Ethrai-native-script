import { TestBed, inject } from '@angular/core/testing';

import { WebinarFilterComponent } from './webinar-filter.component';

describe('a webinar-filter component', () => {
	let component: WebinarFilterComponent;

	// register all needed dependencies
	beforeEach(() => {
		TestBed.configureTestingModule({
			providers: [
				WebinarFilterComponent
			]
		});
	});

	// instantiation through framework injection
	beforeEach(inject([WebinarFilterComponent], (WebinarFilterComponent) => {
		component = WebinarFilterComponent;
	}));

	it('should have an instance', () => {
		expect(component).toBeDefined();
	});
});