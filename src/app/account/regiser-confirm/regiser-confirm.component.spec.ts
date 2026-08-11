import { TestBed, inject } from '@angular/core/testing';

import { RegiserConfirmComponent } from './regiser-confirm.component';

describe('a regiser-confirm component', () => {
	let component: RegiserConfirmComponent;

	// register all needed dependencies
	beforeEach(() => {
		TestBed.configureTestingModule({
			providers: [
				RegiserConfirmComponent
			]
		});
	});

	// instantiation through framework injection
	beforeEach(inject([RegiserConfirmComponent], (RegiserConfirmComponent) => {
		component = RegiserConfirmComponent;
	}));

	it('should have an instance', () => {
		expect(component).toBeDefined();
	});
});