import { TestBed, inject } from '@angular/core/testing';

import { BecomePartnerComponent } from './become-partner.component';

describe('a become-partner component', () => {
	let component: BecomePartnerComponent;

	// register all needed dependencies
	beforeEach(() => {
		TestBed.configureTestingModule({
			providers: [
				BecomePartnerComponent
			]
		});
	});

	// instantiation through framework injection
	beforeEach(inject([BecomePartnerComponent], (BecomePartnerComponent) => {
		component = BecomePartnerComponent;
	}));

	it('should have an instance', () => {
		expect(component).toBeDefined();
	});
});