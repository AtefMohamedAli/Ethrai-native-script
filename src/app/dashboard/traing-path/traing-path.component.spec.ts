import { TestBed, inject } from '@angular/core/testing';

import { TraingPathComponent } from './traing-path.component';

describe('a traing-path component', () => {
	let component: TraingPathComponent;

	// register all needed dependencies
	beforeEach(() => {
		TestBed.configureTestingModule({
			providers: [
				TraingPathComponent
			]
		});
	});

	// instantiation through framework injection
	beforeEach(inject([TraingPathComponent], (TraingPathComponent) => {
		component = TraingPathComponent;
	}));

	it('should have an instance', () => {
		expect(component).toBeDefined();
	});
});