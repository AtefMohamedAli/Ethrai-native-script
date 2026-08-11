import { TestBed, inject } from '@angular/core/testing';

import { DigitalLibraryComponent } from './digitalLibrary.component';

describe('a digitalLibrary component', () => {
	let component: DigitalLibraryComponent;

	// register all needed dependencies
	beforeEach(() => {
		TestBed.configureTestingModule({
			providers: [
				DigitalLibraryComponent
			]
		});
	});

	// instantiation through framework injection
	beforeEach(inject([DigitalLibraryComponent], (DigitalLibraryComponent) => {
		component = DigitalLibraryComponent;
	}));

	it('should have an instance', () => {
		expect(component).toBeDefined();
	});
});