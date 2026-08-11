import { TestBed, inject } from '@angular/core/testing';

import { SadadPopupComponent } from './sadad-popup.component';

describe('a sadad-popup component', () => {
	let component: SadadPopupComponent;

	// register all needed dependencies
	beforeEach(() => {
		TestBed.configureTestingModule({
			providers: [
				SadadPopupComponent
			]
		});
	});

	// instantiation through framework injection
	beforeEach(inject([SadadPopupComponent], (SadadPopupComponent) => {
		component = SadadPopupComponent;
	}));

	it('should have an instance', () => {
		expect(component).toBeDefined();
	});
});