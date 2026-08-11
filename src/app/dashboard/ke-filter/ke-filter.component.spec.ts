import { TestBed, inject } from '@angular/core/testing';

import { KeFilterComponent } from './ke-filter.component';

describe('a ke-filter component', () => {
	let component: KeFilterComponent;

	// register all needed dependencies
	beforeEach(() => {
		TestBed.configureTestingModule({
			providers: [
				KeFilterComponent
			]
		});
	});

	// instantiation through framework injection
	beforeEach(inject([KeFilterComponent], (KeFilterComponent) => {
		component = KeFilterComponent;
	}));

	it('should have an instance', () => {
		expect(component).toBeDefined();
	});
});